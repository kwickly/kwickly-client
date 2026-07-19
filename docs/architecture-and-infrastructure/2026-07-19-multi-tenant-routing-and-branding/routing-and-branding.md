# ADR: Dynamic Storefront Routing & Theme Engine System

**Date:** 2026-07-19  
**Domain:** Architecture & Infrastructure  
**Status:** Approved  

---

## 1. Context

The Kwickly storefront needs to support two distinct experiences under a single codebase and deployment:
1. **Platform SaaS Homepage:** Served at `kwickly.in` or `localhost:3000` (without subdomain). Allows restaurant owners to register, inspect marketing materials, and explore pricing.
2. **White-Labeled Tenant Storefront:** Served at subdomains like `swamy.kwickly.in` or custom domains. Enables restaurant guests to order, view menus, and purchase subscriptions.

A Next.js route collision occurred because both `src/app/page.tsx` and `src/app/(storefront)/page.tsx` mapped to the root `/` path. Additionally, white-label branding colors stored in hex format in the database must be converted into OKLCH coordinates to comply with Tailwind CSS v4's native styling variables.

---

## 2. Decision

We will implement a unified server-side host header dispatcher and dynamic theme injector.

### A. Routing Dispatcher
* We delete `src/app/(storefront)/page.tsx` to resolve the route collision.
* The root `src/app/page.tsx` becomes the central server-side entry point. It inspects the `host` header:
  * If a valid tenant subdomain is detected, it returns the `<TenantLandingView />` component.
  * If no subdomain is present (root domain), it returns the `<PlatformLandingView />` component.
* The navigation component (`Navbar`) dynamically displays either platform navigation or store-specific navigation.

### B. Dynamic Theme Engine (OKLCH Integration)
* We implement a Hex-to-OKLCH color conversion utility (`color-utils.ts`).
* The storefront layout (`src/app/(storefront)/layout.tsx`) dynamically converts the tenant's brand hex color (fetched from `/v1/auth/branding`) into OKLCH format.
* The converted OKLCH coordinates are injected into a `<style>` block in `<head>`, overriding Tailwind's `--primary` and `--primary-foreground` variables within the `.tenant-wrapper` class block.

---

## 3. Consequences

* **Zero Route Collisions:** Solves the Next.js compilation issues safely at build time.
* **Edge-Speed Rendering:** Subdomain detection and redirection happen instantly on the server side before the page reaches the user's browser.
* **Accurate White-Labeling:** Ensures every button, link, badge, and interaction ring automatically adapts to the restaurant's brand color dynamically.
