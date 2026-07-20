"use client";

/**
 * MenuClientView — The primary revenue surface of the storefront.
 *
 * Design philosophy (product-owner + user perspective):
 *  - TIME-TO-FIRST-ADD is the north star metric. Every design decision
 *    optimises for the moment a hungry user sees something they want and
 *    presses ADD with zero friction.
 *
 *  - Users scan menus in the order: IMAGE → NAME → PRICE → ADD.
 *    The layout enforces this hierarchy.
 *
 *  - The ADD button must feel like a satisfying purchase trigger,
 *    not a UI element. It uses the full brand colour as background.
 *
 *  - Cart state is rewarded with instant visual feedback on the row
 *    (left accent bar + background tint) so users always know
 *    what they've picked without opening the cart.
 *
 *  - Mobile is the primary surface (>70% of restaurant traffic).
 *    All touch targets are ≥44px. The floating bottom bar avoids
 *    the user having to scroll to place an order.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Minus, Plus, Search, ShoppingBag,
  Flame, Leaf, ChevronRight, UtensilsCrossed,
  Filter, Wheat, Droplet, Beef, AlertTriangle, Receipt
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/store/useCart';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { formatCurrency } from '@/lib/currency';
import { getCategoryFallbackUrl, FOOD_BLUR_PLACEHOLDER } from '@/lib/image-utils';
import { useMenuFilter } from '@/store/useMenuFilter';
import { toast } from 'sonner';
/* ─── Availability Logic ──────────────────────────────────────────────── */
function getAvailabilityState(item: any): { isAvailable: boolean; reason?: string } {
  if (item.status === 'OUT_OF_STOCK') return { isAvailable: false, reason: 'Out of Stock' };
  if (item.status === 'HIDDEN') return { isAvailable: false, reason: 'Not Available' };

  if (item.availableUntilDate) {
    const expiryDate = new Date(item.availableUntilDate);
    if (new Date() > expiryDate) return { isAvailable: false, reason: 'Not Available' };
  }

  if (item.availability === 'days' && item.availableDays?.length) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    if (!item.availableDays.includes(today)) {
      return { isAvailable: false, reason: `Available ${item.availableDays.map((d: string) => d.slice(0, 3)).join(', ')}` };
    }
  }

  if (item.availability === 'time_window' && item.availableFrom && item.availableUntil) {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    if (currentTime < item.availableFrom || currentTime > item.availableUntil) {
      return { isAvailable: false, reason: `Available ${item.availableFrom} - ${item.availableUntil}` };
    }
  }

  return { isAvailable: true };
}

