import assert from 'assert';
import mongoose from 'mongoose';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import dns from 'dns';
import dotenv from 'dotenv';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set public DNS servers to resolve MongoDB Atlas SRV records on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Plan = require('../src/models/Plan');
const Discount = require('../src/models/Discount');
const Subscription = require('../src/models/Subscription');
const Invoice = require('../src/models/Invoice');
const Payment = require('../src/models/Payment');

const subscriptionService = require('../src/services/subscriptionService');
const billingEngineService = require('../src/services/billingEngineService');
const paymentService = require('../src/services/paymentService');
const discountService = require('../src/services/discountService');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/brightloop_subscriptions';

async function runTests() {
  console.log('====================================================');
  console.log('  Brightloop Member 2 Test Suite: Logic & Billing   ');
  console.log('====================================================');

  try {
    await mongoose.connect(MONGODB_URI, { dbName: 'brightloop_subscriptions' });
    console.log('[Setup] Connected to database for testing.');

    let passed = 0;
    let failed = 0;

    // Helper for assertions
    async function testCase(name, fn) {
      process.stdout.write(`• ${name}... `);
      try {
        await fn();
        console.log('\x1b[32mPASSED\x1b[0m');
        passed++;
      } catch (err) {
        console.log('\x1b[31mFAILED\x1b[0m');
        console.error('  Error:', err.message);
        failed++;
      }
    }

    // 1. Setup Test Fixtures
    const testCustomer = await User.findOneAndUpdate(
      { email: 'test.user@brightloop.test' },
      { name: 'Test QA Customer', password_hash: 'Password123!', role: 'customer' },
      { upsert: true, new: true }
    );

    const testPlan = await Plan.findOneAndUpdate(
      { code: 'TEST-M-PLAN' },
      {
        name: 'Test Monthly Plan',
        billing_interval: 'monthly',
        min_quantity: 1,
        allow_pause: true,
        auto_close: false
      },
      { upsert: true, new: true }
    );

    const noPausePlan = await Plan.findOneAndUpdate(
      { code: 'TEST-NO-PAUSE' },
      {
        name: 'Test No Pause Plan',
        billing_interval: 'monthly',
        min_quantity: 1,
        allow_pause: false,
        auto_close: false
      },
      { upsert: true, new: true }
    );

    const testProduct = await Product.findOneAndUpdate(
      { name: 'Test Business Suite' },
      {
        type: 'software',
        sales_price: 1200,
        cost_price: 400,
        tax_pct: 10,
        variants: [
          { name: 'Brand', option: 'Odoo Connected', extra_price: 560 }
        ]
      },
      { upsert: true, new: true }
    );

    const testDiscount = await Discount.findOneAndUpdate(
      { code: 'TEST20' },
      {
        type: 'percentage',
        value: 20,
        min_qty: 2,
        min_amount: 500,
        is_active: true
      },
      { upsert: true, new: true }
    );

    // --- TEST SUITE ---

    // TEST 1: Variant Calculation Engine (Brand Odoo +560)
    await testCase('Product Variant & Tax Calculation (+560 Odoo brand)', async () => {
      const calculation = await subscriptionService.calculateLines(
        [
          {
            product_id: testProduct._id,
            variant: { name: 'Brand', option: 'Odoo Connected', extra_price: 560 },
            quantity: 1,
            unit_price: 1200,
            tax_pct: 10
          }
        ],
        testPlan
      );

      assert.strictEqual(calculation.items[0].unit_price, 1760, 'Unit price should be 1200 + 560 = 1760');
      assert.strictEqual(calculation.subtotal, 1760, 'Subtotal should be 1760');
      assert.strictEqual(calculation.tax_total, 176, '10% tax should be 176');
      assert.strictEqual(calculation.recurring_total, 1936, 'Recurring total should be 1936');
    });

    // TEST 2: Discount Engine Rules
    await testCase('Discount Rules Engine (min_qty, min_amount, percentage calculation)', async () => {
      // 1 item should fail min_qty requirement of 2
      const failQty = await discountService.validateAndCalculate('TEST20', 2000, 1);
      assert.strictEqual(failQty.valid, false, 'Should fail when quantity < min_qty');

      // 2 items should pass and deduct 20%
      const passResult = await discountService.validateAndCalculate('TEST20', 2000, 2);
      assert.strictEqual(passResult.valid, true, 'Should pass when requirements met');
      assert.strictEqual(passResult.discountAmount, 400, '20% of 2000 should be 400');
    });

    // TEST 3: Subscription State Machine Transitions
    let createdSub = null;
    await testCase('Subscription Lifecycle State Machine (Draft -> Quotation -> Confirmed -> Active)', async () => {
      createdSub = await subscriptionService.createSubscription({
        customer_id: testCustomer._id,
        plan_id: testPlan._id,
        items: [
          {
            product_id: testProduct._id,
            quantity: 1,
            unit_price: 1200,
            tax_pct: 10
          }
        ],
        initial_status: 'draft'
      });

      assert.strictEqual(createdSub.status, 'draft');

      // Valid: draft -> quotation
      let updated = await subscriptionService.transitionStatus(createdSub._id, 'quotation');
      assert.strictEqual(updated.status, 'quotation');

      // Valid: quotation -> confirmed
      updated = await subscriptionService.transitionStatus(createdSub._id, 'confirmed');
      assert.strictEqual(updated.status, 'confirmed');

      // Valid: confirmed -> active
      updated = await subscriptionService.transitionStatus(createdSub._id, 'active');
      assert.strictEqual(updated.status, 'active');
      assert.ok(updated.next_billing_date, 'Active subscription must have next_billing_date assigned');
    });

    await testCase('Illegal State Transitions Rejection', async () => {
      // Active cannot jump straight to quotation
      let threw = false;
      try {
        await subscriptionService.transitionStatus(createdSub._id, 'quotation');
      } catch (e) {
        threw = true;
      }
      assert.strictEqual(threw, true, 'Illegal transition should throw validation error');
    });

    await testCase('Plan allow_pause Constraint Enforcement', async () => {
      const noPauseSub = await subscriptionService.createSubscription({
        customer_id: testCustomer._id,
        plan_id: noPausePlan._id,
        items: [{ product_id: testProduct._id, quantity: 1, unit_price: 1200 }],
        initial_status: 'confirmed'
      });
      await subscriptionService.transitionStatus(noPauseSub._id, 'active');

      let threw = false;
      try {
        await subscriptionService.transitionStatus(noPauseSub._id, 'paused');
      } catch (e) {
        threw = true;
      }
      assert.strictEqual(threw, true, 'Subscription with allow_pause=false must reject pause transition');
    });

    // TEST 4: Billing Day Engine & Idempotency Guarantee
    let generatedInvoice = null;
    await testCase('Automated Billing Run & Invoice Generation', async () => {
      const today = new Date();
      // Set createdSub due for billing today
      createdSub.next_billing_date = today;
      await createdSub.save();

      const runResult = await billingEngineService.triggerBillingRun(today);
      assert.ok(runResult.invoices_generated >= 1, 'Billing run should generate at least 1 invoice');

      generatedInvoice = await Invoice.findOne({ subscription_id: createdSub._id }).sort({ createdAt: -1 });
      assert.ok(generatedInvoice, 'Generated invoice should exist');
      assert.strictEqual(generatedInvoice.status, 'draft');
      assert.strictEqual(generatedInvoice.payment_status, 'unpaid');
      assert.strictEqual(generatedInvoice.total_amount, createdSub.recurring_total);

      // Verify subscription next billing date was advanced to next month
      const reloadedSub = await Subscription.findById(createdSub._id);
      assert.ok(reloadedSub.next_billing_date > today, 'next_billing_date should have advanced to future');
    });

    await testCase('Billing Day Idempotency (Prevent Duplicate Billing)', async () => {
      // Re-running billing run on the same period end must safely skip
      const reloadedInvoice = await Invoice.findById(generatedInvoice._id);
      const reloadedSub = await Subscription.findById(createdSub._id);

      // Artificially reset next_billing_date to trigger evaluation
      reloadedSub.next_billing_date = reloadedInvoice.billing_period_end;
      await reloadedSub.save();

      const rerunResult = await billingEngineService.triggerBillingRun(reloadedInvoice.billing_period_end);
      assert.ok(rerunResult.skipped_already_billed >= 1, 'Second run must skip already billed period');
    });

    // TEST 5: Payment Recording & Invoice Reconciliation
    await testCase('Partial Payment Recording & Invoice Status', async () => {
      const partialAmount = 500;
      const initialDue = generatedInvoice.amount_due;

      const result = await paymentService.recordPayment({
        invoice_id: generatedInvoice._id,
        amount: partialAmount,
        payment_method: 'bank_transfer',
        transaction_reference: 'TEST-TX-PARTIAL'
      });

      assert.strictEqual(result.payment.amount, partialAmount);
      assert.strictEqual(result.invoice.payment_status, 'partially_paid');
      assert.strictEqual(result.invoice.amount_due, Math.round((initialDue - partialAmount) * 100) / 100);
      assert.strictEqual(result.invoice.amount_paid, partialAmount);
    });

    await testCase('Overpayment Rejection Validation', async () => {
      const currentInvoice = await Invoice.findById(generatedInvoice._id);
      const excessiveAmount = currentInvoice.amount_due + 500;

      let threw = false;
      try {
        await paymentService.recordPayment({
          invoice_id: generatedInvoice._id,
          amount: excessiveAmount,
          payment_method: 'credit_card'
        });
      } catch (e) {
        threw = true;
      }

      assert.strictEqual(threw, true, 'Payment exceeding remaining balance must be rejected');
    });

    await testCase('Full Payment Settlement & Automatic Paid Status', async () => {
      const currentInvoice = await Invoice.findById(generatedInvoice._id);
      const finalAmount = currentInvoice.amount_due;

      const result = await paymentService.recordPayment({
        invoice_id: generatedInvoice._id,
        amount: finalAmount,
        payment_method: 'credit_card',
        transaction_reference: 'TEST-TX-FINAL'
      });

      assert.strictEqual(result.invoice.amount_due, 0, 'Remaining due should be 0');
      assert.strictEqual(result.invoice.status, 'paid', 'Status should be paid');
      assert.strictEqual(result.invoice.payment_status, 'paid', 'Payment status should be paid');
    });

    console.log('----------------------------------------------------');
    console.log(`Results: \x1b[32m${passed} Passed\x1b[0m, \x1b[31m${failed} Failed\x1b[0m`);
    console.log('====================================================');

    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal test runner error:', error);
    process.exit(1);
  }
}

runTests();
