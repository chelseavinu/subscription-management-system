const Counter = require('../models/Counter');

/**
 * Atomically generates next sequential ID with prefix and year
 * e.g., SUB-2026-0001, INV-2026-0001, PAY-2026-0001
 * @param {string} prefix - e.g. 'SUB', 'INV', 'PAY'
 * @returns {Promise<string>}
 */
async function generateNextId(prefix) {
  const currentYear = new Date().getFullYear();
  const counterKey = `${prefix}_${currentYear}`;

  try {
    const counter = await Counter.findOneAndUpdate(
      { key: counterKey },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const paddedSeq = String(counter.seq).padStart(4, '0');
    return `${prefix}-${currentYear}-${paddedSeq}`;
  } catch (error) {
    // Fallback timestamp if counter fails
    const fallbackSeq = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${currentYear}-${fallbackSeq}`;
  }
}

module.exports = { generateNextId };
