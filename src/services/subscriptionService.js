const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const Product = require('../models/Product');
const User = require('../models/User');
const { generateNextId } = require('../utils/sequenceGenerator');
const discountService = require('./discountService');

/**
 * State Transition Matrix for Subscriptions
 */
const VALID_TRANSITIONS = {
  draft: ['quotation', 'confirmed', 'closed'],
  quotation: ['confirmed', 'closed'],
  confirmed: ['active', 'closed'],
  active: ['paused', 'closed'],
  paused: ['active', 'closed'],
  closed: ['confirmed', 'active'] // Renewal path
};

class SubscriptionService {
  /**
   * Calculates pricing, taxes, and discounts for a subscription's items
   * @param {Array} rawItems 
   * @param {object} plan 
   * @param {string} discountCode 
   * @returns {Promise<object>}
   */
  async calculateLines(rawItems, plan, discountCode = '') {
    let subtotal = 0;
    let taxTotal = 0;
    let totalQuantity = 0;
    const computedItems = [];

    for (const item of rawItems) {
      let product = null;
      if (item.product_id) {
        product = await Product.findById(item.product_id);
      }

      const productName = product ? product.name : (item.product_name || 'Standard Subscription Line');
      let basePrice = product ? product.sales_price : (Number(item.unit_price) || 0);
      const taxPct = product ? product.tax_pct : (Number(item.tax_pct) ?? 10);
      const qty = Number(item.quantity) || 1;
      totalQuantity += qty;

      // Variant price calculation (e.g. Brand Odoo adds +560)
      let variantObj = null;
      let variantExtra = 0;
      if (item.variant) {
        variantExtra = Number(item.variant.extra_price) || 0;
        variantObj = {
          name: item.variant.name || 'Variant',
          option: item.variant.option || 'Selected',
          extra_price: variantExtra
        };
      }

      const unitPrice = basePrice + variantExtra;
      const lineSubtotal = unitPrice * qty;
      const lineTax = (lineSubtotal * taxPct) / 100;
      const lineTotal = lineSubtotal + lineTax;

      subtotal += lineSubtotal;
      taxTotal += lineTax;

      computedItems.push({
        product_id: product ? product._id : item.product_id,
        product_name: productName,
        variant: variantObj,
        quantity: qty,
        unit_price: unitPrice,
        tax_pct: taxPct,
        tax_amount: Math.round(lineTax * 100) / 100,
        discount_amount: 0,
        line_total: Math.round(lineTotal * 100) / 100
      });
    }

    // Minimum quantity validation against Plan rules
    if (plan && plan.min_quantity && totalQuantity < plan.min_quantity) {
      throw new Error(`Plan '${plan.name}' requires a minimum quantity of ${plan.min_quantity}. Total selected items: ${totalQuantity}`);
    }

    // Discount Calculation
    let discountTotal = 0;
    if (discountCode) {
      const discountCheck = await discountService.validateAndCalculate(discountCode, subtotal, totalQuantity);
      if (!discountCheck.valid) {
        throw new Error(discountCheck.reason || 'Invalid discount code applied');
      }
      discountTotal = discountCheck.discountAmount;
    }

    const recurringTotal = Math.max(0, Math.round((subtotal + taxTotal - discountTotal) * 100) / 100);

    return {
      items: computedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax_total: Math.round(taxTotal * 100) / 100,
      discount_total: Math.round(discountTotal * 100) / 100,
      recurring_total: recurringTotal,
      applied_discount_code: discountCode ? discountCode.toUpperCase() : null
    };
  }

