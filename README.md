# Brightloop Software — Unified Subscription Management Platform
> **Odoo Hackathon Project**  
> Built by Brightloop Engineering Team (Backend: Member 1 & Member 2)

---

## 🎯 Evaluator Expectations Compliance Matrix

| Evaluation Area | How This Implementation Demonstrates It |
| :--- | :--- |
| **Database Design** | Normalized Mongoose schemas for `Users`, `Products`, `Plans`, `Subscriptions`, `Invoices`, `Payments`, `Discounts`, and `Counters` with compound indexes for billing idempotency. |
| **Backend APIs** | Clean RESTful endpoints under `/api/auth`, `/api/products`, `/api/plans`, `/api/subscriptions`, `/api/billing`, `/api/invoices`, `/api/payments`, `/api/discounts`. |
| **Security & RBAC** | Strict password policy (>8 chars, uppercase, lowercase, special char), bcrypt hashing, JWT authentication, and Role-Based Access Control (`admin`, `staff`, `customer`). |
| **State Machine & Lifecycle** | Subscriptions follow `Draft` $\rightarrow$ `Quotation` $\rightarrow$ `Confirmed` $\rightarrow$ `Active` $\rightarrow$ `Closed` (plus `Paused` respecting plan constraints). Invoices follow `Draft` $\rightarrow$ `Confirmed` $\rightarrow$ `Paid`. |
| **Billing Engine & Idempotency** | Automated billing runner with atomic MongoDB transactions. Zero double-billing or skipped cycles guaranteed. |
| **Dynamic Data** | Real MongoDB Atlas cloud operations with Mongoose ODM. |
| **Teamwork & GitHub** | Modular division of labor with distinct team member contributions and passing automated test suites. |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/brightloop_subscriptions?retryWrites=true&w=majority
JWT_SECRET=brightloop_super_secret_jwt_key_2026_odoo_hackathon
NODE_ENV=development
```

### 3. Run Automated Tests
```bash
npm test
```

### 4. Seed the Database
```bash
npm run seed
```

### 5. Start the Server
```bash
npm run dev
```
Open **`http://localhost:5000`** in your browser to view the live **Embedded Control Center & API Explorer**.

---

## 📡 API Reference Overview

### Member 1: Authentication & Catalog
* `POST /api/auth/register` — Register new user with strict password validation
* `POST /api/auth/login` — Sign in and receive JWT token
* `GET /api/auth/me` — Get authenticated user profile
* `POST /api/auth/forgot-password` — Password reset request simulation
* `GET /api/products` & `POST /api/products` — Product catalog and variants (e.g. Brand Odoo +$560)
* `GET /api/plans` & `POST /api/plans` — Plans setup (billing intervals, min quantity, auto_close, allow_pause)

### Member 2: Subscriptions, Invoicing & Billing Engine
* `POST /api/subscriptions` — Create subscription or quote
* `POST /api/subscriptions/quote-template` — Generate quotation from template
* `POST /api/subscriptions/calculate-preview` — Live calculation with variant extras & discounts
* `POST /api/subscriptions/:id/transition` — Finite state machine transitions
* `POST /api/billing/trigger-run` — 1-click automated billing day runner (with idempotency)
* `GET /api/billing/metrics` — Finance Lead metrics (MRR, ARR, active counts, invoiced vs collected revenue)
* `GET /api/invoices` — List invoices with status & payment filters
* `POST /api/invoices/:id/confirm` — Confirm draft invoice
* `POST /api/invoices/:id/send` — Electronic dispatch simulation
* `GET /api/invoices/:id/print` — Printable invoice layout
* `POST /api/payments` — Record payment & automatically reconcile invoice balance
* `POST /api/discounts` & `POST /api/discounts/validate` — Discount rules engine
