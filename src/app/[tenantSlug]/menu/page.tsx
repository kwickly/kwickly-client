import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Search, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Mock Data
const categories = ['Recommended', 'Starters', 'Main Course', 'Desserts', 'Beverages'];
const menuItems = [
  { id: 1, name: 'Truffle Mushroom Risotto', price: '$24', category: 'Main Course', rating: 4.8, description: 'Creamy Arborio rice, wild mushrooms, parmesan crisp.', popular: true, image: 'https://images.unsplash.com/photo-1626372416494-313bc9fdb09e?w=800&q=80' },
  { id: 2, name: 'Wagyu Beef Sliders', price: '$18', category: 'Starters', rating: 4.9, description: 'Truffle aioli, caramelized onions, brioche buns.', popular: true, image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=800&q=80' },
  { id: 3, name: 'Burrata Salad', price: '$16', category: 'Starters', rating: 4.7, description: 'Heirloom tomatoes, fresh basil, balsamic glaze.', popular: false, image: 'https://images.unsplash.com/photo-1601000938259-9e92002320b2?w=800&q=80' },
  { id: 4, name: 'Pan-Seared Salmon', price: '$28', category: 'Main Course', rating: 4.6, description: 'Asparagus, lemon butter sauce, micro-greens.', popular: false, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80' },
];

export default function TenantMenuPage({ params }: { params: { tenantSlug: string } }) {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-4 pb-0">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white capitalize">
              {params.tenantSlug}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Order at Table 12</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {params.tenantSlug.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Search for dishes..." 
            className="pl-9 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl h-12"
          />
        </div>

        {/* Categories (Horizontal Scroll) */}
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex w-max space-x-2">
            {categories.map((cat, idx) => (
              <Badge 
                key={cat} 
                variant={idx === 0 ? "default" : "secondary"}
                className={`px-4 py-2 text-sm rounded-full cursor-pointer transition-all hover:scale-105 ${
                  idx === 0 ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'bg-white dark:bg-slate-800'
                }`}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </ScrollArea>
      </header>

      {/* Menu List */}
      <main className="flex-1 p-4 pb-32">
        <div className="space-y-6">
          {menuItems.map((item) => (
            <Card key={item.id} className="overflow-hidden border-none shadow-sm dark:bg-slate-900 group">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-1/3 h-48 sm:h-auto relative overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {item.popular && (
                    <Badge className="absolute top-3 left-3 bg-white/90 text-primary hover:bg-white backdrop-blur-sm border-none shadow-sm">
                      <Star className="w-3 h-3 mr-1 fill-primary" /> Popular
                    </Badge>
                  )}
                </div>
                <CardContent className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{item.name}</h3>
                      <span className="font-bold text-lg text-primary">{item.price}</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                      {item.description}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center text-sm font-medium text-amber-500">
                      <Star className="w-4 h-4 fill-amber-500 mr-1" /> {item.rating}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-slate-200 dark:border-slate-700">
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-medium text-sm w-4 text-center">0</span>
                      <Button size="icon" className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Floating Cart (Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-slate-950 dark:via-slate-950/95 pb-8 pt-12">
        <div className="max-w-md mx-auto">
          <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-medium shadow-xl shadow-primary/20 flex justify-between px-6">
            <div className="flex items-center">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold mr-3">2 items</span>
              View Order
            </div>
            <span>$42.00</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
