# API Client Integration: Elysia Eden

**Date:** 2026-07-16
**Domain:** Architecture & Infrastructure
**Status:** Approved & Implemented

## Context
The Customer Storefront previously relied on raw `axios` combined with `@tanstack/react-query`. Because the backend (ElysiaJS) and frontend (Next.js) live in the same monorepo ecosystem, manually duplicating types for API payloads and responses was an inefficient anti-pattern.

## Decision
We are integrating `@elysiajs/eden` to consume the `App` type directly from the `kwickly-api` workspace. 

## Implementation
- A central `src/lib/api.ts` will initialize the `edenTreaty` client pointing to our API URL.
- We will gradually refactor existing React Query hooks and Server Components to use the Eden client, granting us full autocomplete and End-to-End type safety out of the box.
