# Kwickly Client App

The customer-facing Next.js digital storefront for the Kwickly POS and Subscription Ecosystem. 

This application serves as the primary endpoint for end-customers to browse live menus, purchase meal subscriptions, and generate dynamic QR codes to redeem their meals seamlessly at the restaurant counter.

## Key Features

- **Multi-Tenant Wildcard Subdomains:** A single Next.js deployment serves thousands of independent restaurant brands. Tenant identification is done natively by reading the HTTP `host` header in server components — no middleware rewriting, no URL slugs. Each tenant gets their own subdomain (e.g., `swamy.kwickly.in`, `punjabi-chuska.kwickly.in`).
- **Live Menu & Cart:** Fast, responsive menu browsing using TanStack Query for background caching and Zustand for local cart management.
- **Authentication & Guest Checkout:** Secure Email/Password login flow with support for POS-registered email linking (customers can be registered at the counter by the cashier).
- **Omnichannel Digital Wallet:** A closed-loop ledger displaying both pre-paid fiat balance (Wallet Cash) and earned loyalty points (CRM). Customers can convert points to cash based on tenant settings.
- **Subscriber Dashboard:** Customers can view their active offline subscriptions, track real-time meal balances, and present a secure, refreshing QR code to the cashier.
- **Dynamic White-Labeling:** The `(storefront)/layout.tsx` fetches tenant branding from the API and injects CSS OKLCH variables at runtime, giving every restaurant its own colour theme, logo, and PWA icon without a separate deployment.
- **Robust API Client:** Advanced Axios interceptors that automatically manage JWT injection and silent token refreshing on `401 Unauthorized` responses.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** Shadcn UI (Base UI)
- **State Management:** Zustand (Client), TanStack React Query (Server)
- **HTTP Client:** Axios

## Getting Started

First, ensure you have [Bun](https://bun.sh/) installed, then install the dependencies:

```bash
bun install
```

Start the development server:

```bash
bun run dev
```

### Local Subdomain Testing

Since `localhost` has no subdomain, use the following pattern to simulate a tenant:

```
http://swamy.localhost:3000
```

Chrome, Safari and Edge all automatically route `*.localhost` to `127.0.0.1`. The app will read `swamy` from the `host` header and fetch the corresponding branding and menu.

## Project Structure

```
src/
├── app/
│   ├── (storefront)/   # Public tenant storefront (route group, served from root)
│   │   ├── layout.tsx  # Fetches branding via host header, injects CSS vars
│   │   ├── page.tsx    # Tenant landing / hero page
│   │   ├── menu/       # Live menu browser
│   │   ├── plans/      # Subscription plan listing
│   │   └── checkout/   # Order checkout
│   ├── auth/           # Email/password login & registration
│   └── dashboard/      # Protected customer portal (orders, wallet, subscriptions)
├── components/
│   ├── ui/             # Shadcn primitives (Base UI)
│   ├── layout/         # Navbar, footer, shell
│   └── cart/           # CartDrawer
├── store/              # Zustand stores (useAuth, useCart)
└── lib/                # Axios API client with JWT interceptors
```

## Documentation

Internal architecture docs are maintained under [`docs/`](./docs/README.md).
