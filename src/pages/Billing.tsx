import { useState, memo } from 'react';
import { Lock, CheckCircle, Shield, CreditCard, Tag, Loader2, Apple, Wallet } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';

const lineItems = [
  { label: 'Subtotal', amount: 499.0 },
  { label: 'Platform Fee', amount: 15.0 },
  { label: 'Tax (8%)', amount: 41.12 },
];

const total = lineItems.reduce((sum, item) => sum + item.amount, 0);

const savedCards = [
  { id: 'visa', brand: 'Visa', last4: '4242', expires: '12/26', default: true },
  { id: 'mastercard', brand: 'Mastercard', last4: '8801', expires: '05/25', default: false },
];

export function Billing() {
  const [selectedCard, setSelectedCard] = useState('visa');
  const [agreed, setAgreed] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [promo, setPromo] = useState('');

  const handlePurchase = () => {
    if (!agreed) return;
    setProcessing(true);
    window.setTimeout(() => {
      setProcessing(false);
      setCompleted(true);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing &amp; Checkout</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription and payment methods.</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Column: Order Summary */}
        <div className="space-y-6 lg:col-span-5">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <Card className="glass-card">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">ProConnect Enterprise Plan</p>
                    <p className="text-xs text-muted-foreground">Annual Subscription • 50 Licenses</p>
                  </div>
                </div>
                <p className="font-bold">$499.00</p>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-2">
                {lineItems.map((item) => (
                  <div key={item.label} className="flex justify-between text-sm text-muted-foreground">
                    <span>{item.label}</span>
                    <span>${item.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between py-1">
                <span className="text-lg font-semibold">Total Due</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary">${total.toFixed(2)}</span>
                  <p className="text-xs text-muted-foreground">USD per year</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Promo code"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  className="rounded-lg border-border pl-9"
                />
              </div>
              <Button variant="outline">Apply</Button>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 opacity-60">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>SSL Secure</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>PCI Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <span>SOC2 Type II</span>
            </div>
          </div>
        </div>

        {/* Right Column: Payment & Billing */}
        <div className="space-y-6 lg:col-span-7">
          <h2 className="text-lg font-semibold">Payment Details</h2>
          <Card className="glass-card">
            <CardContent className="space-y-6 p-6 md:p-8">
              {/* Express Checkout */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Express Checkout</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-12 rounded-xl bg-black text-white hover:bg-black/90 hover:text-white">
                    <Apple className="mr-2 h-5 w-5" />
                    Pay
                  </Button>
                  <Button variant="outline" className="h-12 rounded-xl">
                    <Wallet className="mr-2 h-5 w-5 text-blue-500" />
                    Google Pay
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Or pay by card</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Saved Cards */}
              <div className="space-y-3">
                {savedCards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCard(card.id)}
                    className={cn(
                      'group flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all',
                      selectedCard === card.id ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-12 items-center justify-center rounded border bg-white">
                        <CreditCard className={cn('h-4 w-4', card.brand === 'Visa' ? 'text-blue-600' : 'text-orange-600')} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">
                          {card.brand} ending in {card.last4}
                        </p>
                        <p className="text-xs text-muted-foreground">Expires {card.expires}</p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'h-5 w-5 rounded-full border-4',
                        selectedCard === card.id ? 'border-primary bg-white' : 'border-border bg-white'
                      )}
                    />
                  </div>
                ))}
                <Button variant="ghost" className="px-0 text-primary hover:underline">
                  <span className="mr-1">+</span>
                  Add new payment method
                </Button>
              </div>

              {/* Billing Address */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Billing Address</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Street Address</label>
                    <Input defaultValue="123 Innovation Drive" className="rounded-lg" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Suite / Apartment</label>
                    <Input defaultValue="Suite 400" className="rounded-lg" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">City</label>
                    <Input defaultValue="Palo Alto" className="rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">State</label>
                      <Input defaultValue="CA" className="rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">ZIP</label>
                      <Input defaultValue="94304" className="rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Action */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                  />
                  <label htmlFor="terms" className="text-xs leading-relaxed text-muted-foreground">
                    By clicking &quot;Complete Purchase&quot;, I agree to ProConnect&apos;s{' '}
                    <a className="text-primary hover:underline" href="#">Terms of Service</a> and{' '}
                    <a className="text-primary hover:underline" href="#">Privacy Policy</a>. This is an annual subscription that
                    will automatically renew.
                  </label>
                </div>
                <Button
                  className={cn(
                    'h-14 w-full rounded-xl text-base font-semibold shadow-lg transition-all',
                    completed ? 'bg-green-600 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'
                  )}
                  onClick={handlePurchase}
                  disabled={processing || completed || !agreed}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing Transaction...
                    </>
                  ) : completed ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Purchase Confirmed
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-5 w-5" />
                      Complete Purchase • ${total.toFixed(2)}
                    </>
                  )}
                </Button>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>256-bit AES Encryption Secure Checkout</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="flex flex-col items-center justify-between gap-3 border-t border-border/30 pt-4 text-xs text-muted-foreground md:flex-row">
        <p>© 2024 ProConnect Communications Inc. All rights reserved.</p>
        <div className="flex gap-4">
          <a className="hover:text-primary" href="#">Help Center</a>
          <a className="hover:text-primary" href="#">Contact Sales</a>
          <a className="hover:text-primary" href="#">Refund Policy</a>
        </div>
      </footer>
    </div>
  );
}

export default memo(Billing);
