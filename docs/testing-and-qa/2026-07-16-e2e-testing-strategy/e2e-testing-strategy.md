# End-to-End Testing Strategy (Playwright)

**Date:** 2026-07-16
**Domain:** Testing & QA
**Status:** Approved & Implemented

## Context
While the Storefront utilizes `vitest` for unit testing, there was a critical lack of automated End-to-End (E2E) browser testing for core customer flows like browsing menus, adding to cart, and placing orders.

## Decision
We have adopted **Playwright** as the official E2E testing framework for the Kwickly Client.

## Implementation
- Playwright is installed and configured in the repository root.
- A basic smoke test suite exists in the `e2e/` directory.
- Developers should write Playwright tests for any new critical path in the customer journey to ensure regressions do not occur in production.
