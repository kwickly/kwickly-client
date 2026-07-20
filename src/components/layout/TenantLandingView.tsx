import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Utensils, CalendarDays, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";

export interface TenantLandingViewProps {
  tenantSlug: string;
  brandName: string;
  brandColor?: string;
  baseCurrency?: string;
  enabledModules?: {
    dineIn: boolean;
    takeaway: boolean;
    delivery: boolean;
    subscriptions: boolean;
  };
}

export function TenantLandingView({
  tenantSlug,
  brandName,
  baseCurrency = "INR",
  enabledModules = { dineIn: true, takeaway: true, delivery: true, subscriptions: true }
}: TenantLandingViewProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 dark:bg-primary/5 -skew-y-3 transform origin-top-left z-0" />
        <div className="relative z-10 max-w-3xl space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome to <br />
            <span className="text-primary">{brandName}</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Order fresh meals instantly or subscribe to our exclusive meal plans for daily convenience.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link href="/menu" className="w-full sm:w-auto">
              <Button size="lg" className="h-14 px-8 text-lg font-semibold w-full shadow-xl shadow-primary/20">
                Order Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            {enabledModules.subscriptions && (
              <Link href="/plans" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold w-full">
                  View Meal Plans
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">How it works</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-none shadow-lg bg-white dark:bg-slate-900">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <Utensils className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Instant Orders</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Browse our live menu and place an order for Dine-In or Takeaway. Fast, fresh, and hassle-free.
              </p>
            </CardContent>
          </Card>
          
          {enabledModules.subscriptions && (
            <Card className="border-none shadow-lg bg-white dark:bg-slate-900">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
                  <CalendarDays className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold">Meal Subscriptions</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Subscribe to a weekly or monthly plan. Just walk in, scan your personal QR code, and grab your meal!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
