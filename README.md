# Kwickly Client App

The customer-facing Next.js digital storefront for the Kwickly POS and Subscription Ecosystem. 

This application serves as the primary endpoint for end-customers to browse live menus, purchase meal subscriptions, and generate dynamic QR codes to redeem their meals seamlessly at the restaurant counter.

## Key Features

- **Multi-Tenant Routing:** Fully dynamic URL structures (`/[tenantSlug]`) allow a single codebase to serve menus and branding for thousands of independent restaurants.
- **Live Menu & Cart:** Fast, responsive menu browsing using TanStack Query for background caching and Zustand for local cart management.
- **OTP Authentication:** Secure passwordless login flow.
- **Subscriber Dashboard:** Customers can view their real-time meal balance and present a secure, refreshing QR code to the cashier.
- **Robust API Client:** Advanced Axios interceptors that automatically manage JWT injection and silent token refreshing on `401 Unauthorized` responses.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** Shadcn UI (Radix / Base UI)
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

Open [http://localhost:3000/swamy-hot-foods](http://localhost:3000/swamy-hot-foods) in your browser to view the dynamic storefront demo.

## Project Structure

- `/src/app/[tenantSlug]` - The dynamic public storefront (Menu, Landing, Plans).
- `/src/app/auth` - The OTP login screens.
- `/src/app/dashboard` - Protected customer portal routes.
- `/src/components/ui` - Reusable Shadcn primitives.
- `/src/store` - Zustand global state managers (`useAuth`, `useCart`).
- `/src/lib` - Core utilities like the Axios `api.ts` client.

## Documentation

For a detailed implementation tracker and architectural context, please refer to the internal documentation at [`docs/project-context.md`](./docs/project-context.md).
