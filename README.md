# Brightloop Software — Subscription Management & Recurring Billing Platform
> **Odoo Hackathon — Backend Foundation (Member 1 Scope)**

A modular, production-ready Express.js and MongoDB (Mongoose) backend built using ES Modules (`"type": "module"`), featuring robust JWT authentication, strict password validation, Role-Based Access Control (RBAC), shared foundation schemas, and product/plan catalog management.

---

## 📁 Project Directory Structure

```
Make-a-ton/
├── config/
│   └── db.js                 # MongoDB Mongoose connection with error handling
├── controllers/
│   ├── authController.js     # Register, Login, Forgot Password, and Profile handlers
│   └── catalogController.js  # Product & Plan catalog CRUD operations
├── middleware/
│   ├── auth.js               # JWT verification (protect), RBAC (authorize), and optionalAuth
│   └── errorHandler.js       # Centralized Mongoose and Express error handler
├── models/
│   ├── User.js               # User schema with bcrypt password hashing & role enum
│   ├── Product.js            # Product catalog with dynamic variant pricing (e.g. Odoo brand +560)
│   ├── Plan.js               # Recurring billing plans (daily, weekly, monthly, yearly)
│   ├── Subscription.js       # Subscription lifecycle (Draft -> Quotation -> Confirmed -> Active -> Closed)
│   ├── Invoice.js            # Invoicing engine model with status transitions (Draft -> Paid)
│   ├── Payment.js            # Payment records (Bank Transfer, Credit Card, UPI, etc.)
│   ├── Discount.js           # Promotional discounts (percentage & fixed)
│   └── index.js              # Central barrel export for all Mongoose models
├── routes/
│   ├── authRoutes.js         # /api/auth endpoints
│   ├── catalogRoutes.js      # /api/products and /api/plans endpoints
│   └── index.js              # Central router and health check endpoint
├── scripts/
│   └── seed.js               # Standalone database seeder with sample users, products, plans
├── .env.example              # Environment variables template
├── .env                      # Local environment configuration
├── .gitignore                # Git ignore patterns
├── package.json              # Project metadata, ES module config, and scripts
├── server.js                 # Express application entrypoint with CORS and route mounting
└── README.md                 # System documentation & API specifications
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (copied from `.env.example`):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/brightloop
JWT_SECRET=brightloop_super_secret_jwt_key_2026_odoo_hackathon
NODE_ENV=development
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Database
Wipes existing data and seeds pre-configured demo users, products with variants, and billing plans:
```bash
npm run seed
```

#### Pre-seeded Credentials:
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@brightloop.com` | `Admin#1234` |
| **Staff** | `staff@brightloop.com` | `Staff#1234` |
| **Customer** | `client@business.com` | `Client#1234` |

### 3. Run the Backend Server
- **Development (with hot reload via Node `--watch`)**:
  ```bash
  npm run dev
  ```
- **Production start**:
  ```bash
  npm start
  ```

---

## 🔐 Authentication & Role-Based Access Control (RBAC)

### Password Security Policy:
- Minimum length: **strictly > 8 characters**
- Must contain at least **one uppercase letter** (`A-Z`)
- Must contain at least **one lowercase letter** (`a-z`)
- Must contain at least **one special character** (`!@#$%^&*...`)

### User Roles:
- `admin`: Full administrative privileges (manage products, plans, staff accounts, system settings).
- `staff`: Internal team member handling billing, invoices, and customer subscriptions.
- `customer`: End-user client managing subscriptions, viewing quotes, and paying invoices (default role for public registration).

*Note: Public users can only register as `customer`. Creating a user with `staff` or `admin` role requires an active `admin` Bearer token.*

---

## 📡 API Endpoints Overview

### Health Check
- `GET /api/health` — Returns system status and current timestamp.

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public (Customer) / Admin (Staff) | Register user with password validation & role safeguards |
| `POST` | `/api/auth/login` | Public | Authenticates credentials and returns signed JWT token |
| `POST` | `/api/auth/forgot-password` | Public | Mock endpoint that generates and logs dummy reset link |
| `GET` | `/api/auth/me` | Authenticated | Retrieves current logged-in user profile |

#### Sample: User Registration
`POST /api/auth/register`
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword#2026"
}
```

#### Sample: User Login
`POST /api/auth/login`
```json
{
  "email": "admin@brightloop.com",
  "password": "Admin#1234"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67234a9...",
    "name": "Brightloop Admin",
    "email": "admin@brightloop.com",
    "role": "admin"
  }
}
```

---

### Product Catalog Endpoints (`/api/products`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public / Auth | List all products with their variants |
| `GET` | `/api/products/:id` | Public / Auth | Get a single product by ID |
| `POST` | `/api/products` | Admin Only | Create product with variant pricing |
| `PUT` | `/api/products/:id` | Admin Only | Update an existing product |
| `DELETE` | `/api/products/:id` | Admin Only | Delete a product |

#### Sample: Create Product with Odoo Variant
`POST /api/products` (Requires `Authorization: Bearer <ADMIN_TOKEN>`)
```json
{
  "name": "Enterprise ERP Cloud Engine",
  "type": "software",
  "sales_price": 1200,
  "cost_price": 450,
  "notes": "Core ERP software with dynamic variant add-ons",
  "variants": [
    {
      "name": "Brand",
      "option": "Odoo",
      "extra_price": 560
    },
    {
      "name": "Brand",
      "option": "Standard Cloud",
      "extra_price": 0
    }
  ]
}
```

---

### Plan Catalog Endpoints (`/api/plans`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/plans` | Public / Auth | List active billing plans (`?all=true` for all) |
| `GET` | `/api/plans/:id` | Public / Auth | Get a single plan by ID |
| `POST` | `/api/plans` | Admin Only | Create recurring billing plan |
| `PUT` | `/api/plans/:id` | Admin Only | Update billing plan settings |
| `DELETE` | `/api/plans/:id` | Admin Only | Delete billing plan |

#### Sample: Create Billing Plan
`POST /api/plans` (Requires `Authorization: Bearer <ADMIN_TOKEN>`)
```json
{
  "name": "Standard Monthly Growth",
  "billing_interval": "monthly",
  "base_price": 199,
  "min_quantity": 1,
  "auto_close": false,
  "allow_pause": true,
  "is_active": true
}
```

---

## 🧩 Shared Foundation Models for Teammates

All models are exported in `models/index.js` for immediate use across features:

```javascript
import { 
  User, 
  Product, 
  Plan, 
  Subscription, 
  Invoice, 
  Payment, 
  Discount 
} from './models/index.js';
```

1. **`Product`**: Defines items, types, pricing, and variants (with `extra_price`).
2. **`Plan`**: Recurring billing cadence (`daily`, `weekly`, `monthly`, `yearly`).
3. **`Subscription`**: State machine (`Draft` → `Quotation` → `Confirmed` → `Active` → `Closed`) with line items, tax percentage, variant surcharges, and applied discounts.
4. **`Invoice`**: Tracks due date, subtotal, tax amounts, and payment status (`Draft`, `Confirmed`, `Paid`, `Overdue`).
5. **`Payment`**: Records payment transactions (`Bank Transfer`, `Credit Card`, `Cash`, `UPI`) linked to invoices.
6. **`Discount`**: Promotional codes with minimum requirements and usage limits.
