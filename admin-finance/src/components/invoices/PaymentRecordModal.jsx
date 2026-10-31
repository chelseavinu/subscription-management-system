import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';

export default function PaymentRecordModal({ isOpen, onClose, invoice, onRecordPayment }) {
  const [formData, setFormData] = useState({
    amount: 0,
    payment_method: 'stripe',
    transaction_ref: '',
    notes: ''
  });

  useEffect(() => {
    if (invoice) {
      setFormData({
        amount: invoice.total_amount || 0,
        payment_method: 'stripe',
        transaction_ref: `tx_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        notes: `Settlement for invoice ${invoice.invoice_number}`
      });
    }
  }, [invoice, isOpen]);

  if (!invoice) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onRecordPayment({
      invoice_id: invoice._id,
      invoice_number: invoice.invoice_number,
      customer_name: invoice.customer_name,
      amount: Number(formData.amount) || invoice.total_amount,
      payment_method: formData.payment_method,
      transaction_ref: formData.transaction_ref,
      notes: formData.notes
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Payment for ${invoice.invoice_number}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Invoice Summary Box */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Customer Billable</p>
            <p className="text-sm font-bold text-white">{invoice.customer_name}</p>
            <span className="text-[11px] font-mono text-slate-500">Ref: {invoice.subscription_number}</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Total Due</p>
            <p className="text-xl font-extrabold text-emerald-400 font-mono">
              ${(invoice.total_amount || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Payment Amount */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Settlement Amount ($) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">$</span>
            <input
              type="number"
              step="any"
              min="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Payment Method *
          </label>
          <select
            value={formData.payment_method}
            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 capitalize"
          >
            <option value="stripe">Stripe (Card / Apple Pay)</option>
            <option value="bank_transfer">Wire / ACH Bank Transfer</option>
            <option value="credit_card">Corporate Credit Card (Manual POS)</option>
            <option value="paypal">PayPal Merchant</option>
            <option value="cash">Cash / Cheque Receipt</option>
          </select>
        </div>

        {/* Transaction Reference */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Transaction / Gateway Reference
          </label>
          <input
            type="text"
            value={formData.transaction_ref}
            onChange={(e) => setFormData({ ...formData, transaction_ref: e.target.value })}
            placeholder="e.g. ch_3Nxy882eZvKYlo2C1g9Rtx"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Accounting Notes
          </label>
          <textarea
            rows="2"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Optional audit memo..."
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all active:scale-95 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Mark as Paid</span>
          </button>
        </div>

      </form>
    </Modal>
  );
}
