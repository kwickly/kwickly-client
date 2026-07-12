'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuth';
import { useParams } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CartDrawer } from '../cart/CartDrawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;
  const { isAuthenticated, logout } = useAuthStore();

  // If no tenantSlug in URL (e.g. at root or /auth), we might just show a generic brand or hide tenant links
  const brandName = tenantSlug ? tenantSlug.replace(/-/g, ' ').toUpperCase() : 'KWICKLY';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Mobile Menu & Brand */}
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger className="md:hidden inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-9 w-9">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                {tenantSlug && (
                  <>
                    <Link href="/" className="block px-2 py-1 text-lg font-medium">Home</Link>
                    <Link href="/menu" className="block px-2 py-1 text-lg font-medium">Menu</Link>
                    <Link href="/plans" className="block px-2 py-1 text-lg font-medium">Subscription Plans</Link>
                  </>
                )}
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard" className="block px-2 py-1 text-lg font-medium text-indigo-600">My Dashboard</Link>
                    <Button variant="ghost" className="justify-start px-2 py-1 h-auto text-lg font-medium" onClick={logout}>Logout</Button>
                  </>
                ) : (
                  <Link href="/auth" className="block px-2 py-1 text-lg font-medium text-indigo-600">Login</Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight hidden sm:inline-block">
              {brandName}
            </span>
          </Link>

          {/* Desktop Nav */}
          {tenantSlug && (
            <nav className="hidden md:flex gap-6 ml-6">
              <Link href="/menu" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Menu</Link>
              <Link href="/plans" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Plans</Link>
            </nav>
          )}
        </div>

        {/* Right: Cart, Notifications & Auth */}
        <div className="flex items-center gap-2 sm:gap-4">
          {tenantSlug && <CartDrawer tenantSlug={tenantSlug} />}
          
          {isAuthenticated ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger className="relative inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-10 w-10">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-600"></span>
                  <span className="sr-only">Notifications</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                    <span className="font-medium text-sm">Plan Expiring Soon</span>
                    <span className="text-xs text-muted-foreground">Your Pro Monthly Plan expires in 3 days. Renew now to keep enjoying meals!</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                    <span className="font-medium text-sm">Loyalty Points Earned</span>
                    <span className="text-xs text-muted-foreground">You earned 50 points from your last dine-in order.</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 dark:bg-slate-800">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Dashboard</span>
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/auth" className="hidden sm:inline-block">
              <Button variant="default">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
