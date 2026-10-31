const Discount = require('../models/Discount');

/**
 * Service to validate and apply discounts to subscriptions/invoices
 */
class DiscountService {
  /**
   * Validates discount code and computes discount amount
   * @param {string} code 
   * @param {number} subtotal 
   * @param {number} totalQty 
   * @returns {Promise<{ valid: boolean, discountAmount: number, discount: object|null, reason?: string }>}
   */
  async validateAndCalculate(code, subtotal, totalQty = 1) {
    if (!code) {
      return { valid: true, discountAmount: 0, discount: null };
    }

    const discount = await Discount.findOne({
      code: code.trim().toUpperCase(),
      is_active: true
    });

    if (!discount) {
      return { valid: false, discountAmount: 0, discount: null, reason: `Discount code '${code}' is invalid or inactive` };
    }

    // Expiry check
    if (discount.expiry_date && new Date(discount.expiry_date) < new Date()) {
      return { valid: false, discountAmount: 0, discount: null, reason: `Discount code '${code}' has expired` };
    }

    // Usage limit check
    if (discount.usage_limit !== null && discount.times_used >= discount.usage_limit) {
      return { valid: false, discountAmount: 0, discount: null, reason: `Discount code '${code}' has reached its maximum usage limit` };
    }

    // Min quantity check
    if (discount.min_qty > 0 && totalQty < discount.min_qty) {
      return { valid: false, discountAmount: 0, discount: null, reason: `Discount requires a minimum of ${discount.min_qty} items (current: ${totalQty})` };
    }

    // Min amount check
    if (discount.min_amount > 0 && subtotal < discount.min_amount) {
      return { valid: false, discountAmount: 0, discount: null, reason: `Discount requires a minimum order amount of $${discount.min_amount} (current: $${subtotal})` };
    }

    // Calculate discount value
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (subtotal * discount.value) / 100;
      if (discount.max_discount_amount && discountAmount > discount.max_discount_amount) {
        discountAmount = discount.max_discount_amount;
      }
    } else {
      discountAmount = Math.min(discount.value, subtotal);
    }

    return {
      valid: true,
      discountAmount: Math.round(discountAmount * 100) / 100,
      discount
    };
  }

  /**
   * Increments usage counter when discount is confirmed on a subscription
   * @param {string} code 
   */
  async incrementUsage(code) {
    if (!code) return;
    await Discount.findOneAndUpdate(
      { code: code.trim().toUpperCase() },
      { $inc: { times_used: 1 } }
    );
  }
}

module.exports = new DiscountService();
