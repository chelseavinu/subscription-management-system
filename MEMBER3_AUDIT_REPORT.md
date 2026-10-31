# Member 3 Audit Report: Customer Portal & Sales Workspace

**Product:** Brightloop Subscription Management & Recurring Billing Platform  
**Auditor / Scope:** Member 3 — Frontend: Customer Portal & Sales Workspace  
**Date:** October 31, 2026  
**Status:** Audit Completed

---

## 1. Executive Summary

This audit assesses the current state of Member 3's assigned responsibilities:
- **Dedicated Customer Self-Service Portal** (Overview, My Subscriptions, My Invoices, Payment History, Account Settings, Security Isolation)
- **Dedicated Sales Representative Workspace** (Sales Overview, Quotation Templates, 5-Step Quotation Creator, Quotations Management, Subscriptions View)
- **Role-Based Routing, Access Control, and Redirection** (Admin → Finance Dashboard, Staff → Sales Workspace, Customer → Customer Portal)

### Why the Application Currently Opens the Finance Dashboard:
In `client/src/App.jsx`, the root application state was initialized with a hardcoded fallback user:
```javascript
const [user, setUser] = useState(() => getCurrentUser() || {
  id: 'usr_admin_1',
  name: 'Brightloop Admin',
  email: 'admin@brightloop.com',
  role: 'admin',
});
const [currentRole, setCurrentRole] = useState(user?.role || 'admin');
const [activeTab, setActiveTab] = useState('dashboard');
```
Because of this hardcoded default admin fallback, whenever anyone visits `http://localhost:5000/`, the app initializes as Admin and defaults `activeTab` to `'dashboard'` (the internal Admin Finance Dashboard). Furthermore, the navigation was a single monolithic layout where "Customer Portal" was merely a sub-tab inside the Admin navigation rather than an independent customer portal with its own navigation structure.

---

## 2. Feature-by-Feature Classification Audit

