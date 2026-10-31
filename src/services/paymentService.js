const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const { generateNextId } = require('../utils/sequenceGenerator');

class PaymentService {
  /**
   * Records a payment against an invoice and updates its payment status
   * @param {object} payload 
   * @returns {Promise<{ payment: Payment, invoice: Invoice }>}
   */
  async recordPayment(payload) {
    const {
      invoice_id,
      amount,
      payment_method = 'bank_transfer',
      transaction_reference = '',
      payment_date = new Date(),
      notes = ''
    } = payload;

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      throw new Error('Valid positive payment amount is required');
    }

    const invoice = await Invoice.findById(invoice_id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === 'cancelled') {
      throw new Error('Cannot apply payment to a cancelled invoice');
    }

    if (invoice.status === 'paid' || invoice.amount_due <= 0) {
      throw new Error(`Invoice ${invoice.invoice_number} is already fully paid`);
    }

    if (numericAmount > invoice.amount_due) {
      throw new Error(
        `Payment amount ($${numericAmount}) exceeds remaining amount due ($${invoice.amount_due})`
      );
    }

    const paymentNumber = await generateNextId('PAY');

    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (e) {
      session = null;
    }

    try {
      const payment = new Payment({
        payment_number: paymentNumber,
        invoice_id: invoice._id,
        invoice_number: invoice.invoice_number,
        customer_id: invoice.customer_id,
        customer_name: invoice.customer_name,
        amount: numericAmount,
        payment_method,
        transaction_reference,
        payment_date: new Date(payment_date),
        status: 'completed',
        notes
      });

      if (session) {
        await payment.save({ session });
      } else {
        await payment.save();
      }

      // Reconcile Invoice
      const previousStatus = invoice.status;
      invoice.amount_paid = Math.round((invoice.amount_paid + numericAmount) * 100) / 100;
      invoice.amount_due = Math.round(Math.max(0, invoice.total_amount - invoice.amount_paid) * 100) / 100;

      if (invoice.amount_due <= 0.001) {
        invoice.status = 'paid';
        invoice.payment_status = 'paid';
      } else {
        invoice.payment_status = 'partially_paid';
        // If it was draft, recording payment promotes it
        if (invoice.status === 'draft') {
          invoice.status = 'confirmed';
        }
      }

      invoice.history.push({
        from_status: previousStatus,
        to_status: invoice.status,
        changed_at: new Date(),
        action: 'Payment Applied',
        notes: `Received $${numericAmount} via ${payment_method} (Ref: ${transaction_reference || 'N/A'}). Remaining due: $${invoice.amount_due}`
      });

      if (session) {
        await invoice.save({ session });
        await session.commitTransaction();
        session.endSession();
      } else {
        await invoice.save();
      }

      return { payment, invoice };
    } catch (err) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      throw err;
    }
  }

  /**
   * Retrieves payments for a specific invoice
   * @param {string} invoiceId 
   * @returns {Promise<Array>}
   */
  async getPaymentsByInvoice(invoiceId) {
    return Payment.find({ invoice_id: invoiceId }).sort({ payment_date: -1 });
  }
}

module.exports = new PaymentService();
