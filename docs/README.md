# Kwickly Client Documentation

Welcome to the documentation for the Kwickly Client repository. 
This folder contains Architecture Decision Records (ADRs) and implementation plans.

## 📂 Documentation Structure
To prevent documentation fatigue, we organize files by **Domain (Topic) -> Chronological Order**. 
Deprecated or superseded decisions are moved to the `archive/` folder.

### 🏛️ Architecture & Infrastructure
- [2026-06-17: Project Context](architecture-and-infrastructure/2026-06-17-project-context/project-context.md)
- [2026-07-12: White-Labeling Architecture](architecture-and-infrastructure/2026-07-12-white-labeling-architecture/white-labeling-architecture.md)
- [2026-07-16: API Client Integration](architecture-and-infrastructure/2026-07-16-api-client-integration/api-client-integration.md)
- [2026-07-16: Progressive Web App Configuration](architecture-and-infrastructure/2026-07-16-pwa-configuration/pwa-configuration.md)
- [2026-07-19: Dynamic Storefront Routing & Theme Engine System](architecture-and-infrastructure/2026-07-19-multi-tenant-routing-and-branding/routing-and-branding.md)
- [2026-07-19: Usage-Based Billing & Custom Subscription Tiers](architecture-and-infrastructure/2026-07-19-usage-based-billing-and-custom-tiers/billing-and-custom-tiers.md)
- [2026-07-19: Menu Item Enrichment — Storefront UX](architecture-and-infrastructure/2026-07-19-menu-item-enrichment-ux/menu-enrichment-ux.md)

### 🎨 Frontend & UX
- [2026-07-19: Client UX & UI Guidelines](frontend-and-ux/client-ux-ui-guidelines.md)

### 🧪 Testing & QA
- [2026-06-17: Testing Progress](testing-and-qa/2026-06-17-testing-progress/testing-progress.md)
- [2026-07-16: End-to-End Testing Strategy](testing-and-qa/2026-07-16-e2e-testing-strategy/e2e-testing-strategy.md)

### 📦 Archive
*(Superseded or deprecated decisions live in `docs/archive/`)*

---

**Rule of Thumb for adding new Docs:**
1. Pick the correct domain folder (or create one if it doesn't fit).
2. Create a folder named `YYYY-MM-DD-short-topic-name`.
3. Add your markdown file inside.
4. Update this `README.md` to link to your new file!
