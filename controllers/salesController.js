import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import QuotationTemplate from '../models/QuotationTemplate.js';

/**
 * @desc    Get Sales Workspace Overview & Metrics
 * @route   GET /api/sales/overview
 * @access  Private (Admin, Staff)
 */
export const getSalesOverview = async (req, res, next) => {
  try {
    const [
      allSubs,
      templatesCount,
      customersCount,
    ] = await Promise.all([
      Subscription.find()
        .populate('customer', 'name email')
        .populate('plan', 'name billing_interval base_price')
        .sort({ updatedAt: -1 })
        .lean(),
      QuotationTemplate.countDocuments({ is_active: true }),
      User.countDocuments({ role: 'customer' }),
    ]);

    let draftCount = 0;
    let pendingQuoteCount = 0;
    let confirmedCount = 0;
    let activeCount = 0;
    let closedCount = 0;

    const recentActivity = [];

    allSubs.forEach((sub) => {
      if (sub.status === 'Draft') draftCount++;
      else if (sub.status === 'Quotation') pendingQuoteCount++;
      else if (sub.status === 'Confirmed') confirmedCount++;
      else if (sub.status === 'Active') activeCount++;
      else if (sub.status === 'Closed') closedCount++;

      // Populate activity feed
      if (recentActivity.length < 8) {
        recentActivity.push({
          id: sub._id,
          subscription_number: sub.subscription_number,
          customer_name: sub.customer?.name || 'Client Account',
          plan_name: sub.plan?.name || 'Growth Plan',
          status: sub.status,
          amount: sub.total_amount,
          date: sub.updatedAt || sub.createdAt,
        });
      }
    });

    const totalQuotations = draftCount + pendingQuoteCount;

    return res.status(200).json({
      success: true,
      data: {
        total_quotations: totalQuotations,
        draft_quotations: draftCount,
        pending_quotations: pendingQuoteCount,
        confirmed_subscriptions: confirmedCount,
        active_subscriptions: activeCount,
        closed_subscriptions: closedCount,
        total_templates: templatesCount,
        total_customers: customersCount,
        recent_activity: recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};
