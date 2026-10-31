const mongoose = require('mongoose');
const dns = require('dns');
const dotenv = require('dotenv');
const path = require('path');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Product = require('../models/Product');
const Plan = require('../models/Plan');
const Discount = require('../models/Discount');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Counter = require('../models/Counter');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/brightloop_subscriptions';

async function seedDatabase() {
  try {
    console.log(`Connecting to database at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI, { dbName: 'brightloop_subscriptions' });
    console.log('Connected! Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Plan.deleteMany({}),
      Discount.deleteMany({}),
      Subscription.deleteMany({}),
      Invoice.deleteMany({}),
      Payment.deleteMany({}),
      Counter.deleteMany({})
    ]);

    console.log('1. Creating Users & Roles...');
    const adminUser = await User.create({
      name: 'Sarah Connor (Admin)',
      email: 'admin@brightloop.io',
      password_hash: 'Password123!',
      role: 'admin',
      company: 'Brightloop Software'
    });

    const staffUser = await User.create({
      name: 'David Miller (Sales Rep)',
      email: 'sales@brightloop.io',
      password_hash: 'Password123!',
      role: 'staff',
      company: 'Brightloop Software'
    });

    const customer1 = await User.create({
      name: 'Acme Retail Solutions',
      email: 'contact@acmeretail.com',
      password_hash: 'Customer123!',
      role: 'customer',
      company: 'Acme Retailers Ltd.',
      address: '742 Evergreen Terrace, Springfield',
      phone: '+1 555-0199'
    });

    const customer2 = await User.create({
      name: 'Nexus Global Tech',
      email: 'finance@nexusglobal.com',
      password_hash: 'Customer123!',
      role: 'customer',
      company: 'Nexus Global International',
      address: '500 Madison Ave, New York, NY',
      phone: '+1 212-555-0188'
    });

    console.log('2. Creating Products with Variants (e.g. Brand Odoo +560)...');
    const erpProduct = await Product.create({
      name: 'Brightloop Business ERP Suite',
      type: 'software',
      sales_price: 1200,
      cost_price: 350,
      tax_pct: 10,
      notes: 'Flagship business software with multi-brand integrations',
      variants: [
        { name: 'Brand', option: 'Standard Edition', extra_price: 0 },
        { name: 'Brand', option: 'Odoo Connected', extra_price: 560 },
        { name: 'Brand', option: 'SAP Gateway', extra_price: 850 }
      ]
    });

    const cloudBackup = await Product.create({
      name: 'Automated Daily Cloud Backup Add-on',
      type: 'addon',
      sales_price: 180,
      cost_price: 40,
      tax_pct: 10,
      notes: 'Off-site continuous encryption backup'
    });

    const prioritySupport = await Product.create({
      name: '24/7 Dedicated Account Executive Support',
      type: 'service',
      sales_price: 450,
      cost_price: 120,
      tax_pct: 10,
      notes: '1-hour SLA phone & Slack channel access'
    });

    console.log('3. Creating Subscription Plans...');
    const monthlyPlan = await Plan.create({
      name: 'Monthly Pro Growth',
      code: 'PLAN-M-PRO',
      description: 'Standard monthly subscription billed every 30 days',
      billing_interval: 'monthly',
      base_price: 0,
      min_quantity: 1,
      auto_close: false,
      allow_pause: true,
      allow_renew: true
    });

    const yearlyPlan = await Plan.create({
      name: 'Yearly Enterprise Volume',
      code: 'PLAN-Y-ENT',
      description: 'High-volume annual contract with minimum 2 units requirement',
      billing_interval: 'yearly',
      base_price: 0,
      min_quantity: 2,
      auto_close: true, // Closes on its own upon contract expiry
      allow_pause: true,
      allow_renew: true
    });

    const weeklyPlan = await Plan.create({
      name: 'Weekly Flexible Sprint',
      code: 'PLAN-W-SPRINT',
      description: 'Short-term recurring project billing',
      billing_interval: 'weekly',
      base_price: 0,
      min_quantity: 1,
      auto_close: false,
      allow_pause: false // Plan does not permit pausing
    });

    console.log('4. Creating Discounts & Rules...');
    await Discount.create([
      {
        code: 'LAUNCH20',
        description: '20% Launch Discount for early adopters (min 2 items)',
        type: 'percentage',
        value: 20,
        min_qty: 2,
        min_amount: 500,
        usage_limit: 100,
        times_used: 1
      },
      {
        code: 'SAVE100',
        description: 'Flat $100 off on subscriptions over $1000',
        type: 'fixed',
        value: 100,
        min_amount: 1000,
        usage_limit: 50,
        times_used: 2
      }
    ]);

    console.log('5. Creating Subscriptions across Lifecycle States...');
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    // Active subscription DUE TODAY for immediate Billing Run demonstration!
    const activeDueSub = await Subscription.create({
      subscription_number: 'SUB-2026-0001',
      customer_id: customer1._id,
      customer_name: customer1.name,
      customer_email: customer1.email,
      plan_id: monthlyPlan._id,
      plan_name: monthlyPlan.name,
      billing_interval: 'monthly',
      payment_terms: 'net_15',
      status: 'active',
      start_date: oneMonthAgo,
      expiry_date: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()),
      last_billed_date: oneMonthAgo,
      next_billing_date: today, // DUE TODAY!
      auto_close: false,
      allow_pause: true,
      items: [
        {
          product_id: erpProduct._id,
          product_name: erpProduct.name,
          variant: { name: 'Brand', option: 'Odoo Connected', extra_price: 560 },
          quantity: 1,
          unit_price: 1760, // 1200 + 560
          tax_pct: 10,
          tax_amount: 176,
          discount_amount: 0,
          line_total: 1936
        },
        {
          product_id: cloudBackup._id,
          product_name: cloudBackup.name,
          quantity: 1,
          unit_price: 180,
          tax_pct: 10,
          tax_amount: 18,
          discount_amount: 0,
          line_total: 198
        }
      ],
      subtotal: 1940,
      tax_total: 194,
      discount_total: 0,
      recurring_total: 2134,
      history: [
        { from_status: null, to_status: 'draft', changed_at: oneMonthAgo, reason: 'Initial quote' },
        { from_status: 'draft', to_status: 'confirmed', changed_at: oneMonthAgo, reason: 'Customer signed' },
        { from_status: 'confirmed', to_status: 'active', changed_at: oneMonthAgo, reason: 'Activated' }
      ]
    });

    // Quotation state (Scene: Sales Rep quote flow)
    const quoteSub = await Subscription.create({
      subscription_number: 'SUB-2026-0002',
      customer_id: customer2._id,
      customer_name: customer2.name,
      customer_email: customer2.email,
      plan_id: yearlyPlan._id,
      plan_name: yearlyPlan.name,
      billing_interval: 'yearly',
      payment_terms: 'net_30',
      status: 'quotation',
      start_date: today,
      expiry_date: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()),
      quotation_valid_until: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days validity
      items: [
        {
          product_id: erpProduct._id,
          product_name: erpProduct.name,
          variant: { name: 'Brand', option: 'Odoo Connected', extra_price: 560 },
          quantity: 2,
          unit_price: 1760,
          tax_pct: 10,
          tax_amount: 352,
          discount_amount: 0,
          line_total: 3872
        },
        {
          product_id: prioritySupport._id,
          product_name: prioritySupport.name,
          quantity: 1,
          unit_price: 450,
          tax_pct: 10,
          tax_amount: 45,
          discount_amount: 0,
          line_total: 495
        }
      ],
      subtotal: 3970,
      tax_total: 397,
      discount_total: 100,
      applied_discount_code: 'SAVE100',
      recurring_total: 4267,
      notes: 'Enterprise quote prepared by David Miller (Sales Rep)',
      history: [
        { from_status: null, to_status: 'draft', changed_at: today, reason: 'Template loaded' },
        { from_status: 'draft', to_status: 'quotation', changed_at: today, reason: 'Quote sent to Nexus Global' }
      ]
    });

    // Paused Subscription
    await Subscription.create({
      subscription_number: 'SUB-2026-0003',
      customer_id: customer1._id,
      customer_name: customer1.name,
      customer_email: customer1.email,
      plan_id: monthlyPlan._id,
      plan_name: monthlyPlan.name,
      billing_interval: 'monthly',
      payment_terms: 'net_15',
      status: 'paused',
      start_date: oneMonthAgo,
      last_billed_date: oneMonthAgo,
      next_billing_date: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000),
      items: [
        {
          product_id: cloudBackup._id,
          product_name: cloudBackup.name,
          quantity: 2,
          unit_price: 180,
          tax_pct: 10,
          tax_amount: 36,
          discount_amount: 0,
          line_total: 396
        }
      ],
      subtotal: 360,
      tax_total: 36,
      discount_total: 0,
      recurring_total: 396,
      history: [
        { from_status: 'active', to_status: 'paused', changed_at: today, reason: 'Customer requested pause for system upgrade' }
      ]
    });

    console.log('6. Initializing Sequence Counters...');
    await Counter.create([
      { key: `SUB_${today.getFullYear()}`, seq: 3 },
      { key: `INV_${today.getFullYear()}`, seq: 1 },
      { key: `PAY_${today.getFullYear()}`, seq: 1 }
    ]);

    // Initial paid invoice for historical demonstration
    const pastInvoice = await Invoice.create({
      invoice_number: 'INV-2026-0001',
      subscription_id: activeDueSub._id,
      subscription_number: activeDueSub.subscription_number,
      customer_id: customer1._id,
      customer_name: customer1.name,
      customer_email: customer1.email,
      customer_address: customer1.address,
      billing_period_start: oneMonthAgo,
      billing_period_end: today,
      issue_date: oneMonthAgo,
      due_date: new Date(oneMonthAgo.getTime() + 15 * 24 * 60 * 60 * 1000),
      status: 'paid',
      payment_status: 'paid',
      items: [
        {
          product_id: erpProduct._id,
          product_name: erpProduct.name,
          variant_info: 'Brand: Odoo Connected (+$560)',
          quantity: 1,
          unit_price: 1760,
          tax_pct: 10,
          tax_amount: 176,
          discount_amount: 0,
          line_total: 1936
        }
      ],
      subtotal: 1760,
      tax_amount: 176,
      discount_amount: 0,
      total_amount: 1936,
      amount_paid: 1936,
      amount_due: 0,
      sent_at: oneMonthAgo,
      history: [
        { from_status: 'draft', to_status: 'confirmed', changed_at: oneMonthAgo, action: 'Confirmed' },
        { from_status: 'confirmed', to_status: 'paid', changed_at: oneMonthAgo, action: 'Payment completed' }
      ]
    });

    await Payment.create({
      payment_number: 'PAY-2026-0001',
      invoice_id: pastInvoice._id,
      invoice_number: pastInvoice.invoice_number,
      customer_id: customer1._id,
      customer_name: customer1.name,
      amount: 1936,
      payment_method: 'bank_transfer',
      transaction_reference: 'WIRE-88992241',
      payment_date: oneMonthAgo,
      status: 'completed',
      notes: 'Matched from monthly bank statement reconciliation'
    });

    console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
    console.log(`Created: 4 Users, 3 Products, 3 Plans, 2 Discounts, 3 Subscriptions, 1 Invoice, 1 Payment.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
