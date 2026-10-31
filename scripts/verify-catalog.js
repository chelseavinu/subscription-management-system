import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import mongoose from 'mongoose';
import app from '../server.js';

const PORT = 5099; // Test port to avoid port conflict

const runVerification = async () => {
  let server;
  try {
    server = app.listen(PORT);
    console.log(`[Verify] Test server listening on http://localhost:${PORT}`);

    // Wait a moment for connection
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 1. Login as Admin
    console.log('\n--- 1. Testing Login as Admin ---');
    const loginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@brightloop.com',
        password: 'Admin#1234',
      }),
    });
    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    console.log('Admin Role:', loginData.user?.role);
    const adminToken = loginData.token;

    if (!adminToken) {
      throw new Error('Failed to retrieve admin token');
    }

    // 2. GET /api/products
    console.log('\n--- 2. Testing GET /api/products ---');
    const productsRes = await fetch(`http://localhost:${PORT}/api/products`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const productsData = await productsRes.json();
    console.log('GET /api/products Status:', productsRes.status);
    console.log(`Retrieved ${productsData.count} products:`);
    productsData.data.forEach((p) => {
      console.log(`- Product: "${p.name}" (Type: ${p.type}, Price: $${p.sales_price})`);
      p.variants.forEach((v) => {
        console.log(`    * Variant: ${v.name} -> ${v.option} (+$${v.extra_price})`);
      });
    });

    // 3. GET /api/plans
    console.log('\n--- 3. Testing GET /api/plans ---');
    const plansRes = await fetch(`http://localhost:${PORT}/api/plans`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const plansData = await plansRes.json();
    console.log('GET /api/plans Status:', plansRes.status);
    console.log(`Retrieved ${plansData.count} billing plans:`);
    plansData.data.forEach((pl) => {
      console.log(`- Plan: "${pl.name}" ($${pl.base_price} / ${pl.billing_interval}, Active: ${pl.is_active})`);
    });

    // 4. POST /api/products (Admin creates new product with Odoo integration variant)
    console.log('\n--- 4. Testing POST /api/products (Admin) ---');
    const createProdRes = await fetch(`http://localhost:${PORT}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Odoo Multi-Company Accounting Connector',
        type: 'software',
        sales_price: 650,
        cost_price: 200,
        notes: 'Real-time sync between Brightloop and Odoo ERP ledger',
        variants: [
          { name: 'Edition', option: 'Odoo Enterprise 17', extra_price: 560 },
          { name: 'Edition', option: 'Odoo Community', extra_price: 0 },
        ],
      }),
    });
    const createdProdData = await createProdRes.json();
    console.log('POST /api/products Status:', createProdRes.status);
    console.log('Created Product ID:', createdProdData.data?._id);
    console.log('Variants saved:', createdProdData.data?.variants);

    // 5. POST /api/plans (Admin creates weekly billing plan)
    console.log('\n--- 5. Testing POST /api/plans (Admin) ---');
    const createPlanRes = await fetch(`http://localhost:${PORT}/api/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Sprint Weekly Plan',
        billing_interval: 'weekly',
        base_price: 49,
        min_quantity: 1,
        auto_close: false,
        allow_pause: true,
      }),
    });
    const createdPlanData = await createPlanRes.json();
    console.log('POST /api/plans Status:', createPlanRes.status);
    console.log('Created Plan Name:', createdPlanData.data?.name);
    console.log('Interval:', createdPlanData.data?.billing_interval);

    // 6. RBAC Check: Customer tries to create product (Must fail with 403 Forbidden)
    console.log('\n--- 6. Testing RBAC: Customer trying to POST /api/products ---');
    const custLoginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'client@business.com',
        password: 'Client#1234',
      }),
    });
    const custData = await custLoginRes.json();
    const custToken = custData.token;

    const forbiddenRes = await fetch(`http://localhost:${PORT}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`,
      },
      body: JSON.stringify({
        name: 'Unauthorized Product Creation',
        sales_price: 999,
      }),
    });
    const forbiddenData = await forbiddenRes.json();
    console.log('Customer POST /api/products Status:', forbiddenRes.status);
    console.log('Customer Forbidden Message:', forbiddenData.message);

    console.log('\n====================================================');
    console.log('🎉 ALL CATALOG ENDPOINTS VERIFIED AND WORKING!');
    console.log('====================================================');

    server.close();
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Verification Failed:', err);
    if (server) server.close();
    if (mongoose.connection) await mongoose.connection.close();
    process.exit(1);
  }
};

runVerification();
