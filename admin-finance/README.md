# SaaS Subscription Engine — Admin Catalogs & Finance Hub (Member 4)

Built for Virtual Hackathons: High velocity, pixel-perfect UI, seamless mock-to-live API integration, and full alignment with the 7-entity database schema.

---

## 🚀 Live Demo & Quick Start

The app is located at: `C:\Users\lenovo\.gemini\antigravity-ide\scratch\admin-finance-hub`

```bash
cd admin-finance-hub
npm install
npm run dev
```

Open your browser at: **`http://localhost:5173/`**

---

## 🎯 Member 4 Responsibilities Completed

| Feature | Screen / Module | Hackathon Specs |
| --- | --- | --- |
| **Finance Lead Dashboard** | `FinanceDashboard.jsx` | Real-time MRR, ARR, Active Subs, Overdue Receivables, Collection Rate %, Recent Payments Ledger |
| **"Trigger Billing Run"** | `BillingRunModal.jsx` | Batch billing simulation: queries active subscriptions, generates invoices with taxes & line items, triggers celebration confetti! |
| **Products & Variants** | `ProductsManager.jsx` & `ProductModal.jsx` | Full catalog CRUD, service/product/consu types, **Variants (+560 logic)** with instant preset button and live calculated price previews |
| **Subscription Plans** | `PlansManager.jsx` & `PlanModal.jsx` | Billing intervals (`daily`, `weekly`, `monthly`, `yearly`), min quantity thresholds, `auto_close` policy, `allow_pause` toggle |
| **Invoices & Receivables** | `InvoicesManager.jsx` & `InvoiceDetailModal.jsx` | Status filters (`paid`, `overdue`, `confirmed`, `draft`), search, aging receivables, printable itemized invoice modal |
| **Payment Recording** | `PaymentRecordModal.jsx` | Settle invoices via Stripe, Bank Wire, CC, PayPal, Cash; auto-marks as `paid` and creates audit payment record |
| **Subscriptions Oversight** | `SubscriptionsManager.jsx` | Full state machine pipeline (`draft` $\rightarrow$ `quotation` $\rightarrow$ `confirmed` $\rightarrow$ `active` $\rightarrow$ `closed`) with 1-click stage transitions |
| **Discounts & Coupons** | `DiscountsManager.jsx` | Percentage vs fixed discounts, spend minimums, quantity thresholds, redemption caps |
| **Backend Contract & Settings** | `ApiSettingsModal.jsx` | Live backend URL toggle + fallback mock engine, test ping, full schema reference |

---

## ⚡ Integration with Teammates

### Member 1 (Auth & DB Setup) & Member 2 (Billing Logic & Engine)
In the top navigation bar, click the **"Demo Sandbox / Live API"** pill or open the **Settings** modal:
- Enter your team's live backend URL (e.g. `http://localhost:5000/api` or `https://your-api.onrender.com/api`).
- Click **"Test Ping"** to verify server connectivity.
- Switch the toggle to **"Live Backend API"**. The app will automatically send requests to your endpoints!
- If the backend is temporarily down during a live judge demo, the app **automatically and gracefully falls back** to the local mock engine so you will NEVER face a blank screen or broken demo!

---

## 🏆 Hackathon Judge Demo Script (3-Minute Walkthrough)

1. **Dashboard & KPIs (0:00 - 0:45)**:
   - Point out the **Live MRR ($6,428)**, **Active Subscriptions**, and **Overdue Receivables**.
   - Show the collection progress bar and recent payments ledger.
2. **Trigger Billing Run (0:45 - 1:15)**:
   - Click the orange **"Trigger Billing Run"** button in the navbar.
   - Explain: *"Instead of waiting on delayed cron jobs, our system allows billing managers to run batch billing cycles on-demand."*
   - Click **"Execute Billing Run Now"** — confetti triggers, new invoices are created in bulk, and the dashboard metrics update in real-time!
3. **Products & +560 Variant Builder (1:15 - 1:50)**:
   - Open **Products & Variants**.
   - Show the Enterprise Cloud ERP Suite with the `Brand: Odoo Engine (+ $560)` variant.
   - Click **"Add New Product"** and hit the **"+560 Odoo Preset"** button to show live total price computation.
4. **Subscription Plans & Invoices (1:50 - 2:30)**:
   - Show **Subscription Plans** (`monthly`, `yearly`, `weekly`, `daily`) with `auto_close` and `allow_pause` policies.
   - Jump to **Invoices & Finance**, find an overdue invoice, click **"Pay"**, enter details, and watch the status turn to `paid` with updated finance totals!
5. **Subscriptions Lifecycle Pipeline (2:30 - 3:00)**:
   - Open **Subscriptions Oversight** and show the full pipeline: Draft $\rightarrow$ Quotation $\rightarrow$ Confirmed $\rightarrow$ Active $\rightarrow$ Closed.
   - Click **"To Quotation"** or **"To Confirmed"** to demonstrate state progression.
