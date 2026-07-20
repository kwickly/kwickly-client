'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCart';
import { useAuthStore } from '@/store/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { MapPin, Store, CreditCard, Gift, Loader2, LogIn, ShoppingBag, ChevronRight, Utensils, ArrowLeft, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { getTenantSlug } from '@/lib/tenant-helper';
import { formatCurrency } from '@/lib/currency';
import { CheckoutSkeleton } from '@/components/ui/skeletons';
import Link from 'next/link';
import React from 'react';

export default function CheckoutPage() {
  const [tenantSlug, setTenantSlug] = useState('');
  const [baseCurrency, setBaseCurrency] = useState('INR');
  const [brandColor, setBrandColor] = useState('#4f46e5');
  const [limitExceeded, setLimitExceeded] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [allowTakeawayOnDineIn, setAllowTakeawayOnDineIn] = useState(false);
  const [loyaltyBalance, setLoyaltyBalance] = useState<number | null>(null); // actual balance from API

  const { isAuthenticated, user } = useAuthStore();

  React.useEffect(() => {
    const slug = getTenantSlug(window.location.host) || 'kwickly';
    setTenantSlug(slug);

    const init = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

        const [brandingRes, limitRes] = await Promise.all([
          fetch(`${apiUrl}/auth/branding?hostname=${slug}`),
          fetch(`${apiUrl}/orders/limit-status/${slug}`),
        ]);

        const brandingData = await brandingRes.json();
        if (brandingData.success && brandingData.branding) {
          setBaseCurrency(brandingData.branding.baseCurrency || 'INR');
          setBrandColor(brandingData.branding.brandColor || '#4f46e5');
          setAllowTakeawayOnDineIn(!!brandingData.branding.allowTakeawayOnDineIn);
        }

        const limitData = await limitRes.json();
        if (limitRes.ok && limitData.success) {
          setLimitExceeded(limitData.limitExceeded);
        }
      } catch (error) {
        console.error('Failed to load checkout data:', error);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    init();
  }, []);

  const router = useRouter();
  const { items, totalPrice, clearCart, qrToken, updateItemFulfillmentMode } = useCartStore();
  const [diningMode, setDiningMode] = useState(qrToken ? 'dine_in' : 'takeaway');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useLoyalty, setUseLoyalty] = useState(false);

  const subtotal = totalPrice();
  const tax = subtotal * 0.08;
  // Loyalty discount is only for authenticated users who have a balance
  const maxLoyaltyDiscount = 5.00;
  const loyaltyDiscount = (isAuthenticated && useLoyalty) ? Math.min(maxLoyaltyDiscount, subtotal) : 0;
  const finalTotal = subtotal + tax - loyaltyDiscount;

  /* ── Empty cart state ─────────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-5 px-4">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{ background: `${brandColor}14` }}
        >
          <ShoppingBag className="h-9 w-9" style={{ color: brandColor }} />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Your cart is empty</h2>
          <p className="text-sm text-slate-400 mt-1">Go back and add some delicious dishes!</p>
        </div>
        <Button onClick={() => router.push('/menu')} style={{ background: brandColor }} className="text-white h-11 px-8 rounded-xl font-bold">
          Browse Menu
        </Button>
      </div>
    );
  }

  /* ── Loading state — skeleton ─────────────────────────────────── */
  if (isLoadingStatus) {
    return <CheckoutSkeleton />;
  }

  /* ── Order limit reached ──────────────────────────────────────── */
  if (limitExceeded) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-950/30 flex items-center justify-center rounded-2xl text-red-500">
          <Store className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Restaurant Unavailable</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            This restaurant has reached its monthly order limit on the Basic plan. Please ask staff to place your order manually.
          </p>
        </div>
        <Button onClick={() => router.push('/menu')} className="w-full rounded-xl h-11" style={{ background: brandColor }}>
          Return to Menu
        </Button>
      </div>
    );
  }

  /* ── Handlers ─────────────────────────────────────────────────── */
  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1';
      const orderPayload = {
        branchId: 'default',
        tableNumber: qrToken ? 'QR-Ordered' : 'Counter',
        mode: diningMode,
        type: 'paid',
        qrToken: qrToken || undefined,
        items: items.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          fulfillmentMode: item.fulfillmentMode || undefined,
        })),
      };

      const res = await fetch(`${apiUrl}/orders/public/${tenantSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!data.success) {
        if (data.error?.toLowerCase().includes('invalid') || data.error === 'Internal Server Error') {
          toast.error('Your cart contained invalid items and has been reset.');
          clearCart();
          router.push('/menu');
          return;
        }
        throw new Error(data.error || 'Failed to place order');
      }

      if (diningMode === 'dine_in') {
        toast.success('Order sent to kitchen! Enjoy your meal.');
        if (data.data?.order?.id) {
          localStorage.setItem('kwickly_active_order_id', data.data.order.id);
          clearCart();
          router.push(`/orders/${data.data.order.id}`);
          return;
        }
      } else {
        toast.success('Order sent to kitchen! Please pay at the counter.');
      }
      clearCart();
      router.push('/menu');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Confirm Order</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left column ───────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Dining preference */}
          <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black text-slate-700 dark:text-slate-300">
                {qrToken ? 'Ordering Mode' : 'How would you like your order?'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {qrToken ? (
                <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                  <QrCode className="w-5 h-5" />
                  <span className="text-sm font-bold">QR Table Order (Dine-in)</span>
                </div>
              ) : (
                <RadioGroup value={diningMode} onValueChange={setDiningMode} className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'dine_in', label: 'Dine-in', icon: Utensils },
                    { value: 'takeaway', label: 'Takeaway', icon: Store },
                    { value: 'delivery', label: 'Delivery', icon: MapPin },
                  ].map(({ value, label, icon: Icon }) => (
                    <div key={value}>
                      <RadioGroupItem value={value} id={value} className="peer sr-only" />
                      <Label
                        htmlFor={value}
                        className="flex flex-col items-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 cursor-pointer transition-all hover:border-slate-300 peer-data-[state=checked]:border-[3px]"
                        style={diningMode === value ? { borderColor: brandColor } : {}}
                      >
                        <Icon className="h-5 w-5 text-slate-500" style={diningMode === value ? { color: brandColor } : {}} />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300" style={diningMode === value ? { color: brandColor } : {}}>{label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </CardContent>
          </Card>

          {/* Order items */}
          <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black text-slate-700 dark:text-slate-300">Your Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex flex-col gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs font-black rounded-lg px-2 py-0.5 text-white shrink-0"
                        style={{ background: brandColor }}
                      >
                        {item.quantity}×
                      </span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-slate-800 dark:text-white shrink-0">
                      {formatCurrency(item.price * item.quantity, baseCurrency)}
                    </span>
                  </div>
                  {diningMode === 'dine_in' && allowTakeawayOnDineIn && (
                    <div className="pl-10 flex items-center gap-2">
                      <label className="text-[11px] font-medium text-slate-500 cursor-pointer flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-brand focus:ring-brand accent-brand"
                          style={{ accentColor: brandColor }}
                          checked={item.fulfillmentMode === 'takeaway'}
                          onChange={(e) => updateItemFulfillmentMode(item.id, e.target.checked ? 'takeaway' : undefined)}
                        />
                        Pack to-go
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ── Right column: bill + loyalty + CTA ────────────────── */}
        <div className="space-y-5">
          <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black text-slate-700 dark:text-slate-300">Bill Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* ── Loyalty points section ─────────────────────── */}
              {isAuthenticated ? (
                /* Logged in — show toggle */
                <div
                  className="flex items-center justify-between p-3 rounded-xl border"
                  style={{ background: `${brandColor}0a`, borderColor: `${brandColor}25` }}
                >
                  <div className="flex items-center gap-2.5">
                    <Gift className="h-4 w-4 shrink-0" style={{ color: brandColor }} />
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Loyalty Points</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Save up to {formatCurrency(maxLoyaltyDiscount, baseCurrency)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUseLoyalty(v => !v)}
                    className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
                      useLoyalty ? 'text-white' : 'border'
                    }`}
                    style={useLoyalty
                      ? { background: brandColor }
                      : { borderColor: `${brandColor}40`, color: brandColor }
                    }
                  >
                    {useLoyalty ? '✓ Applied' : 'Apply'}
                  </button>
                </div>
              ) : (
                /* Guest — nudge to sign in */
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <Gift className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Earn &amp; redeem loyalty points</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                      Sign in to apply points and save on every order.
                    </p>
                    <Link href="/auth" className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-black uppercase tracking-wider" style={{ color: brandColor }}>
                      <LogIn className="w-3 h-3" /> Sign in to unlock
                    </Link>
                  </div>
                </div>
              )}

              <Separator className="opacity-50" />

              {/* Bill lines */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Item total</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{formatCurrency(subtotal, baseCurrency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Taxes &amp; GST (8%)</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{formatCurrency(tax, baseCurrency)}</span>
                </div>
                {useLoyalty && isAuthenticated && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Loyalty Discount</span>
                    <span className="font-mono">−{formatCurrency(loyaltyDiscount, baseCurrency)}</span>
                  </div>
                )}
              </div>

              <Separator className="opacity-50" />

              <div className="flex justify-between items-center">
                <span className="font-black text-slate-900 dark:text-white text-base">To Pay</span>
                <span className="font-black font-mono text-lg" style={{ color: brandColor }}>
                  {formatCurrency(finalTotal, baseCurrency)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full h-14 rounded-2xl text-white text-sm font-black flex items-center justify-center gap-2.5 shadow-lg transition-all disabled:opacity-60 hover:brightness-95"
            style={{ background: brandColor }}
          >
            {isProcessing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Placing Order…</>
            ) : diningMode === 'dine_in' ? (
              <><Utensils className="h-4 w-4" /> Place Order <ChevronRight className="h-3.5 w-3.5" /></>
            ) : (
              <><CreditCard className="h-4 w-4" /> Pay {formatCurrency(finalTotal, baseCurrency)} <ChevronRight className="h-3.5 w-3.5" /></>
            )}
          </button>

          {!isAuthenticated && (
            <p className="text-center text-[10px] text-slate-400">
              Ordering as guest.{' '}
              <Link href="/auth" className="font-bold underline underline-offset-2" style={{ color: brandColor }}>
                Sign in
              </Link>{' '}
              to track orders &amp; earn rewards.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
