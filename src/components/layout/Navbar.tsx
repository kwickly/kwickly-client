'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, User, Bell, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuth';
import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CartDrawer } from '../cart/CartDrawer';
import { PushNotificationToggle } from '@/components/ui/PushNotificationToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getTenantSlug } from '@/lib/tenant-helper';
import { Skeleton } from '@/components/ui/skeletons';
import { usePathname } from 'next/navigation';
import { useMenuFilter } from '@/store/useMenuFilter';
import { Search } from 'lucide-react';

interface TenantBranding {
  name: string;
  logoUrl?: string | null;
  brandColor?: string;
  baseCurrency: string;
}

export function Navbar() {
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const [isLoadingBranding, setIsLoadingBranding] = useState(true);
  const { isAuthenticated, user, logout } = useAuthStore();
  const pathname = usePathname();
  const { searchQuery, setSearchQuery, vegOnly, setVegOnly } = useMenuFilter();

  useEffect(() => {
    const slug = getTenantSlug(window.location.host);
    setTenantSlug(slug);

    if (!slug) {
      setIsLoadingBranding(false);
      return;
    }

    const fetchBranding = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        const res = await fetch(`${apiUrl}/auth/branding?hostname=${slug}`);
        const data = await res.json();
        if (data.success && data.branding) {
          setBranding({
            name: data.branding.name,
            logoUrl: data.branding.logoUrl,
            brandColor: data.branding.brandColor,
            baseCurrency: data.branding.baseCurrency || 'INR',
          });
        }
      } catch (err) {
        console.error('Failed to load branding in Navbar:', err);
      } finally {
        setIsLoadingBranding(false);
      }
    };

    fetchBranding();
  }, []);

  const displayName = branding?.name || null;
  const baseCurrency = branding?.baseCurrency || 'INR';
  const brandColor = branding?.brandColor;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">

        {/* ── Left: Mobile hamburger + Brand ──────────────────────────── */}
        <div className="flex items-center gap-3">
          {/* Mobile side-nav */}
          <Sheet>
            <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 h-9 w-9 transition-colors">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5 mb-8 mt-4">
                {branding?.logoUrl ? (
                  <img src={branding.logoUrl} alt={displayName || ''} className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: brandColor ? `${brandColor}20` : undefined }}
                  >
                    <UtensilsCrossed className="w-4 h-4" style={{ color: brandColor || undefined }} />
                  </div>
                )}
                {displayName && (
                  <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{displayName}</span>
                )}
              </div>
              <nav className="flex flex-col gap-1">
                {tenantSlug && (
                  <>
                    <Link href="/" className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Home</Link>
                    <Link href="/menu" className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Menu</Link>
                    <Link href="/plans" className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Subscription Plans</Link>
                  </>
                )}
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard" className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors" style={{ color: brandColor || undefined }}>
                      My Orders &amp; Wallet
                    </Link>
                    <button
                      className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
                      onClick={logout}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link href="/auth" className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors" style={{ color: brandColor || undefined }}>
                    Sign In / Register
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Brand identity */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Logo or icon */}
            {branding?.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={displayName || ''}
                className="w-8 h-8 rounded-lg object-cover shadow-sm"
              />
            ) : (
              !isLoadingBranding && tenantSlug && (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                  style={{ background: brandColor ? `${brandColor}18` : '#f1f5f9' }}
                >
                  <UtensilsCrossed className="w-4 h-4" style={{ color: brandColor || '#64748b' }} />
                </div>
              )
            )}

            {/* Brand name — skeleton while loading */}
            {isLoadingBranding ? (
              <Skeleton className="h-5 w-32 hidden sm:block" />
            ) : displayName ? (
              <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight hidden sm:inline-block group-hover:opacity-80 transition-opacity">
                {displayName}
              </span>
            ) : (
              <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight hidden sm:inline-block">
                Kwickly
              </span>
            )}
          </Link>

          {/* Desktop nav links */}
          {tenantSlug && (
            <nav className="hidden md:flex items-center gap-1 ml-4">
              <Link
                href="/menu"
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                Menu
              </Link>
              <Link
                href="/plans"
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                Plans
              </Link>
            </nav>
          )}
        </div>

        {/* ── Center: Search Bar & Veg Filter (Conditional) ────────── */}
        {pathname === '/menu' && (
          <div className="hidden md:flex flex-1 max-w-lg mx-8 group">
            <div className="flex w-full items-center pl-4 pr-1.5 py-1.5 bg-slate-100/60 dark:bg-slate-900/60 rounded-full border border-transparent focus-within:border-brand/40 focus-within:bg-white dark:focus-within:bg-slate-950 focus-within:shadow-[0_0_0_4px_rgba(var(--brand-color-rgb),0.1)] transition-all">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-brand" style={{ color: searchQuery ? brandColor : undefined }} />
              <input 
                type="text"
                className="w-full bg-transparent border-none text-[13px] px-3 focus:outline-none text-slate-900 dark:text-slate-100 font-medium placeholder:font-normal placeholder:text-slate-500"
                placeholder="Search for dishes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 px-2">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                </button>
              )}
              {/* Veg Only Toggle */}
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`ml-1 h-8 px-3 rounded-full flex items-center gap-1.5 text-[11px] font-bold transition-all shrink-0 ${
                  vegOnly
                    ? 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                    : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-sm border border-emerald-600 flex items-center justify-center shrink-0 bg-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 block" />
                </span>
                Veg Only
              </button>
            </div>
          </div>
        )}

        {/* ── Right: Cart + Auth ───────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {tenantSlug && <CartDrawer tenantSlug={tenantSlug} baseCurrency={baseCurrency} />}

          {isAuthenticated ? (
            <>
              <PushNotificationToggle />

              <DropdownMenu>
                <DropdownMenuTrigger className="relative inline-flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 h-9 w-9 transition-colors">
                  <Bell className="h-4.5 w-4.5" />
                  <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span className="sr-only">Notifications</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 rounded-2xl border-slate-100 dark:border-slate-800">
                  <DropdownMenuLabel className="font-bold">Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 rounded-xl cursor-pointer">
                    <span className="font-semibold text-sm">Plan Expiring Soon</span>
                    <span className="text-xs text-muted-foreground leading-relaxed">Your Pro Monthly Plan expires in 3 days. Renew to keep enjoying meals!</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 rounded-xl cursor-pointer">
                    <span className="font-semibold text-sm">Loyalty Points Earned 🎉</span>
                    <span className="text-xs text-muted-foreground leading-relaxed">You earned 50 points from your last order. Use them at checkout!</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link href="/dashboard">
                <button
                  className="inline-flex items-center justify-center rounded-xl h-9 w-9 transition-all hover:opacity-80 shadow-sm text-white font-bold text-xs"
                  style={{ background: brandColor || '#64748b' }}
                  title={user?.firstName || 'Dashboard'}
                >
                  {user?.firstName?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                </button>
              </Link>
            </>
          ) : (
            <Link href="/auth" className="hidden sm:block">
              <button
                className="h-9 px-4 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:opacity-90"
                style={{ background: brandColor || '#4f46e5' }}
              >
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
