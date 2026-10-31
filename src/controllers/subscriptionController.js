const Subscription = require('../models/Subscription');
const subscriptionService = require('../services/subscriptionService');

/**
 * Controller for Subscriptions & Quotation Lifecycles
 */
exports.createSubscription = async (req, res, next) => {
  try {
    const user = req.user ? req.user.name : (req.body.created_by || 'Team Member');
    const subscription = await subscriptionService.createSubscription(req.body, user);
    return res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

exports.calculatePreview = async (req, res, next) => {
  try {
    const { items = [], plan_id, discount_code = '' } = req.body;
    let plan = null;
    if (plan_id) {
      const Plan = require('../models/Plan');
      plan = await Plan.findById(plan_id);
    }
    const calculation = await subscriptionService.calculateLines(items, plan, discount_code);
    return res.status(200).json({
      success: true,
      data: calculation
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllSubscriptions = async (req, res, next) => {
  try {
    const { status, customer_id, search, plan_id, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (customer_id) filter.customer_id = customer_id;
    if (plan_id) filter.plan_id = plan_id;
    if (search) {
      filter.$or = [
        { subscription_number: { $regex: search, $options: 'i' } },
        { customer_name: { $regex: search, $options: 'i' } },
        { customer_email: { $regex: search, $options: 'i' } }
      ];
    }

    const subscriptions = await Subscription.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('plan_id', 'name billing_interval base_price min_quantity');

    const total = await Subscription.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: subscriptions.length,
      total,
      data: subscriptions
    });
  } catch (error) {
    next(error);
  }
};

exports.getSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('plan_id')
      .populate('customer_id');

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    return res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

exports.transitionStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Target status is required' });
    }

    const user = req.user ? req.user.name : (req.body.user || 'Team Member');
    const updated = await subscriptionService.transitionStatus(req.params.id, status, user, reason);

    return res.status(200).json({
      success: true,
      message: `Subscription transitioned to ${status}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

exports.createFromQuotation = async (req, res, next) => {
  try {
    const user = req.user ? req.user.name : 'Sales Rep';
    const quote = await subscriptionService.createFromQuotationTemplate(req.body, user);
    return res.status(201).json({
      success: true,
      message: 'Quotation generated from template',
      data: quote
    });
  } catch (error) {
    next(error);
  }
};

exports.renewSubscription = async (req, res, next) => {
  try {
    const { months = 12, user = 'Team Member' } = req.body;
    const renewed = await subscriptionService.renewSubscription(req.params.id, months, user);
    return res.status(200).json({
      success: true,
      message: `Subscription renewed for ${months} months`,
      data: renewed
    });
  } catch (error) {
    next(error);
  }
};