/* ─── Shared Info Sheet ───────────────────────────────────────────────── */
function NutritionSheet({ item, children }: { item: any; children: React.ReactNode }) {
  if (!item.calories && !item.ingredients?.length && !item.allergens?.length) {
    return <>{children}</>;
  }
  
  return (
    <Sheet>
      <SheetTrigger className="text-left mt-1 outline-none focus:ring-2 focus:ring-amber-500 rounded-md block w-full">
        {children}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl sm:max-w-md sm:mx-auto bg-white dark:bg-slate-950 px-0 flex flex-col border-none shadow-2xl">
        <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mt-3 mb-0 shrink-0" />
        <SheetHeader className="px-6 py-4 shrink-0 text-left">
          <SheetTitle className="text-xl font-bold">{item.name}</SheetTitle>
          <p className="text-sm text-slate-500">{item.description}</p>
        </SheetHeader>
        <Separator />
        
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {item.ingredients?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Ingredients</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {item.ingredients.join(', ')}
              </p>
            </div>
          )}
          
          {item.allergens?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Allergens</h4>
              <div className="flex flex-wrap gap-2">
                {item.allergens.map((a: string) => (
                  <span key={a} className="text-xs font-bold px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-200">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(item.calories || item.protein || item.carbs || item.fat) && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                Nutrition {item.servingSize ? `(per ${item.servingSize})` : '(approx.)'}
              </h4>
              <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Calories</p>
                  <p className="text-sm font-bold mt-0.5">{item.calories || '-'} kcal</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Protein</p>
                  <p className="text-sm font-bold mt-0.5">{item.protein ? `${item.protein}g` : '-'}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Carbs</p>
                  <p className="text-sm font-bold mt-0.5">{item.carbs ? `${item.carbs}g` : '-'}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Fat</p>
                  <p className="text-sm font-bold mt-0.5">{item.fat ? `${item.fat}g` : '-'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─── FSSAI standard indicator ──────────────────────────────────────── */
function VegDot() {
  return (
    <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-[3px] border-[1.5px] border-emerald-600 bg-white shrink-0">
      <span className="w-[8px] h-[8px] rounded-full bg-emerald-600 block" />
    </span>
  );
}
function NonVegDot() {
  return (
    <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-[3px] border-[1.5px] border-red-500 bg-white shrink-0">
      <span className="w-[8px] h-[8px] rounded-full bg-red-500 block" />
    </span>
  );
}

/* ─── Spice indicator ────────────────────────────────────────────────── */
function SpiceIndicator({ level }: { level: number }) {
  if (!level) return null;
  return (
    <span className="flex items-center gap-px">
      {Array.from({ length: Math.min(level, 3) }).map((_, i) => (
        <Flame key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
      ))}
    </span>
  );
}

/* ─── The star of the show: MenuItem card ────────────────────────────── */
interface MenuItemCardProps {
  item: any;
  categoryName: string;
  baseCurrency: string;
  brandColor: string;
  isAboveFold: boolean; // priority load for first visible items
}

function MenuItemCard({
  item, categoryName, baseCurrency, brandColor, isAboveFold,
}: MenuItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cartStore = useCartStore();
  const qty = cartStore.items.find(i => i.id === item.id)?.quantity || 0;
  const imgSrc = item.imageUrl || getCategoryFallbackUrl(categoryName);

  const handleAdd = useCallback(() => {
    cartStore.addItem({ id: item.id, name: item.name, price: Number(item.price), quantity: 1 }, window.location.hostname.split('.')[0] || 'kwickly');
    toast.success(`Added ${item.name} to cart`);
  }, [item, cartStore]);

  const handleDecrement = useCallback(() => {
    if (qty === 1) cartStore.removeItem(item.id);
    else cartStore.updateQuantity(item.id, qty - 1);
  }, [qty, item.id, cartStore]);

  const handleIncrement = useCallback(() => {
    cartStore.updateQuantity(item.id, qty + 1);
  }, [qty, item.id, cartStore]);

  const availability = getAvailabilityState(item);

  return (
    <div
      className={`relative flex flex-row justify-between items-start gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:shadow-md ${availability.isAvailable ? '' : 'opacity-60 grayscale-[0.2]'}`}
    >
      {/* ── Left: Text content ──────────────────────────────────────── */}
      <div className={`flex-1 min-w-0 flex flex-col transition-all duration-200`}>

        {/* Row 1: dietary indicators + badges */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {item.isVeg ? <VegDot /> : <NonVegDot />}
          <SpiceIndicator level={item.spiceLevel} />
          
          {(() => {
            const badges = [];
            if (item.isBestseller) badges.push(
              <span key="bestseller" className="text-[10px] font-bold tracking-wider uppercase text-[#c2410c] bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-sm">
                Bestseller
              </span>
            );
            if (item.isChefSpecial) badges.push(
              <span key="chefspecial" className="text-[10px] font-bold tracking-wider uppercase text-brand bg-brand/10 px-2 py-0.5 rounded-sm" style={{ color: brandColor }}>
                Chef's Special
              </span>
            );
            if (item.isPopular) badges.push(
              <span key="popular" className="text-[10px] font-bold tracking-wider uppercase text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-sm">
                Popular
              </span>
            );
            if (item.isLimitedEdition) badges.push(
              <span key="limited" className="text-[10px] font-bold tracking-wider uppercase text-purple-600 bg-purple-50 dark:bg-purple-950/30 px-2 py-0.5 rounded-sm">
                Limited Edition
              </span>
            );
            if (item.isHealthyChoice) badges.push(
              <span key="healthy" className="text-[10px] font-bold tracking-wider uppercase text-teal-600 bg-teal-50 dark:bg-teal-950/30 px-2 py-0.5 rounded-sm">
                Healthy Choice
              </span>
            );
            if (item.isNew) badges.push(
              <span key="new" className="text-[10px] font-bold tracking-wider uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-sm">
                New
              </span>
            );
            return badges.slice(0, 2); // Show max 2 badges
          })()}
        </div>

        {/* Row 2: Name */}
        <h3 className="font-bold text-[17px] text-slate-900 dark:text-white line-clamp-2 leading-snug">
          {item.name}
        </h3>

        {/* Row 3: Price */}
        <p className="font-semibold text-[15px] mt-1 text-slate-800 dark:text-slate-200">
          {formatCurrency(Number(item.price), baseCurrency)}
        </p>

        {/* Row 4: Description */}
        {item.description && (
          <div className="mt-2 pr-2">
            <p className={`text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
              {item.description}
            </p>
            {item.description.length > 70 && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:underline mt-0.5"
              >
                {isExpanded ? 'Read less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {/* Row 4.5: Ingredients */}
        {item.ingredients && item.ingredients.length > 0 && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed line-clamp-1 pr-2">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Contains: </span>
            {item.ingredients.join(', ')}
          </p>
        )}

        {/* Row 5: Nutritional Info */}
        {item.calories && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1 border border-slate-100 dark:border-slate-800 rounded-md px-2 py-0.5 bg-slate-50 dark:bg-slate-900/50">
              ⚡ {item.calories} kcal
            </div>
            {(item.protein || item.carbs || item.fat) && (
              <div className="flex gap-1.5 border border-slate-100 dark:border-slate-800 rounded-md px-2 py-0.5 bg-slate-50 dark:bg-slate-900/50">
                {item.protein && <span>P: {item.protein}g</span>}
                {item.carbs && <span>C: {item.carbs}g</span>}
                {item.fat && <span>F: {item.fat}g</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Right: Image + ADD/qty pill ─────────────────────────────── */}
      <div className="relative shrink-0 flex flex-col items-center w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] mb-4">
        {/* Food image */}
        <div className="w-full h-full rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 relative shadow-sm border border-slate-100 dark:border-slate-800">
          <Image
            src={imgSrc}
            alt={item.name}
            fill
            sizes="130px"
            className="object-cover"
            placeholder="blur"
            blurDataURL={FOOD_BLUR_PLACEHOLDER}
            priority={isAboveFold}
            quality={90}
            onError={(e) => {
              const t = e.target as HTMLImageElement;
              t.src = getCategoryFallbackUrl(categoryName);
            }}
          />
        </div>

        {/* ADD Button placed center-bottom overlapping the image edge */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-max z-10">
          {!availability.isAvailable ? (
            <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {availability.reason}
              </span>
            </div>
          ) : qty > 0 ? (
            <div className="flex items-center rounded-lg overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 min-w-[100px] h-9">
              <button
                onClick={handleDecrement}
                aria-label={`Remove one ${item.name}`}
                className="flex-1 h-full flex items-center justify-center text-emerald-600 hover:bg-slate-50 transition-colors"
              >
                <Minus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
              <span className="w-7 text-center text-slate-800 dark:text-slate-100 font-bold text-[14px] tabular-nums select-none">
                {qty}
              </span>
              <button
                onClick={handleIncrement}
                aria-label={`Add one more ${item.name}`}
                className="flex-1 h-full flex items-center justify-center text-emerald-600 hover:bg-slate-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          ) : (
            <div className="relative group">
              <button
                onClick={handleAdd}
                aria-label={`Add ${item.name} to cart`}
                className="h-9 px-8 rounded-lg text-[14px] font-bold shadow-sm bg-white dark:bg-slate-800 text-emerald-600 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors min-w-[100px]"
              >
                ADD
              </button>
            </div>
          )}
          {(item.variants?.length > 0 || item.addons?.length > 0) && (
            <div className="text-[9px] text-slate-400 font-medium text-center mt-1 uppercase tracking-widest">
              Customisable
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Props ──────────────────────────────────────────────────────────── */
interface MenuClientViewProps {
  tenantSlug: string;
  categories: any[];
  baseCurrency?: string;
  brandColor?: string;
  tenantName?: string;
  logoUrl?: string | null;
  tagline?: string | null;
  qrToken?: string;
}

/* ─── Main layout ────────────────────────────────────────────────────── */
export default function MenuClientView({
  categories,
  baseCurrency = 'INR',
  brandColor = '#f59e0b',
  tenantName = 'Restaurant',
  logoUrl,
  tagline,
  qrToken,
}: MenuClientViewProps) {
  const { searchQuery: search, vegOnly, setVegOnly } = useMenuFilter();
  const cartStore = useCartStore();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(categories[0]?.id || null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeOrderStatus, setActiveOrderStatus] = useState<any>(null);
  const isManualScroll = useRef(false);

  useEffect(() => {
    // Check for active order in localStorage
    const savedOrderId = localStorage.getItem('kwickly_active_order_id');
    if (savedOrderId) {
      setActiveOrderId(savedOrderId);
      // Fetch status
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
      fetch(`${apiUrl}/orders/public/status/${savedOrderId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setActiveOrderStatus(data.data);
          }
        })
        .catch(err => console.error("Failed to load active order status", err));
    }
    
    if (qrToken) {
      cartStore.setQrToken(qrToken);
    }
  }, [qrToken, cartStore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersectingEntry = entries.find(entry => entry.isIntersecting);
        if (intersectingEntry && !isManualScroll.current) {
          const catId = intersectingEntry.target.id.replace('category-', '');
          setActiveCategoryId(catId);
          
          // Optionally, scroll the mobile horizontal nav to the active item
          const mobileNav = document.getElementById('mobile-category-nav');
          const activeBtn = document.getElementById(`mobile-btn-${catId}`);
          if (mobileNav && activeBtn) {
            mobileNav.scrollTo({
              left: activeBtn.offsetLeft - 20,
              behavior: 'smooth'
            });
          }
        }
      },
      { rootMargin: '-120px 0px -60% 0px' }
    );

    categories.forEach(cat => {
      const el = document.getElementById(`category-${cat.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  const scrollToCategory = (id: string) => {
    setActiveCategoryId(id);
    isManualScroll.current = true;
    const el = document.getElementById(`category-${id}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setTimeout(() => { isManualScroll.current = false; }, 800);
    }
  };

  const totalItems = cartStore.totalItems();
  const totalPrice = cartStore.totalPrice();

  /* Filtering */
  const filteredCategories = categories
    .map(cat => ({
      ...cat,
      items: (cat.items || []).filter((item: any) => {
        const s = search.toLowerCase();
        const matchesSearch =
          item.name.toLowerCase().includes(s) ||
          (item.description && item.description.toLowerCase().includes(s));
        return matchesSearch && (!vegOnly || item.isVeg);
      }),
    }))
    .filter(cat => cat.items.length > 0);

  const totalMatches = filteredCategories.reduce((a, c) => a + c.items.length, 0);
  const totalMenuItems = categories.reduce((a, c) => a + (c.items?.length || 0), 0);

  // Track cumulative item index across categories for priority loading
  let globalItemIndex = 0;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#faf8f5] dark:bg-slate-950">

      {/* Active Order Tracker (Floating Bottom) */}
      {activeOrderStatus && activeOrderId && (
        <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm">
          <Link href={`/orders/${activeOrderId}`}>
            <div 
              className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl flex items-center justify-between transition-transform hover:scale-[1.02] active:scale-[0.98] border border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 shrink-0"
                >
                  {activeOrderStatus.kotStatus === 'ready' ? (
                    <UtensilsCrossed className="w-5 h-5 text-emerald-400" />
                  ) : activeOrderStatus.kotStatus === 'preparing' ? (
                    <Flame className="w-5 h-5 text-orange-400" />
                  ) : (
                    <Receipt className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <div>
                  <p className="text-[13px] font-bold">
                    {activeOrderStatus.kotStatus === 'ready' ? 'Your food is ready!' :
                     activeOrderStatus.kotStatus === 'preparing' ? 'Preparing your food' :
                     'Order received'}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {activeOrderStatus.estimatedCompletionTime ? (
                      (() => {
                        const mins = Math.max(0, Math.round((new Date(activeOrderStatus.estimatedCompletionTime).getTime() - Date.now()) / 60000));
                        return mins > 0 ? `Ready in ~${mins} mins` : 'Almost ready';
                      })()
                    ) : (
                      'Tap to track status'
                    )}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 opacity-60" />
            </div>
          </Link>
        </div>
      )}

      {/* Mobile: horizontal category scroll */}
      <div 
        id="mobile-category-nav" 
        className="sticky top-16 z-40 lg:hidden overflow-x-auto py-2.5 px-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 scrollbar-hide shadow-sm"
      >
        <div className="flex gap-2 w-max">
          {categories.map(cat => (
            <button
              key={cat.id}
              id={`mobile-btn-${cat.id}`}
              onClick={() => scrollToCategory(cat.id)}
              className={`shrink-0 h-9 px-5 rounded-full text-[13px] font-bold transition-all border whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeCategoryId === cat.id
                  ? 'text-white border-transparent shadow-[inset_0_-2px_6px_rgba(0,0,0,0.15)]'
                  : 'bg-white dark:bg-slate-900 text-slate-600 border-slate-200/80 dark:border-slate-700'
              }`}
              style={activeCategoryId === cat.id ? { background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)` } : {}}
            >
              {cat.name.replace(/^[^\s\w]*/, '').trim()}
              <span className={`ml-1.5 text-[10px] font-bold ${activeCategoryId === cat.id ? 'opacity-70' : 'opacity-40'}`}>
                {cat.items?.length || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 3-column layout ─────────────────────────────────────────────── */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Col 1: Left sticky category rail (desktop) ─────────────── */}
        <aside className="hidden lg:block lg:col-span-2">
          <nav className="sticky top-24 space-y-0.5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-2 mb-3">Menu</p>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`group w-full text-left px-3.5 py-3 rounded-2xl text-[13px] font-bold flex items-center justify-between transition-all duration-300 relative overflow-hidden ${
                  activeCategoryId === cat.id
                    ? 'text-brand border border-transparent shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 border border-transparent'
                }`}
                style={activeCategoryId === cat.id ? { background: `${brandColor}15`, borderColor: `${brandColor}30` } : {}}
              >
                {activeCategoryId === cat.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] rounded-r-full" style={{ background: brandColor }} />
                )}
                <span className={`truncate pr-1 transition-transform ${activeCategoryId === cat.id ? 'translate-x-1' : ''}`} style={{ color: activeCategoryId === cat.id ? brandColor : undefined }}>
                  {cat.name.replace(/^[^\s\w]*/, '').trim()}
                </span>
                <span
                  className={`text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0 transition-colors ${
                    activeCategoryId === cat.id
                      ? 'text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                  style={activeCategoryId === cat.id ? { background: brandColor } : {}}
                >
                  {cat.items?.length || 0}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Col 2: Menu feed ────────────────────────────────────────── */}
        <main className="col-span-1 lg:col-span-7 space-y-8 pb-28 lg:pb-6">

          {/* Removed Veg Filter block since it's on Navbar */}
          {/* Empty / no-match state */}
          {totalMatches === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Search className="w-7 h-7 text-slate-300" />
              </div>
              <div>
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Nothing found</h3>
                <p className="text-xs text-slate-400 mt-1">Try a different term or remove the veg filter.</p>
              </div>
              <button
                onClick={() => { useMenuFilter.getState().setSearchQuery(''); setVegOnly(false); }}
                className="text-xs font-bold underline underline-offset-2"
                style={{ color: brandColor }}
              >
                Clear filters
              </button>
            </div>
          )}

          {filteredCategories.map(category => (
            <section key={category.id} id={`category-${category.id}`} className="scroll-mt-28">
              {/* Category header */}
              <div className="flex items-center gap-3 mb-4 mt-6">
                <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">
                  {category.name.replace(/^[^\s\w]*/, '').trim()}
                </h2>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                <span className="text-[13px] font-semibold text-slate-400 shrink-0">
                  {category.items.length} items
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {category.items.map((item: any) => {
                  const idx = globalItemIndex++;
                  return (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      categoryName={category.name}
                      baseCurrency={baseCurrency}
                      brandColor={brandColor}
                      isAboveFold={idx < 6}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </main>

        {/* ── Col 3: Desktop order panel ──────────────────────────────── */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-24">
            {totalItems === 0 ? (
              <div
                className="rounded-2xl border border-dashed p-7 flex flex-col items-center gap-3 text-center"
                style={{ borderColor: `${brandColor}30`, background: `${brandColor}05` }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `${brandColor}15` }}
                >
                  <ShoppingBag className="w-5 h-5" style={{ color: brandColor }} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Cart is empty</h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[140px] mx-auto leading-relaxed">
                    Add dishes from the menu to start your order.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                {/* Cart header */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                    <ShoppingBag className="w-3.5 h-3.5" style={{ color: brandColor }} />
                    Your Order
                    <span
                      className="text-[9px] font-bold px-1.5 py-px rounded-full text-white ml-0.5"
                      style={{ background: brandColor }}
                    >
                      {totalItems}
                    </span>
                  </span>
                  <button
                    onClick={cartStore.clearCart}
                    className="text-[9px] font-bold uppercase tracking-wider text-red-400 hover:text-red-500 transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {/* Items list */}
                <ScrollArea className="max-h-64">
                  <div className="px-4 py-3 divide-y divide-slate-50 dark:divide-slate-800/60">
                    {cartStore.items.map(ci => (
                      <div key={ci.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">
                            {ci.name}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {formatCurrency(ci.price, baseCurrency)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 rounded-lg p-0.5 shrink-0 border border-slate-100 dark:border-slate-700">
                          <button
                            onClick={() =>
                              ci.quantity === 1
                                ? cartStore.removeItem(ci.id)
                                : cartStore.updateQuantity(ci.id, ci.quantity - 1)
                            }
                            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white dark:hover:bg-slate-700"
                          >
                            <Minus className="w-2.5 h-2.5 text-slate-500" />
                          </button>
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 w-4 text-center tabular-nums">
                            {ci.quantity}
                          </span>
                          <button
                            onClick={() => cartStore.updateQuantity(ci.id, ci.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white dark:hover:bg-slate-700"
                          >
                            <Plus className="w-2.5 h-2.5 text-slate-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Bill */}
                <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50/60 dark:bg-slate-900/60">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Item total</span>
                    <span className="font-bold font-mono text-slate-700 dark:text-slate-300">
                      {formatCurrency(totalPrice, baseCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>GST (8%)</span>
                    <span className="font-bold font-mono text-slate-700 dark:text-slate-300">
                      {formatCurrency(totalPrice * 0.08, baseCurrency)}
                    </span>
                  </div>
                  <Separator className="opacity-40 my-1" />
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">To Pay</span>
                    <span className="text-base font-bold font-mono" style={{ color: brandColor }}>
                      {formatCurrency(totalPrice * 1.08, baseCurrency)}
                    </span>
                  </div>
                  <Link href="/checkout" className="block pt-1.5">
                    <button
                      className="w-full h-11 rounded-xl text-xs font-bold tracking-widest uppercase text-white flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow"
                      style={{ background: brandColor }}
                    >
                      Place Order <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── Mobile: floating cart bar ─────────────────────────────────────
           Positioned at the thumb zone — user never has to scroll to checkout.
           The count bubble gives instant cart awareness.
      ── */}
      {totalItems > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 px-4 pb-5 pt-8 bg-gradient-to-t from-[#faf8f5] via-[#faf8f5]/95 dark:from-slate-950 dark:via-slate-950/95 to-transparent">
          <Sheet>
            <SheetTrigger
              className="w-full h-[54px] rounded-2xl text-white font-bold flex items-center justify-between px-5 shadow-xl transition-all hover:brightness-95 active:scale-[0.99]"
              style={{ background: brandColor }}
            >
              <div className="flex items-center gap-3">
                <span className="bg-white/25 rounded-xl px-2.5 py-1 text-xs font-bold flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
                <span className="text-sm">View Order</span>
              </div>
              <span className="font-mono font-bold">{formatCurrency(totalPrice, baseCurrency)}</span>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[82vh] rounded-t-3xl bg-white dark:bg-slate-950 px-0 flex flex-col border-none shadow-2xl">
              {/* Handle */}
              <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mt-3 mb-0 shrink-0" />

              <SheetHeader className="px-6 py-4 shrink-0">
                <SheetTitle className="text-lg font-bold flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" style={{ color: brandColor }} />
                  Review Order
                </SheetTitle>
              </SheetHeader>
              <Separator />

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {cartStore.items.map(ci => (
                  <div key={ci.id} className="flex items-center justify-between gap-4 py-1">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight line-clamp-1">
                        {ci.name}
                      </p>
                      <p className="text-xs font-mono mt-0.5" style={{ color: brandColor }}>
                        {formatCurrency(ci.price, baseCurrency)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-1 shrink-0">
                      <button
                        onClick={() => {
                          if (ci.quantity > 1) cartStore.updateQuantity(ci.id, ci.quantity - 1);
                          else cartStore.removeItem(ci.id);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                      <span className="font-bold text-xs w-4 text-center tabular-nums text-slate-800 dark:text-white">
                        {ci.quantity}
                      </span>
                      <button
                        onClick={() => cartStore.updateQuantity(ci.id, ci.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill + CTA */}
              <div className="px-6 pb-8 pt-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 space-y-3 shrink-0">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Item total</span>
                  <span className="font-bold font-mono text-slate-700 dark:text-slate-300">
                    {formatCurrency(totalPrice, baseCurrency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>GST (8%)</span>
                  <span className="font-bold font-mono text-slate-700 dark:text-slate-300">
                    {formatCurrency(totalPrice * 0.08, baseCurrency)}
                  </span>
                </div>
                <Separator className="opacity-40" />
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 dark:text-white text-base">To Pay</span>
                  <span className="font-bold font-mono text-lg" style={{ color: brandColor }}>
                    {formatCurrency(totalPrice * 1.08, baseCurrency)}
                  </span>
                </div>
                <Link href="/checkout" className="block pt-1">
                  <button
                    className="w-full h-14 rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-xl transition-all hover:brightness-95"
                    style={{ background: brandColor }}
                  >
                    Proceed to Checkout
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
}
