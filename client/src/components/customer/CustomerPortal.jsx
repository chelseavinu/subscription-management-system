import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  FileText, 
  RefreshCw, 
  Package, 
  CheckCircle2, 
  Calendar,
  AlertTriangle,
  Zap,
  ArrowUpRight,
  Download,
  Printer
} from 'lucide-react';
import Badge from '../common/Badge';
import { downloadReceiptFile, printOrDownloadReceipt } from '../../utils/receiptGenerator';

export default function CustomerPortal({
  currentUser,
  subscriptions = [],
  invoices = [],
  onPayInvoice,
  onViewInvoice,
}) {
  const customerEmail = currentUser?.email || 'client@business.com';
  const customerName = currentUser?.name || 'Customer Organization';

  // Filter subscriptions and invoices for current customer (if not already filtered by backend)
  const mySubscriptions = subscriptions.filter(
    (s) => s.customer_email === customerEmail || s.customer?.email === customerEmail || !s.customer
  );

  const myInvoices = invoices.filter(
    (i) => i.customer_email === customerEmail || i.customer?.email === customerEmail || !i.customer
  );

  const unpaidInvoices = myInvoices.filter(
    (i) => i.status === 'confirmed' || i.status === 'overdue' || i.status === 'Confirmed' || i.status === 'Overdue'
  );

  const activeSubscriptions = mySubscriptions.filter(
    (s) => s.status === 'active' || s.status === 'Active'
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Customer Identity & Welcome Banner */}
      <div className="royal-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-300/10 border border-amber-400/30 flex items-center justify-center font-bold text-lg text-amber-300 shadow-[0_0_20px_-3px_rgba(212,175,55,0.25)]">
              {customerName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  Client Self-Service Portal
                </span>
                <span className="text-xs font-mono text-slate-500">ID: {currentUser?.id ? `CUST-${currentUser.id.slice(-6).toUpperCase()}` : 'CUST-2026-LIVE'}</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight mt-1">
                {customerName}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {customerEmail} • Real-time self-service subscriptions, renewals, and invoice payments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">RBAC Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Unpaid Invoice Callout Banner (if any) */}
      {unpaidInvoices.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-rose-900/20 to-transparent border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">
                {unpaidInvoices.length} Unpaid Invoice(s) Requiring Settlement
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Outstanding subscription balance requires payment to avoid service interruption.
              </p>
            </div>
          </div>

          <button
            onClick={() => onPayInvoice && onPayInvoice(unpaidInvoices[0])}
            className="btn-royal-gold py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-[0_4px_15px_-3px_rgba(212,175,55,0.3)]"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pay Invoice (${(unpaidInvoices[0].total_amount || 0).toLocaleString()})</span>
          </button>
        </div>
      )}

      {/* 3. Customer's Active Subscriptions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Active Subscriptions & Licenses</h2>
            <p className="text-xs text-slate-400">Recurring software modules and services under contract</p>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {activeSubscriptions.length} Active Plan(s)
          </span>
        </div>

        {mySubscriptions.length === 0 ? (
          <div className="royal-card p-12 text-center rounded-2xl">
            <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-white">No active subscriptions found</p>
            <p className="text-xs text-slate-400 mt-1">Your enterprise account does not have active billing commitments yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mySubscriptions.map((sub) => {
              const status = (sub.status || 'Active').toLowerCase();
              return (
                <div key={sub._id || sub.subscription_number} className="royal-card p-5 rounded-2xl flex flex-col justify-between space-y-4 group">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {sub.subscription_number}
                      </span>
                      <Badge status={sub.status} />
                    </div>

                    <h3 className="text-base font-bold text-white mt-3 group-hover:text-amber-200 transition-colors">
                      {sub.plan_name || sub.plan?.name || 'Growth Subscription Plan'}
                    </h3>

                    {/* Line Items & Variants */}
                    <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5">
                      {sub.items?.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                          <span className="truncate pr-2">
                            {it.qty || it.quantity || 1}x {it.product_name || it.name}
                          </span>
                          {(it.variant_addon > 0 || (it.variants_selected && it.variants_selected.length > 0)) && (
                            <span className="text-[10px] font-mono text-amber-400/90 shrink-0">
                              +{it.variant_addon ? `$${it.variant_addon}` : 'Variant'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-end justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Next Auto-Renewal</p>
                      <p className="text-xs font-mono font-medium text-slate-300 mt-0.5">
                        {formatDate(sub.next_billing_date || sub.expiry_date)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Cycle Amount</p>
                      <p className="text-lg font-mono font-bold text-white">
                        ${(sub.billing_cycle_amount || sub.total_amount || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Customer's Billing Ledger & Invoices */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Billing History & Invoices</h2>
            <p className="text-xs text-slate-400">Download and pay invoices directly without email delays</p>
          </div>
        </div>

        <div className="royal-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] border-b border-white/[0.06] text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">Tax (18%)</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {myInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No invoices issued for your account yet.
                    </td>
                  </tr>
                ) : (
                  myInvoices.map((inv) => {
                    const isPaid = (inv.status || '').toLowerCase() === 'paid';
                    return (
                      <tr key={inv._id || inv.invoice_number} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">
                          {inv.invoice_number}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono">
                          {formatDate(inv.issue_date || inv.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono">
                          {formatDate(inv.due_date)}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono">
                          ${(inv.subtotal || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono">
                          ${(inv.tax_amount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-white font-mono">
                          ${(inv.total_amount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge status={inv.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => downloadReceiptFile(inv, { name: customerName, email: customerEmail })}
                              title="Download Official Receipt HTML/PDF"
                              className="royal-pill px-2.5 py-1 rounded-lg text-slate-300 hover:text-white text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer hover:bg-white/[0.08]"
                            >
                              <Download className="w-3.5 h-3.5 text-amber-400" />
                              <span>Receipt</span>
                            </button>
                            {!isPaid && (
                              <button
                                onClick={() => onPayInvoice && onPayInvoice(inv)}
                                className="btn-royal-gold px-2.5 py-1 rounded-lg text-slate-950 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Pay Now</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
