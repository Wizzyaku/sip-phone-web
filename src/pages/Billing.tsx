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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wallet & Top-up</h1>
        <p className="text-sm text-muted-foreground">Buy token credits to power calls and messages.</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Column: Balance & Packages */}
        <div className="space-y-6 lg:col-span-7">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Token Balance</p>
                    <p className="text-2xl font-bold text-primary">
                      {balanceLoading || balance === null ? (
                        <span className="inline-block h-6 w-24 animate-pulse rounded bg-muted" />
                      ) : (
                        formatTokens(balance.tokens)
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">1 NGN / token</p>
                  <p className="text-sm font-semibold">₦1.00 minimum</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Select Token Package</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {TOKEN_PACKAGES.map((pkg, index) => (
                <button
                  key={pkg.tokens}
                  onClick={() => {
                    setSelectedPackage(index);
                    setCustomTokens('');
                  }}
                  className={cn(
                    'flex items-center justify-between rounded-xl border-2 p-4 text-left transition-all',
                    selectedPackage === index
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background hover:border-primary/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Coins className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{pkg.label}</p>
                      <p className="text-xs text-muted-foreground">{formatTokens(pkg.tokens)} tokens</p>
                    </div>
                  </div>
                  <p className="font-bold text-primary">{formatCurrency(pkg.priceMinor, pkg.currency)}</p>
                </button>
              ))}
            </div>
          </div>

          <Card className="glass-card">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Custom amount</p>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={100}
                  placeholder="Enter tokens (e.g. 2500)"
                  value={customTokens}
                  onChange={(e) => {
                    setCustomTokens(e.target.value);
                    setSelectedPackage(null);
                  }}
                  className="rounded-lg"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">tokens</span>
              </div>
              {customTokens && selectedPackage === null && (
                <p className="text-sm text-primary">
                  Cost: {formatCurrency(Number(customTokens) * 100, 'NGN')}
                </p>
              )}
            </CardContent>
          </Card>

          {reference && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-sm">Payment reference received</p>
                  <p className="text-xs text-muted-foreground">
                    Ref: {reference}. Your balance will update automatically once the payment is confirmed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              {success}
            </div>
          )}

          <Button
            className="h-14 w-full rounded-xl text-base font-semibold shadow-lg"
            onClick={handlePay}
            disabled={processing || !activePackage}
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Initializing Korapay...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Pay {activePackage ? formatCurrency(activePackage.priceMinor, activePackage.currency) : ''}
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>

        {/* Right Column: Transaction History */}
        <div className="space-y-6 lg:col-span-5">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </h2>
          <Card className="glass-card">
            <CardContent className="p-0">
              {transactionsLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 w-full animate-pulse rounded bg-muted" />
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No top-ups yet. Select a package to get started.
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between border-b border-border/50 p-4 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">+{formatTokens(tx.tokens)} tokens</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString()} • {tx.reference.slice(0, 12)}…
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          'text-xs font-bold uppercase',
                          tx.status === 'success' ? 'text-green-600' : tx.status === 'pending' ? 'text-amber-500' : 'text-destructive'
                        )}>
                          {tx.status}
                        </p>
                        <p className="text-sm font-medium">{formatCurrency(tx.amountMinor, tx.currency)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="flex flex-col items-center justify-between gap-3 border-t border-border/30 pt-4 text-xs text-muted-foreground md:flex-row">
        <p>© 2024 CloudTalk Enterprise. All rights reserved.</p>
        <div className="flex gap-4">
          <a className="hover:text-primary" href="#">Help Center</a>
          <a className="hover:text-primary" href="#">Contact Sales</a>
        </div>
      </footer>
    </div>
  );
}

export default memo(Billing);
