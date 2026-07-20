# QR-Based Ordering & Session-Aware Checkout

**Date:** 2026-07-19  
**Status:** 🔴 Planned — Phase 9  
**Repo:** kwickly-client  

---

## Context

The current checkout always creates a brand-new order. There is no session concept. A dine-in customer who wants to add desserts after the main course generates a second disconnected order — billing cannot consolidate them.

Additionally, `checkout/page.tsx` hardcodes `tableNumber: 'Table 12'` for every single order (critical bug).

---

## Decision

### QR Token Flow

1. Customer scans QR sticker on table
2. URL opens: `https://{slug}.kwickly.app/menu?t={qrToken}`
3. `MenuClientView.tsx` reads `?t=` from URL on mount
4. Stores `qrToken` in `sessionStorage` (cleared when browser/tab closes)
5. API resolves token → table name
6. Shows "Dine-In · Table T3" sticky banner below nav

### Session-Aware Checkout (`checkout/page.tsx`)

```
IF qrToken in sessionStorage:
  → Call GET /orders/public/session?t={qrToken}
  → If open session:
       Show "Add to Order" CTA (calls POST /public/:slug/add-items)
  → If no session:
       Normal "Place Order" (creates new session + KOT Round 1)
ELSE:
  → Normal tableless checkout (takeaway / walk-in)
```

### Order Tracking Page (`orders/[orderId]/page.tsx`)

- Items grouped by KOT round: "Round 1 · 7:15 PM", "Round 2 · 7:42 PM"
- "Add more items" button → pushes back to `/menu` with `qrToken` preserved in sessionStorage

### Bug Fix

Remove hardcoded `tableNumber: 'Table 12'` from `checkout/page.tsx`.  
Replace with resolved table name from qrToken or null for tableless orders.

---

## Key Invariants

- `sessionStorage` (not `localStorage`) — session ends when customer closes tab or browser
- No qrToken = tableless order, works identically to current flow
- The `kwickly_active_order_id` localStorage key is kept for backward compat (tracks order for SSE)
