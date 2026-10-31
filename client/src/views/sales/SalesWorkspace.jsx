import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Layers, 
  PlusCircle, 
  FileCheck, 
  Repeat, 
  LogOut, 
  Search, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  User, 
  Calendar, 
  Sparkles, 
  Eye, 
  X,
  Tag,
  Briefcase
} from 'lucide-react';
import Logo from '../../components/Logo';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
  getSalesOverviewApi, 
  getQuotationTemplatesApi, 
  getCustomersApi, 
  getProductsApi, 
  getPlansApi, 
  getSubscriptionsApi, 
  createSubscriptionApi, 
  updateSubscriptionStatusApi 
} from '../../services/api';

export const SalesWorkspace = ({ 
  user, 
  onLogout, 
  currency, 
  onCurrencyChange, 
  onRoleChange 
}) => {
  const [activeNav, setActiveNav] = useState('overview'); // overview, templates, create-quote, quotations, subscriptions
  const [salesOverview, setSalesOverview] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Template Search & Category Filter
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState('all');
  const [inspectingTemplate, setInspectingTemplate] = useState(null);
  const [inspectingQuotation, setInspectingQuotation] = useState(null);

  // ==========================================
  // 5-STEP CREATE QUOTATION WIZARD STATE
  // ==========================================
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Configured quote fields (populated from template)
  const [quotePlanId, setQuotePlanId] = useState('');
  const [quoteItems, setQuoteItems] = useState([]);
  const [quotePaymentTerms, setQuotePaymentTerms] = useState('Net 30');
  const [quoteValidityDays, setQuoteValidityDays] = useState(30);
  const [quoteDiscountCode, setQuoteDiscountCode] = useState('SALES10');
  const [quoteDiscountPct, setQuoteDiscountPct] = useState(10);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [createdQuotationResult, setCreatedQuotationResult] = useState(null);
  const [quoteErrorMsg, setQuoteErrorMsg] = useState('');

  // Fetch sales workspace data
  const loadSalesData = async () => {
    try {
      setLoading(true);
      const [
        overviewRes,
        templatesRes,
        customersRes,
        productsRes,
        plansRes,
        subsRes,
      ] = await Promise.all([
        getSalesOverviewApi().catch(() => ({ data: null })),
        getQuotationTemplatesApi().catch(() => ({ data: [] })),
        getCustomersApi().catch(() => ({ data: [] })),
        getProductsApi().catch(() => ({ data: [] })),
        getPlansApi().catch(() => ({ data: [] })),
        getSubscriptionsApi().catch(() => ({ data: [] })),
      ]);

      if (overviewRes?.data) setSalesOverview(overviewRes.data);
      if (templatesRes?.data) setTemplates(templatesRes.data);
      if (customersRes?.data) setCustomers(customersRes.data);
      if (productsRes?.data) setProducts(productsRes.data);
      if (plansRes?.data) setPlans(plansRes.data);
      if (subsRes?.data) setSubscriptions(subsRes.data);
    } catch (err) {
      console.error('Sales data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesData();
  }, [user]);

  // When a template is selected in Step 1, pre-populate all fields
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setQuotePlanId(template.plan?._id || template.plan);
    setQuotePaymentTerms(template.payment_terms || 'Net 30');
    setQuoteValidityDays(template.validity_days || 30);
    setQuoteDiscountCode(template.discount?.code || 'SALES10');
    setQuoteDiscountPct(template.discount?.value || 10);

    const mappedItems = template.items?.map((it) => ({
      product_id: it.product?._id || it.product,
      product_name: it.product_name,
      quantity: it.quantity || 1,
      unit_price: it.unit_price || 0,
      variant_name: it.variant_name || '',
      variant_addon: it.variant_addon || 0,
      tax_pct: it.tax_pct || 10,
    })) || [];

    setQuoteItems(mappedItems);
    setCurrentStep(2); // advance to customer selection
    setActiveNav('create-quote');
  };

  // Filter templates
  const filteredTemplates = templates.filter((tpl) => {
    const matchesSearch =
      tpl.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      tpl.description.toLowerCase().includes(templateSearch.toLowerCase());
    const matchesCategory =
      templateCategory === 'all' || tpl.category.toLowerCase() === templateCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Quotations list (subscriptions in 'Quotation' or 'Draft' status)
  const quotationsList = subscriptions.filter(
    (s) => s.status === 'Quotation' || s.status === 'Draft'
  );

  // Dynamic calculations for Step 4 & 5
  const selectedPlanObj = plans.find((p) => p._id === quotePlanId) || plans[0];
  const itemsSubtotal = quoteItems.reduce(
    (acc, it) => acc + (Number(it.unit_price) + Number(it.variant_addon)) * Number(it.quantity),
    0
  );
  const planBase = selectedPlanObj?.base_price || 0;
  const preDiscountSubtotal = itemsSubtotal + planBase;
  const discountVal = (preDiscountSubtotal * quoteDiscountPct) / 100;
  const afterDiscount = preDiscountSubtotal - discountVal;
  const totalTax = quoteItems.reduce((acc, it) => {
    const lineTotal = (Number(it.unit_price) + Number(it.variant_addon)) * Number(it.quantity);
    return acc + (lineTotal * (Number(it.tax_pct) / 100));
  }, 0);
  const calculatedGrandTotal = Math.round((afterDiscount + totalTax) * 100) / 100;

  // Submit Final Quotation to Backend
  const handleSubmitQuotation = async () => {
    if (!selectedCustomer) {
      alert('Please select a customer for this quotation.');
      setCurrentStep(2);
      return;
    }

    setIsSubmittingQuote(true);
    setQuoteErrorMsg('');

    try {
      const startDate = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + Number(quoteValidityDays));

      const res = await createSubscriptionApi({
        customer_id: selectedCustomer._id,
        plan_id: selectedPlanObj?._id,
        status: 'Quotation', // Quotations start in Quotation lifecycle state!
        items: quoteItems,
        discount: {
          code: quoteDiscountCode,
          discount_type: 'percentage',
          value: quoteDiscountPct,
        },
        start_date: startDate,
        expiry_date: expiryDate,
      });

      if (res?.data) {
        setCreatedQuotationResult(res.data);
        await loadSalesData();
        setCurrentStep(6); // Success confirmation step
      }
    } catch (err) {
      setQuoteErrorMsg(err.message || 'Failed to submit quotation.');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  // Status transition handler
  const handleAdvanceStatus = async (subId, nextStatus) => {
    try {
      await updateSubscriptionStatusApi(subId, nextStatus);
      await loadSalesData();
    } catch (err) {
      alert(err.message || 'Status transition failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Top Navbar */}
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
            SALES WORKSPACE
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
            value="staff"
            onChange={(e) => onRoleChange(e.target.value)}
            className="form-select"
            style={{
              width: 'auto',
              height: '36px',
              padding: '4px 10px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(20, 184, 166, 0.15)',
              color: '#2DD4BF',
              border: '1px solid rgba(20, 184, 166, 0.35)',
              cursor: 'pointer',
            }}
            title="Switch Persona"
          >
            <option value="staff">Persona: Staff (Sales Workspace)</option>
            <option value="customer">Switch to: Customer Portal</option>
            <option value="admin">Switch to: Admin Finance Dashboard</option>
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
                  background: 'linear-gradient(135deg, #14B8A6 0%, #0066FF 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {user?.name ? user.name[0].toUpperCase() : 'S'}
              </div>
              <span>{user?.name || 'Sales Representative'}</span>
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

      {/* Main Split Layout: Sales Sidebar + Content View */}
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
        {/* Sales Navigation Sidebar */}
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
              Sales Suite
            </div>

            {[
              { id: 'overview', label: 'Sales Overview', icon: TrendingUp, badge: null },
              { id: 'templates', label: 'Quotation Templates', icon: Layers, badge: templates.length || 3 },
              { id: 'create-quote', label: 'Create Quotation', icon: PlusCircle, badge: '5-Step' },
              { id: 'quotations', label: 'Quotations', icon: FileCheck, badge: quotationsList.length || null, badgeColor: 'var(--status-amber)' },
              { id: 'subscriptions', label: 'Subscriptions', icon: Repeat, badge: subscriptions.length || null, badgeColor: 'var(--status-emerald)' },
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
                    background: isActive ? 'linear-gradient(90deg, rgba(20, 184, 166, 0.2) 0%, rgba(0, 102, 255, 0.1) 100%)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--silver-300)',
                    border: isActive ? '1px solid rgba(20, 184, 166, 0.4)' : '1px solid transparent',
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={16} color={isActive ? '#2DD4BF' : 'var(--silver-400)'} />
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

          {/* Quick Create Action Card */}
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(20, 184, 166, 0.05)',
              border: '1px solid rgba(20, 184, 166, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2DD4BF', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={14} />
              <span>CPQ Engine</span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--silver-400)' }}>
              Auto-calculate surcharges, Net payment terms, and validity windows.
            </div>
            <button
              onClick={() => {
                setCurrentStep(1);
                setActiveNav('create-quote');
              }}
              className="btn btn-teal btn-sm"
              style={{ width: '100%', marginTop: '4px' }}
            >
              <PlusCircle size={14} /> New Quote
            </button>
          </div>
        </aside>

        {/* Viewport Content */}
        <main style={{ flex: 1, padding: '16px 24px 40px 20px', minWidth: 0 }}>
          {/* TAB 1: SALES OVERVIEW */}
          {activeNav === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                    <span className="badge badge-confirmed">Sales Operations</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>CPQ Pipeline Active</span>
                  </div>
                  <h1 style={{ fontSize: '1.75rem', color: '#FFFFFF', marginTop: '6px' }}>
                    Sales Representative Workspace
                  </h1>
                  <p style={{ fontSize: '0.875rem', color: 'var(--silver-300)' }}>
                    Convert opportunities with pre-configured quotation templates, dynamic variant add-ons, and contract pipelines.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setActiveNav('create-quote');
                  }}
                  className="btn btn-primary"
                  style={{ borderRadius: 'var(--radius-pill)', padding: '10px 20px' }}
                >
                  <PlusCircle size={16} />
                  <span>Start Quotation Wizard</span>
                </button>
              </div>

              {/* 5 Sales Metrics Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                  gap: '14px',
                }}
              >
                <div className="glass-panel" style={{ padding: '18px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>Total Quotations</span>
                  <div className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 700, color: '#FFFFFF', marginTop: '8px' }}>
                    {salesOverview?.total_quotations || quotationsList.length}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#38BDF8', marginTop: '4px' }}>Draft & Pending Pipeline</div>
                </div>

                <div className="glass-panel" style={{ padding: '18px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>Draft Quotations</span>
                  <div className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--status-slate)', marginTop: '8px' }}>
                    {salesOverview?.draft_quotations || 0}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--silver-400)', marginTop: '4px' }}>Internal preparation</div>
                </div>

                <div className="glass-panel" style={{ padding: '18px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>Pending Quotations</span>
                  <div className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 700, color: '#FBBF24', marginTop: '8px' }}>
                    {salesOverview?.pending_quotations || quotationsList.length}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#FBBF24', marginTop: '4px' }}>Awaiting client signoff</div>
                </div>

                <div className="glass-panel" style={{ padding: '18px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>Confirmed Subscriptions</span>
                  <div className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 700, color: '#38BDF8', marginTop: '8px' }}>
                    {salesOverview?.confirmed_subscriptions || 1}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#38BDF8', marginTop: '4px' }}>Ready for activation</div>
                </div>

                <div className="glass-panel" style={{ padding: '18px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>Active Subscriptions</span>
                  <div className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 700, color: '#34D399', marginTop: '8px' }}>
                    {salesOverview?.active_subscriptions || 2}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#34D399', marginTop: '4px' }}>Generating recurring revenue</div>
                </div>
              </div>

              {/* Recent Sales Activity Table */}
              <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF' }}>Recent Sales Activity</h3>
                  <button onClick={() => setActiveNav('quotations')} className="btn btn-ghost btn-sm" style={{ color: '#38BDF8' }}>
                    View All Quotations
                  </button>
                </div>

                <div className="table-container">
                  <table className="glass-table">
                    <thead>
                      <tr>
                        <th>Contract / Quote #</th>
                        <th>Client</th>
                        <th>Plan</th>
                        <th>Amount</th>
                        <th>Lifecycle Stage</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(salesOverview?.recent_activity || subscriptions).length > 0 ? (
                        (salesOverview?.recent_activity || subscriptions).slice(0, 6).map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td style={{ color: '#38BDF8', fontWeight: 600 }} className="tabular-nums">
                              {item.subscription_number}
                            </td>
                            <td style={{ color: '#FFFFFF', fontWeight: 500 }}>
                              {item.customer_name || item.customer?.name}
                            </td>
                            <td>{item.plan_name || item.plan?.name}</td>
                            <td className="tabular-nums" style={{ fontWeight: 700, color: '#FFFFFF' }}>
                              {formatCurrency(item.amount || item.total_amount, currency)}
                            </td>
                            <td>
                              <span className={`badge badge-${(item.status || 'draft').toLowerCase()}`}>
                                <span className="badge-dot" /> {item.status}
                              </span>
                            </td>
                            <td className="tabular-nums" style={{ color: 'var(--silver-400)' }}>
                              {formatDate(item.date || item.createdAt)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--silver-400)' }}>
                            No recent sales transactions recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUOTATION TEMPLATES */}
          {activeNav === 'templates' && (
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
                  <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>Quotation Templates Catalog</h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
                    Standardized product bundles, pre-configured variant surcharges, and default payment terms
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ position: 'relative', width: '220px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--silver-400)' }} />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '32px', height: '34px', fontSize: '0.8125rem', borderRadius: 'var(--radius-md)' }}
                    />
                  </div>

                  <select
                    value={templateCategory}
                    onChange={(e) => setTemplateCategory(e.target.value)}
                    className="form-select"
                    style={{ width: 'auto', height: '34px', fontSize: '0.8125rem', borderRadius: 'var(--radius-md)' }}
                  >
                    <option value="all">All Categories</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="SMB">SMB</option>
                    <option value="AI Modules">AI Modules</option>
                  </select>
                </div>
              </div>

              {/* Template Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                  gap: '18px',
                }}
              >
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((tpl) => (
                    <div
                      key={tpl._id}
                      className="glass-panel"
                      style={{
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '16px',
                        border: '1px solid var(--glass-border-bright)',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="badge badge-active">{tpl.category}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>Terms: {tpl.payment_terms}</span>
                        </div>

                        <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', marginTop: '10px' }}>
                          {tpl.name}
                        </h3>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--silver-300)', marginTop: '4px' }}>
                          {tpl.description}
                        </p>

                        {/* Associated Plan */}
                        <div
                          style={{
                            margin: '12px 0',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--glass-border)',
                            fontSize: '0.75rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span style={{ color: 'var(--silver-400)' }}>Associated Cadence:</span>
                          <span style={{ color: '#38BDF8', fontWeight: 600 }}>
                            {tpl.plan?.name} (${tpl.plan?.base_price} / {tpl.plan?.billing_interval})
                          </span>
                        </div>

                        {/* Associated Products & Surcharges Preview */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--silver-400)', textTransform: 'uppercase' }}>
                            Included Items ({tpl.items?.length || 0})
                          </span>
                          {tpl.items?.map((it, idx) => (
                            <div key={idx} style={{ fontSize: '0.75rem', color: 'var(--silver-300)', display: 'flex', justifyContent: 'space-between' }}>
                              <span>{it.quantity}x {it.product_name}</span>
                              <span style={{ color: it.variant_addon > 0 ? '#38BDF8' : 'var(--silver-400)' }}>
                                ${it.unit_price} {it.variant_addon > 0 ? `(+$${it.variant_addon} addon)` : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', paddingTop: '14px', borderTop: '1px solid var(--glass-border)' }}>
                        <button
                          onClick={() => setInspectingTemplate(tpl)}
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1 }}
                        >
                          <Eye size={14} /> Inspect Details
                        </button>
                        <button
                          onClick={() => handleSelectTemplate(tpl)}
                          className="btn btn-teal btn-sm"
                          style={{ flex: 1 }}
                        >
                          <Check size={14} /> Select Template
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '36px', textAlign: 'center', color: 'var(--silver-400)' }}>
                    No quotation templates match your filter criteria.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: 5-STEP CREATE QUOTATION WIZARD */}
          {activeNav === 'create-quote' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
              {/* Wizard Progress Stepper */}
              <div
                className="glass-panel"
                style={{
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  overflowX: 'auto',
                }}
              >
                {[
                  { step: 1, label: 'Select Template' },
                  { step: 2, label: 'Select Customer' },
                  { step: 3, label: 'Review Products' },
                  { step: 4, label: 'Configure Details' },
                  { step: 5, label: 'Review & Submit' },
                ].map((s) => (
                  <div
                    key={s.step}
                    onClick={() => { if (s.step < currentStep || selectedTemplate) setCurrentStep(s.step); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      opacity: currentStep === s.step ? 1 : currentStep > s.step ? 0.8 : 0.4,
                    }}
                  >
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: currentStep >= s.step ? 'var(--sophisticated-teal)' : 'rgba(255,255,255,0.1)',
                        color: currentStep >= s.step ? '#FFFFFF' : 'var(--silver-400)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {currentStep > s.step ? '✓' : s.step}
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: currentStep === s.step ? '#FFFFFF' : 'var(--silver-300)', whiteSpace: 'nowrap' }}>
                      {s.label}
                    </span>
                    {s.step < 5 && <span style={{ color: 'var(--silver-500)', margin: '0 4px' }}>→</span>}
                  </div>
                ))}
              </div>

              {quoteErrorMsg && (
                <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.35)', color: '#FB7185', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} /> <span>{quoteErrorMsg}</span>
                </div>
              )}

              {/* STEP 1: SELECT TEMPLATE */}
              {currentStep === 1 && (
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>Step 1: Choose a Quotation Template</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
                    Templates automatically configure associated software products, variant pricing surcharges, and payment terms.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                    {templates.length > 0 ? (
                      templates.map((tpl) => (
                        <div
                          key={tpl._id}
                          onClick={() => handleSelectTemplate(tpl)}
                          className="glass-interactive"
                          style={{
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            background: selectedTemplate?._id === tpl._id ? 'rgba(20, 184, 166, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                            border: selectedTemplate?._id === tpl._id ? '1px solid var(--sophisticated-teal)' : '1px solid var(--glass-border)',
                            cursor: 'pointer',
                          }}
                        >
                          <span className="badge badge-confirmed" style={{ fontSize: '0.6875rem' }}>{tpl.category}</span>
                          <h4 style={{ fontSize: '1.05rem', color: '#FFFFFF', marginTop: '8px' }}>{tpl.name}</h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--silver-400)', marginTop: '4px' }}>{tpl.description}</p>
                          <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#2DD4BF', fontWeight: 600 }}>
                            Select Template →
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ gridColumn: '1 / -1', padding: '24px', textAlign: 'center', color: 'var(--silver-400)' }}>
                        No quotation templates loaded.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: SELECT CUSTOMER */}
              {currentStep === 2 && (
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>Step 2: Select Customer Account</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
                    Select the target client organization for this formal quotation.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {customers.length > 0 ? (
                      customers.map((cust) => (
                        <div
                          key={cust._id}
                          onClick={() => setSelectedCustomer(cust)}
                          style={{
                            padding: '14px 18px',
                            borderRadius: 'var(--radius-md)',
                            background: selectedCustomer?._id === cust._id ? 'rgba(20, 184, 166, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                            border: selectedCustomer?._id === cust._id ? '1px solid var(--sophisticated-teal)' : '1px solid var(--glass-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8' }}>
                              <User size={16} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{cust.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>{cust.email}</div>
                            </div>
                          </div>

                          {selectedCustomer?._id === cust._id && (
                            <span className="badge badge-active">Selected</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--silver-400)' }}>
                        No customer accounts found in the database.
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <button onClick={() => setCurrentStep(1)} className="btn btn-secondary">
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button
                      onClick={() => {
                        if (!selectedCustomer) alert('Please choose a customer');
                        else setCurrentStep(3);
                      }}
                      className="btn btn-teal"
                    >
                      Next: Review Products <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: REVIEW PRODUCTS AND PLANS */}
              {currentStep === 3 && (
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>Step 3: Review Products & Associated Plan</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
                    Auto-populated from template: <strong>{selectedTemplate?.name}</strong>
                  </p>

                  {/* Plan Selector */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Billing Plan Cadence</label>
                    <select
                      value={quotePlanId}
                      onChange={(e) => setQuotePlanId(e.target.value)}
                      className="form-select"
                    >
                      {plans.map((pl) => (
                        <option key={pl._id} value={pl._id}>
                          {pl.name} (${pl.base_price} / {pl.billing_interval})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Items list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label className="form-label">Software Lines & Variant Surcharges</label>
                    {quoteItems.map((it, idx) => (
                      <div
                        key={idx}
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
                        <div>
                          <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{it.product_name}</div>
                          {it.variant_addon > 0 && (
                            <div style={{ fontSize: '0.75rem', color: '#38BDF8' }}>
                              Dynamic Variant: {it.variant_name} (+${it.variant_addon} surcharge)
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="tabular-nums" style={{ color: '#FFFFFF', fontWeight: 600 }}>
                            {it.quantity} license(s) @ ${it.unit_price}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--silver-400)' }}>Tax: {it.tax_pct}%</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <button onClick={() => setCurrentStep(2)} className="btn btn-secondary">
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button onClick={() => setCurrentStep(4)} className="btn btn-teal">
                      Next: Configure Quantities & Terms <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: CONFIGURE QUANTITIES AND QUOTATION DETAILS */}
              {currentStep === 4 && (
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>Step 4: Configure Quotation Terms & Quantities</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
                    Adjust license quantities, validity window, and payment terms.
                  </p>

                  {/* Quantity adjustments */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {quoteItems.map((it, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '14px',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--glass-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{it.product_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>
                            Base ${it.unit_price} + Surcharge ${it.variant_addon}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--silver-300)' }}>Quantity:</label>
                          <input
                            type="number"
                            min="1"
                            max="500"
                            value={it.quantity}
                            onChange={(e) => {
                              const val = Math.max(1, parseInt(e.target.value) || 1);
                              const updated = [...quoteItems];
                              updated[idx].quantity = val;
                              setQuoteItems(updated);
                            }}
                            className="form-input"
                            style={{ width: '80px', height: '34px' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Terms & Validity */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Payment Terms</label>
                      <select
                        value={quotePaymentTerms}
                        onChange={(e) => setQuotePaymentTerms(e.target.value)}
                        className="form-select"
                      >
                        <option value="Immediate">Immediate Payment</option>
                        <option value="Net 15">Net 15 Days</option>
                        <option value="Net 30">Net 30 Days</option>
                        <option value="Net 60">Net 60 Days</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Quotation Validity (Days)</label>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={quoteValidityDays}
                        onChange={(e) => setQuoteValidityDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Discount */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Sales Discount Code</label>
                      <input
                        type="text"
                        value={quoteDiscountCode}
                        onChange={(e) => setQuoteDiscountCode(e.target.value.toUpperCase())}
                        className="form-input"
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Discount Percentage (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={quoteDiscountPct}
                        onChange={(e) => setQuoteDiscountPct(Math.max(0, parseInt(e.target.value) || 0))}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <button onClick={() => setCurrentStep(3)} className="btn btn-secondary">
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button onClick={() => setCurrentStep(5)} className="btn btn-teal">
                      Next: Review Pricing <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW PRICING & SUBMIT QUOTATION */}
              {currentStep === 5 && (
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>Step 5: Review Final Quotation & Pricing</h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
                        Prepared for: <strong>{selectedCustomer?.name}</strong> ({selectedCustomer?.email})
                      </p>
                    </div>
                    <span className="badge badge-quotation">Status: Quotation</span>
                  </div>

                  {/* Summary Breakdown Card */}
                  <div
                    style={{
                      padding: '18px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(10, 16, 30, 0.95)',
                      border: '1px solid var(--glass-border-bright)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--silver-300)' }}>
                      <span>Selected Plan Cadence:</span>
                      <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{selectedPlanObj?.name} (${planBase})</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--silver-300)' }}>
                      <span>Payment Terms & Validity:</span>
                      <span style={{ color: '#FFFFFF' }}>{quotePaymentTerms} • Valid for {quoteValidityDays} days</span>
                    </div>

                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '8px' }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--silver-400)', textTransform: 'uppercase' }}>
                        Itemized Pricing
                      </span>
                      {quoteItems.map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', color: 'var(--silver-300)' }}>
                          <span>{it.quantity}x {it.product_name} {it.variant_addon > 0 ? `(+$${it.variant_addon})` : ''}</span>
                          <span className="tabular-nums">${(it.unit_price + it.variant_addon) * it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {quoteDiscountPct > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34D399' }}>
                        <span>Sales Discount ({quoteDiscountCode} - {quoteDiscountPct}%)</span>
                        <span className="tabular-nums">-${discountVal.toFixed(2)}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--silver-400)' }}>
                      <span>Estimated Taxes</span>
                      <span className="tabular-nums">+${totalTax.toFixed(2)}</span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingTop: '10px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        color: '#FFFFFF',
                      }}
                    >
                      <span>Final Quotation Value</span>
                      <span className="tabular-nums text-blue">{formatCurrency(calculatedGrandTotal, currency)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <button onClick={() => setCurrentStep(4)} className="btn btn-secondary">
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button
                      onClick={handleSubmitQuotation}
                      disabled={isSubmittingQuote}
                      className="btn btn-primary btn-lg"
                      style={{ minWidth: '180px' }}
                    >
                      {isSubmittingQuote ? 'Submitting Quote...' : 'Submit Quotation to Client'}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: CONFIRMATION & NAVIGATION */}
              {currentStep === 6 && createdQuotationResult && (
                <div
                  className="glass-panel"
                  style={{
                    padding: '36px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'rgba(20, 184, 166, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2DD4BF',
                    }}
                  >
                    <CheckCircle2 size={32} />
                  </div>

                  <h3 style={{ fontSize: '1.5rem', color: '#FFFFFF' }}>
                    Quotation Created Successfully!
                  </h3>

                  <div
                    style={{
                      padding: '12px 24px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'rgba(56, 189, 248, 0.12)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#38BDF8',
                      fontWeight: 700,
                      fontSize: '1.2rem',
                    }}
                    className="tabular-nums"
                  >
                    {createdQuotationResult.subscription_number}
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--silver-300)', maxWidth: '480px' }}>
                    The quotation is officially recorded in the database in <strong>Quotation</strong> state for{' '}
                    <strong>{createdQuotationResult.customer?.name || selectedCustomer?.name}</strong>.
                  </p>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button
                      onClick={() => {
                        setInspectingQuotation(createdQuotationResult);
                      }}
                      className="btn btn-secondary"
                    >
                      <Eye size={16} /> View Quotation Details
                    </button>
                    <button
                      onClick={() => {
                        setActiveNav('quotations');
                        setCurrentStep(1);
                        setCreatedQuotationResult(null);
                      }}
                      className="btn btn-teal"
                    >
                      Go to Quotations List
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: QUOTATIONS MANAGEMENT */}
          {activeNav === 'quotations' && (
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
                  <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>Quotations Management</h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
                    Track pending customer quotations and advance deals to Confirmed subscriptions
                  </p>
                </div>

                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setActiveNav('create-quote');
                  }}
                  className="btn btn-primary"
                  style={{ borderRadius: 'var(--radius-pill)', padding: '8px 18px' }}
                >
                  <PlusCircle size={15} /> New Quotation
                </button>
              </div>

              <div className="table-container">
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>Quotation #</th>
                      <th>Customer</th>
                      <th>Plan Cadence</th>
                      <th>Created Date</th>
                      <th>Expiry Date</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotationsList.length > 0 ? (
                      quotationsList.map((quote) => (
                        <tr key={quote._id}>
                          <td style={{ color: '#38BDF8', fontWeight: 600 }} className="tabular-nums">
                            {quote.subscription_number}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{quote.customer?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>{quote.customer?.email}</div>
                          </td>
                          <td>{quote.plan?.name}</td>
                          <td className="tabular-nums">{formatDate(quote.createdAt)}</td>
                          <td className="tabular-nums">{formatDate(quote.expiry_date)}</td>
                          <td className="tabular-nums" style={{ fontWeight: 700, color: '#FFFFFF' }}>
                            {formatCurrency(quote.total_amount, currency)}
                          </td>
                          <td>
                            <span className={`badge badge-${quote.status.toLowerCase()}`}>
                              <span className="badge-dot" /> {quote.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                onClick={() => setInspectingQuotation(quote)}
                                className="btn btn-ghost btn-sm"
                              >
                                <Eye size={14} /> Details
                              </button>

                              {quote.status === 'Draft' && (
                                <button
                                  onClick={() => handleAdvanceStatus(quote._id, 'Quotation')}
                                  className="btn btn-secondary btn-sm"
                                  style={{ color: '#FBBF24' }}
                                >
                                  Send Quote
                                </button>
                              )}

                              {quote.status === 'Quotation' && (
                                <button
                                  onClick={() => handleAdvanceStatus(quote._id, 'Confirmed')}
                                  className="btn btn-teal btn-sm"
                                >
                                  <Check size={14} /> Confirm
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--silver-400)' }}>
                          No pending quotations found. Click "New Quotation" to start a deal.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SUBSCRIPTIONS */}
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
                  <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>Sales Contract Subscriptions</h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
                    Inspect active subscriptions created through the sales workflow
                  </p>
                </div>
                <span className="badge badge-active">{subscriptions.length} Total Registered</span>
              </div>

              <div className="table-container">
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>Subscription #</th>
                      <th>Customer</th>
                      <th>Plan</th>
                      <th>Items & Surcharges</th>
                      <th>Total Amount</th>
                      <th>Next Billing</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Staff Lifecycle Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.length > 0 ? (
                      subscriptions.map((sub) => (
                        <tr key={sub._id}>
                          <td style={{ color: '#38BDF8', fontWeight: 600 }} className="tabular-nums">
                            {sub.subscription_number}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{sub.customer?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>{sub.customer?.email}</div>
                          </td>
                          <td>{sub.plan?.name}</td>
                          <td>
                            <div style={{ fontSize: '0.75rem' }}>
                              {sub.items?.map((it, i) => (
                                <div key={i} style={{ color: 'var(--silver-300)' }}>
                                  {it.quantity}x {it.product_name}
                                  {it.variant_addon > 0 && <span style={{ color: '#38BDF8' }}> (+${it.variant_addon})</span>}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="tabular-nums" style={{ fontWeight: 700, color: '#FFFFFF' }}>
                            {formatCurrency(sub.total_amount, currency)}
                          </td>
                          <td className="tabular-nums">{formatDate(sub.next_billing_date)}</td>
                          <td>
                            <span className={`badge badge-${sub.status.toLowerCase()}`}>
                              <span className="badge-dot" /> {sub.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              {sub.status === 'Confirmed' && (
                                <button
                                  onClick={() => handleAdvanceStatus(sub._id, 'Active')}
                                  className="btn btn-primary btn-sm"
                                >
                                  Activate
                                </button>
                              )}
                              <button
                                onClick={() => setInspectingQuotation(sub)}
                                className="btn btn-ghost btn-sm"
                              >
                                <Eye size={14} /> View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--silver-400)' }}>
                          No subscriptions found in the system.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Template Detail Inspection Modal */}
      {inspectingTemplate && (
        <div className="modal-backdrop" onClick={() => setInspectingTemplate(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span className="badge badge-active">{inspectingTemplate.category}</span>
                <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', marginTop: '6px' }}>{inspectingTemplate.name}</h3>
              </div>
              <button onClick={() => setInspectingTemplate(null)} className="btn btn-ghost btn-sm">
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--silver-300)', marginBottom: '16px' }}>
              {inspectingTemplate.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--silver-400)' }}>
                <span>Associated Cadence:</span>
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{inspectingTemplate.plan?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--silver-400)' }}>
                <span>Payment Terms:</span>
                <span style={{ color: '#FFFFFF' }}>{inspectingTemplate.payment_terms}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--silver-400)' }}>
                <span>Validity Period:</span>
                <span style={{ color: '#FFFFFF' }}>{inspectingTemplate.validity_days} Days</span>
              </div>

              <div style={{ marginTop: '10px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                <div style={{ fontWeight: 600, color: 'var(--silver-400)', textTransform: 'uppercase', fontSize: '0.6875rem', marginBottom: '6px' }}>
                  Bundled Items & Taxes
                </div>
                {inspectingTemplate.items?.map((it, idx) => (
                  <div key={idx} style={{ padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: '#FFFFFF', fontWeight: 600 }}>{it.quantity}x {it.product_name}</div>
                      {it.variant_addon > 0 && <div style={{ color: '#38BDF8', fontSize: '0.75rem' }}>{it.variant_name} (+${it.variant_addon})</div>}
                    </div>
                    <div className="tabular-nums" style={{ color: 'var(--silver-200)' }}>
                      ${it.unit_price} (Tax: {it.tax_pct}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setInspectingTemplate(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
              <button
                onClick={() => {
                  setInspectingTemplate(null);
                  handleSelectTemplate(inspectingTemplate);
                }}
                className="btn btn-teal btn-sm"
              >
                Use this Template →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Detail Inspection Modal */}
      {inspectingQuotation && (
        <div className="modal-backdrop" onClick={() => setInspectingQuotation(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span className={`badge badge-${inspectingQuotation.status.toLowerCase()}`}>{inspectingQuotation.status}</span>
                <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', marginTop: '6px' }} className="tabular-nums">
                  {inspectingQuotation.subscription_number}
                </h3>
              </div>
              <button onClick={() => setInspectingQuotation(null)} className="btn btn-ghost btn-sm">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8125rem', marginBottom: '16px' }}>
              <div>
                <div style={{ color: 'var(--silver-400)', fontSize: '0.6875rem' }}>Customer Client:</div>
                <div style={{ color: '#FFFFFF', fontWeight: 600 }}>{inspectingQuotation.customer?.name}</div>
                <div style={{ color: 'var(--silver-300)' }}>{inspectingQuotation.customer?.email}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--silver-400)', fontSize: '0.6875rem' }}>Quotation Expiry:</div>
                <div style={{ color: '#FB7185', fontWeight: 600 }}>{formatDate(inspectingQuotation.expiry_date)}</div>
              </div>
            </div>

            <div style={{ border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 600, color: 'var(--silver-400)', textTransform: 'uppercase', fontSize: '0.6875rem', marginBottom: '8px' }}>
                Configured Software Lines
              </div>
              {inspectingQuotation.items?.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '6px', color: 'var(--silver-300)' }}>
                  <div>
                    <span style={{ color: '#FFFFFF' }}>{it.quantity}x {it.product_name}</span>
                    {it.variant_addon > 0 && <span style={{ color: '#38BDF8', marginLeft: '6px' }}>+${it.variant_addon} variant</span>}
                  </div>
                  <span className="tabular-nums">${(it.unit_price + it.variant_addon) * it.quantity}</span>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '8px', marginTop: '8px', fontWeight: 700, color: '#FFFFFF' }}>
                <span>Quotation Value</span>
                <span className="tabular-nums text-blue">{formatCurrency(inspectingQuotation.total_amount, currency)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {inspectingQuotation.status === 'Quotation' && (
                  <button
                    onClick={() => {
                      handleAdvanceStatus(inspectingQuotation._id, 'Confirmed');
                      setInspectingQuotation(null);
                    }}
                    className="btn btn-teal btn-sm"
                  >
                    Confirm Contract
                  </button>
                )}
              </div>
              <button onClick={() => setInspectingQuotation(null)} className="btn btn-primary btn-sm">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesWorkspace;
