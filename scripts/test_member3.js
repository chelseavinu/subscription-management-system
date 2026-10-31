import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('====================================================');
  console.log('🧪 RUNNING MEMBER 3 VERIFICATION TEST SUITE');
  console.log('====================================================');

  try {
    // ----------------------------------------------------
    // Test 1: Customer Registration & Role Safeguard
    // ----------------------------------------------------
    console.log('\n[Test 1] Testing Customer Registration & Privilege Safeguard...');
    
    // 1a: Attempt to elevate privileges as admin publicly -> Must be rejected with 403 Forbidden
    const unauthElevationRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hacker Attempt',
        email: `hacker_${Date.now()}@domain.com`,
        password: 'SecurePass#2026',
        role: 'admin',
      }),
    });
    assert.strictEqual(unauthElevationRes.status, 403, 'Public registration requesting admin must be rejected with 403');
    console.log('  -> Malicious privilege escalation to admin successfully blocked (403 Forbidden).');

    // 1b: Normal public customer registration -> 201 Created with role 'customer'
    const testEmail = `newcustomer_${Date.now()}@domain.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Test Client',
        email: testEmail,
        password: 'SecurePass#2026',
      }),
    });
    const regData = await regRes.json();
    assert.strictEqual(regRes.status, 201, 'Customer registration should return 201');
    assert.strictEqual(regData.user.role, 'customer', 'Public registration MUST enforce customer role');
    console.log(`✅ Customer registered successfully with role '${regData.user.role}'`);

    // ----------------------------------------------------
    // Test 2: Customer Login & Role Verification
    // ----------------------------------------------------
    console.log('\n[Test 2] Testing Customer Login (Acme Global)...');
    const custLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'client@business.com',
        password: 'Client#1234',
      }),
    });
    const custAuth = await custLoginRes.json();
    assert.strictEqual(custLoginRes.status, 200, 'Login should succeed');
    assert.strictEqual(custAuth.user.role, 'customer', 'User role must be customer');
    const custToken = custAuth.token;
    console.log(`✅ Customer authenticated. Token generated. Role: ${custAuth.user.role}`);

    // ----------------------------------------------------
    // Test 3: Customer Scoped Subscriptions
    // ----------------------------------------------------
    console.log('\n[Test 3] Testing Customer Subscriptions Isolation...');
    const custSubsRes = await fetch(`${BASE_URL}/subscriptions`, {
      headers: { Authorization: `Bearer ${custToken}` },
    });
    const custSubs = await custSubsRes.json();
    assert.strictEqual(custSubsRes.status, 200);
    custSubs.data.forEach((sub) => {
      assert.strictEqual(sub.customer._id.toString(), custAuth.user.id.toString());
    });
    console.log(`✅ Customer Subscriptions isolated: Found ${custSubs.data.length} subs, all belonging exclusively to ${custAuth.user.name}`);

    // ----------------------------------------------------
    // Test 4: Customer Scoped Invoices
    // ----------------------------------------------------
    console.log('\n[Test 4] Testing Customer Invoices Isolation...');
    const custInvsRes = await fetch(`${BASE_URL}/invoices`, {
      headers: { Authorization: `Bearer ${custToken}` },
    });
    const custInvs = await custInvsRes.json();
    assert.strictEqual(custInvsRes.status, 200);
    custInvs.data.forEach((inv) => {
      assert.strictEqual(inv.customer._id.toString(), custAuth.user.id.toString());
    });
    console.log(`✅ Customer Invoices isolated: Found ${custInvs.data.length} invoices, all belonging to ${custAuth.user.name}`);

    // ----------------------------------------------------
    // Test 5: Customer Security Check - Accessing foreign subscription
    // ----------------------------------------------------
    console.log('\n[Test 5] Testing Customer Cross-Tenant Access Protection...');
    // Login as Admin to get Nexus FinTech's subscription ID
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@brightloop.com', password: 'Admin#1234' }),
    });
    const adminAuth = await adminLoginRes.json();
    const allSubsRes = await fetch(`${BASE_URL}/subscriptions`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
    });
    const allSubs = await allSubsRes.json();
    const foreignSub = allSubs.data.find((s) => s.customer._id.toString() !== custAuth.user.id.toString());

    if (foreignSub) {
      const foreignAccessRes = await fetch(`${BASE_URL}/subscriptions/${foreignSub._id}`, {
        headers: { Authorization: `Bearer ${custToken}` },
      });
      assert.strictEqual(foreignAccessRes.status, 403, 'Cross-tenant access must return 403 Forbidden');
      console.log(`✅ Cross-tenant security verified: Customer was denied access (403 Forbidden) to foreign subscription ${foreignSub.subscription_number}`);
    }

    // ----------------------------------------------------
    // Test 6: Staff Login & Role Verification
    // ----------------------------------------------------
    console.log('\n[Test 6] Testing Staff Login (Sales Representative)...');
    const staffLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'staff@brightloop.com',
        password: 'Staff#1234',
      }),
    });
    const staffAuth = await staffLoginRes.json();
    assert.strictEqual(staffLoginRes.status, 200);
    assert.strictEqual(staffAuth.user.role, 'staff');
    const staffToken = staffAuth.token;
    console.log(`✅ Staff authenticated. Role: ${staffAuth.user.role}`);

    // ----------------------------------------------------
    // Test 7: Staff Sales Overview Endpoint
    // ----------------------------------------------------
    console.log('\n[Test 7] Testing Sales Workspace Overview Endpoint...');
    const salesOverviewRes = await fetch(`${BASE_URL}/sales/overview`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    const salesOverview = await salesOverviewRes.json();
    assert.strictEqual(salesOverviewRes.status, 200);
    assert(salesOverview.data.total_quotations !== undefined);
    assert(salesOverview.data.active_subscriptions !== undefined);
    assert(Array.isArray(salesOverview.data.recent_activity));
    console.log(`✅ Sales Overview: ${salesOverview.data.total_quotations} quotes, ${salesOverview.data.active_subscriptions} active subs, ${salesOverview.data.total_templates} templates`);

    // ----------------------------------------------------
    // Test 8: Quotation Templates Retrieval
    // ----------------------------------------------------
    console.log('\n[Test 8] Testing Quotation Templates Endpoint...');
    const tplRes = await fetch(`${BASE_URL}/quotation-templates`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    const templates = await tplRes.json();
    assert.strictEqual(tplRes.status, 200);
    assert(templates.count >= 3);
    const enterpriseTpl = templates.data.find((t) => t.name.includes('Enterprise Odoo'));
    assert(enterpriseTpl, 'Enterprise Odoo ERP template must exist');
    console.log(`✅ Quotation Templates: Found ${templates.count} templates. Selected: '${enterpriseTpl.name}'`);

    // ----------------------------------------------------
    // Test 9: Customers Listing for Staff
    // ----------------------------------------------------
    console.log('\n[Test 9] Testing Customers Listing Endpoint for Staff...');
    const custsRes = await fetch(`${BASE_URL}/customers`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    const custList = await custsRes.json();
    assert.strictEqual(custsRes.status, 200);
    assert(custList.count >= 3);
    console.log(`✅ Customer listing: Found ${custList.count} customers ready for quotation selection`);

    // ----------------------------------------------------
    // Test 10: 5-Step Create Quotation Workflow Execution
    // ----------------------------------------------------
    console.log('\n[Test 10] Executing Quotation Creation from Template...');
    const targetCustomer = custList.data[0];
    const targetTemplate = enterpriseTpl;

    const quoteItems = targetTemplate.items.map((it) => ({
      product_id: it.product._id || it.product,
      quantity: it.quantity,
      unit_price: it.unit_price,
      variant_addon: it.variant_addon,
      tax_pct: it.tax_pct,
    }));

    const createQuoteRes = await fetch(`${BASE_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        customer_id: targetCustomer._id,
        plan_id: targetTemplate.plan._id || targetTemplate.plan,
        status: 'Quotation',
        items: quoteItems,
        discount: targetTemplate.discount,
      }),
    });
    const createdQuote = await createQuoteRes.json();
    assert.strictEqual(createQuoteRes.status, 201);
    assert.strictEqual(createdQuote.data.status, 'Quotation');
    assert(createdQuote.data.subscription_number.startsWith('SUB-'));
    console.log(`✅ Quotation successfully created: ${createdQuote.data.subscription_number} for customer '${targetCustomer.name}' in status '${createdQuote.data.status}' with total ${createdQuote.data.total_amount}`);

    // ----------------------------------------------------
    // Test 11: Subscription Lifecycle Progression
    // ----------------------------------------------------
    console.log('\n[Test 11] Testing Lifecycle Advancement (Quotation -> Confirmed -> Active)...');
    const quoteId = createdQuote.data._id;

    // Advance to Confirmed
    const confirmRes = await fetch(`${BASE_URL}/subscriptions/${quoteId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({ status: 'Confirmed' }),
    });
    const confirmedData = await confirmRes.json();
    assert.strictEqual(confirmedData.data.status, 'Confirmed');
    console.log(`  -> Advanced to 'Confirmed'`);

    // Advance to Active
    const activateRes = await fetch(`${BASE_URL}/subscriptions/${quoteId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({ status: 'Active' }),
    });
    const activeData = await activateRes.json();
    assert.strictEqual(activeData.data.status, 'Active');
    console.log(`  -> Advanced to 'Active'`);

    // ----------------------------------------------------
    // Test 12: Admin Finance Dashboard Access Preserved
    // ----------------------------------------------------
    console.log('\n[Test 12] Testing Admin Access to Finance Dashboard...');
    const dashRes = await fetch(`${BASE_URL}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
    });
    const dashData = await dashRes.json();
    assert.strictEqual(dashRes.status, 200);
    assert(dashData.data.mrr > 0);
    assert(dashData.data.recognized_revenue > 0);
    console.log(`✅ Admin Finance Dashboard operational: MRR $${dashData.data.mrr}, Recognized $${dashData.data.recognized_revenue}`);

    console.log('\n====================================================');
    console.log('🎉 ALL 12 VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Test Failure:', err.message);
    process.exit(1);
  }
};

runTests();
