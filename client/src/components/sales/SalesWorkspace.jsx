import React, { useState } from 'react';
import { 
  FileCheck, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Calendar, 
  CreditCard, 
  Layers, 
  Plus, 
  Clock, 
  User, 
  Building2,
  ChevronRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import Badge from '../common/Badge';

export default function SalesWorkspace({
  quotationTemplates = [],
  subscriptions = [],
  onCreateSubscriptionFromTemplate,
  onAdvanceSubscriptionStatus,
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [targetCustomer, setTargetCustomer] = useState('Acme Global Enterprises');
  const [customerEmail, setCustomerEmail] = useState('client@business.com');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [validityDays, setValidityDays] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const defaultTemplates = [
    {
      _id: 'qt_enterprise_01',
      name: 'Enterprise ERP Cloud Bundle',
      category: 'Enterprise',
      description: 'Includes full Odoo ERP integration variant, dedicated cloud compute, and 24/7 priority SLA.',
      validity_days: 30,
      payment_terms: 'Net 30',
      plan_name: 'Enterprise Yearly Commitment Plan',
      plan_price: 1990,
      interval: 'yearly',
      items: [
        { product_name: 'Enterprise ERP Cloud Engine', variant: 'Brand: Odoo', variant_addon: 560, unit_price: 2400, qty: 1, tax_pct: 10 },
        { product_name: 'AI Operations Co-Pilot', variant: 'Tier: Pro', variant_addon: 120, unit_price: 490, qty: 2, tax_pct: 10 }
      ]
    },
    {
      _id: 'qt_smb_01',
      name: 'SMB SaaS Growth Starter',
      category: 'SMB',
      description: 'Monthly scalable subscription tailored for agile digital-native organizations.',
      validity_days: 15,
      payment_terms: 'Immediate',
      plan_name: 'Standard Monthly Growth Plan',
      plan_price: 199,
      interval: 'monthly',
      items: [
        { product_name: 'Standard Monthly Cloud Seat', variant: 'Standard', variant_addon: 0, unit_price: 199, qty: 3, tax_pct: 10 },
        { product_name: 'Custom Domain & Security Addon', variant: 'Standard', variant_addon: 0, unit_price: 49, qty: 1, tax_pct: 10 }
      ]
    },
    {
      _id: 'qt_agile_01',
      name: 'Agile Weekly Sprint License',
      category: 'Startup',
      description: 'Ultra-flexible weekly billing cycle designed for rapid contractor sprints and pilot projects.',
      validity_days: 7,
      payment_terms: 'Immediate',
      plan_name: 'Agile Weekly Sprint Plan',
      plan_price: 65,
      interval: 'weekly',
      items: [
        { product_name: 'Sprint Dev Workspace', variant: 'Standard', variant_addon: 0, unit_price: 65, qty: 2, tax_pct: 10 }
      ]
    }
  ];

  const templatesToUse = quotationTemplates.length > 0 ? quotationTemplates : defaultTemplates;

  // Filter subscriptions in quotation or draft state
  const pipelineQuotes = subscriptions.filter(
    (s) => s.status === 'Draft' || s.status === 'Quotation' || s.status === 'draft' || s.status === 'quotation' || s.status === 'Confirmed' || s.status === 'confirmed'
  );

  const calculateTemplateTotal = (tpl) => {
    if (!tpl || !tpl.items) return 0;
    const subtotal = tpl.items.reduce((acc, it) => {
      const unit = (it.unit_price || 0) + (it.variant_addon || 0);
      return acc + unit * (it.qty || it.quantity || 1);
    }, 0);
    const taxes = subtotal * 0.10;
    return subtotal + taxes;
  };

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl);
    if (tpl.validity_days) setValidityDays(tpl.validity_days);
    if (tpl.payment_terms) setPaymentTerms(tpl.payment_terms);
    setTimeout(() => {
      const el = document.getElementById('customize-offer-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = document.getElementById('target-customer-input');
        if (input) input.focus();
      }
    }, 60);
  };

  const handleLaunchQuote = async () => {
    if (!selectedTemplate) return;
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const quotePayload = {
        template_id: selectedTemplate._id,
        customer_name: targetCustomer,
        customer_email: customerEmail,
        plan_name: selectedTemplate.plan_name || selectedTemplate.plan?.name,
        payment_terms: paymentTerms,
        validity_days: validityDays,
        items: selectedTemplate.items,
        total_amount: calculateTemplateTotal(selectedTemplate),
        status: 'Quotation'
      };

      if (onCreateSubscriptionFromTemplate) {
        await onCreateSubscriptionFromTemplate(quotePayload);
      }

      setSuccessMessage(`Quotation successfully created for ${targetCustomer}! Status: [Quotation].`);
      setSelectedTemplate(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvanceStatus = async (id, nextStatus) => {
    try {
      if (onAdvanceSubscriptionStatus) {
        await onAdvanceSubscriptionStatus(id, nextStatus);
      }
      setSuccessMessage(`Subscription status advanced to "${nextStatus}"!`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="royal-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                Sales Rep Workspace
              </span>
              <span className="text-xs font-mono text-slate-500">Fast Quotation Engine</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              Quotation Templates & Proposal Generator
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Build compliant customer offers in seconds from pre-approved product lines with variant surcharges (e.g. Odoo +$560) and validity periods.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-300">
              {templatesToUse.length} Master Templates
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Templates Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight">Available Quotation Templates</h2>
          <span className="text-xs text-slate-400">Click a template to generate a customer proposal</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templatesToUse.map((tpl) => {
            const isSelected = selectedTemplate?._id === tpl._id;
            const total = calculateTemplateTotal(tpl);

            return (
              <div
                key={tpl._id}
                onClick={() => handleSelectTemplate(tpl)}
                className={`royal-card p-5 rounded-2xl flex flex-col justify-between space-y-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-amber-400/80 ring-2 ring-amber-400/30 bg-amber-500/[0.04]'
                    : 'hover:border-amber-400/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {tpl.category || 'Enterprise'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Valid: {tpl.validity_days || 30} days
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {tpl.description}
                  </p>

                  {/* Bundled Lines */}
                  <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1">
                    <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Bundled Products</p>
                    {tpl.items?.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                        <span className="truncate pr-2">{it.qty || 1}x {it.product_name}</span>
                        {it.variant_addon > 0 && (
                          <span className="text-[10px] font-mono text-amber-400 shrink-0">
                            +${it.variant_addon} variant
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500">Est. Total</span>
                    <p className="text-base font-mono font-bold text-white">
                      ${Math.round(total).toLocaleString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTemplate(tpl);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'btn-royal-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                        : 'royal-pill text-slate-300 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <span>{isSelected ? 'Configuring Below ↓' : 'Configure Offer →'}</span>
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Template Offer Configuration Drawer */}
      {selectedTemplate && (
        <div id="customize-offer-section" className="royal-panel p-6 sm:p-8 rounded-3xl border border-amber-400/50 space-y-6 animate-in slide-in-from-bottom-3 scroll-mt-24">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-400/10 text-amber-300">
                Turn Quote into Subscription
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Customize Offer: {selectedTemplate.name}
              </h3>
            </div>
            <button
              onClick={() => setSelectedTemplate(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="royal-label block">Target Customer</label>
              <input
                id="target-customer-input"
                type="text"
                value={targetCustomer}
                onChange={(e) => setTargetCustomer(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="royal-label block">Client Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="royal-label block">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0c101a] border border-white/[0.08] text-white text-xs"
              >
                <option value="Immediate">Immediate</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="royal-label block">Offer Validity (Days)</label>
              <input
                type="number"
                min="1"
                max="90"
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs font-mono"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400">Total Calculated Contract Value (including 10% tax):</p>
              <p className="text-xl font-bold font-mono text-white mt-0.5">
                ${Math.round(calculateTemplateTotal(selectedTemplate)).toLocaleString()}
              </p>
            </div>

            <button
              onClick={handleLaunchQuote}
              disabled={isSubmitting}
              className="btn-royal-gold py-2.5 px-6 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_15px_-3px_rgba(212,175,55,0.3)] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Generating Proposal...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Emit Quotation to Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Active Quotations in Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Active Offers in Pipeline (Draft & Quotation)</h2>
            <p className="text-xs text-slate-400">Advance customer offer status: Draft → Quotation → Confirmed → Active</p>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
            {pipelineQuotes.length} Offers in Flight
          </span>
        </div>

        <div className="royal-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] border-b border-white/[0.06] text-slate-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-4">Offer / Sub #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Plan / Interval</th>
                  <th className="py-3 px-4">Quote Total</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4 text-right">State Machine Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {pipelineQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No offers currently in Draft or Quotation stage. Use a template above to generate one.
                    </td>
                  </tr>
                ) : (
                  pipelineQuotes.map((q) => (
                    <tr key={q._id || q.subscription_number} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {q.subscription_number}
                      </td>
                      <td className="py-3 px-4 text-white font-medium">
                        {q.customer_name || q.customer?.name || 'Customer'}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {q.plan_name || q.plan?.name || 'Enterprise Plan'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        ${(q.total_amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={q.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {q.status === 'Draft' || q.status === 'draft' ? (
                          <button
                            onClick={() => handleAdvanceStatus(q._id, 'Quotation')}
                            className="royal-pill px-2.5 py-1 rounded-lg text-amber-300 hover:text-white text-[11px] font-bold cursor-pointer"
                          >
                            Send Quote →
                          </button>
                        ) : q.status === 'Quotation' || q.status === 'quotation' ? (
                          <button
                            onClick={() => handleAdvanceStatus(q._id, 'Confirmed')}
                            className="btn-royal-gold px-2.5 py-1 rounded-lg text-slate-950 text-[11px] font-bold cursor-pointer"
                          >
                            Confirm Contract →
                          </button>
                        ) : q.status === 'Confirmed' || q.status === 'confirmed' ? (
                          <button
                            onClick={() => handleAdvanceStatus(q._id, 'Active')}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 cursor-pointer shadow-sm transition-all"
                          >
                            Activate Subscription →
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono text-emerald-400 font-bold">✓ Active</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
