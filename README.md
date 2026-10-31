# Brightloop Software — Subscription Management & Recurring Billing Platform

A unified subscription management, automated billing, and revenue operations platform built for the **Odoo Hackathon**. 

This system replaces manual spreadsheet workflows with an automated SaaS recurring billing engine, role-based self-service portals, product variant configuration, quotation-to-subscription workflows, and real-time financial reporting.

---

## Table of Contents
1. [Overview & Problem Statement](#overview--problem-statement)
2. [Key Features](#key-features)
3. [Architecture & Tech Stack](#architecture--tech-stack)
4. [Domain Model & Lifecycle State Machines](#domain-model--lifecycle-state-machines)
5. [Getting Started & Local Setup](#getting-started--local-setup)
6. [Environment Variables](#environment-variables)
7. [API Reference](#api-reference)
8. [Demo Walkthrough Script (Judging Guide)](#demo-walkthrough-script-judging-guide)
9. [Team Members](#team-members)

---

## Overview & Problem Statement

Brightloop Software sells recurring software subscriptions, add-ons, and multi-variant services. Managing renewals, invoice drafting, payment reconciliations, and quarter-end reporting manually on spreadsheets resulted in:
* Missed renewal timelines and delayed invoicing
* Human error in calculating taxes, variant surcharges, and tiered discounts
* Unmatched customer payments and untracked overdue invoices
* Complete lack of real-time visibility into Monthly Recurring Revenue (MRR) and receivables

**Solution:** This application provides an end-to-end engine that automates the subscription lifecycle: from quote creation and automated invoice generation to payment capture and real-time financial analytics.

---

## Key Features

### 1. Role-Based Access Control (RBAC) & Security
* **Admin:** Full access to manage products, pricing tiers, variant surcharges, discount rules, staff accounts, and tax policies.
* **Internal Staff (Sales/Ops):** Create quotations from pre-built templates, confirm subscriptions, generate invoices, record payments, and track customer accounts.
* **Customer Portal:** Dedicated self-service view allowing clients to view active/past subscriptions, download itemized invoices, and verify payment receipts.
* **Authentication:** Secure JWT authentication, password complexity enforcement (8+ chars, upper/lower/special characters), and password reset flows.

### 2. Products, Variants & Subscription Plans
* **Dynamic Pricing Engine:** Base product catalog with dynamic variant surcharges (e.g., Brand: *Odoo* adds `+560` to base price).
* **Flexible Billing Intervals:** Support for Daily, Weekly, Monthly, and Annual recurring cycles.
* **Lifecycle Rules:** Configurable policies per plan for auto-closing, pausing, early termination, and auto-renewals.

### 3. Quotation-to-Subscription Workflow
* Pre-configured quotation templates containing preset product lines and plan terms.
* Dedicated transition engine tracking the exact order status:
  $$\text{Draft} \longrightarrow \text{Quotation} \longrightarrow \text{Confirmed} \longrightarrow \text{Active} \longrightarrow \text{Closed}$$

### 4. Automated Recurring Billing Engine
* **Batch/On-Demand Billing Run:** Auto-generates draft/confirmed invoices for all subscriptions due on or before billing day.
* **Idempotency & Duplicate Guards:** Prevents duplicate invoicing for the same billing period.
* **Tax & Discount Rules:** Automated line-level and order-level discount evaluation (fixed vs. percentage, minimum quantity thresholds, expiration checks) and tax computation.
* **Invoice Lifecycle:**
  $$\text{Draft} \longrightarrow \text{Confirmed} \longrightarrow \text{Paid} \quad (\text{or } \text{Overdue})$$

### 5. Payment Reconciliation & Cash Flow Tracking
* Log payments against specific invoices (Bank Transfer, Credit Card, UPI, etc.).
* Automated status updates to `Paid` upon complete settlement.
* Overdue invoice aging and tracking to prevent revenue leakage.

### 6. Real-Time Finance & Executive Dashboard
* High-performance aggregation pipeline delivering response times under 2 seconds.
* Live KPIs: Total Active Subscriptions, Total Collected Revenue, Outstanding Receivables, and Overdue Invoices.
* Status filters and searchable transaction ledgers.

---

## Architecture & Tech Stack

* **Frontend:** React (Vite), Tailwind CSS, Lucide React, Axios
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas (Mongoose ODM)
* **Auth:** JSON Web Tokens (JWT) & bcrypt.js password hashing

---

## Domain Model & Lifecycle State Machines

### Subscription State Flow
```text
 [ Draft ] ---> [ Quotation ] ---> [ Confirmed ] ---> [ Active ] ---> [ Closed ]
                                                           |
                                                           +---> [ Paused ]
```

### Invoice State Flow
```text
 [ Draft ] ---> [ Confirmed ] ---> [ Paid ]
                       |
                       +---> [ Overdue ] (when past due date without payment)
```

### Core Data Entities
* **User:** `name`, `email`, `password`, `role` (`admin` | `staff` | `customer`)
* **Product:** `name`, `type`, `sales_price`, `cost_price`, `variants: [{ name, option, extra_price }]`
* **Plan:** `name`, `billing_interval` (`daily` | `weekly` | `monthly` | `yearly`), `base_price`, `min_quantity`, `auto_close`, `allow_pause`
* **Subscription:** `subscription_number`, `customer`, `plan`, `status`, `start_date`, `expiry_date`, `next_billing_date`, `items`, `discount`, `total_amount`
* **Invoice:** `invoice_number`, `subscription`, `customer`, `items`, `subtotal`, `tax_amount`, `total_amount`, `status`, `due_date`
* **Payment:** `invoice`, `amount`, `payment_method`, `payment_date`, `notes`
* **Discount:** `code`, `type` (`percentage` | `fixed`), `value`, `min_qty`, `min_amount`, `expiry_date`, `usage_limit`

---

## Getting Started & Local Setup

### Prerequisites
* Node.js (v18.x or higher)
* npm or yarn
* MongoDB URI (Local or MongoDB Atlas cluster)

### 1. Clone the Repository
```bash
git clone https://github.com/your-team-name/subscription-management-system.git
cd subscription-management-system
```

### 2. Backend Installation & Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your MongoDB Atlas URI and JWT Secret
npm run dev
```

### 3. Frontend Installation & Setup
```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

The frontend will run at `http://localhost:5173` and the backend API at `http://localhost:5000`.

---

## Environment Variables

### Backend (`/backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/brightloop?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_hackathon_2026
CLIENT_URL=http://localhost:5173
```

### Frontend (`/frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## API Reference

### Authentication
* `POST /api/auth/register` — Create a new user account
* `POST /api/auth/login` — Authenticate and receive JWT token
* `POST /api/auth/reset-password` — Trigger password reset workflow

### Products & Plans
* `GET /api/products` — List catalog products and variant configurations
* `POST /api/products` — Add a new product with variant pricing (Admin)
* `GET /api/plans` — List active subscription plans
* `POST /api/plans` — Create a billing plan (Admin)

### Subscriptions
* `GET /api/subscriptions` — List subscriptions (filtered by customer role)
* `POST /api/subscriptions` — Create new subscription/quotation
* `PATCH /api/subscriptions/:id/status` — Advance state (`Draft` $\rightarrow$ `Quotation` $\rightarrow$ `Confirmed` $\rightarrow$ `Active` $\rightarrow$ `Closed`)

### Billing & Invoices
* `POST /api/billing/trigger-run` — Run automated billing cycle for due subscriptions
* `GET /api/invoices` — List invoices with payment & due status
* `GET /api/invoices/:id` — Retrieve itemized invoice details
* `PATCH /api/invoices/:id/confirm` — Move invoice from Draft to Confirmed

### Payments & Finance Analytics
* `POST /api/payments` — Record payment against an invoice
* `GET /api/analytics/dashboard` — High-performance finance metrics (MRR, Receivables, Overdue stats)

---

## Demo Walkthrough Script (Judging Guide)

Follow this 5-minute scenario during evaluation:

1. **Sign Up & RBAC:** Register a new customer (`customer@test.com`) with password complexity checks. Log in as `admin@brightloop.com` to review role privileges.
2. **Catalog & Variant Setup:** Open Product Catalog, observe base item and add a variant rule (e.g. Brand `Odoo` adding `+560`).
3. **Quotation to Subscription:** Create a quote for a client, apply a discount rule, and advance status: **Draft $\rightarrow$ Quotation $\rightarrow$ Confirmed $\rightarrow$ Active**.
4. **Automated Billing Day:** Click **"Trigger Billing Run"** on the admin panel to simulate billing day. Verify that an invoice is auto-generated with calculated taxes and discounts, without duplicate generation.
5. **Payment Capture:** Register a payment under **Payments** for the generated invoice. Verify invoice moves to `Paid`.
6. **Finance Analytics:** Open Finance Dashboard to observe real-time updates to Active Subscriptions, Total Revenue, and Outstanding Dues.

---

## Team Members

* **Member 1 (Backend Core & Auth):** Models, Authentication, RBAC, Product/Plan Catalog
* **Member 2 (Billing & State Engine):** Lifecycle State Machines, Billing Engine, Discount/Tax Calculations
* **Member 3 (Customer & Sales Frontend):** Portal, Auth UI, Quotation Generation
* **Member 4 (Admin & Analytics Frontend):** Product/Plan Management, Finance Dashboard & Deployment
