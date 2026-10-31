Project: Brightloop Software - Subscription Management & Recurring Billing Platform
Stack: Node.js (Express), MongoDB (Mongoose), React (Vite + Tailwind CSS)

Key Requirements:
1. Roles: Admin, Internal Staff, Customer (with RBAC and JWT auth)
2. Products & Variants: Products with sales/cost price and dynamic variant surcharges (e.g., Brand Odoo adds +560)
3. Subscription Lifecycle: Draft -> Quotation -> Confirmed -> Active -> Closed
4. Invoicing & Billing: Auto-generate invoices from active subscriptions, calculate taxes and discounts (percentage/fixed), avoid duplicate billing, statuses: Draft -> Confirmed -> Paid
5. Payments: Track payments against invoices (Bank Transfer, Credit Card, UPI, etc.)
6. Finance Dashboard: Metrics for active subscriptions, recognized revenue, unpaid/overdue invoices with sub-2s query response time
