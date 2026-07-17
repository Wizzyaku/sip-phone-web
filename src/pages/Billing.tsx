import { useEffect, useMemo, useState, memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Wallet,
  Coins,
  CreditCard,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
  History,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAppStore } from '../store/appStore';
import {
  TOKEN_PACKAGES,
  fetchTransactions,
  formatTokens,
  formatCurrency,
  type Transaction,
} from '../lib/balance';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

export function Billing() {
  const [searchParams] = useSearchParams();
  const balance = useAppStore((s) => s.balance);
  const balanceLoading = useAppStore((s) => s.balanceLoading);
  const refreshBalance = useAppStore((s) => s.refreshBalance);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(1);
  const [customTokens, setCustomTokens] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  const reference = searchParams.get('reference');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const data = await fetchTransactions();
      if (mounted) {
        setTransactions(data);
        setTransactionsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (reference) {
      refreshBalance();
    }
  }, [reference, refreshBalance]);

  const activePackage = useMemo(() => {
    if (selectedPackage !== null) return TOKEN_PACKAGES[selectedPackage];
    const tokens = Math.max(0, Number(customTokens));
    if (tokens > 0) {
      return {
        tokens,
        label: `${formatTokens(tokens)} tokens`,
        priceMinor: tokens * 100,
        currency: 'NGN',
      };
    }
    return null;
  }, [selectedPackage, customTokens]);

  const handlePay = async () => {
    setError(null);
    setSuccess(null);

    if (!activePackage) {
      setError('Select a token package or enter a custom amount.');
      return;
    }

    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) {
      setError('You must be signed in to add funds.');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/korapay-initiate-charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          packageIndex: selectedPackage,
          customTokens: selectedPackage === null ? Number(customTokens) : undefined,
        }),
      });

      const data = (await response.json()) as {
        checkoutUrl?: string;
        reference?: string;
        error?: string;
        korapayMessage?: string;
      };
      if (!response.ok || data.error) {
        console.error('Korapay initiate response:', { status: response.status, data });
        throw new Error(data.korapayMessage || data.error || 'Payment initialization failed.');
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-3 md:space-y-6 md:pb-6">
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold tracking-tight">Wallet & Top-up</h1>
        <p className="text-sm text-muted-foreground">Buy token credits to power calls and messages.</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-2.5 md:gap-6 lg:grid-cols-12">
        {/* Left Column: Balance & Packages */}
        <div className="space-y-3 md:space-y-6 lg:col-span-7">
          <Card className="glass-card rounded-xl md:rounded-[1.5rem] overflow-hidden border-2 border-primary/40 shadow-[0_0_12px_rgba(91,91,214,0.3)]">
            <CardContent className="p-4 md:p-6 bg-gradient-to-br from-indigo-950 via-primary to-primary/90 text-white relative">
              <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-[30px] -mr-8 -mt-8 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-lg md:rounded-xl bg-white/10 backdrop-blur-sm shadow-sm border border-white/30 text-white">
                    <Wallet className="h-5.5 w-5.5 md:h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-white/80 font-bold uppercase tracking-wider mb-0.5">Token Balance</p>
                    <p className="text-2xl md:text-3xl font-black text-white leading-none tracking-tight">
                      {balanceLoading || balance === null ? (
                        <span className="inline-block h-7 w-28 animate-pulse rounded bg-white/20" />
                      ) : (
                        formatTokens(balance.tokens)
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col justify-end">
                  <p className="text-[10px] md:text-xs text-white/80 font-semibold">1 NGN / token</p>
                  <p className="text-xs md:text-sm font-bold text-white">₦1.00 min</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2 md:space-y-3">
            <h2 className="text-[13px] md:text-lg font-bold text-foreground">Select Package</h2>
            <div className="grid grid-cols-2 gap-2 md:gap-3 rounded-xl md:rounded-2xl border border-border bg-card dark:bg-zinc-900/60 p-2 md:p-3">
              {TOKEN_PACKAGES.map((pkg, index) => (
                <button
                  key={pkg.tokens}
                  onClick={() => {
                    setSelectedPackage(index);
                    setCustomTokens('');
                  }}
                  className={cn(
                    'flex flex-col md:flex-row items-start md:items-center justify-between rounded-lg md:rounded-xl border-2 p-2.5 md:p-4 text-left transition-all relative overflow-hidden',
                    selectedPackage === index
                      ? 'border-primary bg-muted dark:bg-zinc-800 shadow-[0_0_10px_rgba(91,91,214,0.4)] shadow-sm'
                      : 'border-border/80 bg-card dark:bg-zinc-900/40 shadow-[0_0_4px_rgba(91,91,214,0.15)] hover:border-primary/60 hover:shadow-[0_0_8px_rgba(91,91,214,0.3)] hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                    <div className="flex h-7 w-7 md:h-10 md:w-10 items-center justify-center rounded-md md:rounded-lg bg-primary/10 text-primary shrink-0">
                      <Coins className="h-3.5 w-3.5 md:h-5 md:w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[11px] md:text-sm text-foreground">{pkg.label}</p>
                      <p className="text-[9px] md:text-xs text-muted-foreground">{formatTokens(pkg.tokens)} tokens</p>
                    </div>
                  </div>
                  <p className="font-black text-primary text-xs md:text-base mt-1 md:mt-0">{formatCurrency(pkg.priceMinor, pkg.currency)}</p>
                  {selectedPackage === index && (
                    <div className="absolute top-1.5 right-1.5 md:top-1/2 md:-translate-y-1/2 md:right-4 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(91,91,214,0.6)]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <Card className="glass-card rounded-lg md:rounded-2xl border-2 border-border shadow-[0_0_8px_rgba(91,91,214,0.15)]">
            <CardContent className="space-y-2.5 md:space-y-4 p-3.5 md:p-6">
              <div className="flex items-center gap-2 border-b-2 border-border/60 pb-2">
                <Zap className="h-4 w-4 md:h-4 md:w-4 text-primary" />
                <p className="text-[13px] md:text-sm font-bold text-foreground">Custom amount</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={100}
                  placeholder="e.g. 2500"
                  value={customTokens}
                  onChange={(e) => {
                    setCustomTokens(e.target.value);
                    setSelectedPackage(null);
                  }}
                  className="rounded-lg h-11 md:h-12 text-sm md:text-sm font-medium bg-background border-2 border-border"
                />
                <span className="text-xs md:text-sm font-semibold text-muted-foreground whitespace-nowrap">tokens</span>
              </div>
              {customTokens && selectedPackage === null && (
                <div className="flex items-center gap-2 bg-primary/5 p-2.5 md:p-2.5 rounded-lg border border-primary/30">
                  <p className="text-xs md:text-sm font-bold text-primary">
                    Cost: {formatCurrency(Number(customTokens) * 100, 'NGN')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {reference && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-2 md:p-4">
              <div className="flex items-start gap-1.5 md:gap-3">
                <CheckCircle className="h-3.5 w-3.5 md:h-5 md:w-5 text-primary shrink-0" />
                <div>
                  <p className="font-bold text-[10px] md:text-sm">Payment reference received</p>
                  <p className="text-[9px] md:text-xs text-muted-foreground mt-0.5">
                    Ref: {reference}. Your balance will update automatically once the payment is confirmed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-2 md:p-4 text-[10px] md:text-sm font-medium text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-2 md:p-4 text-[10px] md:text-sm font-medium text-green-600">
              <CheckCircle className="h-3.5 w-3.5 shrink-0" />
              {success}
            </div>
          )}

          <Button
            className="h-12 md:h-14 w-full rounded-lg md:rounded-xl text-sm md:text-base font-bold border-2 border-primary/30 shadow-[0_8px_24px_rgba(91,91,214,0.4)] active:scale-[0.98] transition-transform"
            onClick={handlePay}
            disabled={processing || !activePackage}
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 md:h-5 md:w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5 md:h-5 md:w-5" />
                Pay {activePackage ? formatCurrency(activePackage.priceMinor, activePackage.currency) : ''}
                <ArrowRight className="ml-2 h-5 w-5 md:h-5 md:w-5" />
              </>
            )}
          </Button>
        </div>

        {/* Right Column: Transaction History */}
        <div className="hidden md:block space-y-2 md:space-y-6 lg:col-span-5">
          <h2 className="text-[13px] md:text-lg font-bold flex items-center gap-2">
            <History className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Transaction History
          </h2>
          <Card className="glass-card rounded-lg md:rounded-2xl border border-border">
            <CardContent className="p-0">
              {transactionsLoading ? (
                <div className="p-2 md:p-6 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 md:h-12 w-full animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-4 md:p-8 text-center">
                  <History className="mx-auto h-6 w-6 md:h-8 w-8 text-muted-foreground/30 mb-2 md:mb-4" />
                  <p className="text-[10px] md:text-sm font-semibold text-muted-foreground">No transactions yet.</p>
                  <p className="text-[9px] md:text-xs text-muted-foreground/70 mt-1">Top up your wallet to get started.</p>
                </div>
              ) : (
                <div className="max-h-[220px] md:max-h-[400px] overflow-y-auto custom-scrollbar">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between border-b border-border p-2.5 md:p-4 hover:bg-muted/30 transition-colors last:border-b-0"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-[11px] md:text-sm font-bold text-foreground truncate">+{formatTokens(tx.tokens)} <span className="text-muted-foreground font-semibold">tokens</span></p>
                        <p className="text-[9px] md:text-xs font-medium text-muted-foreground mt-0.5">
                          {new Date(tx.createdAt).toLocaleDateString()} &bull; {tx.reference.slice(0, 8)}&hellip;
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn(
                          'text-[8px] md:text-[10px] font-black uppercase tracking-wider',
                          tx.status === 'success' ? 'text-green-600' : tx.status === 'pending' ? 'text-amber-500' : 'text-destructive'
                        )}>
                          {tx.status}
                        </p>
                        <p className="text-[11px] md:text-sm font-bold mt-0.5">{formatCurrency(tx.amountMinor, tx.currency)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="hidden md:flex flex-col items-center justify-between gap-3 border-t border-border/30 pt-4 text-xs text-muted-foreground md:flex-row">
        <p>© 2024 CloudTalk Enterprise. All rights reserved.</p>
        <div className="flex gap-4">
          <a className="hover:text-primary font-medium" href="#">Help Center</a>
          <a className="hover:text-primary font-medium" href="#">Contact Sales</a>
        </div>
      </footer>
    </div>
  );
}

export default memo(Billing);
