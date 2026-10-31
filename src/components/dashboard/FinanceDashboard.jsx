import React, { useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  ArrowUpRight, 
  Layers
} from 'lucide-react';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';

export default function FinanceDashboard({
  metrics,
  invoices = [],
  subscriptions = [],
  payments = [],
  onTriggerBilling,
  onRecordPaymentClick,
  onViewInvoice,
  onNavigateTab
}) {
  const [filterPeriod, setFilterPeriod] = useState('all');

  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');
  const activeSubs = subscriptions.filter((s) => s.status === 'active');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Minimalist Executive Header */}
      <div className="royal-panel p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
            Financial Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time recurring revenue velocity, billing cycle execution, and receivables collection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Toggle */}
          <div className="flex items-center royal-pill rounded-lg p-0.5 text-xs">
            {['all', 'month'].map((period) => (
              <button
                key={period}
                onClick={() => setFilterPeriod(period)}
                className={`px-3 py-1 rounded-md capitalize text-xs font-medium transition-all ${
                  filterPeriod === period 
                    ? 'bg-white/[0.08] text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {period === 'all' ? 'All Time' : 'This Month'}
              </button>
            ))}
          </div>

          {/* Trigger Billing Run */}
          <button
            onClick={onTriggerBilling}
            className="btn-royal-gold flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs tracking-wide"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Trigger Billing Run</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Spacious & Minimal) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Subscriptions"
          value={metrics.activeSubscriptionsCount || 0}
          subtext={`${metrics.totalSubscriptionsCount || 0} in active pipeline`}
          icon={Layers}
          trend="+12%"
          onClick={() => onNavigateTab('subscriptions')}
        />

        <StatCard
          title="Monthly Recurring Revenue"
          value={`$${(metrics.mrr || 0).toLocaleString()}`}
          subtext={`ARR: $${(metrics.arr || 0).toLocaleString()}`}
          icon={TrendingUp}
          trend="+18% YoY"
        />

        <StatCard
          title="Total Cash Collected"
          value={`$${(metrics.totalCollectedRevenue || 0).toLocaleString()}`}
          subtext={`${metrics.collectionRate || 0}% collection rate`}
          icon={DollarSign}
          trend={`${payments.length} verified`}
          onClick={() => onNavigateTab('invoices')}
        />

        <StatCard
          title="Overdue Receivables"
          value={`$${(metrics.totalOverdueAmount || 0).toLocaleString()}`}
          subtext={`${metrics.overdueCount || 0} invoices need follow-up`}
          icon={AlertTriangle}
          trend={metrics.overdueCount > 0 ? 'Action required' : 'All clear'}
          trendType={metrics.overdueCount > 0 ? 'negative' : 'positive'}
          onClick={() => onNavigateTab('invoices')}
        />
      </div>

      {/* Main Two-Column Minimalist Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Receivables Health & Overdue Priority */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Receivables Summary Card */}
          <div className="royal-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="royal-label">Collection Progress</span>
                <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                  Accounts Receivable Ledger
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('invoices')}
                className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 font-mono"
              >
                Full Ledger <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3 Clean Stat Tiles */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="royal-card p-3 rounded-xl">
                <span className="royal-label">Settled</span>
                <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                  {metrics.invoicesBreakdown?.paid || 0}
                </p>
                <span className="text-[10px] text-slate-400">${(metrics.totalCollectedRevenue || 0).toLocaleString()}</span>
              </div>

              <div className="royal-card p-3 rounded-xl">
                <span className="royal-label">Pending</span>
                <p className="text-lg font-bold text-amber-300 font-mono mt-0.5">
                  {metrics.invoicesBreakdown?.unpaid || 0}
                </p>
                <span className="text-[10px] text-slate-400">${(metrics.totalUnpaidAmount || 0).toLocaleString()}</span>
              </div>

              <div className="royal-card p-3 rounded-xl">
                <span className="royal-label">Overdue</span>
                <p className="text-lg font-bold text-rose-400 font-mono mt-0.5">
                  {metrics.invoicesBreakdown?.overdue || 0}
                </p>
                <span className="text-[10px] text-slate-400">${(metrics.totalOverdueAmount || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Subtle Progress Bar */}
            <div className="pt-2">
              <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden flex">
                <div 
                  className="bg-emerald-400 h-full" 
                  style={{ width: `${metrics.collectionRate || 50}%` }}
                />
                <div 
                  className="bg-amber-400 h-full opacity-60" 
                  style={{ width: `${Math.max(10, 100 - (metrics.collectionRate || 50) - 20)}%` }}
                />
                <div 
                  className="bg-rose-500 h-full opacity-80" 
                  style={{ width: '20%' }}
                />
              </div>
            </div>
          </div>

          {/* Overdue Receivables Watchlist */}
          <div className="royal-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <span className="royal-label text-rose-400">Action Required</span>
                <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                  Overdue Invoices
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {overdueInvoices.length} outstanding
              </span>
            </div>

            {overdueInvoices.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5 opacity-80" />
                <p className="text-xs font-medium text-slate-300">All Invoices Settled</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {overdueInvoices.map((inv) => (
                  <div 
                    key={inv._id}
                    className="p-3.5 rounded-xl royal-card flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">{inv.invoice_number}</span>
                        <Badge status={inv.status} />
                      </div>
                      <p className="text-xs font-medium text-slate-300 mt-1">{inv.customer_name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Due: {inv.due_date}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-rose-400 font-mono">${inv.total_amount?.toLocaleString()}</p>
                      <button
                        onClick={() => onRecordPaymentClick(inv)}
                        className="mt-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-600/80 hover:bg-emerald-600 text-white transition-colors"
                      >
                        Record Payment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (5 cols): Cadence Mix & Recent Settlements */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Subscription Cadence Breakdown */}
          <div className="royal-panel p-6 rounded-2xl space-y-4">
            <div>
              <span className="royal-label">Cadence Breakdown</span>
              <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                Plans by Interval
              </h3>
            </div>

            <div className="space-y-3 pt-1">
              {[
                { name: 'Monthly Recurring', count: 3, share: '50%', color: 'bg-indigo-500' },
                { name: 'Yearly Enterprise', count: 1, share: '17%', color: 'bg-amber-400' },
                { name: 'Weekly Sprint', count: 1, share: '17%', color: 'bg-sky-400' },
                { name: 'Draft / Quote Pipeline', count: 1, share: '16%', color: 'bg-slate-600' }
              ].map((tier, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{tier.name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{tier.count} subs</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                    <div className={`${tier.color} h-full rounded-full`} style={{ width: tier.share }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigateTab('products')}
                className="w-full py-2 px-3 rounded-lg text-xs font-medium text-slate-300 hover:text-white royal-pill flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Products & +560 Variants</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Recent Settlements */}
          <div className="royal-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <span className="royal-label text-emerald-400">Verified</span>
                <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                  Recent Settlements
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {payments.length} total
              </span>
            </div>

            {payments.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                No payments recorded yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {payments.map((pmt) => (
                  <div 
                    key={pmt._id}
                    className="p-3 rounded-xl royal-card flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-emerald-400">
                        +${pmt.amount?.toLocaleString()}
                      </span>
                      <p className="font-medium text-slate-300 mt-0.5">{pmt.customer_name || 'Customer'}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">
                        {pmt.invoice_number}
                      </p>
                    </div>

                    <div className="text-right font-mono text-[11px] text-slate-400">
                      <span>{pmt.date ? new Date(pmt.date).toLocaleDateString() : 'Today'}</span>
                      <p className="text-[10px] text-slate-500 uppercase mt-0.5">{pmt.payment_method?.replace('_', ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
