'use client';

import { useAuthStore } from '@/store/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Clock, Utensils } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getTenantSlug } from '@/lib/tenant-helper';
import { formatCurrency } from '@/lib/currency';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [totpCountdown, setTotpCountdown] = useState(30);
  const [baseCurrency, setBaseCurrency] = useState('INR');

  useEffect(() => {
    const interval = setInterval(() => {
      setTotpCountdown(prev => (prev === 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const slug = getTenantSlug(window.location.host) || 'kwickly';
    const fetchBranding = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        const res = await fetch(`${apiUrl}/auth/branding?hostname=${slug}`);
        const data = await res.json();
        if (data.success && data.branding) {
          setBaseCurrency(data.branding.baseCurrency || 'INR');
        }
      } catch (err) {
        console.error('Failed to load base currency for dashboard:', err);
      }
    };
    fetchBranding();
  }, []);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hello, {user?.firstName || 'Guest'}</h1>
        <p className="text-muted-foreground mt-2 text-lg">Manage your digital wallet, loyalty points, and subscriptions.</p>
      </div>

      {/* Wallet and Loyalty Overview */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-sm border-emerald-100 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-emerald-800 dark:text-emerald-400">Wallet Cash</CardTitle>
            <CardDescription>Pre-paid fiat balance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-500">{formatCurrency(45.50, baseCurrency)}</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-amber-100 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-amber-800 dark:text-amber-400">Loyalty Points</CardTitle>
            <CardDescription>Earned from orders (100 pts = {formatCurrency(1, baseCurrency)})</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-amber-500">1,250 <span className="text-sm font-normal text-amber-700 dark:text-amber-300">pts</span></p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold tracking-tight pt-4">Active Subscriptions</h2>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg border-indigo-100 dark:border-indigo-900 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4">
            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>
          </div>
          <CardHeader className="bg-indigo-50/50 dark:bg-indigo-950/20 pb-4">
            <CardTitle className="text-xl">Pro Monthly Plan</CardTitle>
            <CardDescription className="text-indigo-600 dark:text-indigo-400 font-medium">Valid at Swamy Hot Foods</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <Utensils className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Meals Remaining</p>
                  <p className="text-3xl font-bold">24 <span className="text-base font-normal text-muted-foreground">/ 30</span></p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <Clock className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expires In</p>
                  <p className="text-lg font-bold">38 Days</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center p-8 text-center shadow-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="mb-4">
            <div className="w-48 h-48 bg-white p-4 rounded-xl shadow-inner border flex items-center justify-center">
              {/* Dummy QR Code Representation */}
              <QrCode className="w-full h-full text-slate-800" />
            </div>
          </div>
          <h3 className="text-xl font-bold">Scan to redeem</h3>
          <p className="text-muted-foreground text-sm mt-2 max-w-xs">
            Present this code to the staff at the counter. Code refreshes automatically for security.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            <Clock className="h-4 w-4" /> Refreshes in {totpCountdown}s
          </div>
        </Card>
      </div>
    </div>
  );
}