  /**
   * Create a new subscription or quote
   * @param {object} payload 
   * @param {string} user 
   * @returns {Promise<Subscription>}
   */
  async createSubscription(payload, user = 'Sales Rep') {
    const {
      customer_id,
      customer_name,
      customer_email,
      plan_id,
      billing_interval,
      payment_terms = 'net_15',
      start_date = new Date(),
      expiry_date,
      validity_days = 15,
      items = [],
      discount_code = '',
      initial_status = 'draft',
      notes = ''
    } = payload;

    // Verify or Auto-resolve Customer
    let customerData = { name: customer_name, email: customer_email };
    let resolvedCustomerId = customer_id;

    if (resolvedCustomerId) {
      const foundCustomer = await User.findById(resolvedCustomerId);
      if (foundCustomer) {
        customerData.name = foundCustomer.name;
        customerData.email = foundCustomer.email;
      }
    } else if (customer_email) {
      let existingCustomer = await User.findOne({ email: customer_email.trim().toLowerCase() });
      if (!existingCustomer) {
        existingCustomer = await User.create({
          name: customer_name || 'Prospect Customer',
          email: customer_email.trim().toLowerCase(),
          password_hash: 'Customer123!',
          role: 'customer'
        });
      }
      resolvedCustomerId = existingCustomer._id;
      customerData.name = existingCustomer.name;
      customerData.email = existingCustomer.email;
    }

    if (!customerData.name || !customerData.email) {
      throw new Error('Customer name and email are required to create a subscription');
    }

    // Verify Plan
    const plan = await Plan.findById(plan_id);
    if (!plan) {
      throw new Error('Valid subscription plan is required');
    }

    // Calculate line items & discounts
    const calculations = await this.calculateLines(items, plan, discount_code);

    // Generate unique sequential subscription ID
    const subscriptionNumber = await generateNextId('SUB');

    const quotationValidUntil = initial_status === 'quotation'
      ? new Date(Date.now() + validity_days * 24 * 60 * 60 * 1000)
      : null;

    const subscription = new Subscription({
      subscription_number: subscriptionNumber,
      customer_id: resolvedCustomerId,
      customer_name: customerData.name,
      customer_email: customerData.email,
      plan_id: plan._id,
      plan_name: plan.name,
      billing_interval: billing_interval || plan.billing_interval || 'monthly',
      payment_terms,
      status: initial_status,
      start_date: new Date(start_date),
      expiry_date: expiry_date ? new Date(expiry_date) : null,
      next_billing_date: initial_status === 'active' ? new Date(start_date) : null,
      auto_close: plan.auto_close ?? false,
      allow_pause: plan.allow_pause ?? true,
      quotation_valid_until: quotationValidUntil,
      items: calculations.items,
      subtotal: calculations.subtotal,
      tax_total: calculations.tax_total,
      discount_total: calculations.discount_total,
      recurring_total: calculations.recurring_total,
      applied_discount_code: calculations.applied_discount_code,
      notes,
      history: [
        {
          from_status: null,
          to_status: initial_status,
          changed_at: new Date(),
          changed_by: user,
          reason: initial_status === 'quotation' ? 'Quotation created from template' : 'Initial subscription created'
        }
      ]
    });

    await subscription.save();

    if (discount_code) {
      await discountService.incrementUsage(discount_code);
    }

    return subscription;
  }

  /**
   * Transition a subscription to a new lifecycle state
   * @param {string} subscriptionId 
   * @param {string} targetStatus 
   * @param {string} user 
   * @param {string} reason 
   * @returns {Promise<Subscription>}
   */
  async transitionStatus(subscriptionId, targetStatus, user = 'Team Member', reason = '') {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const currentStatus = subscription.status;
    const allowed = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(targetStatus)) {
      throw new Error(
        `Invalid status transition from '${currentStatus}' to '${targetStatus}'. Allowed next states: [${allowed.join(', ')}]`
      );
    }

    // Business rule checks based on Plan settings
    if (targetStatus === 'paused') {
      if (subscription.allow_pause === false) {
        throw new Error(`This subscription's plan does not allow pausing.`);
      }
    }

    if (targetStatus === 'active') {
      // Set next billing date to now or start date if not already assigned
      if (!subscription.next_billing_date) {
        subscription.next_billing_date = subscription.start_date || new Date();
      }
    }

    subscription.status = targetStatus;
    subscription.history.push({
      from_status: currentStatus,
      to_status: targetStatus,
      changed_at: new Date(),
      changed_by: user,
      reason: reason || `Status changed from ${currentStatus} to ${targetStatus}`
    });

    await subscription.save();
    return subscription;
  }

  /**
   * Create a subscription starting from a Quotation Template
   * @param {object} quoteData 
   * @param {string} user 
   * @returns {Promise<Subscription>}
   */
  async createFromQuotationTemplate(quoteData, user = 'Sales Rep') {
    return this.createSubscription(
      {
        ...quoteData,
        initial_status: 'quotation'
      },
      user
    );
  }

  /**
   * Renews an existing subscription
   * @param {string} subscriptionId 
   * @param {number} additionalMonths 
   * @param {string} user 
   * @returns {Promise<Subscription>}
   */
  async renewSubscription(subscriptionId, additionalMonths = 12, user = 'Team Member') {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const newExpiry = subscription.expiry_date
      ? new Date(subscription.expiry_date)
      : new Date();
    newExpiry.setMonth(newExpiry.getMonth() + Number(additionalMonths));

    subscription.expiry_date = newExpiry;
    subscription.status = 'active';
    if (!subscription.next_billing_date || subscription.next_billing_date < new Date()) {
      subscription.next_billing_date = new Date();
    }

    subscription.history.push({
      from_status: subscription.status,
      to_status: 'active',
      changed_at: new Date(),
      changed_by: user,
      reason: `Subscription renewed for +${additionalMonths} months until ${newExpiry.toISOString().split('T')[0]}`
    });

    await subscription.save();
    return subscription;
  }
}

module.exports = new SubscriptionService();
