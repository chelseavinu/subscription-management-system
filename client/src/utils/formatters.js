/**
 * Currency & Financial Formatting Utilities
 */

const RATES = {
  USD: { symbol: '$', rate: 1.0 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.78 },
  INR: { symbol: '₹', rate: 83.5 },
};

export const formatCurrency = (amount, currency = 'USD') => {
  const num = Number(amount) || 0;
  const config = RATES[currency] || RATES.USD;
  const converted = num * config.rate;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(converted);
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
