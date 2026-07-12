# Kwickly Client App: Customer Web & White-Labeling Architecture

The `kwickly-client` repository serves as the end-user (customer) interface for restaurant guests. This document outlines the architectural plan for tenant routing, white-labeling, and branding injection, adhering to modern Next.js and industry best practices.

## 1. Access Strategy (Domain Routing & Context)

To support thousands of tenants seamlessly from a single Next.js application, we will adopt the **Multi-Tenant Platforms Architecture** (popularized by Vercel).

### Next.js Middleware Routing
Customers need seamless access to the restaurant's menu and ordering system. We will intercept all incoming requests using Next.js Middleware (`middleware.ts`).

- **Subdomain Routing:** Requests to `[tenant-slug].kwickly.app` will be rewritten internally to `/app/[tenant-slug]`.
- **Custom Domain Routing:** If a restaurant brings their own domain (e.g., `ordernow.swamys.com`), the middleware will lookup the custom domain and rewrite to the corresponding tenant slug.
- **QR Code Context (Table/Branch):** When a user scans a physical QR code at a table, the URL will include context parameters. 
  - *Example URL:* `https://swamys.kwickly.app/branch/[branch-id]/table/[table-no]`
  - The middleware will parse the subdomain (`swamys`) and rewrite it to `/app/swamys/branch/[branch-id]/table/[table-no]`. This allows the server components to immediately know *Who* the tenant is, *Where* the branch is, and *What* table the user is sitting at.

## 2. White-Labeling & Branding Strategy

Our goal is to make the app feel like a native, custom-built application for each restaurant. We will leverage the existing `tenantBrandings` table.

### Dynamic CSS Variable Injection (Theming)
We cannot pre-compile Tailwind classes for every tenant's hex code. Instead, we will use **Dynamic CSS Variables**.

1. **Server-Side Fetching:** The root layout `app/[tenant-slug]/layout.tsx` will fetch the tenant's branding data from the Kwickly API (cached aggressively in Redis).
2. **Style Injection:** We will inject a `<style>` block directly into the `<head>`.
   ```html
   <style>
     :root {
       --primary-brand: <converted-hsl-or-oklch-from-hex>;
       --font-sans: "<tenant-font>", sans-serif;
     }
   </style>
   ```
3. **Tailwind Config:** The `tailwind.config.ts` will map `colors.primary` to `var(--primary-brand)`. This ensures that all UI components (buttons, badges, active states) automatically inherit the tenant's exact brand color with full opacity-modifier support.

### Dynamic Assets & Metadata
- **Logos & Favicons:** The `layout.tsx` will dynamically set the `<title>` and inject `<link rel="icon">` using the `faviconUrl`. 
- **Watermark:** Based on the `hideKwicklyBranding` flag (from higher pricing tiers), the "Powered by Kwickly" footer will be hidden.

## 3. Progressive Web App (PWA) Capabilities

A core feature for regular customers is the ability to install the restaurant's app on their phone without going to the App Store.

- **Dynamic Manifest Route:** We will create a Next.js API route `/manifest.json` (or route handler) that dynamically generates the Web App Manifest based on the `customPwaManifest` JSON in the database. 
- When a user visits `swamys.kwickly.app`, they can tap "Add to Home Screen". The icon and app name on their phone will belong to Swamy's, not Kwickly.

## 4. Performance & Caching

- **Redis Caching:** The API endpoint that serves the `TenantBranding` payload must be heavily cached. A cache invalidation event will fire only when the tenant updates their branding via the Admin Web Dashboard.
- **Image Optimization:** Tenant logos will be served via Next.js `<Image>` component for automatic WebP conversion and optimization.

## Open Questions

> [!IMPORTANT]
> **Domain Resolution Strategy:** How are we handling the DNS layer for custom domains? Are we using Vercel/Cloudflare custom domains API to programmatically provision SSL certificates when a tenant adds a custom domain?

> [!WARNING]
> **Authentication Scope:** Do we want customer accounts to be "Global" across all Kwickly restaurants, or "Isolated" per tenant? (Industry standard usually leans towards global auth for ease of use, but isolated profiles per restaurant).

## User Review Required

Does this routing and dynamic CSS injection strategy align with your vision for the white-labeled end-user experience? Once approved, we will formalize this into an ADR and proceed with scaffolding the Client repository.
