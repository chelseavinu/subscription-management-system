const Invoice = require('../models/Invoice');

class InvoiceService {
  /**
   * Confirms a draft invoice
   * @param {string} invoiceId 
   * @param {string} user 
   * @returns {Promise<Invoice>}
   */
  async confirmInvoice(invoiceId, user = 'Team Member') {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === 'paid') {
      throw new Error('Invoice is already paid');
    }

    if (invoice.status === 'cancelled') {
      throw new Error('Cannot confirm a cancelled invoice');
    }

    const previousStatus = invoice.status;
    invoice.status = 'confirmed';
    invoice.history.push({
      from_status: previousStatus,
      to_status: 'confirmed',
      changed_at: new Date(),
      action: 'Invoice Confirmed',
      notes: `Confirmed by ${user}`
    });

    await invoice.save();
    return invoice;
  }

  /**
   * Cancels an invoice (unless already paid)
   * @param {string} invoiceId 
   * @param {string} reason 
   * @param {string} user 
   * @returns {Promise<Invoice>}
   */
  async cancelInvoice(invoiceId, reason = 'Cancelled by staff', user = 'Team Member') {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === 'paid' || invoice.amount_paid > 0) {
      throw new Error('Cannot cancel an invoice with payments applied. Process a refund first.');
    }

    const previousStatus = invoice.status;
    invoice.status = 'cancelled';
    invoice.history.push({
      from_status: previousStatus,
      to_status: 'cancelled',
      changed_at: new Date(),
      action: 'Invoice Cancelled',
      notes: `Reason: ${reason} (by ${user})`
    });

    await invoice.save();
    return invoice;
  }

  /**
   * Simulates sending an invoice to the customer
   * @param {string} invoiceId 
   * @returns {Promise<object>}
   */
  async sendInvoice(invoiceId) {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    invoice.sent_at = new Date();
    invoice.history.push({
      from_status: invoice.status,
      to_status: invoice.status,
      changed_at: new Date(),
      action: 'Invoice Dispatched',
      notes: `Electronic invoice sent to ${invoice.customer_email}`
    });

    await invoice.save();

    return {
      message: `Invoice ${invoice.invoice_number} successfully dispatched to ${invoice.customer_email}`,
      sent_at: invoice.sent_at,
      recipient: invoice.customer_email,
      total_amount: invoice.total_amount
    };
  }

  /**
   * Returns clean formatted data for printing an invoice
   * @param {string} invoiceId 
   * @returns {Promise<object>}
   */
  async getPrintableInvoice(invoiceId) {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return {
      company: {
        name: 'Brightloop Software Inc.',
        tax_id: 'US-BL-8899221',
        email: 'billing@brightloop.io',
        address: '100 Innovation Way, Suite 400'
      },
      invoice: invoice
    };
  }
}

module.exports = new InvoiceService();
