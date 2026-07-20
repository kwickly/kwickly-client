# Kwickly Client — Progress Tracker

**Last Updated:** 2026-07-19  
**Mirror of:** kwickly-api `docs/progress-and-planning/2026-07-19-master-progress-tracker/progress-tracker.md`

> Canonical progress lives in the API repo. This is a mirror for agent context.

---

## Legend

| Symbol | Meaning |
|---|---|
| ✅ | Completed & deployed |
| 🔴 | Planned — not started |

---

## Completed Phases

| Phase | Name | Key Deliverables |
|---|---|---|
| 0 | Foundation | Next.js App Router, multi-tenant host routing |
| 5 | Subdomain Storefront | `(storefront)` route group, wildcard routing |
| 7 | Order Tracking (SSE) | Live status page with torn-ticket design, SSE countdown |
| 8 | Theme & Font System | Plus Jakarta Sans / Inter, brand color CSS var injection |

---

## Phase 9 — QR-Based Ordering & Session-Aware Checkout 🔴

### Client Tasks

- [ ] Read `?t={qrToken}` from URL in `MenuClientView.tsx`
- [ ] Store qrToken in `sessionStorage`
- [ ] Resolve token → table name via API
- [ ] Show "Dine-In · Table X" sticky banner and hide Delivery/Online Ordering modules
- [ ] Modify `checkout/page.tsx`:
  - [ ] Fix hardcoded `tableNumber: 'Table 12'` bug
  - [ ] Support item-level "To-Go" toggles based on tenant `allowTakeawayOnDineIn` setting
  - [ ] Check active session → add-items vs new-order flow
- [ ] Modify `orders/[orderId]/page.tsx`: group items by KOT round and show "To-Go" badges

---

## Known Bugs (This Repo)

| # | Severity | File | Description |
|---|---|---|---|
| 1 | 🔴 High | `checkout/page.tsx:129` | Hardcodes `tableNumber: 'Table 12'` for every order |
| 2 | 🔴 High | `checkout/page.tsx` | New order always created — no session check for dine-in |
