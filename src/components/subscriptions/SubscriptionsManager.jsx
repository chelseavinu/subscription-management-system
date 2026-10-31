import React, { useState } from 'react';
import { 
  RefreshCw, 
  Search, 
  ChevronRight
} from 'lucide-react';
import Badge from '../common/Badge';

export default function SubscriptionsManager({
  subscriptions = [],
  onUpdateSubscriptionStatus
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSubs = subscriptions.filter((sub) => {
    const matchesSearch = 
      sub.subscription_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plan_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stages = [
    { id: 'draft', label: 'Draft' },
    { id: 'quotation', label: 'Quotation' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'active', label: 'Active' },
    { id: 'closed', label: 'Closed' }
  ];

  const handleAdvanceStatus = async (sub) => {
    const currentIndex = stages.findIndex((s) => s.id === sub.status);
    if (currentIndex < stages.length - 1) {
      const nextStatus = stages[currentIndex + 1].id;
      await onUpdateSubscriptionStatus(sub._id, nextStatus);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Swiss Header and Pipeline Banner */}
      <div className="liquid-panel p-6 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
                Subscriptions Lifecycle Pipeline
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {subscriptions.filter(s => s.status === 'active').length} Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Cross-functional view of the state machine transitions: Draft → Quotation → Confirmed → Active → Closed.
            </p>
          </div>
        </div>

        {/* State Pipeline Indicator */}
        <div className="pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {stages.map((stage, idx) => {
              const count = subscriptions.filter((s) => s.status === stage.id).length;
              return (
                <div 
                  key={stage.id} 
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    statusFilter === stage.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                      : 'liquid-card text-slate-300'
                  }`}
                  onClick={() => setStatusFilter(statusFilter === stage.id ? 'all' : stage.id)}
                >
                  <div>
                    <span className="swiss-label">Step {idx + 1}</span>
                    <p className="text-xs font-bold capitalize mt-0.5">{stage.label}</p>
                  </div>
                  <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded-lg bg-black/40 text-white">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search subscriptions by number, customer, plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        {/* Reset Filter Button if active */}
        {statusFilter !== 'all' && (
          <button
            onClick={() => setStatusFilter('all')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold self-center font-mono"
          >
            Clear Filter (Show All {subscriptions.length})
          </button>
        )}
      </div>

      {/* Subscriptions Table */}
      <div className="liquid-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 text-slate-400 border-b border-white/[0.06] font-semibold">
              <tr>
                <th className="py-3.5 px-4 swiss-label">Subscription #</th>
                <th className="py-3.5 px-4 swiss-label">Customer</th>
                <th className="py-3.5 px-4 swiss-label">Plan & Cadence</th>
                <th className="py-3.5 px-4 swiss-label">Items / Config</th>
                <th className="py-3.5 px-4 swiss-label text-right">Cycle Amount</th>
                <th className="py-3.5 px-4 swiss-label text-center">Status</th>
                <th className="py-3.5 px-4 swiss-label text-right">Transition Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No subscriptions match current criteria.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => {
                  const currentIndex = stages.findIndex((s) => s.id === sub.status);
                  const nextStage = currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;

                  return (
                    <tr key={sub._id} className="hover:bg-white/[0.02] transition-colors">
                      
                      {/* Sub # */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        <div className="flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{sub.subscription_number}</span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white leading-tight">{sub.customer_name}</p>
                        <p className="text-[11px] text-slate-400">{sub.customer_email}</p>
                      </td>

                      {/* Plan */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-white block">{sub.plan_name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Next cycle: {sub.next_billing_date || 'N/A'}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {(sub.items || []).map((item, idx) => (
                            <div key={idx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                              <span className="font-mono text-indigo-400 font-bold">{item.qty}x</span>
                              <span className="truncate max-w-[180px]">{item.product_name}</span>
                              {item.variants_selected?.length > 0 && (
                                <span className="text-[10px] text-amber-300 font-mono">
                                  (+${item.variants_selected.reduce((s, v) => s + (v.extra_price || 0), 0)})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Cycle Amount */}
                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-400 text-sm">
                        ${Number(sub.billing_cycle_amount || 0).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <Badge status={sub.status} />
                      </td>

                      {/* State Transition Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {nextStage ? (
                          <button
                            onClick={() => handleAdvanceStatus(sub)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
                            title={`Transition to ${nextStage.label}`}
                          >
                            <span>To {nextStage.label}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">CLOSED</span>
                        )}
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
  );
}
