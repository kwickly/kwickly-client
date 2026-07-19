'use client';

import { ShoppingCart, Plus, Minus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/store/useCart';
import Link from 'next/link';
import { formatCurrency } from '@/lib/currency';

export function CartDrawer({ 
  tenantSlug,
  baseCurrency = "INR"
}: { 
  tenantSlug: string;
  baseCurrency?: string;
}) {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCartStore();
  const itemCount = totalItems();
  const total = totalPrice();

  return (
    <Sheet>
      <SheetTrigger className="relative inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-10 w-10">
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {itemCount}
          </span>
        )}
        <span className="sr-only">Cart</span>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl font-bold">
            <ShoppingCart className="h-5 w-5 text-primary" /> Your Order
          </SheetTitle>
        </SheetHeader>
        
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full">
              <ShoppingCart className="h-12 w-12 text-slate-400" />
            </div>
            <p className="text-xl font-semibold text-slate-600 dark:text-slate-400">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Looks like you haven't added any items yet.</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6 mt-6">
              <div className="space-y-6 pb-8">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-base">{item.name}</h4>
                      <p className="text-sm text-muted-foreground font-mono">{formatCurrency(item.price, baseCurrency)}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-md hover:bg-white dark:hover:bg-slate-700 shadow-sm"
                        onClick={() => item.quantity === 1 ? removeItem(item.id) : updateQuantity(item.id, item.quantity - 1)}
                      >
                        {item.quantity === 1 ? <X className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                      </Button>
                      <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-md hover:bg-white dark:hover:bg-slate-700 shadow-sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="w-16 text-right font-semibold font-mono">
                      {formatCurrency(item.price * item.quantity, baseCurrency)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-auto space-y-4 pt-6">
              <Separator />
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">{formatCurrency(total, baseCurrency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes</span>
                  <span className="font-mono">{formatCurrency(total * 0.08, baseCurrency)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span className="font-mono">{formatCurrency(total * 1.08, baseCurrency)}</span>
                </div>
              </div>
              <div className="pt-4">
                <Link href="/checkout" className="w-full">
                  <Button className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/95 text-primary-foreground shadow-xl shadow-primary/20">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
