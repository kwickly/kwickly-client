'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Info } from 'lucide-react';

const MOCK_PLANS = [
  {
    id: 'plan-1',
    name: 'Starter Weekly',
    price: 49.99,
    meals: 7,
    type: 'Lunch Only',
    popular: false,
    features: ['7 Meals valid for 10 days', 'Any Main Course', 'Carry-forward unused meals']
  },
  {
    id: 'plan-2',
    name: 'Pro Monthly',
    price: 179.99,
    meals: 30,
    type: 'Lunch or Dinner',
    popular: true,
    features: ['30 Meals valid for 45 days', 'Any Main Course + Beverage', 'Priority Queue', 'Earn Loyalty Points']
  }
];

export default function PlansPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Meal Subscriptions</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Save money and skip the queue. Subscribe to a plan and simply scan your QR code at the counter.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {MOCK_PLANS.map((plan) => (
          <Card key={plan.id} className={`relative flex flex-col ${plan.popular ? 'border-indigo-600 shadow-indigo-500/10 shadow-2xl' : 'shadow-lg border-slate-200 dark:border-slate-800'}`}>
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              </div>
            )}
            <CardHeader className="text-center pb-2 pt-8">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="text-md mt-2 font-medium text-slate-600 dark:text-slate-400">{plan.type}</CardDescription>
              <div className="mt-4 flex justify-center items-baseline text-5xl font-extrabold">
                ${plan.price.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                ${(plan.price / plan.meals).toFixed(2)} per meal
              </p>
            </CardHeader>
            <CardContent className="flex-1 mt-6">
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1 rounded-full text-emerald-600">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-lg">{plan.meals} Meals Total</span>
                </li>
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pb-8 pt-4">
              <Button className="w-full h-12 text-lg font-semibold" variant={plan.popular ? 'default' : 'outline'}>
                Subscribe Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Info className="h-4 w-4" />
        <p>Subscriptions are billed securely via Razorpay. Pause or cancel anytime.</p>
      </div>
    </div>
  );
}
