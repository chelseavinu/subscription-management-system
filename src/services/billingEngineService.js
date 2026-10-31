const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const { generateNextId } = require('../utils/sequenceGenerator');
const { calculateNextBillingDate, calculateDueDate, normalizeToMRR } = require('../utils/dateHelpers');

class BillingEngineService {
  /**
   * Executes the Billing Day run for all subscriptions due on or before targetDate
   * Guarantees idempotency: No subscription is billed twice or skipped
   * @param {Date|string} targetDate 
   * @param {object} options { dryRun: boolean, autoConfirm: boolean }
   * @returns {Promise<object>}
   */
  async triggerBillingRun(targetDate = new Date(), options = {}) {
    const billingDate = new Date(targetDate);
    billingDate.setHours(23, 59, 59, 999);
    const { dryRun = false, autoConfirm = false } = options;

    // Find all active subscriptions that are due for billing
    const dueSubscriptions = await Subscription.find({
      status: 'active',
      next_billing_date: { $lte: billingDate }
    }).populate('customer_id');

    const results = {
      run_date: billingDate,
      subscriptions_evaluated: dueSubscriptions.length,
      invoices_generated: 0,
      skipped_already_billed: 0,
      invoices: [],
      skipped_details: [],
      errors: []
    };

    for (const sub of dueSubscriptions) {
      try {
        const periodStart = sub.last_billed_date || sub.start_date || new Date();
        const periodEnd = new Date(sub.next_billing_date);

        // IDEMPOTENCY CHECK:
        // Ensure an active/draft/confirmed/paid invoice does not already exist for this exact billing cycle
        const existingInvoice = await Invoice.findOne({
          subscription_id: sub._id,
          billing_period_end: {
            $gte: new Date(periodEnd.getFullYear(), periodEnd.getMonth(), periodEnd.getDate(), 0, 0, 0),
            $lte: new Date(periodEnd.getFullYear(), periodEnd.getMonth(), periodEnd.getDate(), 23, 59, 59)
          },
          status: { $ne: 'cancelled' }
        });

        if (existingInvoice) {
          results.skipped_already_billed++;
          results.skipped_details.push({
            subscription_number: sub.subscription_number,
            reason: `Invoice ${existingInvoice.invoice_number} already generated for period ending ${periodEnd.toISOString().split('T')[0]}`
          });
          continue;
        }

        // Map line items snapshot from subscription
        const invoiceItems = sub.items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          variant_info: item.variant && item.variant.option
            ? `${item.variant.name}: ${item.variant.option} (+$${item.variant.extra_price})`
            : '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_pct: item.tax_pct,
          tax_amount: item.tax_amount,
          discount_amount: item.discount_amount || 0,
          line_total: item.line_total
        }));

        const dueDate = calculateDueDate(billingDate, sub.payment_terms || 'net_15');
        const invoiceNumber = await generateNextId('INV');
        const initialStatus = autoConfirm ? 'confirmed' : 'draft';

        if (dryRun) {
          results.invoices_generated++;
          results.invoices.push({
            dry_run: true,
            invoice_number: invoiceNumber,
            subscription_number: sub.subscription_number,
            customer_name: sub.customer_name,
            total_amount: sub.recurring_total,
            due_date: dueDate
          });
          continue;
        }

        // Create and persist the generated Invoice
        const invoice = new Invoice({
          invoice_number: invoiceNumber,
          subscription_id: sub._id,
          subscription_number: sub.subscription_number,
          customer_id: sub.customer_id ? sub.customer_id._id : null,
          customer_name: sub.customer_name,
          customer_email: sub.customer_email,
          customer_address: sub.customer_id ? sub.customer_id.address : '',
          billing_period_start: periodStart,
          billing_period_end: periodEnd,
          issue_date: billingDate,
          due_date: dueDate,
          status: initialStatus,
          payment_status: 'unpaid',
          items: invoiceItems,
          subtotal: sub.subtotal,
          tax_amount: sub.tax_total,
          discount_amount: sub.discount_total || 0,
          total_amount: sub.recurring_total,
          amount_paid: 0,
          amount_due: sub.recurring_total,
          notes: `Automated recurring billing generated for period ${periodStart.toISOString().split('T')[0]} to ${periodEnd.toISOString().split('T')[0]}`,
          history: [
            {
              from_status: null,
              to_status: initialStatus,
              changed_at: new Date(),
              action: 'Billing Day Generation',
              notes: `Automated invoice generated from subscription ${sub.subscription_number}`
            }
          ]
        });

