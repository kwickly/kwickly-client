'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Star, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function WalletPage() {
  const [balance, setBalance] = useState(25.00);
  const [isProcessing, setIsProcessing] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('50');

  const loyaltyPoints = 450;
  const loyaltyTier = 'Silver';
  
  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount < 10) {
      toast.error('Minimum top-up amount is $10');
      return;
    }

    setIsProcessing(true);
    // Simulate Razorpay topup
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setBalance(prev => prev + amount);
    setIsProcessing(false);
    toast.success(`Successfully added $${amount.toFixed(2)} to your wallet!`);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet & Loyalty</h1>
        <p className="text-muted-foreground mt-2 text-lg">Manage your prepaid balance and Kwickly loyalty points.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Wallet Card */}
        <Card className="border-indigo-100 shadow-sm dark:border-indigo-900">
          <CardHeader className="bg-indigo-50/50 dark:bg-indigo-950/20">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-indigo-600" /> Digital Wallet
            </CardTitle>
            <CardDescription>Use your wallet for fast, one-tap checkout</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-6">
              <span className="text-sm font-medium text-muted-foreground mb-2">Available Balance</span>
              <span className="text-5xl font-bold tracking-tight font-mono">${balance.toFixed(2)}</span>
            </div>

            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label>Quick Top-up</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[25, 50, 100].map(amt => (
                    <Button 
                      key={amt} 
                      variant={topUpAmount === amt.toString() ? 'default' : 'outline'}
                      onClick={() => setTopUpAmount(amt.toString())}
                    >
                      ${amt}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Custom Amount</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-medium">$</span>
                  <Input 
                    type="number" 
                    value={topUpAmount} 
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="text-lg font-mono"
                    min="10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full h-12 shadow-md shadow-indigo-600/10" onClick={handleTopUp} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-5 w-5" />}
              Add Funds
            </Button>
          </CardFooter>
        </Card>

        {/* Loyalty Card */}
        <Card className="border-amber-100 shadow-sm dark:border-amber-900/30 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-amber-500/10 rotate-12">
            <Star className="h-48 w-48" fill="currentColor" />
          </div>
          <CardHeader className="bg-amber-50/50 dark:bg-amber-950/20 relative">
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
              <Star className="h-5 w-5" fill="currentColor" /> Kwickly Rewards
            </CardTitle>
            <CardDescription>Earn points on every purchase</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 relative">
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-sm font-medium text-muted-foreground mb-1 block">Your Points</span>
                <span className="text-4xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{loyaltyPoints}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-muted-foreground mb-1 block">Current Tier</span>
                <span className="inline-block px-3 py-1 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 rounded-full text-sm font-bold tracking-wide">
                  {loyaltyTier.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to Gold Tier</span>
                <span className="font-medium">450 / 1000</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[45%]" />
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-100 dark:border-amber-900/50 text-sm text-amber-800 dark:text-amber-200">
              <span className="font-semibold block mb-1">Value: $4.50</span>
              You can redeem these points during checkout for a discount on your next meal or subscription renewal!
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
