import React, { useState } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Layers, 
  DollarSign, 
  Clock, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Modal from '../common/Modal';

export default function BillingRunModal({
  isOpen,
  onClose,
  subscriptions = [],
  onExecuteBillingRun
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);

  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const totalBillingPotential = activeSubs.reduce((sum, s) => sum + (s.billing_cycle_amount || 0), 0);
  const estimatedTax = totalBillingPotential * 0.18;
  const grandTotal = totalBillingPotential + estimatedTax;

  const handleRunBilling = async () => {
    setIsRunning(true);
    try {
      const result = await onExecuteBillingRun();
      setRunResult(result);

      // Trigger Confetti Celebration for Hackathon Demo WOW factor!
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.log('Confetti triggered');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setRunResult(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Automated Billing Run Simulation Engine"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        
        {!runResult ? (
          <>
            {/* Context Notice */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <Zap className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-xs text-slate-300">
                <p className="font-bold text-amber-300 text-sm">Automated Billing Cycle Trigger</p>
                <p className="mt-1 text-slate-400">
                  This tool queries all <strong>Active Subscriptions</strong>, calculates itemized pricing with active product variants (e.g. +$560 Odoo logic), computes applicable taxes, and creates finalized invoices ready for payment settlement.
                </p>
              </div>
            </div>

            {/* Run Parameters Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Active Subscriptions</span>
                <p className="text-2xl font-black text-white font-mono mt-1">{activeSubs.length}</p>
                <span className="text-slate-400 text-[11px]">Ready to process</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Subtotal Billed</span>
                <p className="text-2xl font-black text-white font-mono mt-1">${totalBillingPotential.toLocaleString()}</p>
                <span className="text-slate-400 text-[11px]">+${estimatedTax.toFixed(0)} est. tax</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 bg-emerald-500/5">
                <span className="text-emerald-400 font-bold uppercase text-[10px]">Total Receivables</span>
                <p className="text-2xl font-black text-emerald-400 font-mono mt-1">${grandTotal.toLocaleString()}</p>
                <span className="text-emerald-400/80 text-[11px]">Gross Invoice Total</span>
              </div>
            </div>

            {/* Subscriptions to be processed preview */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Subscriptions Queue ({activeSubs.length})
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {activeSubs.map((sub) => (
                  <div 
                    key={sub._id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{sub.subscription_number}</span>
                        <span className="text-slate-400 font-medium">{sub.customer_name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{sub.plan_name}</p>
                    </div>
                    <span className="font-mono font-extrabold text-emerald-400">
                      ${Number(sub.billing_cycle_amount || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-execute-billing-run"
                disabled={isRunning || activeSubs.length === 0}
                onClick={handleRunBilling}
                className="btn-royal-gold px-5 py-2 rounded-lg text-xs font-bold text-slate-950 flex items-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{isRunning ? 'Processing...' : 'Execute Billing Run Now'}</span>
              </button>
            </div>

          </>
        ) : (
          /* Execution Success State */
          <div className="space-y-5 animate-in zoom-in-95 duration-200">
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Billing Run Completed Successfully!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Generated <strong className="text-white">{runResult.count} new invoices</strong> totaling{' '}
                <strong className="text-emerald-400">${(runResult.totalAmount || 0).toLocaleString()}</strong>.
              </p>
            </div>

            {/* Invoices List Generated */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {(runResult.invoices || []).map((inv) => (
                <div 
                  key={inv._id}
                  className="p-3 rounded-xl bg-slate-950 border border-emerald-500/20 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-mono font-bold text-white">{inv.invoice_number}</span>
                      <p className="text-[11px] text-slate-400">{inv.customer_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-emerald-400">${inv.total_amount?.toLocaleString()}</p>
                    <span className="text-[10px] text-slate-500">Due: {inv.due_date}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={handleReset}
                className="btn-royal-sapphire px-5 py-2 rounded-lg text-xs font-semibold text-white transition-all"
              >
                Done & View Updated Ledger
              </button>

            </div>
          </div>
        )}

      </div>
    </Modal>
  );
}
