"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Search, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/store/useCart';

export default function MenuClientView({ 
  tenantSlug, 
  categories 
}: { 
  tenantSlug: string;
  categories: any[];
}) {
  const [search, setSearch] = useState('');
  
  const cartStore = useCartStore();
  const cartItems = cartStore.items;
  const totalItems = cartStore.totalItems();
  const totalPrice = cartStore.totalPrice();

  const getQuantity = (id: string) => cartItems.find(i => i.id === id)?.quantity || 0;

  // Fallback image if item doesn't have one
  const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-4 pb-0">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white capitalize">
              {tenantSlug}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Order at Table 12</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {tenantSlug.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Search for dishes..." 
            className="pl-9 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl h-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Categories (Horizontal Scroll) */}
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex w-max space-x-2">
            <Badge 
              variant="default"
              className="bg-primary text-primary-foreground shadow-lg shadow-primary/25 px-4 py-2 text-sm rounded-full cursor-pointer transition-all hover:scale-105"
            >
              All
            </Badge>
            {categories.map((cat, idx) => (
              <Badge 
                key={cat.id} 
                variant="secondary"
                className="bg-white dark:bg-slate-800 px-4 py-2 text-sm rounded-full cursor-pointer transition-all hover:scale-105"
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        </ScrollArea>
      </header>

      {/* Menu List */}
      <main className="flex-1 p-4 pb-32">
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category.id} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{category.name}</h2>
              <div className="space-y-6">
                {category.items?.filter((item: any) => item.name.toLowerCase().includes(search.toLowerCase())).map((item: any) => (
                  <Card key={item.id} className="overflow-hidden border-none shadow-sm dark:bg-slate-900 group">
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-1/3 h-48 sm:h-auto relative overflow-hidden">
                        <img 
                          src={item.imageUrl || fallbackImage} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {item.isVeg && (
                          <Badge className="absolute top-3 left-3 bg-green-500/90 text-white backdrop-blur-sm border-none shadow-sm">
                            Veg
                          </Badge>
                        )}
                      </div>
                      <CardContent className="flex-1 p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{item.name}</h3>
                            <span className="font-bold text-lg text-primary">${Number(item.price).toFixed(2)}</span>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                            {item.description || 'Delicious freshly prepared meal.'}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center text-sm font-medium text-amber-500">
                            {/* <Star className="w-4 h-4 fill-amber-500 mr-1" /> 4.8 */}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {getQuantity(item.id) > 0 ? (
                              <>
                                <Button onClick={() => {
                                  const q = getQuantity(item.id);
                                  if (q > 1) cartStore.updateQuantity(item.id, q - 1);
                                  else cartStore.removeItem(item.id);
                                }} variant="outline" size="icon" className="h-8 w-8 rounded-full border-slate-200 dark:border-slate-700">
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="font-medium text-sm w-4 text-center">{getQuantity(item.id)}</span>
                              </>
                            ) : null}
                            <Button 
                              onClick={() => {
                                const q = getQuantity(item.id);
                                if (q > 0) cartStore.updateQuantity(item.id, q + 1);
                                else cartStore.addItem({ id: item.id, name: item.name, price: Number(item.price), quantity: 1 });
                              }} 
                              size="icon" 
                              className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Cart (Bottom) */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-slate-950 dark:via-slate-950/95 pb-8 pt-12 animate-in slide-in-from-bottom-10">
          <div className="max-w-md mx-auto">
            <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-medium shadow-xl shadow-primary/20 flex justify-between px-6">
              <div className="flex items-center">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold mr-3">{totalItems} items</span>
                View Order
              </div>
              <span>${totalPrice.toFixed(2)}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
