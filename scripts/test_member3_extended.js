// scripts/test_member3_extended.js
// Extended QA verification for Member 3: Auth, Passwords, Payments, and RBAC

const API_BASE = 'http://localhost:5000/api';

async function runExtendedTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING MEMBER 3 EXTENDED QA TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    console.log(`[Test ${total}] ${name}`);
    try {
      await fn();
      console.log(`✅ Passed\n`);
      passed++;
    } catch (err) {
      console.error(`❌ FAILED: ${err.message}\n`);
    }
  }

  // Helper fetch
  async function api(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...options.headers,
      },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  }

  // 1. Health check
  await test('Verify Health Check endpoint', async () => {
    const res = await api('/health');
    if (!res.ok || !res.data.success) throw new Error('Health check failed');
  });

  // Dedicated test account for password workflows
  const dynamicEmail = `qa_member3_${Date.now()}@domain.com`;
  let dynamicToken;

  await test('Register dedicated customer for password testing', async () => {
    const res = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'QA Dynamic Client',
        email: dynamicEmail,
        password: 'InitialPassword#123',
      }),
    });
    if (!res.ok) throw new Error(`Registration failed: ${res.data.message}`);
    dynamicToken = res.data.token;
  });

  // 2. Customer forgot password
  await test('Customer forgot-password endpoint', async () => {
    const res = await api('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: dynamicEmail }),
    });
    if (!res.ok) throw new Error(`Forgot password failed: ${res.data.message}`);
    if (!res.data.data.mockToken) throw new Error('Missing mock reset token');
  });

  // 3. Customer password reset
  await test('Customer password reset endpoint', async () => {
    const res = await api('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        email: dynamicEmail,
        newPassword: 'NewPassword#456',
      }),
    });
    if (!res.ok) throw new Error(`Reset password failed: ${res.data.message}`);
  });

  // 4. Customer login with reset password
  await test('Customer login with newly reset password', async () => {
    const res = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: dynamicEmail,
        password: 'NewPassword#456',
      }),
    });
    if (!res.ok) throw new Error(`Login failed: ${res.data.message}`);
    dynamicToken = res.data.token;
  });

  // 5. Customer profile update
  await test('Customer updates profile organization name', async () => {
    const res = await api('/auth/profile', {
      method: 'PUT',
      token: dynamicToken,
      body: JSON.stringify({ name: 'Dynamic Verified Enterprise' }),
    });
    if (!res.ok) throw new Error(`Profile update failed: ${res.data.message}`);
    if (res.data.user.name !== 'Dynamic Verified Enterprise') throw new Error('Name did not update');
  });

  // 6. Customer change password while authenticated
  await test('Customer changes password while authenticated', async () => {
    const res = await api('/auth/change-password', {
      method: 'POST',
      token: dynamicToken,
      body: JSON.stringify({
        currentPassword: 'NewPassword#456',
        newPassword: 'FinalPassword#789',
      }),
    });
    if (!res.ok) throw new Error(`Change password failed: ${res.data.message}`);
  });

  // 7. Seeded customer login & payments
  let seededCustomerToken;
  await test('Seeded Customer (Acme Global) Login', async () => {
    const res = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'client@business.com',
        password: 'Client#1234',
      }),
    });
    if (!res.ok) throw new Error(`Customer login failed: ${res.data.message}`);
    seededCustomerToken = res.data.token;
  });

  // 8. Customer payment recording on real invoice
  await test('Customer records payment on outstanding invoice', async () => {
    const invRes = await api('/invoices', { token: seededCustomerToken });
    if (!invRes.ok || !invRes.data.data.length) throw new Error('No invoices found for customer');
    
    const invoice = invRes.data.data[0];
    const payRes = await api('/payments', {
      method: 'POST',
      token: seededCustomerToken,
      body: JSON.stringify({
        invoice_id: invoice._id,
        amount: 50.00,
        payment_method: 'Credit Card',
        notes: 'QA verification payment via customer self-service portal',
      }),
    });
    if (!payRes.ok) throw new Error(`Payment recording failed: ${payRes.data.message}`);
    const payment = payRes.data.data.payment || payRes.data.data;
    if (payment.amount !== 50.00) throw new Error(`Payment amount mismatch: received ${payment.amount}`);
  });

  // 9. Customer payments history retrieval
  await test('Customer retrieves payment ledger history', async () => {
    const payRes = await api('/payments', { token: seededCustomerToken });
    if (!payRes.ok) throw new Error(`Failed to fetch payments: ${payRes.data.message}`);
    if (!payRes.data.data.length) throw new Error('Expected at least 1 payment record in ledger');
  });

  // 10. RBAC: Customer blocked from Admin Finance Analytics
  await test('RBAC: Customer blocked from accessing Admin Finance Dashboard (403 Forbidden)', async () => {
    const res = await api('/analytics/dashboard', { token: seededCustomerToken });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden but received ${res.status}`);
  });

  // 11. Staff login & access
  let staffToken;
  await test('Staff login and access to Sales Overview', async () => {
    const res = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'staff@brightloop.com',
        password: 'Staff#1234',
      }),
    });
    if (!res.ok) throw new Error(`Staff login failed: ${res.data.message}`);
    staffToken = res.data.token;
    if (res.data.user.role !== 'staff') throw new Error(`Expected role 'staff'`);

    const salesRes = await api('/sales/overview', { token: staffToken });
    if (!salesRes.ok) throw new Error(`Sales overview failed: ${salesRes.data.message}`);
  });

  // 12. RBAC: Staff blocked from Admin Finance Analytics
  await test('RBAC: Staff blocked from accessing Admin Finance Dashboard (403 Forbidden)', async () => {
    const res = await api('/analytics/dashboard', { token: staffToken });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden but received ${res.status}`);
  });

  console.log('====================================================');
  console.log(`Summary: ${passed} / ${total} Extended Tests Passed`);
  console.log('====================================================');
}

runExtendedTests();
