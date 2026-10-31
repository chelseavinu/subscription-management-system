import React from 'react';
import { CreditCard, ArrowDownLeft, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export const PaymentsView = ({ payments, currency }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
          <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>Payments & Settlement Ledger</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
            Real-time multi-rail transactions: Bank Wire, Credit Card, UPI, and Cash
          </p>
        </div>

        <span className="badge badge-paid">
          <span className="badge-dot" /> Instant Auto-Reconcile
        </span>
      </div>

      <div className="table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Transaction Date</th>
              <th>Customer</th>
              <th>Invoice Reference</th>
              <th>Payment Method</th>
              <th>Amount Settled</th>
              <th>Reconciliation Notes</th>
              <th style={{ textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments && payments.length > 0 ? (
              payments.map((p, idx) => (
                <tr key={p._id || idx}>
                  <td className="tabular-nums" style={{ color: 'var(--silver-300)' }}>
                    {formatDate(p.payment_date || p.createdAt)}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#FFFFFF' }}>
                      {p.invoice?.customer?.name || 'Client Corporation'}
                    </span>
                  </td>
                  <td style={{ color: '#38BDF8', fontWeight: 600 }} className="tabular-nums">
                    {p.invoice?.invoice_number || 'INV-2026-0001'}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-pill)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--glass-border)',
                        fontSize: '0.75rem',
                        color: 'var(--silver-200)',
                      }}
                    >
                      {p.payment_method}
                    </span>
                  </td>
                  <td className="tabular-nums" style={{ fontWeight: 700, color: '#34D399', fontSize: '0.95rem' }}>
                    +{formatCurrency(p.amount, currency)}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
                    {p.notes || 'Settled'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="badge badge-paid">
                      <span className="badge-dot" /> Settled
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--silver-400)' }}>
                  No payment transactions recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default PaymentsView;
