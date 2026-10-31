import React from 'react';
import { 
  Building2, 
  Repeat, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export const CustomerPortalView = ({
  subscriptions,
  invoices,
  currency,
  onRecordPayment,
  onViewInvoice,
}) => {
  // Focus on customer's active items
  const customerSubs = subscriptions || [];
  const customerInvoices = invoices || [];
  const unpaidInvoices = customerInvoices.filter((inv) => inv.status !== 'Paid');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Customer Organization Header */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(13, 20, 36, 0.8) 0%, rgba(10, 24, 46, 0.7) 100%)',
          border: '1px solid var(--glass-border-bright)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0066FF 0%, #14B8A6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(0, 102, 255, 0.3)',
            }}
          >
            <Building2 size={28} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-active">Enterprise Tier</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>Client ID: CUST-ACME-2026</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', color: '#FFFFFF', marginTop: '4px' }}>
              Acme Global Enterprises
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--silver-300)' }}>
              client@business.com • Recurring Invoicing & Self-Service Portal
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge badge-paid" style={{ padding: '6px 14px', fontSize: '0.8125rem' }}>
            <ShieldCheck size={14} /> Verified Enterprise RBAC
          </span>
        </div>
      </div>

      {/* 2. Outstanding Invoices Alert Card (if any) */}
      {unpaidInvoices.length > 0 && (
        <div
          className="glass-panel"
          style={{
            padding: '20px 24px',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            background: 'rgba(244, 63, 94, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(244, 63, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FB7185',
              }}
            >
              <Clock size={20} />
            </div>

            <div>
              <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.95rem' }}>
                {unpaidInvoices.length} Unpaid Invoices Requiring Settlement
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--silver-300)' }}>
                Please reconcile your overdue subscription balances to prevent service suspension.
              </div>
            </div>
          </div>

          <button
            onClick={() => onRecordPayment(unpaidInvoices[0])}
            className="btn btn-teal"
            style={{ borderRadius: 'var(--radius-pill)', padding: '8px 18px' }}
          >
            <CreditCard size={15} />
            <span>Pay Invoice ({formatCurrency(unpaidInvoices[0].total_amount, currency)})</span>
          </button>
        </div>
      )}

      {/* 3. Customer's Active Subscriptions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>Active Subscriptions & Licenses</h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {customerSubs.map((sub) => (
            <div
              key={sub._id}
              className="glass-panel"
              style={{
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#38BDF8', fontWeight: 600 }} className="tabular-nums">
                    {sub.subscription_number}
                  </span>
                  <span className={`badge badge-${sub.status.toLowerCase()}`}>
                    <span className="badge-dot" /> {sub.status}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.15rem', color: '#FFFFFF', marginTop: '10px' }}>
                  {sub.plan?.name || 'Growth Plan'}
                </h4>

                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {sub.items?.map((it, i) => (
                    <div key={i} style={{ fontSize: '0.8125rem', color: 'var(--silver-300)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{it.quantity}x {it.product_name}</span>
                      {it.variant_addon > 0 && (
                        <span style={{ color: '#38BDF8' }}>+${it.variant_addon} variant</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  paddingTop: '12px',
                  borderTop: '1px solid var(--glass-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--silver-400)' }}>Next Auto-Charge</div>
                  <div className="tabular-nums" style={{ fontSize: '0.8125rem', color: 'var(--silver-200)' }}>
                    {formatDate(sub.next_billing_date)}
                  </div>
                </div>

                <div className="tabular-nums text-blue" style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                  {formatCurrency(sub.total_amount, currency)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Customer's Invoices Ledger */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>Billing History & Downloadable Receipts</h3>

        <div className="table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Due Date</th>
                <th>Subtotal</th>
                <th>Taxes</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customerInvoices.map((inv) => (
                <tr key={inv._id}>
                  <td style={{ color: '#38BDF8', fontWeight: 600 }} className="tabular-nums">
                    {inv.invoice_number}
                  </td>
                  <td className="tabular-nums">{formatDate(inv.due_date)}</td>
                  <td className="tabular-nums">{formatCurrency(inv.subtotal, currency)}</td>
                  <td className="tabular-nums" style={{ color: 'var(--silver-400)' }}>{formatCurrency(inv.tax_amount, currency)}</td>
                  <td className="tabular-nums" style={{ fontWeight: 700, color: '#FFFFFF' }}>
                    {formatCurrency(inv.total_amount, currency)}
                  </td>
                  <td>
                    <span className={`badge badge-${inv.status.toLowerCase()}`}>
                      <span className="badge-dot" /> {inv.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="btn btn-ghost btn-sm"
                      >
                        <FileText size={14} /> View Receipt
                      </button>
                      {inv.status !== 'Paid' && (
                        <button
                          onClick={() => onRecordPayment(inv)}
                          className="btn btn-teal btn-sm"
                        >
                          <CreditCard size={14} /> Pay Now
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default CustomerPortalView;
