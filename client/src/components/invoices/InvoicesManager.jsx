import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  CreditCard, 
  Eye, 
  ArrowUpDown
} from 'lucide-react';
import Badge from '../common/Badge';
import InvoiceDetailModal from './InvoiceDetailModal';
import PaymentRecordModal from './PaymentRecordModal';

export default function InvoicesManager({
  invoices = [],
  onUpdateInvoiceStatus,
  onRecordPayment
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.subscription_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoiced = invoices.reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0);
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0);
  const totalOverdue = invoices.filter((i) => i.status === 'overdue').reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0);
  const totalPending = invoices.filter((i) => i.status === 'confirmed').reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0);

  const handleOpenPayment = (invoice) => {
    setSelectedInvoiceForPayment(invoice);
  };

  const handleCompletePayment = async (paymentData) => {
    await onRecordPayment(paymentData);
    setSelectedInvoiceForPayment(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Swiss Header and Quick Stats */}
      <div className="liquid-panel p-6 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
                Invoices & Accounts Receivable
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.05] text-indigo-300 border border-white/[0.08]">
                {invoices.length} Invoices
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Audit trails, automated billing generation records, aging receivables, and instant payment settlement.
            </p>
          </div>
        </div>

        {/* Financial KPI bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="liquid-card p-3.5 rounded-xl">
            <span className="swiss-label">Total Invoiced</span>
            <p className="text-xl font-black text-white font-mono mt-1">${totalInvoiced.toLocaleString()}</p>
          </div>
          <div className="liquid-card p-3.5 rounded-xl border-emerald-500/20">
            <span className="swiss-label text-emerald-400">Total Settled</span>
            <p className="text-xl font-black text-emerald-400 font-mono mt-1">${totalPaid.toLocaleString()}</p>
          </div>
          <div className="liquid-card p-3.5 rounded-xl border-rose-500/25 bg-rose-500/[0.03]">
            <span className="swiss-label text-rose-400">Overdue Due</span>
            <p className="text-xl font-black text-rose-400 font-mono mt-1">${totalOverdue.toLocaleString()}</p>
          </div>
          <div className="liquid-card p-3.5 rounded-xl border-amber-500/20">
            <span className="swiss-label text-amber-400">Pending Due</span>
            <p className="text-xl font-black text-amber-300 font-mono mt-1">${totalPending.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search invoice #, customer name, subscription..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center liquid-pill rounded-xl p-1 text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'All Invoices' },
            { id: 'paid', label: 'Paid' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'confirmed', label: 'Confirmed (Pending)' },
            { id: 'draft', label: 'Draft' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg capitalize text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="liquid-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 text-slate-400 border-b border-white/[0.06] font-semibold">
              <tr>
                <th className="py-3.5 px-4 swiss-label">Invoice #</th>
                <th className="py-3.5 px-4 swiss-label">Customer</th>
                <th className="py-3.5 px-4 swiss-label">Subscription Ref</th>
                <th className="py-3.5 px-4 swiss-label">Issue / Due Date</th>
                <th className="py-3.5 px-4 swiss-label text-right">Amount</th>
                <th className="py-3.5 px-4 swiss-label text-center">Status</th>
                <th className="py-3.5 px-4 swiss-label text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No invoices match your selected filters.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-white/[0.02] transition-colors">
                    
                    {/* Invoice # */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{inv.invoice_number}</span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white leading-tight">{inv.customer_name}</p>
                      <p className="text-[11px] text-slate-400">{inv.customer_email || 'billing@acme.com'}</p>
                    </td>

                    {/* Subscription */}
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {inv.subscription_number || 'N/A'}
                    </td>

                    {/* Dates */}
                    <td className="py-3.5 px-4 font-mono">
                      <p className="text-slate-300">{inv.issue_date || '2026-10-31'}</p>
                      <p className={`text-[11px] ${inv.status === 'overdue' ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
                        Due: {inv.due_date}
                      </p>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right font-mono font-black text-white text-sm">
                      ${Number(inv.total_amount || 0).toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <Badge status={inv.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInvoiceForDetail(inv)}
                          title="View Details"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            title="Record Payment"
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all active:scale-95 flex items-center gap-1 font-sans"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Pay</span>
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal */}
      <InvoiceDetailModal
        isOpen={!!selectedInvoiceForDetail}
        onClose={() => setSelectedInvoiceForDetail(null)}
        invoice={selectedInvoiceForDetail}
        onRecordPayment={handleOpenPayment}
      />

      {/* Payment Recording Modal */}
      <PaymentRecordModal
        isOpen={!!selectedInvoiceForPayment}
        onClose={() => setSelectedInvoiceForPayment(null)}
        invoice={selectedInvoiceForPayment}
        onRecordPayment={handleCompletePayment}
      />

    </div>
  );
}