| Feature Area | Specific Requirement | Status | Detailed Finding |
|---|---|---|---|
| **Auth & Routing** | Customer Registration | **Partially Implemented** | Backend `POST /api/auth/register` prevents public users from registering as `admin` or `staff`, defaulting to `customer`. Frontend has a registration form in `AuthView.jsx`, but lacks full customer route protection and dedicated login screen. |
| **Auth & Routing** | Customer Login & Session Persistence | **Partially Implemented** | Backend `POST /api/auth/login` returns signed JWT and user object. Token is saved in `localStorage`, but app fails to redirect by role upon login. |
| **Auth & Routing** | Role-Based Redirection (Admin / Staff / Customer) | **Missing** | App hardcodes Admin role fallback and opens Admin Finance Dashboard for all users. |
| **Auth & Routing** | Password Reset & Profile Update | **UI Only / Missing API** | `POST /api/auth/forgot-password` generates a dummy token, but no `POST /api/auth/reset-password` or `PUT /api/auth/profile` endpoint exists. |
| **Customer Portal** | Dedicated Customer Navigation (Overview, Subs, Invoices, Payments, Settings, Logout) | **Missing** | Customer Portal was an embedded tab in the Admin sidebar rather than an independent portal with dedicated navigation. |
| **Customer Portal** | Customer Overview (Welcome, Active Subs, Invoices, Next Billing Date, Feeds) | **Partially Implemented** | Basic cards existed in `CustomerPortalView.jsx`, but mixed with hardcoded Acme data instead of dynamic authenticated customer context. |
| **Customer Portal** | My Subscriptions (Sub #, Plan, Dates, Quantity, Surcharges, Details) | **Partially Implemented** | Listed subscriptions, but lacked customer-specific detail inspection drawer/modal. |
| **Customer Portal** | My Invoices (Inv #, Dates, Amount, Status, Printable Detail, Pay) | **Partially Implemented** | Displayed invoices with pay button, but lacked clean customer-only view without admin tools. |
| **Customer Portal** | Payment History (Ref, Invoice, Amount, Date, Rail, Status) | **UI Only, without backend integration** | Payment history was displayed globally for admin; customer-specific view lacked dedicated view with filtered payments. |
| **Customer Portal** | Account Settings (Profile Info, Password Update, Security) | **Missing** | No account settings view existed for customer management. |
| **Customer Security** | Multi-Tenant Customer Data Isolation | **Fully Implemented in Backend** | `subscriptionController.js`, `invoiceController.js`, and `paymentController.js` enforce `req.user.role === 'customer' => query.customer = req.user._id`. However, frontend needs to use authenticated session data. |
| **Sales Workspace** | Dedicated Staff Navigation (Sales Overview, Templates, Create Quote, Quotes, Subs, Logout) | **Missing** | Staff was given access to Admin dashboard with restricted buttons. No dedicated Sales Workspace existed. |
| **Sales Workspace** | Sales Overview (Total Quotes, Drafts, Pending, Confirmed, Active, Activity) | **Missing** | No sales overview metrics or activity feed existed for sales reps. |
| **Sales Workspace** | Quotation Templates Catalog (Browse, Search, Products/Plans, Surcharges, Select) | **Missing / Blocked by Backend API** | No `QuotationTemplate` model, routes, or frontend view existed in the system. |
| **Sales Workspace** | 5-Step Create Quotation Wizard (Template -> Customer -> Review -> Configure -> Submit) | **Missing** | Only a generic "Create Subscription" modal existed on Admin subscriptions page. |
| **Sales Workspace** | Quotations Management Page (Quote #, Customer, Expiry, Amount, Status, Actions) | **Missing** | Quotations were mixed together with active subscriptions in the main subscription table. |
| **Sales Workspace** | Subscriptions Inspection for Staff | **Partially Implemented** | Staff could view subscriptions, but only within the Admin table view. |
| **Admin Experience** | Preserve Existing Finance Dashboard | **Fully Implemented** | The existing Admin Finance Dashboard, Subscriptions, Invoices, Payments, Products, and System Diagnostics are fully functional and must be preserved for Admin role. |

---

## 3. Required Implementation Plan for Member 3

To fulfill Member 3 requirements safely without breaking existing Admin functionality:

### Phase A: Additive Backend Enhancements
1. **QuotationTemplate Model & Routes**:
   - Model `models/QuotationTemplate.js`: Template name, description, plan ref, items (product, variant addon, quantity, tax), default payment terms, validity days, active flag.
   - Endpoints in `routes/quotationTemplateRoutes.js`:
     - `GET /api/quotation-templates`
     - `GET /api/quotation-templates/:id`
     - `POST /api/quotation-templates` (Admin/Staff)
   - Seed pre-configured quotation templates (e.g. Odoo ERP Enterprise Bundle, Cloud DevOps SLA Pack, AI Automated Billing Suite).
2. **Customers Endpoint for Sales Representatives**:
   - `GET /api/customers` (accessible by Admin and Staff to populate customer selection in Step 2 of quotation creation).
3. **Sales Analytics Endpoint**:
   - `GET /api/sales/overview` (returns quotation counts by status: Draft, Quotation, Confirmed, Active, plus recent sales events).
4. **Account Profile & Password Management**:
   - `PUT /api/auth/profile` (update name).
   - `POST /api/auth/change-password` (authenticated password update).

### Phase B: Frontend Architecture Separation
1. **Three Dedicated View Portals**:
   - **`AdminPortal.jsx`**: Preserves existing Finance Dashboard, Subscriptions, Invoices, Payments, Catalog, and System diagnostics.
   - **`CustomerPortal.jsx`**: Dedicated layout with customer navbar/sidebar (Overview, My Subscriptions, My Invoices, Payment History, Account Settings, Logout).
   - **`SalesWorkspace.jsx`**: Dedicated layout for Staff (Sales Overview, Quotation Templates, 5-Step Quotation Wizard, Quotations Management, Subscriptions View, Logout).
2. **Role-Based Landing & Redirection**:
   - Check authenticated user on load:
     - If not logged in → Render clean Brightloop Login/Signup screen with demo persona fast-fill.
     - If logged in as `customer` → Render `CustomerPortal`.
     - If logged in as `staff` → Render `SalesWorkspace`.
     - If logged in as `admin` → Render `AdminPortal`.
   - Navbar persona quick-switch retained for evaluation testing.
3. **Complete 5-Step Quotation Creation Wizard**:
   - Step 1: Select Quotation Template.
   - Step 2: Select Customer (loaded from real backend `GET /api/customers`).
   - Step 3: Review Products & Plans auto-populated from template.
   - Step 4: Configure quantities, variant surcharges, validity period, and payment terms.
   - Step 5: Live financial review and submit quotation to database.
4. **Customer Portal Views**:
   - Overview with dynamic greetings and real stats.
   - My Subscriptions with detailed line item and variant surcharge inspector.
   - My Invoices with printable receipt drawer.
   - Payment History with settlement details.
   - Account Settings with live profile update.
