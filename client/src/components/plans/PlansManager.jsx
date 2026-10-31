import React, { useState } from 'react';
import { 
  CalendarRange, 
  Plus, 
  Check, 
  X, 
  Clock, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  PauseCircle
} from 'lucide-react';
import Badge from '../common/Badge';
import PlanModal from './PlanModal';

export default function PlansManager({
  plans = [],
  onCreatePlan,
  onUpdatePlan,
  onDeletePlan
}) {
  const [selectedInterval, setSelectedInterval] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const filteredPlans = plans.filter((plan) => {
    return selectedInterval === 'all' || plan.billing_interval === selectedInterval;
  });

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleSavePlan = async (formData) => {
    if (editingPlan) {
      await onUpdatePlan(editingPlan._id, formData);
    } else {
      await onCreatePlan(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Swiss Minimalist Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 liquid-panel p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
              Subscription Plans & Cadence
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.05] text-indigo-300 border border-white/[0.08]">
              {plans.length} Cadences
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure recurring intervals (daily/weekly/monthly/yearly), auto-close triggers, and customer pause policies.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          id="btn-add-plan"
          className="btn-royal-gold flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold text-slate-950 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Interval Filters */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center royal-pill rounded-lg p-0.5 text-xs">
          {[
            { id: 'all', label: 'All Cadences' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'yearly', label: 'Yearly' },
            { id: 'weekly', label: 'Weekly' },
            { id: 'daily', label: 'Daily' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedInterval(tab.id)}
              className={`px-3 py-1 rounded-md capitalize text-xs font-medium transition-all ${
                selectedInterval === tab.id
                  ? 'bg-white/[0.08] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>


        <span className="text-xs text-slate-400 font-mono">
          Showing <span className="font-bold text-white">{filteredPlans.length}</span> plans
        </span>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPlans.map((plan) => (
          <div 
            key={plan._id}
            className="liquid-card rounded-2xl p-5 flex flex-col justify-between group relative overflow-hidden"
          >
            {/* Specular Liquid Edge */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500/80 via-purple-500/80 to-transparent" />

            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <Badge status={plan.billing_interval} text={`${plan.billing_interval} Cadence`} />

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    title="Edit Plan"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeletePlan(plan._id)}
                    title="Delete Plan"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Desc */}
              <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors font-sans">
                {plan.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                {plan.description || 'Standard plan parameters.'}
              </p>

              {/* Specs Grid */}
              <div className="mt-4 p-3.5 rounded-xl bg-black/30 border border-white/[0.05] space-y-2.5 text-xs">
                
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> Free Trial Period
                  </span>
                  <span className="font-semibold text-white font-mono">
                    {plan.trial_period_days ? `${plan.trial_period_days} Days` : 'None'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Minimum Quantity
                  </span>
                  <span className="font-semibold text-white font-mono">
                    {plan.min_quantity || 1} {plan.min_quantity > 1 ? 'Units' : 'Unit'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 text-[11px]">Base Discount</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {plan.base_discount_pct || 0}%
                  </span>
                </div>

              </div>

              {/* Policy Checklist */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px]">Auto-Close on non-payment</span>
                  {plan.auto_close ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px] font-mono">
                      <Check className="w-3 h-3" /> Enabled
                    </span>
                  ) : (
                    <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px] font-mono">
                      <X className="w-3 h-3" /> Disabled
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px]">Customer Pause allowed</span>
                  {plan.allow_pause ? (
                    <span className="text-indigo-400 font-semibold flex items-center gap-1 text-[11px] font-mono">
                      <PauseCircle className="w-3 h-3" /> Allowed
                    </span>
                  ) : (
                    <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px] font-mono">
                      <X className="w-3 h-3" /> Blocked
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer with status */}
            <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Catalog Visibility</span>
              <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                plan.active !== false 
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                  : 'bg-white/[0.04] text-slate-500'
              }`}>
                {plan.active !== false ? 'ACTIVE' : 'HIDDEN'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Form Modal */}
      <PlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePlan}
        planToEdit={editingPlan}
      />

    </div>
  );
}
