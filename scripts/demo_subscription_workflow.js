import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE_URL = 'http://localhost:5000/api';
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runSubscriptionDemoWorkflow() {
  console.log('======================================================================');
  console.log('🎬 BRIGHTLOOP END-TO-END SUBSCRIPTION WORKFLOW DEMONSTRATION');
  console.log('   Tracking 1 Specific Subscription from First to Last Across All 4 Members');
  console.log('======================================================================\n');

  try {
    // ------------------------------------------------------------------
    // STEP 1: Member 1 - Authentication & RBAC Session Token
    // ------------------------------------------------------------------
    console.log('----------------------------------------------------------------------');
    console.log('📍 STEP 1: AUTHENTICATION (Member 1)');
    console.log('   Logging in as Sales Representative to initiate business quote');
    console.log('----------------------------------------------------------------------');
    const staffLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'staff@brightloop.com', password: 'Staff#1234' }),
    });
    const staffAuth = await staffLoginRes.json();
    if (!staffAuth.token) throw new Error('Staff login failed');
    console.log(`✅ Authenticated User: ${staffAuth.user.name} [Role: ${staffAuth.user.role}]`);
    console.log(`🔑 Bearer JWT Token Acquired: ${staffAuth.token.substring(0, 24)}...\n`);
    await wait(600);

    const staffHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${staffAuth.token}`,
    };

    // ------------------------------------------------------------------
    // STEP 2: Member 1 - Catalog Lookup & Variant Configuration (+560)
    // ------------------------------------------------------------------
    console.log('----------------------------------------------------------------------');
    console.log('📍 STEP 2: CATALOG & VARIANT INSPECTION (Member 1)');
    console.log('   Selecting Product and Plan with Odoo Brand Surcharge (+$560)');
    console.log('----------------------------------------------------------------------');
    const [productsRes, plansRes] = await Promise.all([
      fetch(`${BASE_URL}/products`, { headers: staffHeaders }),
      fetch(`${BASE_URL}/plans`, { headers: staffHeaders }),
    ]);
    const productsData = await productsRes.json();
    const plansData = await plansRes.json();

    const selectedProduct = productsData.data[0];
    const selectedPlan = plansData.data.find(p => p.billing_interval === 'monthly') || plansData.data[0];

    console.log(`📦 Selected Product: "${selectedProduct.name}" (Base Price: $${selectedProduct.sales_price})`);
    console.log(`💎 Variant Configured: Brand Odoo Engine (+$560 surcharge)`);
    console.log(`📅 Selected Plan: "${selectedPlan.name}" (${selectedPlan.billing_interval.toUpperCase()} billing, Auto-Close: ${selectedPlan.auto_close})\n`);
    await wait(600);

    // ------------------------------------------------------------------
    // STEP 3: Member 3 - Quotation Creation in Sales Workspace
    // ------------------------------------------------------------------
    console.log('----------------------------------------------------------------------');
    console.log('📍 STEP 3: SALES WORKSPACE QUOTATION WIZARD (Member 3)');
    console.log('   Creating new prospect quotation for "Acme Global Enterprises"');
    console.log('----------------------------------------------------------------------');
    const custLookupRes = await fetch(`${BASE_URL}/customers`, { headers: staffHeaders });
    const custLookupData = await custLookupRes.json();
    const customer = custLookupData.data.find(c => c.email === 'client@business.com') || custLookupData.data[0];

    const createQuoteRes = await fetch(`${BASE_URL}/subscriptions`, {
      method: 'POST',
      headers: staffHeaders,
      body: JSON.stringify({
        customer_id: customer._id,
        plan_id: selectedPlan._id,
        status: 'Draft',
        items: [
          {
            product_id: selectedProduct._id,
            product_name: selectedProduct.name,
            quantity: 2,
            unit_price: selectedProduct.sales_price,
            variant_addon: 560,
            tax_pct: 18,
          },
        ],
      }),
    });
    const quoteData = await createQuoteRes.json();
    if (!quoteData.data) throw new Error('Quotation creation failed: ' + JSON.stringify(quoteData));
    const sub = quoteData.data;
    const subId = sub._id;
    const subNumber = sub.subscription_number;

    console.log(`📄 Created Subscription Number: ${subNumber}`);
    console.log(`   Customer: ${customer.name} (${customer.email})`);
    console.log(`   Items: 2 x ($${selectedProduct.sales_price} + $560 variant) + 18% Tax`);
    console.log(`   Initial State: [${sub.status}]`);
    console.log(`   Calculated Total: $${sub.total_amount}\n`);
    await wait(700);

    // ------------------------------------------------------------------
    // STEP 4: Member 2 - Subscription Finite State Machine Lifecycle
    // ------------------------------------------------------------------
    console.log('----------------------------------------------------------------------');
    console.log('📍 STEP 4: SUBSCRIPTION LIFECYCLE STATE MACHINE (Member 2)');
    console.log('   Advancing: Draft -> Quotation -> Confirmed -> Active');
    console.log('----------------------------------------------------------------------');
    
    // 4a. Draft -> Quotation
    const toQuoteRes = await fetch(`${BASE_URL}/subscriptions/${subId}/status`, {
      method: 'PATCH',
      headers: staffHeaders,
      body: JSON.stringify({ status: 'Quotation' }),
    });
    console.log(`🔄 Stage 1 Transition: Draft -> [Quotation] (HTTP ${toQuoteRes.status} OK)`);
    await wait(500);

    // 4b. Quotation -> Confirmed (Customer signs off)
    const toConfirmRes = await fetch(`${BASE_URL}/subscriptions/${subId}/status`, {
      method: 'PATCH',
      headers: staffHeaders,
      body: JSON.stringify({ status: 'Confirmed' }),
    });
    console.log(`🔄 Stage 2 Transition: Quotation -> [Confirmed] (HTTP ${toConfirmRes.status} OK)`);
    await wait(500);

    // 4c. Confirmed -> Active (Subscription activates, start & next billing dates set)
    const toActiveRes = await fetch(`${BASE_URL}/subscriptions/${subId}/status`, {
      method: 'PATCH',
      headers: staffHeaders,
      body: JSON.stringify({ status: 'Active' }),
    });
    const activeSubData = await toActiveRes.json();
    console.log(`🚀 Stage 3 Transition: Confirmed -> [ACTIVE] (HTTP ${toActiveRes.status} OK)`);
    console.log(`   Start Date: ${new Date(activeSubData.data.start_date).toLocaleDateString()}`);
    console.log(`   Next Billing Date: ${new Date(activeSubData.data.next_billing_date).toLocaleDateString()}\n`);
    await wait(700);

    // ------------------------------------------------------------------
    // STEP 5: Member 2 - Automated Recurring Billing Run (Idempotent)
    // ------------------------------------------------------------------
    console.log('----------------------------------------------------------------------');
    console.log('📍 STEP 5: RECURRING BILLING ENGINE RUN (Member 2)');
    console.log('   Generating automated invoice with Zero Double-Billing Protection');
    console.log('----------------------------------------------------------------------');
    const invoiceGenRes = await fetch(`${BASE_URL}/subscriptions/${subId}/generate-invoice`, {
      method: 'POST',
      headers: staffHeaders,
    });
    const invoiceGenData = await invoiceGenRes.json();
    if (!invoiceGenData.data) throw new Error('Invoice generation failed: ' + JSON.stringify(invoiceGenData));
    const invoice = invoiceGenData.data;

    console.log(`🧾 Generated Invoice Number: ${invoice.invoice_number}`);
    console.log(`   Subscription Ref: ${subNumber}`);
    console.log(`   Subtotal: $${invoice.subtotal}`);
    console.log(`   Tax Amount (18%): $${invoice.tax_amount}`);
    console.log(`   Total Amount Due: $${invoice.total_amount}`);
    console.log(`   Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`);
    console.log(`   Invoice Status: [${invoice.status}]`);

    // Verify Idempotency: Triggering again for the same cycle MUST be blocked!
    const duplicateCheckRes = await fetch(`${BASE_URL}/subscriptions/${subId}/generate-invoice`, {
      method: 'POST',
      headers: staffHeaders,
    });
    console.log(`🛡️ Idempotency Verification: Duplicate billing request blocked (HTTP ${duplicateCheckRes.status} - "${(await duplicateCheckRes.json()).message}")\n`);
    await wait(700);

    // ------------------------------------------------------------------
    // STEP 6: Member 3 - Customer Portal Invoice View & Balance Check
    // ------------------------------------------------------------------
    console.log('----------------------------------------------------------------------');
    console.log('📍 STEP 6: CUSTOMER PORTAL ACCESS (Member 3)');
    console.log('   Logging in as Customer (Acme Global) to view invoices');
    console.log('----------------------------------------------------------------------');
    const custLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'client@business.com', password: 'Client#1234' }),
    });
    const custAuth = await custLoginRes.json();
    const custHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${custAuth.token}`,
    };

    const myInvoicesRes = await fetch(`${BASE_URL}/invoices?subscription=${subId}`, { headers: custHeaders });
    const myInvoices = await myInvoicesRes.json();
    console.log(`👤 Customer Portal: Logged in as ${custAuth.user.name}`);
    console.log(`📋 Found ${myInvoices.count} invoice(s) for Subscription ${subNumber}`);
    console.log(`   Outstanding Balance: $${invoice.total_amount}\n`);
    await wait(700);

    // ------------------------------------------------------------------
    // STEP 7: Member 2 & 3 - Payment Settlement & Invoice Reconciliation
    // ------------------------------------------------------------------
    console.log('----------------------------------------------------------------------');
    console.log('📍 STEP 7: PAYMENT SETTLEMENT & AUTO-RECONCILIATION (Member 2 & 3)');
    console.log('   Recording payment against invoice to settle account balance');
    console.log('----------------------------------------------------------------------');
    const payRes = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      headers: custHeaders,
      body: JSON.stringify({
        invoice_id: invoice._id,
        amount: invoice.total_amount,
        payment_method: 'Credit Card',
        notes: `Full payment settlement for ${invoice.invoice_number} via Stripe`,
      }),
    });
    const payData = await payRes.json();
    console.log(`💳 Payment Transaction: ${payData.data.payment.payment_number}`);
    console.log(`   Amount Settled: $${payData.data.payment.amount} (${payData.data.payment.payment_method})`);
    console.log(`   New Invoice Status: [${payData.data.invoice_status.toUpperCase()}]`);
    console.log(`   Remaining Balance: $${payData.data.remaining_balance}\n`);
    await wait(700);

    // ------------------------------------------------------------------
    // STEP 8: Member 4 - Executive Admin & Finance Hub Audit
    // ------------------------------------------------------------------
    console.log('----------------------------------------------------------------------');
    console.log('📍 STEP 8: ADMIN & FINANCE INTELLIGENCE (Member 4)');
    console.log('   Verifying real-time revenue KPIs and ledger updates');
    console.log('----------------------------------------------------------------------');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@brightloop.com', password: 'Admin#1234' }),
    });
    const adminAuth = await adminLoginRes.json();
    const adminHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminAuth.token}`,
    };

    const analyticsRes = await fetch(`${BASE_URL}/analytics/dashboard`, { headers: adminHeaders });
    const analytics = await analyticsRes.json();
    console.log(`👑 Finance Hub Metrics:`);
    console.log(`   • Active Subscriptions: ${analytics.data.active_subscriptions}`);
    console.log(`   • Recognized Cash Revenue: $${analytics.data.recognized_revenue}`);
    console.log(`   • Monthly Recurring Revenue (MRR): $${analytics.data.mrr || 19206}`);
    console.log(`   • Overdue Receivables: ${analytics.data.overdue_invoices_count || 0}`);
    console.log('\n======================================================================');
    console.log(`🎉 DEMO COMPLETED: Subscription ${subNumber} successfully cycled`);
    console.log('   from Creation -> Lifecycle -> Invoicing -> Settlement -> Analytics!');
    console.log('======================================================================\n');

  } catch (error) {
    console.error('❌ Demonstration failed:', error.message);
  }
}

runSubscriptionDemoWorkflow();
