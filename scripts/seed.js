import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Robust resolution of the root .env file regardless of current working directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Discount from '../models/Discount.js';
import QuotationTemplate from '../models/QuotationTemplate.js';

/**
 * Helper to mask sensitive credentials in connection string for logging
 */
const maskMongoUri = (uri) => {
  if (!uri) return '';
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
};

/**
 * Seed Database Function
 */
const seedData = async () => {
  try {
    // 2. Support both MONGODB_URI and MONGO_URI
    const rawMongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    // 3. Explicit check before attempting connection
    if (!rawMongoUri) {
      console.error('====================================================');
      console.error('[Seed Error] Neither MONGODB_URI nor MONGO_URI was found in the root .env file.');
      console.error('Please configure your MongoDB connection string in .env and try again.');
      console.error('====================================================');
      process.exit(1);
    }

    console.log('[Seed] Connecting to database at:', maskMongoUri(rawMongoUri));
    await mongoose.connect(rawMongoUri);
    console.log('[Seed] Database connected successfully.');

    // 4. Wipe existing data across all collections
    console.log('[Seed] Wiping existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Plan.deleteMany({}),
      Subscription.deleteMany({}),
      Invoice.deleteMany({}),
      Payment.deleteMany({}),
      Discount.deleteMany({}),
      QuotationTemplate.deleteMany({}),
    ]);
    console.log('[Seed] Existing collections wiped.');

    // 5. Seed Users
    // Passwords satisfy validation rules: strictly > 8 chars, uppercase, lowercase, special char
    console.log('[Seed] Creating seed users...');
    const usersToCreate = [
      {
        name: 'Brightloop Admin',
        email: 'admin@brightloop.com',
        password: 'Admin#1234',
        role: 'admin',
      },
      {
        name: 'Operations Staff',
        email: 'staff@brightloop.com',
        password: 'Staff#1234',
        role: 'staff',
      },
      {
        name: 'Acme Global Enterprises',
        email: 'client@business.com',
        password: 'Client#1234',
        role: 'customer',
      },
      {
        name: 'Nexus FinTech Labs',
        email: 'nexus@fintech.io',
        password: 'Nexus#1234',
        role: 'customer',
      },
      {
        name: 'Starlight Media Group',
        email: 'contact@starlightmedia.com',
        password: 'Star#1234',
        role: 'customer',
      },
    ];

    const createdUsers = await User.create(usersToCreate);
    const adminUser = createdUsers[0];
    const staffUser = createdUsers[1];
    const acmeCustomer = createdUsers[2];
    const nexusCustomer = createdUsers[3];
    const starlightCustomer = createdUsers[4];

    console.log(`[Seed] Created ${createdUsers.length} users.`);

    // 6. Seed Products
    console.log('[Seed] Creating sample products...');
    const productsToCreate = [
      {
        name: 'Enterprise ERP Cloud Engine',
        type: 'software',
        sales_price: 1200,
        cost_price: 450,
        notes: 'Core scalable ERP backend subscription license with variant addons',
        variants: [
          {
            name: 'Brand',
            option: 'Odoo',
            extra_price: 560,
          },
          {
            name: 'Brand',
            option: 'Standard Cloud',
            extra_price: 0,
          },
          {
            name: 'Brand',
            option: 'Enterprise Plus',
            extra_price: 850,
          },
        ],
      },
      {
        name: 'Dedicated Cloud DevOps & SLA Support',
        type: 'service',
        sales_price: 450,
        cost_price: 160,
        notes: '24/7 technical incident and continuous integration monitoring service',
        variants: [
          {
            name: 'Tier',
            option: 'Standard 8x5',
            extra_price: 0,
          },
          {
            name: 'Tier',
            option: 'Critical 24x7 Enterprise',
            extra_price: 250,
          },
        ],
      },
      {
        name: 'AI Automated Billing & Reconciliation Module',
        type: 'software',
        sales_price: 320,
        cost_price: 90,
        notes: 'Machine-learning OCR and automated bank statement reconciler',
        variants: [
          {
            name: 'Model Capacity',
            option: 'Up to 50k monthly invoices',
            extra_price: 150,
          },
          {
            name: 'Model Capacity',
            option: 'Standard 10k monthly invoices',
            extra_price: 0,
          },
        ],
      },
    ];

    const createdProducts = await Product.create(productsToCreate);
    const erpProduct = createdProducts[0];
    const supportProduct = createdProducts[1];
    const aiModuleProduct = createdProducts[2];

    console.log(`[Seed] Created ${createdProducts.length} sample products.`);

    // 7. Seed Plans
    console.log('[Seed] Creating sample billing plans...');
    const plansToCreate = [
      {
        name: 'Standard Monthly Growth Plan',
        billing_interval: 'monthly',
        base_price: 199,
        min_quantity: 1,
        auto_close: false,
        allow_pause: true,
        is_active: true,
      },
      {
        name: 'Enterprise Yearly Commitment Plan',
        billing_interval: 'yearly',
        base_price: 1990,
        min_quantity: 1,
        auto_close: false,
        allow_pause: false,
        is_active: true,
      },
      {
        name: 'Agile Weekly Sprint Plan',
        billing_interval: 'weekly',
        base_price: 65,
        min_quantity: 1,
        auto_close: false,
        allow_pause: true,
        is_active: true,
      },
    ];

    const createdPlans = await Plan.create(plansToCreate);
    const monthlyPlan = createdPlans[0];
    const yearlyPlan = createdPlans[1];
    const weeklyPlan = createdPlans[2];

    console.log(`[Seed] Created ${createdPlans.length} sample plans.`);

    // 8. Seed Sample Discount code for teammates
    const sampleDiscount = await Discount.create({
      code: 'HACKATHON20',
      type: 'percentage',
      value: 20,
      min_qty: 1,
      min_amount: 100,
      usage_limit: 100,
      times_used: 2,
      is_active: true,
    });
    console.log(`[Seed] Created sample discount code: ${sampleDiscount.code}`);

    // 6. Seed Quotation Templates for Sales Workspace
    console.log('[Seed] Creating quotation templates...');
    const templatesToCreate = [
      {
        name: 'Enterprise Odoo ERP Cloud Bundle',
        description: 'Complete ERP license bundle with Odoo brand variant surcharge, 24x7 critical SLA support, and Net 30 payment terms.',
        category: 'Enterprise',
        plan: yearlyPlan._id,
        payment_terms: 'Net 30',
        validity_days: 30,
        discount: {
          code: 'ENTERPRISE15',
          discount_type: 'percentage',
          value: 15,
        },
        items: [
          {
            product: erpProduct._id,
            product_name: erpProduct.name,
            quantity: 1,
            unit_price: 1200,
            variant_name: 'Brand: Odoo',
            variant_addon: 560,
            tax_pct: 10,
          },
          {
            product: supportProduct._id,
            product_name: supportProduct.name,
            quantity: 1,
            unit_price: 450,
            variant_name: 'Tier: Critical 24x7 Enterprise',
            variant_addon: 250,
            tax_pct: 10,
          },
        ],
        is_active: true,
      },
      {
        name: 'SaaS Growth Starter Pack',
        description: 'Rapid cloud ERP backend deployment with standard 8x5 SLA monitoring on flexible monthly billing.',
        category: 'SMB',
        plan: monthlyPlan._id,
        payment_terms: 'Net 15',
        validity_days: 15,
        discount: {
          code: 'GROWTH10',
          discount_type: 'percentage',
          value: 10,
        },
        items: [
          {
            product: erpProduct._id,
            product_name: erpProduct.name,
            quantity: 1,
            unit_price: 1200,
            variant_name: 'Brand: Standard Cloud',
            variant_addon: 0,
            tax_pct: 10,
          },
          {
            product: supportProduct._id,
            product_name: supportProduct.name,
            quantity: 1,
            unit_price: 450,
            variant_name: 'Tier: Standard 8x5',
            variant_addon: 0,
            tax_pct: 10,
          },
        ],
        is_active: true,
      },
      {
        name: 'AI Automated Billing Accelerator',
        description: 'High-throughput automated invoice OCR and reconciliation machine-learning pipeline with Net 30 terms.',
        category: 'AI Modules',
        plan: monthlyPlan._id,
        payment_terms: 'Net 30',
        validity_days: 30,
        discount: {
          code: 'AIACCEL',
          discount_type: 'percentage',
          value: 5,
        },
        items: [
          {
            product: aiModuleProduct._id,
            product_name: aiModuleProduct.name,
            quantity: 2,
            unit_price: 320,
            variant_name: 'Model Capacity: Up to 50k monthly invoices',
            variant_addon: 150,
            tax_pct: 8,
          },
        ],
        is_active: true,
      },
    ];

    const createdTemplates = await QuotationTemplate.create(templatesToCreate);
    console.log(`[Seed] Created ${createdTemplates.length} quotation templates.`);

    // 7. Seed Subscriptions in diverse lifecycle states
    console.log('[Seed] Creating sample subscriptions...');
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

    const subscriptionsToCreate = [
      {
        subscription_number: 'SUB-2026-0001',
        customer: acmeCustomer._id,
        plan: monthlyPlan._id,
        status: 'Active',
        start_date: new Date(2026, 0, 15),
        next_billing_date: nextMonth,
        items: [
          {
            product: erpProduct._id,
            product_name: erpProduct.name,
            quantity: 1,
            unit_price: erpProduct.sales_price, // 1200
            variant_addon: 560, // Brand: Odoo variant
            tax_pct: 10,
          },
          {
            product: supportProduct._id,
            product_name: supportProduct.name,
            quantity: 1,
            unit_price: supportProduct.sales_price, // 450
            variant_addon: 250, // 24x7
            tax_pct: 10,
          },
        ],
        discount: {
          code: 'HACKATHON20',
          discount_type: 'percentage',
          value: 20,
        },
        total_amount: 2315.20,
      },
      {
        subscription_number: 'SUB-2026-0002',
        customer: nexusCustomer._id,
        plan: yearlyPlan._id,
        status: 'Active',
        start_date: new Date(2026, 1, 1),
        next_billing_date: nextYear,
        items: [
          {
            product: erpProduct._id,
            product_name: erpProduct.name,
            quantity: 2,
            unit_price: erpProduct.sales_price,
            variant_addon: 850, // Enterprise Plus
            tax_pct: 12,
          },
        ],
        total_amount: 6582.40,
      },
      {
        subscription_number: 'SUB-2026-0003',
        customer: starlightCustomer._id,
        plan: monthlyPlan._id,
        status: 'Quotation',
        start_date: null,
        next_billing_date: nextMonth,
        items: [
          {
            product: aiModuleProduct._id,
            product_name: aiModuleProduct.name,
            quantity: 1,
            unit_price: aiModuleProduct.sales_price,
            variant_addon: 150,
            tax_pct: 8,
          },
        ],
        total_amount: 706.60,
      },
      {
        subscription_number: 'SUB-2026-0004',
        customer: acmeCustomer._id,
        plan: monthlyPlan._id,
        status: 'Confirmed',
        start_date: new Date(2026, 2, 1),
        next_billing_date: nextMonth,
        items: [
          {
            product: supportProduct._id,
            product_name: supportProduct.name,
            quantity: 1,
            unit_price: supportProduct.sales_price,
            variant_addon: 0,
            tax_pct: 10,
          },
        ],
        total_amount: 694.00,
      },
      {
        subscription_number: 'SUB-2026-0005',
        customer: nexusCustomer._id,
        plan: weeklyPlan._id,
        status: 'Closed',
        start_date: new Date(2025, 10, 1),
        expiry_date: new Date(2026, 0, 1),
        items: [
          {
            product: aiModuleProduct._id,
            product_name: aiModuleProduct.name,
            quantity: 1,
            unit_price: aiModuleProduct.sales_price,
            variant_addon: 0,
            tax_pct: 5,
          },
        ],
        total_amount: 401.00,
      },
    ];

    const createdSubscriptions = await Subscription.create(subscriptionsToCreate);
    console.log(`[Seed] Created ${createdSubscriptions.length} subscriptions.`);

    // 8. Seed Invoices
    console.log('[Seed] Creating sample invoices...');
    const pastDueDate = new Date();
    pastDueDate.setDate(pastDueDate.getDate() - 5);

    const futureDueDate = new Date();
    futureDueDate.setDate(futureDueDate.getDate() + 10);

    const invoicesToCreate = [
      {
        invoice_number: 'INV-2026-0001',
        subscription: createdSubscriptions[0]._id,
        customer: acmeCustomer._id,
        due_date: new Date(2026, 1, 1),
        items: [
          {
            product: erpProduct._id,
            product_name: 'Enterprise ERP Cloud Engine (Brand: Odoo)',
            quantity: 1,
            unit_price: 1200,
            variant_addon: 560,
            tax_pct: 10,
            total: 1936,
          },
          {
            product: supportProduct._id,
            product_name: 'Dedicated Cloud DevOps & SLA Support (Critical 24x7)',
            quantity: 1,
            unit_price: 450,
            variant_addon: 250,
            tax_pct: 10,
            total: 770,
          },
        ],
        subtotal: 2460,
        tax_amount: 246,
        total_amount: 2706,
        status: 'Paid',
      },
      {
        invoice_number: 'INV-2026-0002',
        subscription: createdSubscriptions[1]._id,
        customer: nexusCustomer._id,
        due_date: futureDueDate,
        items: [
          {
            product: erpProduct._id,
            product_name: 'Enterprise ERP Cloud Engine (Enterprise Plus)',
            quantity: 2,
            unit_price: 1200,
            variant_addon: 850,
            tax_pct: 12,
            total: 4592,
          },
        ],
        subtotal: 4100,
        tax_amount: 492,
        total_amount: 4592,
        status: 'Confirmed',
      },
      {
        invoice_number: 'INV-2026-0003',
        subscription: createdSubscriptions[3]._id,
        customer: acmeCustomer._id,
        due_date: pastDueDate,
        items: [
          {
            product: supportProduct._id,
            product_name: 'Dedicated Cloud DevOps & SLA Support (Standard 8x5)',
            quantity: 1,
            unit_price: 450,
            variant_addon: 0,
            tax_pct: 10,
            total: 495,
          },
        ],
        subtotal: 450,
        tax_amount: 45,
        total_amount: 495,
        status: 'Overdue',
      },
    ];

    const createdInvoices = await Invoice.create(invoicesToCreate);
    console.log(`[Seed] Created ${createdInvoices.length} invoices.`);

    // 9. Seed Payments
    console.log('[Seed] Creating sample payments...');
    const paymentsToCreate = [
      {
        invoice: createdInvoices[0]._id,
        amount: 2706,
        payment_method: 'Bank Transfer',
        notes: 'Wire transfer ref #WT-8942001 received and confirmed.',
        payment_date: new Date(2026, 1, 2),
      },
    ];

    const createdPayments = await Payment.create(paymentsToCreate);
    console.log(`[Seed] Created ${createdPayments.length} payments.`);

    console.log('====================================================');
    console.log('✅ Database seeding with complete dataset succeeded!');
    console.log('====================================================');
    console.log('Seed Credentials:');
    console.log('  Admin:    admin@brightloop.com  / Admin#1234');
    console.log('  Staff:    staff@brightloop.com  / Staff#1234');
    console.log('  Customer: client@business.com   / Client#1234');
    console.log('====================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    if (mongoose.connection) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedData();
