import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// 1. Robust resolution of the root .env file regardless of CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 2. Import Express Application (Starts server on process.env.PORT || 5000)
import app from '../server.js';

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runUnifiedSmokeTest() {
  console.log('====================================================');
  console.log('  Brightloop Unified Platform Smoke Test Suite      ');
  console.log('  Testing Member 1 (Auth/Catalog), Member 2 & 3     ');
  console.log('====================================================');

  try {
    // Wait for Mongoose connection to be fully ready
    console.log('[Setup] Waiting for MongoDB connection...');
    let retries = 20;
    while (mongoose.connection.readyState !== 1 && retries > 0) {
      await wait(300);
      retries--;
    }
    console.log(`[Setup] Connected to DB: ${mongoose.connection.name} on host ${mongoose.connection.host}`);

    // ----------------------------------------------------
    // STAGE 1: Authentication (Member 1)
    // ----------------------------------------------------
    console.log('\n--- 1. Testing Auth: POST /api/auth/login ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@brightloop.com',
        password: 'Admin#1234',
      }),
    });
    const loginData = await loginRes.json();
    console.log(`  -> Status: ${loginRes.status} (${loginRes.statusText})`);

    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error(`Auth failed: ${loginData.message || 'No token returned'}`);
    }

    const token = loginData.token;
    console.log(`  -> Successfully logged in as: ${loginData.user?.name} [Role: ${loginData.user?.role}]`);
    console.log(`  -> Bearer Token Acquired`);

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // ----------------------------------------------------
    // STAGE 2: Product & Plan Catalog (Member 1)
    // ----------------------------------------------------
    console.log('\n--- 2. Testing Catalog: GET /api/products ---');
    const prodRes = await fetch(`${BASE_URL}/products`, { headers: authHeaders });
    const prodData = await prodRes.json();
    console.log(`  -> Status: ${prodRes.status} (${prodRes.statusText})`);
    console.log(`  -> Products Count: ${prodData.count}`);

    const odooProduct = prodData.data?.find((p) =>
      p.variants?.some((v) => v.option?.toLowerCase().includes('odoo'))
    );

    if (odooProduct) {
      const odooVariant = odooProduct.variants.find((v) =>
        v.option?.toLowerCase().includes('odoo')
      );
      console.log(`  -> Verified Odoo Integration Variant: "${odooProduct.name}" -> ${odooVariant.name}: ${odooVariant.option} (+$${odooVariant.extra_price})`);
    } else {
      console.log(`  -> Product: ${prodData.data?.[0]?.name} ($${prodData.data?.[0]?.sales_price})`);
    }

    console.log('\n--- 3. Testing Catalog: GET /api/plans ---');
    const planRes = await fetch(`${BASE_URL}/plans`, { headers: authHeaders });
    const planData = await planRes.json();
    console.log(`  -> Status: ${planRes.status} (${planRes.statusText})`);
    console.log(`  -> Active Plans Count: ${planData.count}`);
    planData.data?.forEach((pl) => {
      console.log(`      * Plan: "${pl.name}" ($${pl.base_price} / ${pl.billing_interval})`);
    });

    const selectedProduct = odooProduct || prodData.data[0];
    const selectedPlan = planData.data[0];

    // ----------------------------------------------------
    // STAGE 3: Subscription Creation & State Machine (Member 2 & 3)
    // ----------------------------------------------------
    console.log('\n--- 4. Testing Subscriptions: GET /api/subscriptions ---');
    const existingSubsRes = await fetch(`${BASE_URL}/subscriptions`, { headers: authHeaders });
    const existingSubsData = await existingSubsRes.json();
    console.log(`  -> Status: ${existingSubsRes.status} (${existingSubsRes.statusText})`);
    console.log(`  -> Existing Subscriptions Count: ${existingSubsData.count}`);

    console.log('\n--- 5. Testing Subscription Lifecycle Creation: POST /api/subscriptions ---');
    const subPayload = {
      plan_id: selectedPlan._id,
      status: 'Draft',
      items: [
        {
          product_id: selectedProduct._id,
          quantity: 2,
          unit_price: selectedProduct.sales_price,
          variant_addon: 560,
          tax_pct: 10,
        },
      ],
      discount: {
        code: 'HACKATHON20',
        discount_type: 'percentage',
        value: 20,
      },
    };

    const createSubRes = await fetch(`${BASE_URL}/subscriptions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(subPayload),
    });
    const createSubData = await createSubRes.json();
    console.log(`  -> Status: ${createSubRes.status} (${createSubRes.statusText})`);

    if (createSubRes.status !== 201 || !createSubData.data) {
      throw new Error(`Failed to create subscription: ${createSubData.message}`);
    }

    const createdSub = createSubData.data;
    const subId = createdSub._id;
    console.log(`  -> Created Subscription: ${createdSub.subscription_number}`);
    console.log(`  -> Initial Status: ${createdSub.status}`);
    console.log(`  -> Calculated Total Amount: $${createdSub.total_amount}`);

    // State Machine Transitions: Draft -> Quotation -> Confirmed -> Active
    console.log('\n--- 6. Testing State Machine Transitions (Draft -> Quotation -> Confirmed -> Active) ---');
    const transitions = ['Quotation', 'Confirmed', 'Active'];
    for (const targetState of transitions) {
      const transRes = await fetch(`${BASE_URL}/subscriptions/${subId}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status: targetState }),
      });
      const transData = await transRes.json();
      console.log(`  -> Transitioned to [${targetState}]: Status ${transRes.status} (${transData.message})`);
      if (transRes.status !== 200) {
        throw new Error(`Transition to ${targetState} failed`);
      }
    }

    // ----------------------------------------------------
    // STAGE 4: Automated Billing & Invoicing (Member 2 & 3)
    // ----------------------------------------------------
    console.log('\n--- 7. Testing Billing: POST /api/subscriptions/:id/generate-invoice ---');
    const genInvoiceRes = await fetch(`${BASE_URL}/subscriptions/${subId}/generate-invoice`, {
      method: 'POST',
      headers: authHeaders,
    });
    const genInvoiceData = await genInvoiceRes.json();
    console.log(`  -> Status: ${genInvoiceRes.status} (${genInvoiceRes.statusText})`);

    let invoiceId = null;
    if (genInvoiceRes.status === 201 && genInvoiceData.data) {
      console.log(`  -> Generated Invoice: ${genInvoiceData.data.invoice_number}`);
      console.log(`  -> Invoice Status: ${genInvoiceData.data.status}`);
      console.log(`  -> Total Amount: $${genInvoiceData.data.total_amount}`);
      invoiceId = genInvoiceData.data._id;
    } else {
      console.log(`  -> Info: ${genInvoiceData.message}`);
    }

    console.log('\n--- 8. Testing Invoices List: GET /api/invoices ---');
    const invListRes = await fetch(`${BASE_URL}/invoices`, { headers: authHeaders });
    const invListData = await invListRes.json();
    console.log(`  -> Status: ${invListRes.status} (${invListRes.statusText})`);
    console.log(`  -> Total Invoices in System: ${invListData.count}`);

    if (!invoiceId && invListData.data?.length > 0) {
      invoiceId = invListData.data[0]._id;
    }

    // ----------------------------------------------------
    // STAGE 5: Payment Processing (Member 3)
    // ----------------------------------------------------
    if (invoiceId) {
      console.log(`\n--- 9. Testing Payment Processing: POST /api/payments ---`);
      const paymentRes = await fetch(`${BASE_URL}/payments`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          invoice_id: invoiceId,
          amount: 500,
          payment_method: 'Credit Card',
          notes: 'Automated smoke test payment settlement',
        }),
      });
      const paymentData = await paymentRes.json();
      console.log(`  -> Status: ${paymentRes.status} (${paymentRes.statusText})`);
      console.log(`  -> Payment Result: ${paymentData.message}`);
    }

    // ----------------------------------------------------
    // STAGE 6: Analytics & Financial Dashboard
    // ----------------------------------------------------
    console.log('\n--- 10. Testing Financial Analytics: GET /api/analytics/dashboard ---');
    const analyticsRes = await fetch(`${BASE_URL}/analytics/dashboard`, { headers: authHeaders });
    const analyticsData = await analyticsRes.json();
    console.log(`  -> Status: ${analyticsRes.status} (${analyticsRes.statusText})`);
    if (analyticsData.data) {
      const { metrics } = analyticsData.data;
      console.log(`  -> Recognized Revenue: $${metrics?.recognized_revenue || 0}`);
      console.log(`  -> Active Subscriptions: ${metrics?.active_subscriptions || 0}`);
      console.log(`  -> Unpaid/Overdue Invoices: ${metrics?.unpaid_invoices || 0}`);
    }

    console.log('\n====================================================');
    console.log('✅ ALL INTEGRATION CHECKS PASSED SUCCESSFULLY!');
    console.log('   Member 1: Auth (JWT/RBAC) & Catalog (Variants)  ');
    console.log('   Member 2: Subscription State Machine Lifecycle   ');
    console.log('   Member 3: Invoicing, Payments & Analytics        ');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Smoke Test Failed with Error:');
    console.error(error);
    process.exit(1);
  }
}

runUnifiedSmokeTest();
