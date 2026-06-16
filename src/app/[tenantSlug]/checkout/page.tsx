'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { MapPin, Store, CreditCard, Gift, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage({ params }: { params: { tenantSlug: string } }) {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [diningMode, setDiningMode] = useState('takeaway');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useLoyalty, setUseLoyalty] = useState(false);

  const subtotal = totalPrice();
  const tax = subtotal * 0.08;
  const loyaltyDiscount = useLoyalty ? Math.min(5.00, subtotal) : 0;
  const finalTotal = subtotal + tax - loyaltyDiscount;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <ShoppingCartIcon className="h-16 w-16 text-slate-300" />
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <Button onClick={() => router.push(`/${params.tenantSlug}/menu`)}>Return to Menu</Button>
      </div>
    );
  }

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate Razorpay/Stripe checkout delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    toast.success('Payment successful! Your order has been placed.');
    clearCart();
    router.push('/dashboard/orders');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dining Preference</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={diningMode} onValueChange={setDiningMode} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <RadioGroupItem value="takeaway" id="takeaway" className="peer sr-only" />
                  <Label
                    htmlFor="takeaway"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600"
                  >
                    <Store className="mb-3 h-6 w-6" />
                    Takeaway
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="delivery" id="delivery" className="peer sr-only" />
                  <Label
                    htmlFor="delivery"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600"
                  >
                    <MapPin className="mb-3 h-6 w-6" />
                    Delivery
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <span className="font-semibold">{item.quantity}x</span>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-indigo-50 dark:bg-indigo-950/30">
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-indigo-600" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Use Loyalty Points</p>
                    <p className="text-xs text-muted-foreground">Save $5.00</p>
                  </div>
                </div>
                <Button 
                  variant={useLoyalty ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setUseLoyalty(!useLoyalty)}
                >
                  {useLoyalty ? 'Applied' : 'Apply'}
                </Button>
              </div>

              <Separator />

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes & Fees</span>
                  <span className="font-mono">${tax.toFixed(2)}</span>
                </div>
                {useLoyalty && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Loyalty Discount</span>
                    <span className="font-mono">-${loyaltyDiscount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <Separator />

              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span className="font-mono">${finalTotal.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Button 
            className="w-full h-14 text-lg shadow-lg shadow-indigo-600/20" 
            onClick={handlePayment} 
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <CreditCard className="h-5 w-5 mr-2" />
            )}
            {isProcessing ? 'Processing...' : `Pay $${finalTotal.toFixed(2)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Inline icon for empty state
function ShoppingCartIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
