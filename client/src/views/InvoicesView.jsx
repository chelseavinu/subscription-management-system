import React, { useState } from 'react';
import { 
  FileText, 
  CreditCard, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Download, 
  X, 
  Check, 
  Copy,
  Calendar,
  Building,
  DollarSign
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export const InvoicesView = ({
  invoices,
  currency,
  onRecordPaymentSubmit,
  onUpdateInvoiceStatus,
  currentRole,
  selectedInvoiceForPay,
  setSelectedInvoiceForPay,
  viewingInvoice,
  setViewingInvoice,
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Payment Modal State
  const [paymentAmount, setPaymentAmount] = useState(
    selectedInvoiceForPay ? selectedInvoiceForPay.total_amount : 0
  );
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submittingPay, setSubmittingPay] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredInvoices = (invoices || []).filter((inv) => {
    const matchesTab = activeTab === 'all' || inv.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvoiceForPay) return;
    setSubmittingPay(true);

    try {
      await onRecordPaymentSubmit({
        invoice_id: selectedInvoiceForPay._id,
        amount: Number(paymentAmount) || selectedInvoiceForPay.total_amount,
        payment_method: paymentMethod,
        notes: paymentNotes || `Payment via ${paymentMethod}`,
      });
      setSelectedInvoiceForPay(null);
    } catch (err) {
      alert(err.message || 'Payment recording failed');
    } finally {
      setSubmittingPay(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>Invoices & Cashflow Engine</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
            Strict tax computation, dynamic variant surcharges, and instant reconciliation
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge badge-active">
            <span className="badge-dot" /> Auto-Invoice Active
          </span>
        </div>
      </div>

      {/* 2. Filter Tabs & Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '4px',
            borderRadius: 'var(--radius-pill)',
            background: 'rgba(10, 16, 30, 0.85)',
            border: '1px solid var(--glass-border)',
            gap: '2px',
          }}
        >
          {['all', 'Paid', 'Confirmed', 'Overdue', 'Draft'].map((tab) => {
            const isSelected = activeTab.toLowerCase() === tab.toLowerCase();
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: isSelected ? 'var(--electric-blue)' : 'transparent',
                  color: isSelected ? '#FFFFFF' : 'var(--silver-400)',
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {tab === 'all' ? 'All' : tab}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--silver-400)' }} />
          <input
            type="text"
            placeholder="Search invoice or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '32px', height: '34px', fontSize: '0.8125rem', borderRadius: 'var(--radius-md)' }}
          />
        </div>
      </div>

      {/* 3. Dense High-Contrast Invoices Table */}
      <div className="table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Customer</th>
              <th>Subscription Ref</th>
              <th>Due Date</th>
              <th>Subtotal</th>
              <th>Tax Amount</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices && filteredInvoices.length > 0 ? (
              filteredInvoices.map((inv) => {
                const isCopied = copiedId === inv.invoice_number;
                const isOverdue = inv.status === 'Overdue' || (new Date(inv.due_date) < new Date() && inv.status !== 'Paid');

                return (
                  <tr key={inv._id || inv.invoice_number}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 600, color: '#38BDF8' }} className="tabular-nums">
                          {inv.invoice_number}
                        </span>
                        <button
                          onClick={() => handleCopy(inv.invoice_number)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '2px', color: isCopied ? '#34D399' : 'var(--silver-500)' }}
                          title="Copy Invoice #"
                        >
                          {isCopied ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: '#FFFFFF' }}>
                          {inv.customer?.name || 'Customer Account'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>
                          {inv.customer?.email}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--silver-300)' }} className="tabular-nums">
                        {inv.subscription?.subscription_number || 'SUB-DIRECT'}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="tabular-nums" style={{ color: isOverdue && inv.status !== 'Paid' ? '#FB7185' : 'var(--silver-200)' }}>
                          {formatDate(inv.due_date)}
                        </span>
                        {isOverdue && inv.status !== 'Paid' && (
                          <span style={{ fontSize: '0.6875rem', color: '#FB7185', fontWeight: 600 }}>
                            (Late)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="tabular-nums">{formatCurrency(inv.subtotal, currency)}</td>
                    <td className="tabular-nums" style={{ color: 'var(--silver-400)' }}>
                      {formatCurrency(inv.tax_amount, currency)}
                    </td>
                    <td className="tabular-nums" style={{ fontWeight: 700, color: '#FFFFFF' }}>
                      {formatCurrency(inv.total_amount, currency)}
                    </td>

                    <td>
                      <span className={`badge badge-${inv.status.toLowerCase()}`}>
                        <span className="badge-dot" />
                        {inv.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => setViewingInvoice(inv)}
                          className="btn btn-ghost btn-sm"
                          title="View Printable Receipt"
                        >
                          <FileText size={14} /> View
                        </button>

                        {inv.status !== 'Paid' && (
                          <button
                            onClick={() => {
                              setSelectedInvoiceForPay(inv);
                              setPaymentAmount(inv.total_amount);
                            }}
                            className="btn btn-teal btn-sm"
                          >
                            <CreditCard size={14} /> Pay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: 'var(--silver-400)' }}>
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Record Payment Modal */}
      {selectedInvoiceForPay && (
        <div className="modal-backdrop" onClick={() => setSelectedInvoiceForPay(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(20, 184, 166, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2DD4BF',
                  }}
                >
                  <CreditCard size={17} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF' }}>Record Payment</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>
                    Reconcile invoice {selectedInvoiceForPay.invoice_number}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedInvoiceForPay(null)}
                className="btn btn-ghost btn-sm"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePaySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.8125rem', color: 'var(--silver-300)' }}>Total Invoice Balance:</span>
                <span className="tabular-nums" style={{ fontWeight: 700, fontSize: '1.1rem', color: '#FFFFFF' }}>
                  {formatCurrency(selectedInvoiceForPay.total_amount, currency)}
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Payment Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedInvoiceForPay.total_amount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-select"
                >
                  <option value="Bank Transfer">Bank Wire Transfer</option>
                  <option value="Credit Card">Credit Card (Stripe Gateway)</option>
                  <option value="UPI">UPI Instant Pay</option>
                  <option value="Cash">Cash / Cheque</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Reference / Transaction Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Bank Ref #TXN-902148"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPay(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPay}
                  className="btn btn-teal"
                  style={{ minWidth: '140px' }}
                >
                  {submittingPay ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Printable Liquid Glass Invoice Receipt Drawer */}
      {viewingInvoice && (
        <div className="modal-backdrop" onClick={() => setViewingInvoice(null)}>
          <div
            className="modal-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '32px', maxWidth: '640px', background: 'var(--navy-900)' }}
          >
            {/* Header / Brand */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '20px', borderBottom: '1px solid var(--glass-border-bright)' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>Brightloop</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>Enterprise Subscription & Recurring Billing</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>Tax ID: US-OD-89410294-HACK</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={`badge badge-${viewingInvoice.status.toLowerCase()}`} style={{ fontSize: '0.875rem', padding: '4px 12px' }}>
                  <span className="badge-dot" /> {viewingInvoice.status}
                </span>
                <div style={{ fontSize: '0.8125rem', color: '#38BDF8', fontWeight: 600, marginTop: '6px' }} className="tabular-nums">
                  {viewingInvoice.invoice_number}
                </div>
              </div>
            </div>

            {/* Bill To & Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '20px 0', fontSize: '0.8125rem' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--silver-400)', textTransform: 'uppercase', fontSize: '0.6875rem' }}>Billed To</div>
                <div style={{ color: '#FFFFFF', fontWeight: 600, marginTop: '4px' }}>{viewingInvoice.customer?.name}</div>
                <div style={{ color: 'var(--silver-300)' }}>{viewingInvoice.customer?.email}</div>
                <div style={{ color: 'var(--silver-400)' }}>Subscription: {viewingInvoice.subscription?.subscription_number || 'Direct'}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, color: 'var(--silver-400)', textTransform: 'uppercase', fontSize: '0.6875rem' }}>Invoice Dates</div>
                <div style={{ color: 'var(--silver-200)', marginTop: '4px' }}>Issued: {formatDate(viewingInvoice.createdAt)}</div>
                <div style={{ color: '#FB7185', fontWeight: 600 }}>Due: {formatDate(viewingInvoice.due_date)}</div>
              </div>
            </div>

            {/* Line Items Table */}
            <div style={{ border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead style={{ background: 'rgba(255, 255, 255, 0.04)', color: 'var(--silver-400)' }}>
                  <tr>
                    <th style={{ padding: '8px 12px' }}>Description</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Price</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingInvoice.items?.map((item, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '10px 12px', color: '#FFFFFF' }}>
                        <div>{item.product_name}</div>
                        {item.variant_addon > 0 && (
                          <div style={{ fontSize: '0.6875rem', color: '#38BDF8' }}>
                            Dynamic Variant Add-on: +${item.variant_addon}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--silver-300)' }}>{item.quantity}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--silver-300)' }} className="tabular-nums">
                        {formatCurrency(item.unit_price + (item.variant_addon || 0), currency)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#FFFFFF', fontWeight: 600 }} className="tabular-nums">
                        {formatCurrency(item.total, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--silver-300)' }}>
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(viewingInvoice.subtotal, currency)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--silver-400)' }}>
                <span>Taxes</span>
                <span className="tabular-nums">+{formatCurrency(viewingInvoice.tax_amount, currency)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', color: '#FFFFFF', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span>Total Amount Due</span>
                <span className="tabular-nums text-blue">{formatCurrency(viewingInvoice.total_amount, currency)}</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
              <button
                onClick={() => window.print()}
                className="btn btn-secondary btn-sm"
              >
                <Printer size={14} /> Print Receipt
              </button>

              <button
                onClick={() => setViewingInvoice(null)}
                className="btn btn-primary btn-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default InvoicesView;
