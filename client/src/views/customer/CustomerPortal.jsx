import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Repeat, 
  FileText, 
  CreditCard, 
  UserCog, 
  LogOut, 
  ShieldCheck, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  X, 
  ArrowRight,
  Eye,
  Key,
  Lock,
  ChevronRight,
  Clock,
  Sparkles
} from 'lucide-react';
import Logo from '../../components/Logo';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
  getSubscriptionsApi, 
  getInvoicesApi, 
  getPaymentsApi, 
  recordPaymentApi, 
  updateProfileApi, 
  changePasswordApi 
} from '../../services/api';

export const CustomerPortal = ({ 
  user, 
  onLogout, 
  currency, 
  onCurrencyChange, 
  onRoleChange 
}) => {
  const [activeNav, setActiveNav] = useState('overview'); // overview, subscriptions, invoices, payments, settings
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Drawers
  const [selectedSubForDetail, setSelectedSubForDetail] = useState(null);
  const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  // Pay modal form
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submittingPay, setSubmittingPay] = useState(false);

  // Account Settings form
  const [profileName, setProfileName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrMsg, setProfileErrMsg] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrMsg, setPasswordErrMsg] = useState('');

  // Fetch customer-specific data (guaranteed security isolation by backend)
  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const [subsRes, invsRes, paymentsRes] = await Promise.all([
        getSubscriptionsApi().catch(() => ({ data: [] })),
        getInvoicesApi().catch(() => ({ data: [] })),
        getPaymentsApi().catch(() => ({ data: [] })),
      ]);

      setSubscriptions(subsRes?.data || []);
      setInvoices(invsRes?.data || []);
      setPayments(paymentsRes?.data || []);
    } catch (err) {
      console.error('Customer data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, [user]);

  // Derived metrics
  const activeSubs = subscriptions.filter((s) => s.status === 'Active');
  const pendingQuotes = subscriptions.filter((s) => s.status === 'Quotation' || s.status === 'Draft');
  const unpaidInvoices = invoices.filter((i) => i.status !== 'Paid');
  const outstandingAmount = unpaidInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const nextBillingSub = activeSubs.find((s) => s.next_billing_date);

  // Payment Submission
  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvoiceForPay) return;
    setSubmittingPay(true);
    try {
      await recordPaymentApi({
        invoice_id: selectedInvoiceForPay._id,
        amount: Number(paymentAmount) || selectedInvoiceForPay.total_amount,
        payment_method: paymentMethod,
        notes: paymentNotes || `Customer Portal payment via ${paymentMethod}`,
      });
      setSelectedInvoiceForPay(null);
      await loadCustomerData();
    } catch (err) {
      alert(err.message || 'Payment processing failed');
    } finally {
      setSubmittingPay(false);
    }
  };

  // Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrMsg('');
    try {
      await updateProfileApi({ name: profileName });
      setProfileSuccessMsg('Profile name updated successfully.');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err) {
      setProfileErrMsg(err.message || 'Profile update failed.');
    }
  };

  // Password Update
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordSuccessMsg('');
    setPasswordErrMsg('');
    try {
      await changePasswordApi(currentPassword, newPassword);
      setPasswordSuccessMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordSuccessMsg(''), 4000);
    } catch (err) {
      setPasswordErrMsg(err.message || 'Password change failed.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Top Navigation Bar */}
      <header
        className="glass-panel"
        style={{
          position: 'sticky',
          top: '12px',
          zIndex: 100,
          margin: '12px 16px 0 16px',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid var(--glass-border-bright)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Logo size="md" />
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--sophisticated-teal)',
              background: 'rgba(20, 184, 166, 0.12)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid rgba(20, 184, 166, 0.3)',
            }}
          >
            CUSTOMER PORTAL
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Currency Switcher */}
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="form-select"
            style={{
              width: 'auto',
              height: '36px',
              padding: '4px 10px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--silver-200)',
            }}
            aria-label="Currency"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </select>

          {/* Persona Switcher Pill for Evaluation */}
          <select
            value="customer"
            onChange={(e) => onRoleChange(e.target.value)}
            className="form-select"
            style={{
              width: 'auto',
              height: '36px',
              padding: '4px 10px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38BDF8',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              cursor: 'pointer',
            }}
            title="Switch Persona"
          >
            <option value="customer">Persona: Customer (Acme)</option>
            <option value="staff">Switch to: Staff (Sales)</option>
            <option value="admin">Switch to: Admin (Finance)</option>
          </select>

          {/* User Profile Pill & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                fontSize: '0.8125rem',
                color: '#FFFFFF',
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0066FF 0%, #14B8A6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {user?.name ? user.name[0].toUpperCase() : 'C'}
              </div>
              <span>{user?.name || 'Customer Account'}</span>
            </div>

            <button
              onClick={onLogout}
              className="btn btn-ghost btn-sm"
              style={{ color: '#FB7185' }}
              title="Sign Out"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Layout: Customer Sidebar + View Content */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          maxWidth: '1440px',
          width: '100%',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Customer Sidebar Navigation */}
        <aside
          className="glass-panel"
          style={{
            width: '240px',
            margin: '12px 0 16px 16px',
            padding: '20px 12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexShrink: 0,
            border: '1px solid var(--glass-border)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              style={{
                padding: '0 12px 10px',
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--silver-400)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Client Self-Service
            </div>

            {[
              { id: 'overview', label: 'Overview', icon: Home, badge: null },
              { id: 'subscriptions', label: 'My Subscriptions', icon: Repeat, badge: activeSubs.length || null, badgeColor: 'var(--status-emerald)' },
              { id: 'invoices', label: 'My Invoices', icon: FileText, badge: unpaidInvoices.length > 0 ? `${unpaidInvoices.length} Due` : null, badgeColor: 'var(--status-rose)' },
              { id: 'payments', label: 'Payment History', icon: CreditCard, badge: null },
              { id: 'settings', label: 'Account Settings', icon: UserCog, badge: null },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`btn btn-ghost btn-sm ${isActive ? 'active-nav-item' : ''}`}
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: isActive ? 'linear-gradient(90deg, rgba(0, 102, 255, 0.2) 0%, rgba(20, 184, 166, 0.1) 100%)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--silver-300)',
                    border: isActive ? '1px solid rgba(0, 102, 255, 0.4)' : '1px solid transparent',
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={16} color={isActive ? '#38BDF8' : 'var(--silver-400)'} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-pill)',
                        background: item.badgeColor ? `${item.badgeColor}22` : 'rgba(255, 255, 255, 0.08)',
                        color: item.badgeColor || 'var(--silver-200)',
                        border: `1px solid ${item.badgeColor ? `${item.badgeColor}55` : 'rgba(255,255,255,0.1)'}`,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Security Isolation Assurance Widget */}
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(20, 184, 166, 0.06)',
              border: '1px solid rgba(20, 184, 166, 0.2)',
              fontSize: '0.6875rem',
              color: 'var(--silver-400)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2DD4BF', fontWeight: 600 }}>
              <ShieldCheck size={14} />
              <span>Multi-Tenant Security</span>
            </div>
            <span>Authenticated customer isolation active. Data strictly scoped to your organization account.</span>
          </div>
        </aside>

        {/* Viewport Content */}
        <main style={{ flex: 1, padding: '16px 24px 40px 20px', minWidth: 0 }}>
          {/* TAB 1: OVERVIEW */}
          {activeNav === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Personalized Welcome Banner */}
              <div
                className="glass-panel"
                style={{
                  padding: '24px 28px',
                  background: 'linear-gradient(135deg, rgba(13, 20, 36, 0.8) 0%, rgba(10, 25, 47, 0.65) 100%)',
                  border: '1px solid var(--glass-border-bright)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-active">Active Client</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>Account: {user?.email}</span>
                  </div>
                  <h1 style={{ fontSize: '1.75rem', color: '#FFFFFF', marginTop: '6px' }}>
                    Welcome back, {user?.name || 'Valued Client'}
                  </h1>
                  <p style={{ fontSize: '0.875rem', color: 'var(--silver-300)' }}>
                    Manage your recurring software licenses, review billing invoices, and download receipts.
                  </p>
                </div>

                {unpaidInvoices.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedInvoiceForPay(unpaidInvoices[0]);
                      setPaymentAmount(unpaidInvoices[0].total_amount);
                    }}
                    className="btn btn-teal"
                    style={{ borderRadius: 'var(--radius-pill)', padding: '10px 20px' }}
                  >
                    <CreditCard size={16} />
                    <span>Pay Outstanding ({formatCurrency(outstandingAmount, currency)})</span>
                  </button>
                )}
              </div>

              {/* 4 Customer Quick Stats */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                }}
              >
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>Active Subscriptions</span>
                    <Repeat size={16} color="#34D399" />
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF', marginTop: '10px' }}>
                    {activeSubs.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--silver-400)', marginTop: '4px' }}>
                    Out of {subscriptions.length} total contracts
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>Pending Quotations</span>
                    <Clock size={16} color="#FBBF24" />
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF', marginTop: '10px' }}>
                    {pendingQuotes.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--silver-400)', marginTop: '4px' }}>
                    Quotes awaiting your review
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>Outstanding Amount</span>
                    <AlertCircle size={16} color={outstandingAmount > 0 ? '#FB7185' : '#34D399'} />
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 700, color: outstandingAmount > 0 ? '#FB7185' : '#FFFFFF', marginTop: '10px' }}>
                    {formatCurrency(outstandingAmount, currency)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--silver-400)', marginTop: '4px' }}>
                    {unpaidInvoices.length} unpaid invoices
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>Next Auto-Billing Date</span>
                    <Calendar size={16} color="#38BDF8" />
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38BDF8', marginTop: '12px' }}>
                    {nextBillingSub ? formatDate(nextBillingSub.next_billing_date) : 'No upcoming cycle'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--silver-400)', marginTop: '6px' }}>
                    {nextBillingSub?.plan?.name || 'Standard cycle'}
                  </div>
                </div>
              </div>

              {/* Recent Invoices & Subscriptions Split */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                {/* Recent Invoices Card */}
                <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF' }}>Recent Invoices</h3>
                    <button onClick={() => setActiveNav('invoices')} className="btn btn-ghost btn-sm" style={{ color: '#38BDF8' }}>
                      View All
                    </button>
                  </div>

                  <div className="table-container">
                    <table className="glass-table">
                      <thead>
                        <tr>
                          <th>Invoice #</th>
                          <th>Due Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.length > 0 ? (
                          invoices.slice(0, 4).map((inv) => (
                            <tr key={inv._id}>
                              <td style={{ color: '#38BDF8', fontWeight: 600 }} className="tabular-nums">
                                {inv.invoice_number}
                              </td>
                              <td className="tabular-nums">{formatDate(inv.due_date)}</td>
                              <td className="tabular-nums" style={{ fontWeight: 700, color: '#FFFFFF' }}>
                                {formatCurrency(inv.total_amount, currency)}
                              </td>
                              <td>
                                <span className={`badge badge-${inv.status.toLowerCase()}`}>
                                  <span className="badge-dot" /> {inv.status}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                {inv.status !== 'Paid' ? (
                                  <button
                                    onClick={() => {
                                      setSelectedInvoiceForPay(inv);
                                      setPaymentAmount(inv.total_amount);
                                    }}
                                    className="btn btn-teal btn-sm"
                                  >
                                    Pay
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setViewingInvoice(inv)}
                                    className="btn btn-ghost btn-sm"
                                  >
                                    Receipt
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '28px', color: 'var(--silver-400)' }}>
                              No billing invoices generated yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Subscriptions Card */}
                <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF' }}>My Subscriptions</h3>
                    <button onClick={() => setActiveNav('subscriptions')} className="btn btn-ghost btn-sm" style={{ color: '#38BDF8' }}>
                      View All
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {subscriptions.length > 0 ? (
                      subscriptions.slice(0, 3).map((sub) => (
                        <div
                          key={sub._id}
                          style={{
                            padding: '14px',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--glass-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 600, color: '#38BDF8', fontSize: '0.8125rem' }} className="tabular-nums">
                                {sub.subscription_number}
                              </span>
                              <span className={`badge badge-${sub.status.toLowerCase()}`} style={{ fontSize: '0.6875rem' }}>
                                {sub.status}
                              </span>
                            </div>
                            <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.875rem', marginTop: '2px' }}>
                              {sub.plan?.name || 'Growth Plan'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>
                              {sub.items?.length || 1} Products • Billing: {sub.plan?.billing_interval || 'monthly'}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div className="tabular-nums text-blue" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                              {formatCurrency(sub.total_amount, currency)}
                            </div>
                            <button
                              onClick={() => setSelectedSubForDetail(sub)}
                              className="btn btn-ghost btn-sm"
                              style={{ fontSize: '0.75rem', padding: '2px 8px', marginTop: '4px' }}
                            >
                              Details <ChevronRight size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '28px', textAlign: 'center', color: 'var(--silver-400)', fontSize: '0.875rem' }}>
                        No active subscriptions or contracts registered yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY SUBSCRIPTIONS */}
          {activeNav === 'subscriptions' && (
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
                  <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>My Subscriptions & Licenses</h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
                    Active contracts, dynamic variant surcharges, and scheduled renewal terms
                  </p>
                </div>
                <span className="badge badge-active">{activeSubs.length} Active Contracts</span>
              </div>

              <div className="table-container">
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>Subscription #</th>
                      <th>Plan Name</th>
                      <th>Start Date</th>
                      <th>Expiry Date</th>
                      <th>Billing Frequency</th>
                      <th>Price / Cycle</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Inspect Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.length > 0 ? (
                      subscriptions.map((sub) => (
                        <tr key={sub._id}>
                          <td style={{ color: '#38BDF8', fontWeight: 600 }} className="tabular-nums">
                            {sub.subscription_number}
                          </td>
                          <td style={{ fontWeight: 600, color: '#FFFFFF' }}>
                            {sub.plan?.name || 'Growth Plan'}
                          </td>
                          <td className="tabular-nums">{formatDate(sub.start_date)}</td>
                          <td className="tabular-nums">{formatDate(sub.expiry_date)}</td>
                          <td>
                            <span style={{ textTransform: 'capitalize', color: 'var(--sophisticated-teal)', fontWeight: 600, fontSize: '0.8125rem' }}>
                              {sub.plan?.billing_interval || 'monthly'}
                            </span>
                          </td>
                          <td className="tabular-nums" style={{ fontWeight: 700, color: '#FFFFFF' }}>
                            {formatCurrency(sub.total_amount, currency)}
                          </td>
                          <td>
                            <span className={`badge badge-${sub.status.toLowerCase()}`}>
                              <span className="badge-dot" /> {sub.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => setSelectedSubForDetail(sub)}
                              className="btn btn-secondary btn-sm"
                            >
                              <Eye size={14} /> View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--silver-400)' }}>
                          No subscriptions found for your account. Once your sales team issues a contract or quotation, it will appear here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MY INVOICES */}
          {activeNav === 'invoices' && (
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
                  <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>My Invoices & Receipts</h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
                    Itemized tax calculations, payment status, and downloadable receipts
                  </p>
                </div>
                {unpaidInvoices.length > 0 && (
                  <span className="badge badge-overdue">
                    {unpaidInvoices.length} Unpaid ({formatCurrency(outstandingAmount, currency)})
                  </span>
                )}
              </div>

              <div className="table-container">
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Invoice Date</th>
                      <th>Due Date</th>
                      <th>Subtotal</th>
                      <th>Taxes</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.length > 0 ? (
                      invoices.map((inv) => (
                        <tr key={inv._id}>
                          <td style={{ color: '#38BDF8', fontWeight: 600 }} className="tabular-nums">
                            {inv.invoice_number}
                          </td>
                          <td className="tabular-nums">{formatDate(inv.createdAt)}</td>
                          <td className="tabular-nums" style={{ color: inv.status !== 'Paid' ? '#FB7185' : 'var(--silver-300)' }}>
                            {formatDate(inv.due_date)}
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
                              <span className="badge-dot" /> {inv.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                onClick={() => setViewingInvoice(inv)}
                                className="btn btn-ghost btn-sm"
                              >
                                <FileText size={14} /> Receipt
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--silver-400)' }}>
                          No invoices found for your account. Invoices generated from subscription billing cycles will appear here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENT HISTORY */}
          {activeNav === 'payments' && (
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
                  <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>Payment History & Settlements</h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
                    Ledger of all processed transactions and settled recurring cycles
                  </p>
                </div>
                <span className="badge badge-paid">Automated Ledger</span>
              </div>

              <div className="table-container">
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>Transaction Date</th>
                      <th>Invoice Reference</th>
                      <th>Amount Settled</th>
                      <th>Payment Rail</th>
                      <th>Confirmation Notes</th>
                      <th style={{ textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length > 0 ? (
                      payments.map((p, idx) => (
                        <tr key={p._id || idx}>
                          <td className="tabular-nums" style={{ color: 'var(--silver-300)' }}>
                            {formatDate(p.payment_date || p.createdAt)}
                          </td>
                          <td style={{ color: '#38BDF8', fontWeight: 600 }} className="tabular-nums">
                            {p.invoice?.invoice_number || 'INV-SETTLED'}
                          </td>
                          <td className="tabular-nums" style={{ fontWeight: 700, color: '#34D399', fontSize: '0.95rem' }}>
                            {formatCurrency(p.amount, currency)}
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
                          <td style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
                            {p.notes || 'Settled via Customer Portal'}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span className="badge badge-paid">
                              <span className="badge-dot" /> Succeeded
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--silver-400)' }}>
                          No payment transactions recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: ACCOUNT SETTINGS */}
          {activeNav === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
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
                  <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>Account Settings</h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
                    Manage customer profile details and security credentials
                  </p>
                </div>
                <span className="badge badge-active">Customer Role</span>
              </div>

              {/* Profile Details Card */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', marginBottom: '16px' }}>Organization Profile</h3>

                {profileSuccessMsg && (
                  <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34D399', fontSize: '0.8125rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} /> <span>{profileSuccessMsg}</span>
                  </div>
                )}
                {profileErrMsg && (
                  <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.35)', color: '#FB7185', fontSize: '0.8125rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} /> <span>{profileErrMsg}</span>
                  </div>
                )}

                <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Company / Client Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email Address (Read-only)</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="form-input"
                      style={{ opacity: 0.7, cursor: 'not-allowed' }}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
                    Save Profile Changes
                  </button>
                </form>
              </div>

              {/* Password Management Card */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', marginBottom: '16px' }}>Security & Password</h3>

                {passwordSuccessMsg && (
                  <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34D399', fontSize: '0.8125rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} /> <span>{passwordSuccessMsg}</span>
                  </div>
                )}
                {passwordErrMsg && (
                  <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.35)', color: '#FB7185', fontSize: '0.8125rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} /> <span>{passwordErrMsg}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 9 chars, 1 uppercase, 1 lowercase, 1 special char"
                      className="form-input"
                      required
                    />
                    <span className="form-hint">Security policy: strictly &gt; 8 characters, uppercase, lowercase, special character.</span>
                  </div>

                  <button type="submit" className="btn btn-secondary" style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Subscription Line Item Detail Modal */}
      {selectedSubForDetail && (
        <div className="modal-backdrop" onClick={() => setSelectedSubForDetail(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span className="badge badge-active">{selectedSubForDetail.status}</span>
                <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', marginTop: '6px' }} className="tabular-nums">
                  {selectedSubForDetail.subscription_number}
                </h3>
              </div>
              <button onClick={() => setSelectedSubForDetail(null)} className="btn btn-ghost btn-sm">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--silver-300)' }}>
                <span>Plan Cadence</span>
                <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{selectedSubForDetail.plan?.name} ({selectedSubForDetail.plan?.billing_interval})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--silver-300)' }}>
                <span>Next Scheduled Billing</span>
                <span className="tabular-nums">{formatDate(selectedSubForDetail.next_billing_date)}</span>
              </div>

              <div style={{ marginTop: '10px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                <div style={{ fontWeight: 600, color: 'var(--silver-400)', textTransform: 'uppercase', fontSize: '0.6875rem', marginBottom: '8px' }}>
                  Licensed Products & Add-ons
                </div>
                {selectedSubForDetail.items?.map((it, idx) => (
                  <div key={idx} style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: '#FFFFFF', fontWeight: 600 }}>{it.quantity}x {it.product_name}</div>
                      {it.variant_addon > 0 && (
                        <div style={{ color: '#38BDF8', fontSize: '0.75rem' }}>Variant Add-on: +${it.variant_addon}</div>
                      )}
                    </div>
                    <div className="tabular-nums" style={{ color: 'var(--silver-200)', fontWeight: 600 }}>
                      ${(it.unit_price + it.variant_addon) * it.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {selectedSubForDetail.discount && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34D399' }}>
                  <span>Applied Discount ({selectedSubForDetail.discount.code})</span>
                  <span>-{selectedSubForDetail.discount.value}%</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--glass-border)', fontWeight: 700, fontSize: '1.1rem', color: '#FFFFFF' }}>
                <span>Cycle Total</span>
                <span className="tabular-nums text-blue">{formatCurrency(selectedSubForDetail.total_amount, currency)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setSelectedSubForDetail(null)} className="btn btn-primary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {selectedInvoiceForPay && (
        <div className="modal-backdrop" onClick={() => setSelectedInvoiceForPay(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(20, 184, 166, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2DD4BF' }}>
                  <CreditCard size={17} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF' }}>Settle Invoice</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>Reconcile {selectedInvoiceForPay.invoice_number}</p>
                </div>
              </div>
              <button onClick={() => setSelectedInvoiceForPay(null)} className="btn btn-ghost btn-sm">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePaySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--silver-300)' }}>Invoice Total:</span>
                <span className="tabular-nums" style={{ fontWeight: 700, fontSize: '1.1rem', color: '#FFFFFF' }}>
                  {formatCurrency(selectedInvoiceForPay.total_amount, currency)}
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Payment Rail / Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="form-select">
                  <option value="Credit Card">Credit Card (Stripe Corporate)</option>
                  <option value="Bank Transfer">Bank Wire Transfer</option>
                  <option value="UPI">UPI Instant Pay</option>
                </select>
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
                <label className="form-label">Reference / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Card ending 4242 or Wire ref"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setSelectedInvoiceForPay(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submittingPay} className="btn btn-teal" style={{ minWidth: '130px' }}>
                  {submittingPay ? 'Processing...' : 'Confirm & Pay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Receipt View */}
      {viewingInvoice && (
        <div className="modal-backdrop" onClick={() => setViewingInvoice(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ padding: '32px', maxWidth: '640px', background: 'var(--navy-900)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '20px', borderBottom: '1px solid var(--glass-border-bright)' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>Brightloop</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>Subscription & Recurring Billing</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge badge-${viewingInvoice.status.toLowerCase()}`}>
                  <span className="badge-dot" /> {viewingInvoice.status}
                </span>
                <div style={{ fontSize: '0.8125rem', color: '#38BDF8', fontWeight: 600, marginTop: '6px' }} className="tabular-nums">
                  {viewingInvoice.invoice_number}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '20px 0', fontSize: '0.8125rem' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--silver-400)', textTransform: 'uppercase', fontSize: '0.6875rem' }}>Billed To</div>
                <div style={{ color: '#FFFFFF', fontWeight: 600, marginTop: '4px' }}>{viewingInvoice.customer?.name}</div>
                <div style={{ color: 'var(--silver-300)' }}>{viewingInvoice.customer?.email}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, color: 'var(--silver-400)', textTransform: 'uppercase', fontSize: '0.6875rem' }}>Dates</div>
                <div style={{ color: 'var(--silver-200)' }}>Issued: {formatDate(viewingInvoice.createdAt)}</div>
                <div style={{ color: '#FB7185', fontWeight: 600 }}>Due: {formatDate(viewingInvoice.due_date)}</div>
              </div>
            </div>

            <div style={{ border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead style={{ background: 'rgba(255, 255, 255, 0.04)', color: 'var(--silver-400)' }}>
                  <tr>
                    <th style={{ padding: '8px 12px' }}>Item</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Unit Price</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingInvoice.items?.map((item, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '10px 12px', color: '#FFFFFF' }}>{item.product_name}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--silver-300)' }}>{item.quantity}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--silver-300)' }} className="tabular-nums">
                        {formatCurrency(item.unit_price, currency)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#FFFFFF', fontWeight: 600 }} className="tabular-nums">
                        {formatCurrency(item.total, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--silver-300)' }}>
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(viewingInvoice.subtotal, currency)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--silver-400)' }}>
                <span>Tax</span>
                <span className="tabular-nums">+{formatCurrency(viewingInvoice.tax_amount, currency)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', color: '#FFFFFF', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span>Total Amount Due</span>
                <span className="tabular-nums text-blue">{formatCurrency(viewingInvoice.total_amount, currency)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
              <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
                <Printer size={14} /> Print Receipt
              </button>
              <button onClick={() => setViewingInvoice(null)} className="btn btn-primary btn-sm">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;
