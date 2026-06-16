'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/useCart';
import { Skeleton } from '@/components/ui/skeleton';
import { use } from 'react';

// Mock data to simulate API
const MOCK_MENU = [
  {
    id: 'cat-1',
    name: 'Main Course',
    items: [
      { id: 'item-1', name: 'Spicy Chicken Bowl', price: 12.99, description: 'Grilled chicken with rice and spicy sauce.' },
      { id: 'item-2', name: 'Vegetarian Pasta', price: 10.99, description: 'Penne pasta with marinara and fresh veggies.' },
    ]
  },
  {
    id: 'cat-2',
    name: 'Beverages',
    items: [
      { id: 'item-3', name: 'Mango Lassi', price: 4.99, description: 'Fresh yogurt and mango drink.' },
      { id: 'item-4', name: 'Iced Coffee', price: 3.99, description: 'Cold brewed coffee.' },
    ]
  }
];

export default function MenuPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = use(params);
  const { items: cartItems, addItem, removeItem, updateQuantity } = useCartStore();

  const { data: menu, isLoading } = useQuery({
    queryKey: ['menu', tenantSlug],
    queryFn: async () => {
      // Simulate network request
      return new Promise(resolve => setTimeout(() => resolve(MOCK_MENU), 800));
    }
  });

  const getCartQuantity = (itemId: string) => {
    return cartItems.find(i => i.id === itemId)?.quantity || 0;
  };

  const handleAdd = (item: any) => {
    addItem({ id: item.id, name: item.name, price: item.price, quantity: 1 });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-end mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Menu</h1>
          <p className="text-muted-foreground mt-1 text-lg">Order fresh meals directly to your table or for pickup.</p>
        </div>
      </div>

      <div className="space-y-12">
        {(menu as typeof MOCK_MENU)?.map((category) => (
          <div key={category.id} className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">{category.name}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items.map((item) => {
                const qty = getCartQuantity(item.id);
                return (
                  <Card key={item.id} className="flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 bg-slate-50 dark:bg-slate-900/50">
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <Badge variant="secondary" className="font-mono text-sm">${item.price.toFixed(2)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-1">
                      <CardDescription className="text-sm">{item.description}</CardDescription>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      {qty > 0 ? (
                        <div className="flex items-center gap-4 w-full justify-between bg-slate-100 dark:bg-slate-800 rounded-md p-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => qty === 1 ? removeItem(item.id) : updateQuantity(item.id, qty - 1)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-semibold w-8 text-center">{qty}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, qty + 1)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button className="w-full font-semibold" variant="outline" onClick={() => handleAdd(item)}>
                          <ShoppingCart className="h-4 w-4 mr-2" /> Add to Order
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
