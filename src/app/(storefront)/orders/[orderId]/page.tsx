'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, ChefHat, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { useSmartETA } from '@/hooks/useSmartETA';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: string;
  total: string;
  fulfillmentMode?: 'dine_in' | 'takeaway' | 'delivery';
}

interface OrderStatus {
  id: string;
  orderStatus: string;
  kotStatus: string | null;
  mode: string;
  tableNumber: string | null;
  subtotal: string;
  total: string;
  createdAt: string;
  estimatedCompletionTime: string | null;
  items: OrderItem[];
}

export default function OrderTrackingPage({ params }: { params: Promise<{ orderId: string }> }) {
  const router = useRouter();
  const { orderId } = use(params);
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1';

  useEffect(() => {
    // 1. Initial Fetch
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_URL}/orders/public/status/${orderId}`);
        const data = await res.json();
        
        if (!data.success) {
          setError(data.error || 'Order not found');
          localStorage.removeItem('kwickly_active_order_id');
        } else {
          setOrder(data.data);
        }
      } catch (err: any) {
        setError('Failed to load order status.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // 2. Setup Server-Sent Events (SSE)
    const eventSource = new EventSource(`${API_URL}/orders/public/status/${orderId}/sse`);
    
    eventSource.addEventListener('status_update', (e) => {
      try {
        const payload = JSON.parse(e.data);
        setOrder(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            kotStatus: payload.kot.status,
            orderStatus: payload.order.status
          };
        });
      } catch (err) {
        console.error('Failed to parse SSE payload:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [orderId, API_URL]);

  // Smart ETA Hook (Must be called before conditional returns)
  const { etaText, isDelayed } = useSmartETA(
    order?.createdAt || new Date().toISOString(),
    order?.estimatedCompletionTime || null,
    (order?.kotStatus as 'pending' | 'preparing' | 'ready' | 'completed') || 'pending'
  );

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive mb-4">{error || 'Order not found'}</p>
            <Button onClick={() => router.push('/menu')}>Return to Menu</Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background pb-24 pt-6 md:pt-10">
      <main className="container mx-auto px-4 max-w-lg space-y-6">
        
        {/* Page Title & Meta */}
        <div className="flex items-end justify-between mb-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Track Order
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="uppercase tracking-widest text-[11px] font-bold">
                Order #{order.id.slice(-6).toUpperCase()}
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="flex items-center gap-1">
                Placed at {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">
              {order.mode === 'takeaway' ? 'Takeaway' : order.tableNumber?.toLowerCase() === 'counter' ? 'Pickup' : 'Dine In'}
            </span>
            <Badge variant="outline" className="text-foreground font-bold text-lg px-3 py-1">
              {order.mode === 'takeaway' || order.tableNumber?.toLowerCase() === 'counter'
                ? 'Counter' 
                : order.tableNumber?.toLowerCase().startsWith('table') 
                  ? order.tableNumber 
                  : `Table ${order.tableNumber || 'Unknown'}`}
            </Badge>
          </div>
        </div>
        
        {/* Status Stepper Card */}
        <div className="bg-card text-card-foreground rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none overflow-hidden">
          <CardHeader className="text-center pb-2 pt-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {order.kotStatus === 'ready' ? "It's Ready!" : 
               order.kotStatus === 'preparing' ? "In the Kitchen" : 
               "Order Received"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-[250px] mx-auto leading-relaxed">
              {order.kotStatus === 'ready' ? "Your order is ready to be served or picked up." : 
               order.kotStatus === 'preparing' ? "The chefs are preparing your food right now." : 
               "We've got your order and are waiting to start."}
            </p>

            {/* Subtle ETA / Delay Text */}
            {order.kotStatus !== 'ready' && order.kotStatus !== 'completed' && (
              <div className="mt-3 flex items-center justify-center gap-1.5">
                {isDelayed ? (
                   <AlertCircle className="w-4 h-4 text-orange-500" />
                ) : (
                   <Clock className="w-4 h-4 text-primary" />
                )}
                <span className={`text-sm font-medium ${isDelayed ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'}`}>
                   {isDelayed 
                     ? `Running a little behind schedule` 
                     : `Expected in ${etaText}`}
                </span>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="pt-6 pb-10 flex justify-center">
            <div className="relative mt-2">
              {/* Pulsing background effect for active states */}
              {(order.kotStatus === 'preparing' || order.kotStatus === 'pending') && (
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              )}
              
              <div className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                {order.kotStatus === 'ready' ? (
                  <CheckCircle2 className="w-12 h-12 animate-in zoom-in duration-500 text-green-500" />
                ) : order.kotStatus === 'preparing' ? (
                  <ChefHat className="w-12 h-12 animate-pulse" />
                ) : (
                  <ShoppingBag className="w-10 h-10" />
                )}
              </div>
            </div>
          </CardContent>
        </div>

        {/* Receipt styled details */}
        <div className="relative rounded-[24px] bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none overflow-hidden">
          {/* Dashed line top decoration */}
          <div className="absolute top-0 left-0 right-0 h-1 flex justify-around overflow-hidden opacity-20">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-foreground -mt-1" />
            ))}
          </div>

          <div className="p-6">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-widest mb-6">Order Summary</h3>
            
            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <span className="font-bold text-foreground bg-muted w-6 h-6 rounded flex items-center justify-center text-xs shrink-0 mt-0.5">
                      {item.quantity}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground pt-0.5">{item.name}</span>
                      {item.fulfillmentMode === 'takeaway' && (
                        <Badge variant="outline" className="w-fit text-[10px] uppercase tracking-widest mt-1 border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-400">
                          To-Go
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="font-semibold text-foreground pt-0.5 tabular-nums">₹{Number(item.total).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="my-6 border-t border-dashed border-border/40" />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">₹{Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg pt-2">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-foreground tabular-nums">₹{Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Dashed line bottom decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-1 flex justify-around overflow-hidden opacity-20">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-foreground -mb-1" />
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="pt-2">
          <Button 
            className="w-full h-12 rounded-xl text-base font-bold"
            onClick={() => router.push('/menu')}
          >
            Order More Items
          </Button>
        </div>

      </main>
    </div>
  );
}
