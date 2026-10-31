import React from 'react';
import { Printer, Download, CreditCard, CheckCircle2, ShieldCheck, Building2, Calendar, FileText } from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';

export default function InvoiceDetailModal({ isOpen, onClose, invoice, onRecordPayment }) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice: ${invoice.invoice_number}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        
        {/* Invoice Header Details */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-black text-white">{invoice.invoice_number}</span>
              <Badge status={invoice.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Subscription Ref: <span className="font-mono text-indigo-400">{invoice.subscription_number || 'N/A'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print / PDF
            </button>
            {invoice.status !== 'paid' && (
              <button
                onClick={() => {
                  onClose();
                  onRecordPayment(invoice);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" /> Record Payment
              </button>
            )}
          </div>
        </div>

        {/* Customer & Dates Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 uppercase tracking-wider font-bold block mb-1">Billed To</span>
            <p className="font-bold text-white text-sm">{invoice.customer_name}</p>
            <p className="text-slate-400 mt-0.5">{invoice.customer_email || 'billing@customer.com'}</p>
            <p className="text-slate-500 mt-1 font-mono">Customer ID: {invoice.customer_id}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Issue Date:</span>
              <span className="font-mono text-white font-medium">{invoice.issue_date || '2026-10-31'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Due Date:</span>
              <span className="font-mono text-amber-300 font-semibold">{invoice.due_date || '2026-11-14'}</span>
            </div>
            {invoice.paid_at && (
              <div className="flex justify-between border-t border-slate-800 pt-1 text-emerald-400">
                <span>Paid On:</span>
                <span className="font-mono font-bold">{new Date(invoice.paid_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Itemized Line Items Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Item & Description</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-center">Qty</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Unit Price</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(invoice.items || []).map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/20">
                  <td className="py-3 px-4 font-medium text-white">{item.name}</td>
                  <td className="py-3 px-4 text-center font-mono text-slate-300">{item.qty}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">${(item.unit_price || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white">
                    ${((item.amount || item.unit_price * item.qty) || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="flex justify-end">
          <div className="w-full sm:w-64 space-y-2 p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono text-white">${(invoice.subtotal || invoice.total_amount * 0.82).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Tax (18% GST/VAT):</span>
              <span className="font-mono text-white">${(invoice.tax_amount || invoice.total_amount * 0.18).toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-extrabold text-white">
              <span>Total Due:</span>
              <span className="font-mono text-emerald-400 text-base">${(invoice.total_amount || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </Modal>
  );
}
