import React, { useState } from 'react';
import { 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  Layers, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Code2, 
  Sparkles,
  ExternalLink,
  Crown
} from 'lucide-react';

export default function PresentationGuide({ onNavigateTab, onTriggerBilling }) {
  const [copiedSection, setCopiedSection] = useState(null);
  const [openFaq, setOpenFaq] = useState(0); // first FAQ open by default

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const pitchText = `Hi judges, I am Member 4 (Frontend: Admin Catalogs & Finance Lead) on the team. I built the entire internal command center that drives our business operations and revenue. My domain covers two critical pillars: 1. The Catalogs & Configuration Engine (full CRUD for Products, dynamic multi-attribute variant pricing including our custom +$560 Odoo logic, Subscription Plans with auto_close and allow_pause policies, and Discount rules). 2. The Finance Intelligence Hub (real-time MRR and collection telemetry, overdue invoice tracking, payment settlement, and our one-click Automated Billing Run simulation that generates batch invoices on-demand). It is built with React and Vite, styled in an uncluttered Royal Obsidian & Champagne Gold aesthetic, and engineered with a dual-mode API service.`;

  const faqs = [
    {
      q: "What was your specific responsibility compared to your teammates?",
      a: "Our team split into 4 clear lanes: Member 1 handled Database modeling, Auth, and JWT sessions. Member 2 built the backend subscription state engine and automated billing logic. Member 3 built the customer-facing portal and sales quotation interface. I owned Member 4: The Admin & Finance Hub, creating the product/plan catalog, variant calculations (+560 logic), the executive finance dashboard, discount engine, and invoice settlement.",
      badge: "Team Role"
    },
    {
      q: "How does the '+560 variant logic' work in your code?",
      a: "In our data model, each product has a base sales_price and an array of variants. In our ERP product, we have { name: 'Brand', option: 'Odoo Engine', extra_price: 560 }. When an admin creates or edits a product, my dynamic variant builder calculates Base Price + Sum(extra_prices) to display the total configured price. When an invoice is generated, the line items reflect this calculation with variant tags.",
      badge: "Catalog & Pricing"
    },
    {
      q: "How does the 'Trigger Billing Run' button work?",
      a: "Rather than relying on an hourly background cron job that cannot be observed during a short live presentation, I built an on-demand billing cycle simulation. It queries all subscriptions marked active, extracts their itemized line items, computes the 18% tax rate, generates sequential invoice IDs (INV-2026-XXX), and appends them to the ledger, instantly updating our live MRR and collection charts.",
      badge: "Billing Automation"
    },
    {
      q: "How does your frontend connect to the backend built by Member 1 and 2?",
      a: "I designed an abstracted API layer in src/services/api.js. It contains a mode toggle: in Live API mode, it sends standard REST calls (GET /api/products, POST /api/invoices/generate-billing-cycle, etc.) to our backend URL with full JSON payloads matching our team's 7-entity schema. It also features automatic fallback to local persistence so our presentation remains 100% resilient.",
      badge: "API Architecture"
    },
    {
      q: "Why did you choose this Royal Obsidian and Champagne Gold aesthetic?",
      a: "Financial tools are often cluttered with loud, distracting neon alerts and poor contrast. I chose an editorial, minimalist approach inspired by Swiss typographic hierarchy and private wealth terminals: deep royal obsidian (#07090e) for zero eye strain, hairline glass borders for subtle depth, and understated champagne gold (#d4af37) for high-priority calls-to-action like billing triggers.",
      badge: "Design Rationale"
    },
    {
      q: "What happens when an invoice becomes overdue?",
      a: "If an invoice's due_date has passed and its status is not paid, the system flags it as overdue. It immediately surfaces in the Finance Dashboard's Overdue Receivables Watchlist in red. The finance lead can click 'Record Payment' directly from that card to settle it via Stripe or Bank Wire, immediately transitioning its status to Paid.",
      badge: "Finance Engine"
    }
  ];

  const demoSteps = [
    {
      time: "0:00 - 0:30",
      title: "1. Financial Intelligence & Live MRR",
      desc: "Point out Live MRR, Total Cash Collected, and the 3-part ledger progress (Settled, Pending, Overdue).",
      actionLabel: "View Dashboard",
      action: () => onNavigateTab('dashboard')
    },
    {
      time: "0:30 - 1:00",
      title: "2. Batch Billing Run Simulation",
      desc: "Click 'Trigger Billing Run' to show how active subscriptions are batch-processed with 18% tax calculation into new invoices.",
      actionLabel: "Launch Billing Modal",
      action: onTriggerBilling
    },
    {
      time: "1:00 - 1:30",
      title: "3. Products & +560 Variant Engine",
      desc: "Open Products catalog, demonstrate the +560 Odoo Preset, and show real-time configured price computation.",
      actionLabel: "Inspect Variants",
      action: () => onNavigateTab('products')
    },
    {
      time: "1:30 - 2:00",
      title: "4. Invoice Settlement & Lifecycle",
      desc: "Settle an overdue invoice via the 'Record Payment' drawer and show the 5-stage subscription state progression.",
      actionLabel: "Open Invoices",
      action: () => onNavigateTab('invoices')
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* Royal Header */}
      <div className="royal-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <Crown className="w-4 h-4" />
              </div>
              <span className="royal-label text-amber-300">Hackathon Defense & Documentation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans mt-2">
              Member 4: Executive Statement & Judge Defense
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Complete architectural documentation, live demo playbook, and technical answers for evaluators.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-3 py-1.5 rounded-xl royal-pill text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Branch: feature/member-4-admin-finance
            </span>
          </div>
        </div>
      </div>

      {/* 30-Second Elevator Pitch Card */}
      <div className="royal-panel p-6 rounded-2xl relative space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-300" />
            <span className="royal-label text-amber-300">The 30-Second Opening Statement</span>
          </div>
          <button
            onClick={() => handleCopy(pitchText, 'pitch')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-mono royal-pill px-3 py-1 rounded-lg transition-colors"
          >
            {copiedSection === 'pitch' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'pitch' ? 'Copied' : 'Copy Pitch'}</span>
          </button>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed font-sans italic p-4 rounded-xl bg-black/40 border border-white/[0.04]">
          "{pitchText}"
        </p>
      </div>

      {/* 2-Minute Live Demo Walkthrough Playbook */}
      <div className="space-y-4">
        <div>
          <span className="royal-label">Interactive Demo Playbook</span>
          <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
            2-Minute Live Judge Walkthrough
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demoSteps.map((step, idx) => (
            <div key={idx} className="royal-card p-5 rounded-2xl flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between text-xs mb-2 font-mono">
                  <span className="text-amber-400 font-bold">{step.time}</span>
                  <span className="text-slate-500">Step {idx + 1}</span>
                </div>
                <h3 className="text-sm font-bold text-white font-sans">{step.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.04] flex justify-end">
                <button
                  onClick={step.action}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 royal-pill hover:bg-white/[0.06] transition-colors"
                >
                  <span>{step.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anticipated Judge Questions & Answers (Interactive Accordions) */}
      <div className="space-y-4">
        <div>
          <span className="royal-label">Evaluator Q&A Defense</span>
          <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
            Anticipated Technical Questions & Verified Answers
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="royal-panel rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/[0.04] text-slate-400 font-mono text-xs flex items-center justify-center shrink-0">
                      Q{idx + 1}
                    </span>
                    <span className="text-sm font-bold text-white font-sans">{faq.q}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md royal-pill text-slate-400 hidden sm:inline">
                      {faq.badge}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/[0.04] bg-black/20">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3">
                      <p className="leading-relaxed">{faq.a}</p>
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleCopy(faq.a, `faq-${idx}`)}
                          className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                        >
                          {copiedSection === `faq-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedSection === `faq-${idx}` ? 'Copied Answer' : 'Copy Answer'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Technical Architecture Overview */}
      <div className="royal-panel p-6 rounded-2xl space-y-4">
        <div>
          <span className="royal-label">System Architecture</span>
          <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
            Key Architecture & Logic Specifications
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl royal-card space-y-1">
            <span className="text-slate-500 uppercase text-[10px] block">Product +560 Logic</span>
            <p className="text-white font-bold text-sm">Base + Sum(Variants)</p>
            <p className="text-slate-400 text-[11px] font-sans">
              Odoo variant injects +$560 extra price dynamically across catalogs and generated invoices.
            </p>
          </div>

          <div className="p-4 rounded-xl royal-card space-y-1">
            <span className="text-slate-500 uppercase text-[10px] block">MRR Normalization</span>
            <p className="text-white font-bold text-sm">Monthly Revenue Velocity</p>
            <p className="text-slate-400 text-[11px] font-sans">
              Normalizes weekly (*4.33) and annual (/12) subscriptions to calculate true monthly run-rate.
            </p>
          </div>

          <div className="p-4 rounded-xl royal-card space-y-1">
            <span className="text-slate-500 uppercase text-[10px] block">Dual-Mode Resilience</span>
            <p className="text-white font-bold text-sm">REST API + Local Sandbox</p>
            <p className="text-slate-400 text-[11px] font-sans">
              Supports live team endpoints with automatic offline localStorage fallback for zero-downtime demos.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
