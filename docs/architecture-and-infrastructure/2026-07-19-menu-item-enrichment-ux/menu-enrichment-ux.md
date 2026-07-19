# Menu Item Enrichment — Storefront UX Design
**Date:** 2026-07-19  
**Repo:** `kwickly-client`  
**Domain:** Architecture & Infrastructure  
**Status:** Implemented

---

## Context

This document describes the storefront UX decisions made when displaying enriched menu item data (tags, nutrition, availability state) on the `MenuClientView` component.

See the API-side ADR: `kwickly-api/docs/database-and-schema/2026-07-19-menu-item-enrichment/menu-item-enrichment.md`

---

## Menu Item Card — Information Hierarchy

The card is designed for **TIME-TO-FIRST-ADD** as the north-star metric. Every visual decision optimises for the moment a hungry user spots something and taps ADD without friction.

Scan order enforced by layout: **IMAGE → NAME → PRICE → ADD**

```
┌─────────────────────────────────────────┬───────────────┐
│ [🟢] ★ Bestseller  👨‍🍳 Chef's Special      │  [food image] │
│                                         │               │
│ Chole Bhature                           │   112×112px   │
│ ₹130                                    │               │
│ 🔥 520 kcal · 1 plate                  │  ┌──────────┐ │
│ Fluffy bhature with spiced chickpea...  │  │  + ADD   │ │
│ [🌾 Gluten]                             │  └──────────┘ │
└─────────────────────────────────────────┴───────────────┘
```

### Row structure

| Row | Content | When shown |
|-----|---------|------------|
| 1 | Veg/NonVeg dot + Spice flames + Badge pills | Always |
| 2 | Item name (bold, 14–15px) | Always |
| 3 | Price (extrabold, mono, brand colour if in cart) | Always |
| 4 | Calorie + serving size hint | Only if `calories` is set |
| 5 | Description (muted, 2-line clamp) | Only if set |
| 6 | Dietary pills (Jain, Gluten Free) | Only if set |
| 7 | Allergen chips | Only if set |

---

## Badge System

### Tag Priority & Visual Design

Max **2 tag badges** rendered per item to avoid visual noise.

| Tag | Emoji | Text Colour | Background |
|-----|-------|------------|------------|
| Bestseller | ★ | `#c2410c` | `#fff7ed` (orange-50) |
| Chef's Special | 👨‍🍳 | `#7c3aed` | `#f5f3ff` (violet-50) |
| House Special | 🏠 | Brand colour | Brand α12 |
| New | 🆕 | `#059669` | `#ecfdf5` (emerald-50) |
| Popular | 🔥 | `#dc2626` | `#fef2f2` (red-50) |
| Limited | ⏰ | `#d97706` | `#fffbeb` (amber-50) |
| Healthy | 💚 | `#0d9488` | `#f0fdfa` (teal-50) |

Priority rendering: `isBestseller > isChefSpecial > isRestaurantSpecial > isNew > isPopular > isLimitedEdition > isHealthyChoice`

---

## Availability States

Items are **never hidden** — we always show the full menu. Unavailable items are greyed with a helpful hint. This is the Swiggy/Zomato/Starbucks standard.

| State | Visual treatment | ADD button |
|-------|-----------------|------------|
| Available | Normal | Enabled |
| Out of Stock | 50% opacity | "Out of Stock" chip (grey) |
| Time window | 50% opacity | "Available 12pm–3pm" chip |
| Day restriction | 50% opacity | "Available Mon–Fri" chip |
| Seasonal ended | 50% opacity | "Not Available" chip |

---

## Nutrition Display

Calorie line appears only when `calories` is non-null:

```
🔥 520 kcal · 1 plate (approx.)
```

Tapping the calorie line (or a dedicated ℹ️ button) opens a bottom sheet:

```
Ingredients
  Chickpeas, Flour, Tomato, Onion, Ghee, Cumin, Coriander, Salt

Allergens
  🌾 Gluten   🥛 Dairy

Nutrition (per serving)
  Protein 14g | Carbs 68g | Fat 22g
```

The bottom sheet uses the shared `Sheet` component from shadcn/ui.

---

## Image Optimisation

- All food images use Next.js `<Image>` with `placeholder="blur"` and a warm amber LQIP `blurDataURL`.
- First 6 items above the fold use `priority={true}` for LCP optimisation.
- Fallback images are category-matched from Unsplash CDN using `getCategoryFallbackUrl()` in `src/lib/image-utils.ts`.
- All Unsplash URLs include `auto=format&fit=crop` — required by Unsplash CDN; without it many photo IDs return 404.
- Configured `deviceSizes` and `imageSizes` in `next.config.ts` for `<100px` thumbnail and `~400px` card tiers.

---

## Skeleton / Loading State

`MenuSkeleton` is used for the full-page initial load (Server Component suspense boundary).  
Individual items do not skeleton — the category shell loads instantly and images lazy-load with the blur LQIP.
