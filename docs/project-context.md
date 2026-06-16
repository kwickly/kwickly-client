# Kwickly Client Application - Context & Progress Tracker

This document serves as the primary source of truth for the `kwickly-client` repository. It contains the architecture context, technical decisions, and tracks the implementation progress for the Customer Web Application storefront.

---

## 🏗️ Architecture & Tech Stack

The Client Web App is a public-facing digital storefront designed to load quickly, rank well on SEO, and dynamically serve menus and subscriptions for multiple restaurant tenants using a single codebase.

| Layer | Technology Choice | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15 (App Router)** | Excellent SEO capabilities via SSR/SSG, fast routing, and built-in image optimization. |
| **Language** | **TypeScript** | Strict typing to ensure reliable data fetching and schema safety. |
| **Styling** | **Tailwind CSS v4** | Rapid, utility-first styling consistent with the Kwickly ecosystem. |
| **UI Components** | **Shadcn UI** | Accessible, unstyled components built on Radix UI/Base UI. |
| **Server State** | **TanStack Query** | Manages API data fetching, caching, and background syncing for live menus. |
| **Client State** | **Zustand** | Handles the lightweight client state: persistent Auth tokens and local shopping Cart. |
| **API Client** | **Axios** | Configured with automatic JWT injection and seamless silent 401 token refreshing. |

### Folder Structure
```text
kwickly-client/
├── src/
│   ├── app/                 # Next.js App Router definitions
│   │   ├── [tenantSlug]/    # Dynamic public pages per restaurant (Menu, Plans)
│   │   ├── auth/            # OTP Login wizard
│   │   ├── dashboard/       # Protected customer portal (QR Code, Orders)
│   │   └── layout.tsx       # Root layout injecting Nav and Providers
│   ├── components/          
│   │   ├── layout/          # Global components like Navbar
│   │   └── ui/              # Shadcn primitives
│   ├── lib/                 # Utilities (Axios config, Tailwind cn merger)
│   ├── providers/           # React context providers (QueryProvider)
│   └── store/               # Zustand stores (useAuth, useCart)
```

---

## 🎨 Design Direction

- **Theme:** High-contrast **Slate/Zinc** base with **Indigo/Blue** primary accents.
- **Why:** This ensures brand continuity with the Kwickly Admin Dashboard while maintaining a clean, premium, and trustworthy ordering experience for the end consumer.

---

## 🚀 Implementation Progress

### Phase 1: Foundation & Public Storefront (✅ COMPLETED)
- [x] Scaffold Next.js 15 App Router project with TypeScript and Tailwind v4.
- [x] Configure Shadcn UI components and Radix primitives.
- [x] Setup global Zustand stores (`useAuth`, `useCart`) with local storage persistence.
- [x] Setup robust Axios client with seamless JWT silent refreshing.
- [x] Global Layout & responsive Navigation Bar with dynamic cart counter.
- [x] **Landing Page:** (`/[tenantSlug]`) Dynamic hero section showcasing the restaurant.
- [x] **Live Menu:** (`/[tenantSlug]/menu`) Data grid fetching and displaying categories, items, and an interactive Add-to-Cart UI.
- [x] **Subscriptions:** (`/[tenantSlug]/plans`) Subscription plan pricing tables and features.

### Phase 2: Authentication & Protected Dashboard (✅ COMPLETED)
- [x] **Auth Wizard:** (`/auth`) State-driven OTP login flow for secure passwordless entry.
- [x] **Protected Layout:** Route-level redirection ensuring unauthenticated users cannot access the portal.
- [x] **My QR Code:** (`/dashboard`) Active meal balance display and a secure 30-second rotating QR code for POS scanning.
- [x] **Order History:** (`/dashboard/orders`) Read-only list of past Dine-In and Takeaway purchases.

### Phase 3: Checkout & Payments (✅ COMPLETED)
- [x] Cart Checkout UI and address collection.
- [x] Razorpay integration for processing paid orders and subscription purchases.
- [x] Webhook validation handling.

### Phase 4: Customer CRM & Loyalty (✅ COMPLETED)
- [x] Notification feed (bell icon).
- [x] Digital Wallet top-up flow and balance rendering.
- [x] Loyalty points redemption integration into the checkout flow.
