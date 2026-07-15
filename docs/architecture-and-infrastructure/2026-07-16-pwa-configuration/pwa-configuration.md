# Progressive Web App (PWA) Configuration

**Date:** 2026-07-16
**Domain:** Architecture & Infrastructure
**Status:** Approved & Implemented

## Context
To provide a native-like experience for end customers using the Kwickly storefront (e.g. scanning a QR code at a table), the application needs to be installable and support offline caching. The Admin Web already utilized `vite-plugin-pwa`, but the Next.js storefront lacked equivalent configuration.

## Decision
We are configuring the Next.js `kwickly-client` as a Progressive Web App (PWA) using `@ducanh2912/next-pwa`.

## Implementation
- The `next.config.js` is wrapped with `withPWA`.
- A dynamic manifest route generates the `manifest.json` per tenant to support white-labeling on the home screen.
- Service workers will handle static asset caching and enable future Web Push Notifications (Phase 9).
