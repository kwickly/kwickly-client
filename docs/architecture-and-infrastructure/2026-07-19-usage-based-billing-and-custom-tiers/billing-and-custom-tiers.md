# ADR: Usage-Based Billing & Custom Subscription Tiers

**Date:** 2026-07-19  
**Domain:** Architecture & Infrastructure  
**Status:** Approved  

---

## 1. Context

Kwickly supports multiple restaurant tenants with varying traffic profiles. Small kiosks process under 50 orders a day, whereas large enterprise restaurants process thousands. 

To prevent small businesses from paying high fixed costs, and to protect Kwickly from high variable infrastructure costs (such as SMS OTP authentication and notifications), we need a flexible, pay-as-you-go billing model. We also need a Custom Tier that allows platform administrators to configure manually negotiated rates and customize module configurations per tenant.

---

## 2. Decision

We will implement a hybrid billing architecture combining subscription plans (for feature gates) with metered usage calculations (for transaction limits).

### A. Dynamic Billing Models
Tenants will be set to either a `FLAT` or `METERED` model.
* **FLAT Model:** Standard monthly subscription fee (Basic, Starter, Growth, Enterprise) with fixed order limits.
* **METERED Model:** Pay-As-You-Go pricing. A low baseline hosting fee of ₹299/mo combined with transaction-based pricing:
  * 0 - 1,500 orders/month: **₹4.00 per order**
  * 1,501 - 3,000 orders/month: **₹3.00 per order**
  * 3,001 - 10,000 orders/month: **₹2.00 per order**
  * > 10,000 orders/month: **₹1.50 per order**
* **Variable Fees:** SMS OTP and transaction notifications will be metered and charged at ₹1.50 per SMS beyond a free allocation.

### B. Custom Tier
Administrators can assign a tenant to a `CUSTOM` plan. The custom plan allows overriding:
* Monthly base fee.
* Fixed rate per order (bypassing the tiered volume bracket).
* Granular module toggles (e.g. enabling Subscriptions without upgrading to the Enterprise tier).

### C. Database & Metering Engine
* Add `billingModel`, `baseFee`, `customOrderRate`, and `maxOrdersPerMonth` columns to the `tenants` table.
* Add a `tenant_billing_meters` table to track monthly cycles, order counts, and SMS logs.
* Implement a daily background cron service to compile billing periods, calculate usage, and generate draft invoices.
* Implement a check on the storefront checkouts to block order creation if a tenant exceeds their monthly order limit (specifically on the Basic plan).

---

## 3. Consequences

* **Flexible Economics:** Fits both small kiosks and high-volume chains, matching the platform's infrastructural costs with business value.
* **Protected Unit Margins:** Variable SMS and database storage costs are metered, guaranteeing platform profitability.
* **B2B Customization:** Gives sales teams the flexibility to structure custom plans and features for enterprise clients.
