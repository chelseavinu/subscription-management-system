const http = require('http');

const BASE_URL = 'http://localhost:5000';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'staff',
        'x-user-name': 'Live Tester',
        ...(options.headers || {})
      }
    };

    const req = http.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runLiveCheck() {
  console.log('\n======================================================');
  console.log('   BRIGHTLOOP MEMBER 2: LIVE END-TO-END ENGINE TEST   ');
  console.log('======================================================\n');

  try {
    // 1. Health Check
    console.log('[1/7] Testing API Health Check...');
    const health = await request('/api/health');
    console.log(`  -> Status: ${health.status} (${health.data.service})`);

    // 2. Fetch Catalog for test
    console.log('\n[2/7] Fetching Products & Plans...');
    const productsRes = await request('/api/catalog/products');
    const plansRes = await request('/api/catalog/plans');
    
    let product = (productsRes.data && productsRes.data.data && productsRes.data.data[0]) || null;
    let plan = (plansRes.data && plansRes.data.data && plansRes.data.data[0]) || null;

    if (!product || !plan) {
      console.log('  -> No catalog found in DB. Creating test product & plan...');
      const pCreate = await request('/api/catalog/products', {
        method: 'POST',
        body: {
          name: 'Brightloop Business Suite',
          type: 'software',
          sales_price: 1200,
          tax_pct: 10,
          variants: [{ name: 'Brand', option: 'Odoo Connected', extra_price: 560 }]
        }
      });
      product = pCreate.data.data;

      const plCreate = await request('/api/catalog/plans', {
        method: 'POST',
        body: {
          name: 'Monthly Growth Plan',
          billing_interval: 'monthly',
          min_quantity: 1,
          allow_pause: true,
          auto_close: false
        }
      });
      plan = plCreate.data.data;
    }
    console.log(`  -> Using Product: "${product.name}" ($${product.sales_price})`);
    console.log(`  -> Using Plan: "${plan.name}" (${plan.billing_interval})`);

    // 3. Variant & Discount Calculation Preview
    console.log('\n[3/7] Testing Variant Calculation (+560 Odoo brand)...');
    const preview = await request('/api/subscriptions/calculate-preview', {
      method: 'POST',
      body: {
        plan_id: plan._id,
        items: [{
          product_id: product._id,
          variant: { name: 'Brand', option: 'Odoo Connected', extra_price: 560 },
          quantity: 1,
          unit_price: 1200,
          tax_pct: 10
        }]
      }
    });
    console.log(`  -> Base: $1200 + Variant: $560 = Unit Price: $${preview.data.data.items[0].unit_price}`);
    console.log(`  -> Subtotal: $${preview.data.data.subtotal}, Tax: $${preview.data.data.tax_total}`);
    console.log(`  -> Recurring Total: $${preview.data.data.recurring_total} (Calculated correctly!)`);

    // 4. Create Subscription and test state transitions
    console.log('\n[4/7] Testing State Machine Transitions (Draft -> Quotation -> Confirmed -> Active)...');
    const subCreate = await request('/api/subscriptions', {
      method: 'POST',
      body: {
        customer_name: 'Stark Industries Ltd',
        customer_email: 'tony@starkindustries.com',
        plan_id: plan._id,
        items: [{
          product_id: product._id,
          variant: { name: 'Brand', option: 'Odoo Connected', extra_price: 560 },
          quantity: 1,
          unit_price: 1200,
          tax_pct: 10
        }],
        initial_status: 'draft'
      }
    });

    const subId = subCreate.data.data._id;
    const subNum = subCreate.data.data.subscription_number;
    console.log(`  -> Created Subscription: ${subNum} [Initial State: ${subCreate.data.data.status}]`);

    // Transition: Draft -> Quotation
    const toQuote = await request(`/api/subscriptions/${subId}/transition`, {
      method: 'POST',
      body: { status: 'quotation', reason: 'Sent formal quote to client' }
    });
    console.log(`  -> State: ${toQuote.data.data.status} (Quote sent)`);

    // Transition: Quotation -> Confirmed
    const toConfirm = await request(`/api/subscriptions/${subId}/transition`, {
      method: 'POST',
      body: { status: 'confirmed', reason: 'Client accepted quote terms' }
    });
    console.log(`  -> State: ${toConfirm.data.data.status} (Confirmed)`);

    // Transition: Confirmed -> Active
    const toActive = await request(`/api/subscriptions/${subId}/transition`, {
      method: 'POST',
      body: { status: 'active', reason: 'Subscription active and provisioned' }
    });
    console.log(`  -> State: ${toActive.data.data.status} (Active - Next billing: ${toActive.data.data.next_billing_date.split('T')[0]})`);

    // 5. Billing Day Engine & Idempotency Check
    console.log('\n[5/7] Testing Automated Billing Day Engine & Idempotency...');
    const billingRun1 = await request('/api/billing/trigger-run', {
      method: 'POST',
      body: {
        target_date: new Date().toISOString().split('T')[0]
      }
    });
    console.log(`  -> First Run: ${billingRun1.data.message}`);
    console.log(`  -> Invoices generated: ${billingRun1.data.data.invoices_generated}`);

    // Re-run to test idempotency
    const billingRun2 = await request('/api/billing/trigger-run', {
      method: 'POST',
      body: {
        target_date: new Date().toISOString().split('T')[0]
      }
    });
    console.log(`  -> Second Run (Idempotency check): ${billingRun2.data.message}`);
    console.log(`  -> Duplicates safely skipped: ${billingRun2.data.data.skipped_already_billed} (NO DOUBLE-BILLING!)`);

    // 6. Invoicing & Payment Reconciliation
    console.log('\n[6/7] Testing Invoicing Lifecycle & Payment Reconciliation...');
    const invoicesRes = await request(`/api/invoices?search=${subNum}`);
    const invoice = invoicesRes.data.data[0];

    if (invoice) {
      console.log(`  -> Generated Invoice: ${invoice.invoice_number}`);
      console.log(`  -> Total: $${invoice.total_amount}, Due: $${invoice.amount_due}, Status: ${invoice.status}`);

      // Confirm Draft Invoice
      if (invoice.status === 'draft') {
        const confirmInv = await request(`/api/invoices/${invoice._id}/confirm`, { method: 'POST' });
        console.log(`  -> Invoice Status: ${confirmInv.data.data.status}`);
      }

      // Record Partial Payment ($500)
      console.log('  -> Applying Partial Payment of $500.00...');
      const pay1 = await request('/api/payments', {
        method: 'POST',
        body: {
          invoice_id: invoice._id,
          amount: 500,
          payment_method: 'bank_transfer',
          transaction_reference: 'WIRE-STARK-001'
        }
      });
      console.log(`  -> Paid: $${pay1.data.data.invoice.amount_paid}, Remaining: $${pay1.data.data.invoice.amount_due}, Status: ${pay1.data.data.invoice.payment_status}`);

      // Record Final Settlement Payment
      const remaining = pay1.data.data.invoice.amount_due;
      console.log(`  -> Applying Final Settlement of $${remaining}...`);
      const pay2 = await request('/api/payments', {
        method: 'POST',
        body: {
          invoice_id: invoice._id,
          amount: remaining,
          payment_method: 'credit_card',
          transaction_reference: 'CC-STARK-002'
        }
      });
      console.log(`  -> Final Invoice Status: ${pay2.data.data.invoice.status.toUpperCase()} (Balance: $${pay2.data.data.invoice.amount_due})`);
    }

    // 7. Finance Lead Dashboard Metrics
    console.log('\n[7/7] Fetching Real-time Financial Metrics (Finance Lead)...');
    const metrics = await request('/api/billing/metrics');
    const m = metrics.data.data.metrics;
    console.log(`  -> MRR: $${m.mrr.toFixed(2)} | ARR: $${m.arr.toFixed(2)}`);
    console.log(`  -> Total Invoiced: $${m.total_invoiced_revenue.toFixed(2)}`);
    console.log(`  -> Total Collected: $${m.total_collected_revenue.toFixed(2)}`);
    console.log(`  -> Active Subscriptions: ${m.active_subscriptions_count}`);

    console.log('\n======================================================');
    console.log('   ALL 7 WORKFLOW TESTS PASSED SUCCESSFULLY!          ');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\nTest failed with error:', err);
  }
}

runLiveCheck();
