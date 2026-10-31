import Subscription from '../models/Subscription.js';
import Product from '../models/Product.js';
import Plan from '../models/Plan.js';
import Invoice from '../models/Invoice.js';
import User from '../models/User.js';

/**
 * Generate unique subscription number
 */
const generateSubNumber = async () => {
  const count = await Subscription.countDocuments();
  const year = new Date().getFullYear();
  return `SUB-${year}-${String(count + 1).padStart(4, '0')}`;
};

/**
 * @desc    Get all subscriptions (filtered by role & query)
 * @route   GET /api/subscriptions
 * @access  Private
 */
export const getSubscriptions = async (req, res, next) => {
  try {
    const query = {};

    // Customer can only view their own subscriptions
    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.query.customer) {
      query.customer = req.query.customer;
    }

    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    if (req.query.plan) {
      query.plan = req.query.plan;
    }

    if (req.query.search) {
      query.subscription_number = { $regex: req.query.search, $options: 'i' };
    }

    const subscriptions = await Subscription.find(query)
      .populate('customer', 'name email role')
      .populate('plan', 'name billing_interval base_price')
      .populate('items.product', 'name type sales_price variants')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single subscription by ID
 * @route   GET /api/subscriptions/:id
 * @access  Private
 */
export const getSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('customer', 'name email role')
      .populate('plan', 'name billing_interval base_price allow_pause auto_close')
      .populate('items.product', 'name type sales_price variants notes');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: `Subscription not found with id: ${req.params.id}`,
      });
    }

    // Customer access check
    if (req.user.role === 'customer' && subscription.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot view subscriptions belonging to other customers.',
      });
    }

    return res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new subscription
 * @route   POST /api/subscriptions
 * @access  Private (Admin, Staff, or Customer creating for themselves)
 */