        let session = null;
        try {
          session = await mongoose.startSession();
          session.startTransaction();
        } catch (e) {
          session = null;
        }

        try {
          if (session) {
            await invoice.save({ session });
          } else {
            await invoice.save();
          }

          // Advance subscription billing pointers
          sub.last_billed_date = periodEnd;
          const nextDate = calculateNextBillingDate(periodEnd, sub.billing_interval);
          sub.next_billing_date = nextDate;

          // Auto-close check upon reaching expiry date
          if (sub.auto_close && sub.expiry_date && nextDate > new Date(sub.expiry_date)) {
            sub.status = 'closed';
            sub.history.push({
              from_status: 'active',
              to_status: 'closed',
              changed_at: new Date(),
              changed_by: 'Billing Engine',
              reason: `Subscription reached expiry date (${sub.expiry_date.toISOString().split('T')[0]}) and auto_close is enabled on plan.`
            });
          }

          if (session) {
            await sub.save({ session });
            await session.commitTransaction();
            session.endSession();
          } else {
            await sub.save();
          }

          results.invoices_generated++;
          results.invoices.push(invoice);
        } catch (saveErr) {
          if (session) {
            await session.abortTransaction();
            session.endSession();
          }
          throw saveErr;
        }
      } catch (err) {
        results.errors.push({
          subscription_number: sub.subscription_number,
          error: err.message
        });
      }
    }

    return results;
  }

  /**
   * Calculates high-level recurring revenue and billing metrics for Finance Lead Dashboard
   * @returns {Promise<object>}
   */
  async getFinancialMetrics() {
    const activeSubscriptions = await Subscription.find({ status: 'active' });
    const allInvoices = await Invoice.find();

    let mrr = 0;
    activeSubscriptions.forEach(sub => {
      mrr += normalizeToMRR(sub.recurring_total, sub.billing_interval);
    });

    const arr = mrr * 12;

    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let unpaidInvoicesCount = 0;
    let overdueInvoicesCount = 0;

    const today = new Date();

    allInvoices.forEach(inv => {
      if (inv.status !== 'cancelled') {
        totalInvoiced += inv.total_amount;
        totalCollected += inv.amount_paid;
        totalOutstanding += inv.amount_due;

        if (inv.payment_status !== 'paid') {
          unpaidInvoicesCount++;
          if (new Date(inv.due_date) < today) {
            overdueInvoicesCount++;
          }
        }
      }
    });

    const subscriptionCounts = {
      draft: await Subscription.countDocuments({ status: 'draft' }),
      quotation: await Subscription.countDocuments({ status: 'quotation' }),
      confirmed: await Subscription.countDocuments({ status: 'confirmed' }),
      active: activeSubscriptions.length,
      paused: await Subscription.countDocuments({ status: 'paused' }),
      closed: await Subscription.countDocuments({ status: 'closed' })
    };

    return {
      metrics: {
        mrr: Math.round(mrr * 100) / 100,
        arr: Math.round(arr * 100) / 100,
        active_subscriptions_count: activeSubscriptions.length,
        total_invoiced_revenue: Math.round(totalInvoiced * 100) / 100,
        total_collected_revenue: Math.round(totalCollected * 100) / 100,
        total_outstanding_revenue: Math.round(totalOutstanding * 100) / 100,
        unpaid_invoices_count: unpaidInvoicesCount,
        overdue_invoices_count: overdueInvoicesCount
      },
      subscription_breakdown: subscriptionCounts
    };
  }
}

module.exports = new BillingEngineService();
