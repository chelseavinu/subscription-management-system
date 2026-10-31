/**
 * Date utility helper functions for subscription intervals and billing periods
 */

/**
 * Calculates the next billing date based on current date and billing interval
 * @param {Date|string} fromDate 
 * @param {'daily'|'weekly'|'monthly'|'yearly'} interval 
 * @returns {Date}
 */
function calculateNextBillingDate(fromDate, interval) {
  const date = new Date(fromDate);

  switch (interval.toLowerCase()) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }

  return date;
}

/**
 * Calculates due date based on issue date and payment terms
 * @param {Date|string} issueDate 
 * @param {'immediate'|'net_15'|'net_30'|'net_60'} paymentTerms 
 * @returns {Date}
 */
function calculateDueDate(issueDate, paymentTerms) {
  const date = new Date(issueDate);

  switch (paymentTerms) {
    case 'immediate':
      return date;
    case 'net_15':
      date.setDate(date.getDate() + 15);
      return date;
    case 'net_30':
      date.setDate(date.getDate() + 30);
      return date;
    case 'net_60':
      date.setDate(date.getDate() + 60);
      return date;
    default:
      date.setDate(date.getDate() + 15);
      return date;
  }
}

/**
 * Normalizes recurring amount to Monthly Recurring Revenue (MRR) equivalent
 * @param {number} amount 
 * @param {'daily'|'weekly'|'monthly'|'yearly'} interval 
 * @returns {number}
 */
function normalizeToMRR(amount, interval) {
  switch (interval.toLowerCase()) {
    case 'daily':
      return amount * 30.42;
    case 'weekly':
      return (amount * 52) / 12;
    case 'monthly':
      return amount;
    case 'yearly':
      return amount / 12;
    default:
      return amount;
  }
}

module.exports = {
  calculateNextBillingDate,
  calculateDueDate,
  normalizeToMRR
};