export const createSubscription = async (req, res, next) => {
  try {
    const {
      customer_id,
      plan_id,
      status = 'Draft',
      items = [],
      discount,
      start_date,
      expiry_date,
    } = req.body;

    const targetCustomerId = req.user.role === 'customer' ? req.user._id : (customer_id || req.user._id);

    // Verify customer exists
    const customer = await User.findById(targetCustomerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Verify plan exists
    const plan = await Plan.findById(plan_id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Billing Plan not found' });
    }

    // Validate and process items
    let processedItems = [];
    let itemsTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found with id: ${item.product_id}`,
        });
      }

      const qty = Number(item.quantity) || 1;
      const unitPrice = Number(item.unit_price) || product.sales_price;
      const variantAddon = Number(item.variant_addon) || 0;
      const taxPct = Number(item.tax_pct) || 0;

      const lineTotal = (unitPrice + variantAddon) * qty;
      const taxAmount = lineTotal * (taxPct / 100);
      itemsTotal += lineTotal + taxAmount;

      processedItems.push({
        product: product._id,
        product_name: product.name,
        quantity: qty,
        unit_price: unitPrice,
        variant_addon: variantAddon,
        tax_pct: taxPct,
      });
    }

    // Add plan base price if applicable
    let totalAmount = itemsTotal + (plan.base_price || 0);

    // Apply discount if any
    let appliedDiscount = null;
    if (discount && discount.value > 0) {
      appliedDiscount = {
        code: discount.code ? discount.code.toUpperCase() : 'PROMO',
        discount_type: discount.discount_type || 'percentage',
        value: discount.value,
      };

      if (appliedDiscount.discount_type === 'percentage') {
        const discountVal = (totalAmount * appliedDiscount.value) / 100;
        totalAmount = Math.max(0, totalAmount - discountVal);
      } else {
        totalAmount = Math.max(0, totalAmount - appliedDiscount.value);
      }
    }

    const subNumber = await generateSubNumber();
    const startDate = start_date ? new Date(start_date) : new Date();
    
    // Calculate next billing date based on plan interval
    const nextBillingDate = new Date(startDate);
    if (plan.billing_interval === 'yearly') {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    } else if (plan.billing_interval === 'monthly') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else if (plan.billing_interval === 'weekly') {
      nextBillingDate.setDate(nextBillingDate.getDate() + 7);
    } else {
      nextBillingDate.setDate(nextBillingDate.getDate() + 1);
    }

    const newSub = await Subscription.create({
      subscription_number: subNumber,
      customer: targetCustomerId,
      plan: plan._id,
      status,
      start_date: startDate,
      expiry_date: expiry_date ? new Date(expiry_date) : null,
      next_billing_date: nextBillingDate,
      items: processedItems,
      discount: appliedDiscount,
      total_amount: Math.round(totalAmount * 100) / 100,
    });

    const populatedSub = await Subscription.findById(newSub._id)
      .populate('customer', 'name email role')
      .populate('plan', 'name billing_interval base_price')
      .populate('items.product', 'name type sales_price variants');

    return res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: populatedSub,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update subscription status lifecycle (Draft -> Quotation -> Confirmed -> Active -> Closed)
 * @route   PATCH /api/subscriptions/:id/status
 * @access  Private (Admin, Staff)
 */
export const updateSubscriptionStatus = async (req, res, next) => {
  try {
    const rawStatus = req.body.status || req.body.target_status;
    if (!rawStatus) {
      return res.status(400).json({
        success: false,
        message: 'A status or target_status field is required',
      });
    }

    // Normalize to TitleCase (e.g. 'active' -> 'Active')
    const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
    const validStatuses = ['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status: ${rawStatus}. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: `Subscription not found with id: ${req.params.id}`,
      });
    }

    subscription.status = status;
    if (status === 'Active' && !subscription.start_date) {
      subscription.start_date = new Date();
    }
    await subscription.save();

    const updatedSub = await Subscription.findById(subscription._id)
      .populate('customer', 'name email role')
      .populate('plan', 'name billing_interval base_price')
      .populate('items.product', 'name type sales_price variants');

    return res.status(200).json({
      success: true,
      message: `Subscription status updated to ${status}`,
      data: updatedSub,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Auto-generate invoice from active subscription
 * @route   POST /api/subscriptions/:id/generate-invoice
 * @access  Private (Admin, Staff)
 */
export const generateInvoiceForSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('plan')
      .populate('items.product');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    // Check for duplicate un-paid invoice for this subscription due in the future
    const existingDraft = await Invoice.findOne({
      subscription: subscription._id,
      status: { $in: ['Draft', 'Confirmed'] },
    });

    if (existingDraft) {
      return res.status(400).json({
        success: false,
        message: `An active invoice (${existingDraft.invoice_number}) already exists for this subscription cycle.`,
        data: existingDraft,
      });
    }

    const count = await Invoice.countDocuments();
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;

    const invoiceItems = subscription.items.map((it) => {
      const lineSubtotal = (it.unit_price + it.variant_addon) * it.quantity;
      const lineTax = lineSubtotal * (it.tax_pct / 100);
      return {
        product: it.product ? it.product._id : null,
        product_name: it.product_name,
        quantity: it.quantity,
        unit_price: it.unit_price,
        variant_addon: it.variant_addon,
        tax_pct: it.tax_pct,
        total: Math.round((lineSubtotal + lineTax) * 100) / 100,
      };
    });

    const subtotal = invoiceItems.reduce((acc, it) => acc + (it.unit_price + it.variant_addon) * it.quantity, 0);
    const taxAmount = invoiceItems.reduce((acc, it) => acc + (it.unit_price + it.variant_addon) * it.quantity * (it.tax_pct / 100), 0);
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14-day payment window

    const invoice = await Invoice.create({
      invoice_number: invoiceNumber,
      subscription: subscription._id,
      customer: subscription.customer,
      due_date: dueDate,
      items: invoiceItems,
      subtotal,
      tax_amount: Math.round(taxAmount * 100) / 100,
      total_amount: totalAmount,
      status: 'Confirmed',
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('customer', 'name email')
      .populate('subscription', 'subscription_number');

    return res.status(201).json({
      success: true,
      message: `Invoice ${invoiceNumber} generated successfully`,
      data: populatedInvoice,
    });
  } catch (error) {
    next(error);
  }
};
