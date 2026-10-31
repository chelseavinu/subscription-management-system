import React, { useState } from 'react';
import { 
  Repeat, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  X, 
  Sparkles,
  Percent,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export const SubscriptionsView = ({
  subscriptions,
  products,
  plans,
  currency,
  onUpdateStatus,
  onGenerateInvoice,
  onCreateSubscription,
  currentRole,
  isCreateModalOpen,
  setIsCreateModalOpen,
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  // New Subscription Form State
  const [newCustomer, setNewCustomer] = useState('Acme Global Enterprises');
  const [newPlanId, setNewPlanId] = useState(plans[0]?._id || '');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?._id || '');
  const [selectedVariantAddon, setSelectedVariantAddon] = useState(560); // Odoo default
  const [selectedVariantName, setSelectedVariantName] = useState('Brand: Odoo (+560)');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [taxPct, setTaxPct] = useState(10);
  const [discountCode, setDiscountCode] = useState('HACKATHON20');
  const [discountApplied, setDiscountApplied] = useState(true);
  const [discountPct, setDiscountPct] = useState(20);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Copy helper
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter Subscriptions
  const filteredSubs = (subscriptions || []).filter((sub) => {
    const matchesTab = activeTab === 'all' || sub.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch =
      sub.subscription_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === 'all' || (sub.plan?._id === planFilter || sub.plan?.name === planFilter);

    return matchesTab && matchesSearch && matchesPlan;
  });

  // Dynamic calculations for the New Subscription Modal
  const selectedProduct = products.find((p) => p._id === selectedProductId) || products[0];
  const selectedPlan = plans.find((p) => p._id === newPlanId) || plans[0];

  const basePrice = selectedProduct?.sales_price || 1200;
  const planBase = selectedPlan?.base_price || 199;
  const lineSubtotal = (basePrice + selectedVariantAddon) * itemQuantity;
  const preDiscountTotal = lineSubtotal + planBase;
  const discountAmount = discountApplied ? (preDiscountTotal * discountPct) / 100 : 0;
  const afterDiscount = preDiscountTotal - discountAmount;
  const taxAmount = (afterDiscount * taxPct) / 100;
  const calculatedGrandTotal = Math.round((afterDiscount + taxAmount) * 100) / 100;

  const handleSubmitNewSub = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      await onCreateSubscription({
        plan_id: selectedPlan?._id,
        items: [
          {
            product_id: selectedProduct?._id,
            quantity: itemQuantity,
            unit_price: basePrice,
            variant_addon: selectedVariantAddon,
            tax_pct: taxPct,
          },
        ],
        discount: discountApplied ? { code: discountCode, discount_type: 'percentage', value: discountPct } : null,
        status: 'Active',
      });
      setIsCreateModalOpen(false);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create subscription.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header with Stats & Actions */}
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
          <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>Subscriptions Lifecycle Engine</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
            Track recurring contracts from Draft through Quotation, Confirmed, Active billing, to Closed
          </p>
        </div>

        {currentRole !== 'customer' && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
            style={{ borderRadius: 'var(--radius-pill)', padding: '10px 20px' }}
          >
            <Plus size={16} />
            <span>New Subscription</span>
          </button>
        )}
      </div>

      {/* 2. State Machine Tabs & Search / Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Tabs */}
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
          {['all', 'Active', 'Confirmed', 'Quotation', 'Draft', 'Closed'].map((tab) => {
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

        {/* Search & Plan Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--silver-400)' }} />
            <input
              type="text"
              placeholder="Search subs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '30px', height: '34px', fontSize: '0.8125rem', borderRadius: 'var(--radius-md)' }}
            />
          </div>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', height: '34px', fontSize: '0.8125rem', borderRadius: 'var(--radius-md)' }}
          >
            <option value="all">All Plans</option>
            {plans.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Dense High-Contrast Subscriptions Table */}
      <div className="table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Sub Number</th>
              <th>Customer</th>
              <th>Plan Cadence</th>
              <th>Products & Dynamic Surcharges</th>
              <th>Total Amount</th>
              <th>Next Billing</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Lifecycle Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubs && filteredSubs.length > 0 ? (
              filteredSubs.map((sub) => {
                const isCopied = copiedId === sub.subscription_number;

                return (
                  <tr key={sub._id || sub.subscription_number}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 600, color: '#38BDF8' }} className="tabular-nums">
                          {sub.subscription_number}
                        </span>
                        <button
                          onClick={() => handleCopy(sub.subscription_number)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '2px', color: isCopied ? '#34D399' : 'var(--silver-500)' }}
                          title="Copy ID"
                        >
                          {isCopied ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: '#FFFFFF' }}>
                          {sub.customer?.name || 'Client Corporation'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>
                          {sub.customer?.email}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 500, color: 'var(--silver-200)' }}>
                          {sub.plan?.name || 'Growth Plan'}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--sophisticated-teal)', textTransform: 'uppercase', fontWeight: 600 }}>
                          {sub.plan?.billing_interval || 'monthly'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxWidth: '280px' }}>
                        {sub.items?.map((it, idx) => (
                          <div key={idx} style={{ fontSize: '0.8125rem' }}>
                            <span style={{ color: 'var(--silver-200)' }}>
                              {it.quantity}x {it.product_name}
                            </span>
                            {it.variant_addon > 0 && (
                              <span
                                style={{
                                  marginLeft: '6px',
                                  fontSize: '0.6875rem',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  background: 'rgba(56, 189, 248, 0.15)',
                                  color: '#38BDF8',
                                  border: '1px solid rgba(56, 189, 248, 0.3)',
                                }}
                              >
                                +${it.variant_addon} variant
                              </span>
                            )}
                          </div>
                        ))}
                        {sub.discount && (
                          <span style={{ fontSize: '0.6875rem', color: '#34D399' }}>
                            Promo {sub.discount.code} (-{sub.discount.value}%)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="tabular-nums" style={{ fontWeight: 700, color: '#FFFFFF' }}>
                      {formatCurrency(sub.total_amount, currency)}
                    </td>

                    <td className="tabular-nums" style={{ color: 'var(--silver-300)' }}>
                      {formatDate(sub.next_billing_date)}
                    </td>

                    <td>
                      <span className={`badge badge-${sub.status.toLowerCase()}`}>
                        <span className="badge-dot" />
                        {sub.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {/* State machine advancement triggers */}
                        {currentRole !== 'customer' && (
                          <>
                            {sub.status === 'Draft' && (
                              <button
                                onClick={() => onUpdateStatus(sub._id, 'Quotation')}
                                className="btn btn-secondary btn-sm"
                                style={{ color: '#FBBF24', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                              >
                                Send Quote
                              </button>
                            )}

                            {sub.status === 'Quotation' && (
                              <button
                                onClick={() => onUpdateStatus(sub._id, 'Confirmed')}
                                className="btn btn-secondary btn-sm"
                                style={{ color: '#38BDF8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                              >
                                Confirm
                              </button>
                            )}

                            {sub.status === 'Confirmed' && (
                              <button
                                onClick={() => onUpdateStatus(sub._id, 'Active')}
                                className="btn btn-primary btn-sm"
                              >
                                <CheckCircle2 size={13} /> Activate
                              </button>
                            )}

                            {sub.status === 'Active' && (
                              <button
                                onClick={() => onGenerateInvoice(sub._id)}
                                className="btn btn-teal btn-sm"
                                title="Auto-generate invoice from active subscription without duplication"
                              >
                                <FileText size={13} /> Gen Invoice
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--silver-400)' }}>
                  No subscriptions found matching the filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. "+ New Subscription" Modal with Dynamic Variant Surcharges */}
      {isCreateModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(0, 102, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38BDF8',
                  }}
                >
                  <Repeat size={17} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF' }}>Create New Subscription</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>
                    Dynamic variant surcharges & automated recurring billing
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '6px' }}
              >
                <X size={18} />
              </button>
            </div>

            {errorMessage && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#FB7185',
                  fontSize: '0.8125rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={15} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitNewSub} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Customer Selector */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Client / Customer</label>
                <select
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  className="form-select"
                >
                  <option value="Acme Global Enterprises">Acme Global Enterprises (client@business.com)</option>
                  <option value="Nexus FinTech Labs">Nexus FinTech Labs (nexus@fintech.io)</option>
                  <option value="Starlight Media Group">Starlight Media Group (contact@starlightmedia.com)</option>
                </select>
              </div>

              {/* Plan Selector */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Recurring Billing Plan</label>
                <select
                  value={newPlanId}
                  onChange={(e) => setNewPlanId(e.target.value)}
                  className="form-select"
                >
                  {plans.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} — ${p.base_price} / {p.billing_interval}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Selector */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Software / Service Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const prod = products.find((p) => p._id === e.target.value);
                    if (prod && prod.variants && prod.variants.length > 0) {
                      setSelectedVariantAddon(prod.variants[0].extra_price);
                      setSelectedVariantName(`${prod.variants[0].name}: ${prod.variants[0].option} (+${prod.variants[0].extra_price})`);
                    } else {
                      setSelectedVariantAddon(0);
                    }
                  }}
                  className="form-select"
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (Base: ${p.sales_price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Variant Selector (Key requirement for Odoo variant pricing) */}
              {selectedProduct?.variants && selectedProduct.variants.length > 0 && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: '#38BDF8' }}>
                    <span>Dynamic Product Variant & Surcharge</span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--sophisticated-teal)' }}>Surcharge Active</span>
                  </label>
                  <select
                    value={selectedVariantAddon}
                    onChange={(e) => {
                      const addon = Number(e.target.value);
                      setSelectedVariantAddon(addon);
                      const matchingVar = selectedProduct.variants.find((v) => v.extra_price === addon);
                      setSelectedVariantName(matchingVar ? `${matchingVar.name}: ${matchingVar.option}` : 'Custom');
                    }}
                    className="form-select"
                    style={{ borderColor: 'rgba(56, 189, 248, 0.4)' }}
                  >
                    {selectedProduct.variants.map((v, i) => (
                      <option key={i} value={v.extra_price}>
                        {v.name}: {v.option} — +${v.extra_price} Extra
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity & Tax */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Licenses / Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={taxPct}
                    onChange={(e) => setTaxPct(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Promotional Discount</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. HACKATHON20)"
                    className="form-input"
                    style={{ flex: 1, textTransform: 'uppercase' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (discountCode === 'HACKATHON20') {
                        setDiscountApplied(true);
                        setDiscountPct(20);
                      } else {
                        setDiscountApplied(false);
                      }
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Apply
                  </button>
                </div>
                {discountApplied && (
                  <span style={{ fontSize: '0.75rem', color: '#34D399', marginTop: '4px' }}>
                    ✓ 20% Discount Applied via {discountCode}
                  </span>
                )}
              </div>

              {/* Live Stripe-Style Financial Breakdown Preview */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(10, 16, 30, 0.95)',
                  border: '1px solid var(--glass-border-bright)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.8125rem',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--silver-400)', textTransform: 'uppercase', fontSize: '0.6875rem' }}>
                  Live Financial Summary
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--silver-300)' }}>
                  <span>Base Product ({itemQuantity}x ${basePrice})</span>
                  <span className="tabular-nums">{formatCurrency(basePrice * itemQuantity, currency)}</span>
                </div>

                {selectedVariantAddon > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38BDF8' }}>
                    <span>Dynamic Variant Surcharge ({selectedVariantName})</span>
                    <span className="tabular-nums">+{formatCurrency(selectedVariantAddon * itemQuantity, currency)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--silver-300)' }}>
                  <span>Plan Base Fee ({selectedPlan?.name})</span>
                  <span className="tabular-nums">{formatCurrency(planBase, currency)}</span>
                </div>

                {discountApplied && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34D399' }}>
                    <span>Discount ({discountPct}%)</span>
                    <span className="tabular-nums">-{formatCurrency(discountAmount, currency)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--silver-300)' }}>
                  <span>Estimated Tax ({taxPct}%)</span>
                  <span className="tabular-nums">+{formatCurrency(taxAmount, currency)}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#FFFFFF',
                  }}
                >
                  <span>Grand Total per Billing Cycle</span>
                  <span className="tabular-nums text-blue">{formatCurrency(calculatedGrandTotal, currency)}</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ minWidth: '150px' }}
                >
                  {submitting ? 'Creating...' : 'Activate Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default SubscriptionsView;
