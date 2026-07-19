/**
 * Shared skeleton UI primitives — used throughout the storefront for
 * all loading states. Consistent shimmer animation via CSS.
 */

import React from 'react';
import { cn } from '@/lib/utils';

/* ─── Base shimmer block ─────────────────────────────────────────────── */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg bg-slate-200/80 dark:bg-slate-800/80 animate-pulse',
        className
      )}
      {...props}
    />
  );
}

/* ─── Menu page skeleton — mirrors the 3-col grid ───────────────────── */
export function MenuPageSkeleton() {
  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
      {/* Strip */}
      <div className="col-span-full h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse mb-2" />

      {/* Left rail */}
      <aside className="hidden lg:flex lg:col-span-2 flex-col gap-2.5 pt-1">
        <Skeleton className="h-3 w-24 mb-2" />
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-xl" style={{ opacity: 1 - i * 0.08 }} />
        ))}
      </aside>

      {/* Feed */}
      <main className="col-span-1 lg:col-span-7 space-y-10">
        {Array.from({ length: 2 }).map((_, gi) => (
          <section key={gi}>
            {/* Category heading */}
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-5 w-32" />
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              <Skeleton className="h-3 w-12" />
            </div>
            {/* Item rows */}
            <div className="space-y-3">
              {Array.from({ length: gi === 0 ? 4 : 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-stretch gap-0 overflow-hidden"
                >
                  <div className="flex-1 p-4 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4 rounded-sm" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <div className="relative p-4 flex flex-col items-center w-28 sm:w-32 shrink-0">
                    <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl" />
                    <Skeleton className="absolute -bottom-3 h-8 w-20 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Right panel */}
      <aside className="hidden lg:block lg:col-span-3">
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </aside>
    </div>
  );
}

/* ─── Checkout skeleton ──────────────────────────────────────────────── */
export function CheckoutSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      <Skeleton className="h-8 w-32 mb-8" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
            <Skeleton className="h-5 w-36" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-px w-full" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3.5 w-16" />
                </div>
              ))}
            </div>
          </div>
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ─── Dashboard / Orders skeleton ───────────────────────────────────── */
export function DashboardSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-8 w-20 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Generic full-page skeleton ────────────────────────────────────── */
export function PageSkeleton() {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-4 animate-in fade-in duration-300">
      <Skeleton className="h-8 w-48 mb-6" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}
