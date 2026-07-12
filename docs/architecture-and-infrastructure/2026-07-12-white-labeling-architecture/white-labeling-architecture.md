# Kwickly Client App: Customer Web & White-Labeling Architecture

## Status: ✅ Implemented (2026-07-12)

The `kwickly-client` serves as the end-user (customer) interface for restaurant guests. This document describes the **implemented** architecture for tenant routing, white-labeling, and branding injection.

---

## 1. Access Strategy — Native Subdomain Routing via HTTP Host Header

### Decision: No Middleware Rewrites

We explored Next.js Middleware-based URL rewriting (`[tenantSlug]` path parameter approach) and **rejected it** in favour of a cleaner, more scalable pattern.

**Final Architecture:** The storefront lives in a Next.js Route Group `src/app/(storefront)/`. Pages and layouts in this group use the `next/headers` API to read the incoming `host` header directly on the server:

```ts
import { headers } from 'next/headers';

export default async function TenantLayout({ children }) {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const tenantSlug = host.split('.')[0]; // e.g. "swamy" from "swamy.kwickly.in"
  
  const branding = await getTenantBranding(tenantSlug);
  // inject OKLCH CSS variables, set metadata...
}
```

**Benefits over middleware rewrites:**
- No `[tenantSlug]` leaking into every URL path — links stay clean (`/menu`, `/checkout`, `/plans`)
- No `middleware.ts` added to the Edge bundle — better cold-start performance
- Zero-config: subdomain `swamy.kwickly.in` automatically resolves to the same deployment as `punjabi-chuska.kwickly.in`

### Wildcard DNS Setup (Production)
- Set a wildcard A record: `*.kwickly.in → <server-ip>` (single DNS entry)
- The Next.js deployment (on Vercel, Cloudflare Pages, or VPS) receives all traffic
- Each restaurant identified purely by the `host` header — no separate deployments

### Local Development
Since `localhost` has no subdomain, Chrome/Safari/Edge automatically route `*.localhost` to `127.0.0.1`:
```
http://swamy.localhost:3000       →  tenant = "swamy"
http://punjabi-chuska.localhost:3000  →  tenant = "punjabi-chuska"
```

---

## 2. White-Labeling & Dynamic Branding

Each tenant's brand color (hex) is stored in the `tenantBrandings` table. At request time:

1. `(storefront)/layout.tsx` fetches branding via `GET /v1/auth/branding?hostname={slug}`
2. The hex is converted to OKLCH format (Tailwind v4 native)
3. A `<style>` block is injected into `<head>` to override CSS variables:

```html
<style>
  .tenant-wrapper {
    --primary: oklch(0.51 0.2 260);     /* tenant brand colour */
    --primary-foreground: oklch(0.985 0 0); /* auto white foreground */
  }
</style>
```

All Shadcn/Base UI components inherit `--primary` automatically — buttons, badges, focus rings, etc.

### Metadata & SEO
`generateMetadata()` in `layout.tsx` dynamically sets the page `<title>` and `<meta description>` using the tenant's name fetched from the API.

### Future: PWA Manifest
A Next.js Route Handler at `/manifest.json` can dynamically generate the Web App Manifest from the `customPwaManifest` JSONB column in the DB, enabling "Add to Home Screen" with the restaurant's own icon and name.

---

## 3. Custom Domains (Future)

The `tenantBrandings` table already has a `custom_domain` column. To support `ordernow.swamys.com`:
1. Tenant enters their domain in the Admin Dashboard
2. A Cloudflare/Vercel API call provisions a wildcard SSL certificate
3. No code changes needed — the same host-header logic handles it

---

## 4. Scalability

Because this is a stateless serverless/edge deployment:
- **Zero per-tenant infrastructure** — one codebase, one deployment, N tenants
- **Edge caching** — menu data cached at CDN for 60s; branding cached for 1hr
- **Auto-scaling** — serverless provider spins instances based on traffic, not tenant count
- **No traffic bottleneck** — same model as Shopify, Substack, and Vercel's own multi-tenant architecture
