# Brightloop Subscription Management System
## Member 2: Backend Logic & Billing Automation Engine

> **Hackathon Role:** Member 2 — Subscriptions Lifecycle, Quotation Engine, Billing Day Automation, Invoicing & Payment Reconciliation.  
> **Tech Stack:** Node.js, Express.js, MongoDB Atlas (Mongoose ODM), RESTful Architecture.

---

## 🎯 Evaluator Expectations Compliance Matrix

| Evaluation Area | How This Implementation Demonstrates It |
| :--- | :--- |
| **Database Design** | Normalized Mongoose schemas for `Subscriptions`, `Invoices`, `Payments`, `Discounts`, `Products`, `Plans`, and atomic `Counters` with compound indexes (e.g., `{ subscription_id: 1, billing_period_end: 1 }` for idempotency). |
| **Backend APIs** | Clean RESTful endpoints under `/api/subscriptions`, `/api/billing`, `/api/invoices`, `/api/payments`, `/api/discounts` with standard status codes (`200`, `201`, `400`, `404`, `409`, `500`). |
| **Code Quality** | Strict separation of concerns across `controllers/`, `services/`, `models/`, `routes/`, `middlewares/`, and `utils/`. |
| **Validation & Business Logic** | Plan minimum quantity checks, variant extra price calculation (e.g. Brand Odoo `+$560`), discount rule verification, and finite state machine transition enforcement. |
| **Security** | Role-based middleware (`authMiddleware`, `requireRole`), parameterized queries via Mongoose ODM to prevent NoSQL injection, and sanitized error messages. |
| **Dynamic Data & Idempotency** | Real MongoDB Atlas operations. **Guaranteed Idempotency:** Subscriptions cannot be billed twice or skipped for the same billing period. |
| **Teamwork & Integration** | Plug-and-play API contracts with clear integration endpoints for Member 1 (Auth/Catalog), Member 3 (Customer/Sales), and Member 4 (Finance Lead). |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure MongoDB Atlas
Edit `.env` (or copy `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/brightloop_subscriptions?retryWrites=true&w=majority
NODE_ENV=development
```
*(If testing locally, `mongodb://localhost:27017/brightloop_subscriptions` works out of the box).*

### 3. Seed Database with Brightloop Data
Populates products (including Brand Odoo variant +$560), starter plans, customers, subscriptions across all states, and active billing test data:
```bash
npm run seed
```

### 4. Start the Server
```bash
npm run dev
# or
npm start
```
The server will start at **`http://localhost:5000`**.  
Open your browser to **`http://localhost:5000`** to view the live **Embedded Control Center & API Explorer**.

---

## 🔄 State Machine & Lifecycles

### 1. Subscription State Transitions
```text
[Draft] ----------> [Quotation] ----------> [Confirmed] ----------> [Active] ----------> [Closed]
   |                     |                                             |                    ^
   |                     +---------------------------------------------+                    |
   |                                                                   v                    |
   |                                                               [Paused] ----------------+
   |                                                                   |
   |                                                                   v (Resume)
   |                                                                [Active]
   +-------------------------------------------------------------------> [Closed]
```

* **Valid Next States:**
  * `draft` $\rightarrow$ `['quotation', 'confirmed', 'closed']`
  * `quotation` $\rightarrow$ `['confirmed', 'closed']`
  * `confirmed` $\rightarrow$ `['active', 'closed']`
  * `active` $\rightarrow$ `['paused', 'closed']` *(validates `plan.allow_pause !== false`)*
  * `paused` $\rightarrow$ `['active', 'closed']`
  * `closed` $\rightarrow$ `['confirmed', 'active']` *(renewal action)*

### 2. Invoice State Transitions
```text
[Draft] ----------> [Confirmed] ----------> [Paid]
   |                     |
   +---------------------+-----------------> [Cancelled]
```

---

## 📡 API Reference for Teammates

### Subscriptions & Quotes (`/api/subscriptions`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/subscriptions` | List subscriptions (supports `?status=active`, `?customer_id=...`, `?search=...`) |
| `GET` | `/api/subscriptions/:id` | Get subscription details with populated plan and items |
| `POST` | `/api/subscriptions` | Create a new subscription or draft |
| `POST` | `/api/subscriptions/quote-template` | Generate quotation with validity days from a template (Member 3) |
| `POST` | `/api/subscriptions/calculate-preview` | Calculate live subtotal, variant adjustments, taxes, and discounts |
| `POST` | `/api/subscriptions/:id/transition` | Transition status (`{ status: "confirmed", reason: "..." }`) |
| `POST` | `/api/subscriptions/:id/renew` | Renew closed/active subscription (`{ months: 12 }`) |

### Billing Automation & Finance (`/api/billing`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/billing/trigger-run` | **The Billing Day Runner**: Scans all active subscriptions due on or before `target_date`, generates invoices with guaranteed idempotency. |
| `GET` | `/api/billing/metrics` | **Finance Lead Dashboard**: Real-time MRR, ARR, active counts, invoiced vs collected revenue, and overdue invoices (Member 4). |

### Invoices (`/api/invoices`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/invoices` | List invoices with filters (`?status=draft`, `?payment_status=unpaid`) |
| `GET` | `/api/invoices/:id` | Get single invoice details |
| `POST` | `/api/invoices/:id/confirm` | Confirm draft invoice |
| `POST` | `/api/invoices/:id/cancel` | Cancel invoice (prohibited if payments applied) |
| `POST` | `/api/invoices/:id/send` | Simulate electronic dispatch to customer email |
| `GET` | `/api/invoices/:id/print` | Formatted printable invoice structure with company header |

### Payments & Reconciliation (`/api/payments`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/payments` | Record payment against invoice (auto-updates invoice to `paid` or `partially_paid`) |
| `GET` | `/api/payments` | List payment transaction audit trail |
| `GET` | `/api/payments/invoice/:invoiceId` | List payments for a specific invoice |

### Discounts & Rules (`/api/discounts`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/discounts` | Create discount rule (`code`, `percentage`/`fixed`, `min_qty`, `min_amount`, `expiry_date`) |
| `POST` | `/api/discounts/validate` | Validate code against current subtotal and items quantity |
| `GET` | `/api/discounts` | List active discounts |

---

## 🤝 Team Integration Guide

### For Member 1 (Auth & Product/Plan Setup):
* Our models directly reference your `User` (`customer_id`), `Product` (`product_id`), and `Plan` (`plan_id`).
* Pass your JWT token in the `Authorization: Bearer <token>` header, or use `x-user-role`, `x-user-id`, and `x-user-name` headers during development.

### For Member 3 (Frontend: Customer Portal & Quotes):
* Fetch customer's own subscriptions: `GET /api/subscriptions?customer_id=<id>`
* Fetch customer's invoices: `GET /api/invoices?customer_id=<id>`
* Customer payment submission: `POST /api/payments`
* Quote creation from template: `POST /api/subscriptions/quote-template`

### For Member 4 (Frontend: Admin & Finance Hub):
* Real-time metrics: `GET /api/billing/metrics` (returns formatted `mrr`, `arr`, `active_subscriptions_count`, `total_invoiced_revenue`, `total_collected_revenue`, `overdue_invoices_count`).
* Billing Day 1-click button: `POST /api/billing/trigger-run`.
