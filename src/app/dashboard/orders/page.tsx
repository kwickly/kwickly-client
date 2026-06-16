'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MOCK_ORDERS = [
  {
    id: 'ORD-1092',
    date: 'Today, 1:15 PM',
    branch: 'Swamy Hot Foods',
    total: 0.00,
    items: ['1x Subscription Meal (Spicy Chicken Bowl)', '1x Mango Lassi (Paid: $4.99)'],
    status: 'Completed',
    type: 'Dine In'
  },
  {
    id: 'ORD-1085',
    date: 'Yesterday, 12:30 PM',
    branch: 'Swamy Hot Foods',
    total: 0.00,
    items: ['1x Subscription Meal (Vegetarian Pasta)'],
    status: 'Completed',
    type: 'Takeaway'
  }
];

export default function OrdersPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
        <p className="text-muted-foreground mt-2 text-lg">View your past redemptions and paid orders.</p>
      </div>

      <div className="space-y-4">
        {MOCK_ORDERS.map((order) => (
          <Card key={order.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row justify-between items-start bg-slate-50 dark:bg-slate-900/50 pb-4">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-indigo-600" /> Order {order.id}
                </CardTitle>
                <div className="text-sm text-muted-foreground">{order.date} • {order.branch}</div>
              </div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400">
                {order.status}
              </Badge>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Items:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {order.items.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="text-sm font-medium text-slate-500">{order.type}</p>
                <Button variant="ghost" size="sm" className="text-indigo-600 h-8">
                  View Receipt <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
