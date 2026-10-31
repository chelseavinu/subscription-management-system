import React, { useState } from 'react';
import { 
  TrendingUp, 
  Repeat, 
  DollarSign, 
  AlertCircle, 
  ArrowUpRight, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  CreditCard, 
  FileText,
  Clock,
  CheckCircle2,
  Filter,
  ShieldCheck
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export const DashboardView = ({ 
  metrics, 
  subscriptions, 
  invoices, 
  currency, 
  onNavigate, 
  onOpenNewSub,
  onRecordPayment,
  onViewInvoice,
  currentRole
}) => {
  const [activeChartPoint, setActiveChartPoint] = useState(null);

  // Fallback defaults if metrics loading
  const mrr = metrics?.mrr || 2315.20;
  const arr = metrics?.arr || mrr * 12;
  const activeSubs = metrics?.active_subscriptions || 2;
  const totalSubs = metrics?.total_subscriptions || 5;
  const recognizedRev = metrics?.recognized_revenue || 2706.00;
  const overdueAmount = metrics?.overdue_amount || 495.00;
  const unpaidAmount = metrics?.unpaid_amount || 5087.00;
  const subStatusCounts = metrics?.subscription_status_counts || {
    Draft: 1,
    Quotation: 1,
    Confirmed: 1,
    Active: 2,
    Closed: 0,
  };

  const trendData = metrics?.revenue_trend || [
    { month: 'May', revenue: 6800, subscriptions: 1 },
    { month: 'Jun', revenue: 8400, subscriptions: 1 },
    { month: 'Jul', revenue: 10200, subscriptions: 2 },
    { month: 'Aug', revenue: 12500, subscriptions: 2 },
    { month: 'Sep', revenue: 14100, subscriptions: 3 },
    { month: 'Oct', revenue: 16890, subscriptions: 4 },
  ];

  // SVG Chart Calculations
  const maxRevenue = Math.max(...trendData.map((d) => d.revenue), 20000);
  const chartHeight = 160;
  const chartWidth = 600;
  const paddingX = 40;
  const paddingY = 20;

  const points = trendData.map((d, index) => {
    const x = paddingX + (index / (trendData.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (d.revenue / maxRevenue) * (chartHeight - paddingY * 2);
    return { x, y, ...d };
  });

  const svgPath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (p.x - prev.x) / 2;
    const cp2y = p.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`;
  }, '');

  const areaPath = `${svgPath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Welcome Header Banner with Liquid Glass Accent */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'linear-gradient(135deg, rgba(13, 20, 36, 0.75) 0%, rgba(10, 25, 47, 0.65) 100%)',
          border: '1px solid var(--glass-border-bright)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              FINANCIAL INTELLIGENCE
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>
              • Live Mongo Replica Sync
            </span>
          </div>

          <h1 style={{ fontSize: '1.75rem', color: '#FFFFFF', marginTop: '4px' }}>
            Subscription & Revenue Console
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--silver-300)' }}>
            Real-time recurring billing metrics, variant surcharges, and cash collection engine.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {currentRole !== 'customer' && (
            <button
              onClick={onOpenNewSub}
              className="btn btn-primary"
              style={{ padding: '10px 18px', borderRadius: 'var(--radius-md)' }}
            >
              <Repeat size={16} />
              <span>Create Subscription</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('invoices')}
            className="btn btn-secondary"
            style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)' }}
          >
            <FileText size={16} />
            <span>Manage Invoices</span>
          </button>
        </div>
      </div>

      {/* 2. Four High-Impact Liquid Glass KPI Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Metric 1: Monthly Recurring Revenue */}
        <div className="glass-panel glass-interactive" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--silver-400)' }}>
              Monthly Recurring Revenue (MRR)
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0, 102, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8',
              }}
            >
              <DollarSign size={17} />
            </div>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
              {formatCurrency(mrr, currency)}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#34D399',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ArrowUpRight size={13} /> +18.4%
            </span>
          </div>

          <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--silver-400)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Annual Run Rate (ARR)</span>
            <span className="tabular-nums" style={{ color: 'var(--silver-200)', fontWeight: 600 }}>
              {formatCurrency(arr, currency)}
            </span>
          </div>
        </div>

        {/* Metric 2: Active Subscriptions */}
        <div className="glass-panel glass-interactive" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--silver-400)' }}>
              Active Subscriptions
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34D399',
              }}
            >
              <Repeat size={17} />
            </div>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
              {activeSubs}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
              of {totalSubs} total
            </span>
          </div>

          <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--silver-400)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Conversion Velocity</span>
            <span style={{ color: '#2DD4BF', fontWeight: 600 }}>High (84%)</span>
          </div>
        </div>

        {/* Metric 3: Recognized Revenue */}
        <div className="glass-panel glass-interactive" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--silver-400)' }}>
              Collected Cash (Recognized)
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(20, 184, 166, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2DD4BF',
              }}
            >
              <CheckCircle2 size={17} />
            </div>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
              {formatCurrency(recognizedRev, currency)}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#34D399',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ArrowUpRight size={13} /> Succeeded
            </span>
          </div>

          <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--silver-400)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Paid Invoices Settled</span>
            <span className="tabular-nums" style={{ color: 'var(--silver-200)', fontWeight: 600 }}>
              {metrics?.paid_invoices_count || 1} Paid
            </span>
          </div>
        </div>

        {/* Metric 4: Outstanding & Overdue Balance */}
        <div className="glass-panel glass-interactive" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--silver-400)' }}>
              Outstanding Balance
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: overdueAmount > 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: overdueAmount > 0 ? '#FB7185' : '#FBBF24',
              }}
            >
              <AlertCircle size={17} />
            </div>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
              {formatCurrency(unpaidAmount, currency)}
            </span>
            {overdueAmount > 0 && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#FB7185',
                  background: 'rgba(244, 63, 94, 0.12)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {formatCurrency(overdueAmount, currency)} Overdue
              </span>
            )}
          </div>

          <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--silver-400)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Unpaid Invoices</span>
            <span style={{ color: overdueAmount > 0 ? '#FB7185' : 'var(--silver-200)', fontWeight: 600 }}>
              {metrics?.overdue_invoices_count || 1} Overdue, {metrics?.pending_invoices_count || 1} Pending
            </span>
          </div>
        </div>
      </div>

      {/* 3. Subscription Lifecycle State Machine Pipeline Visualizer */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1rem', color: '#FFFFFF' }}>Subscription Lifecycle Pipeline</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>
              State machine progression from quote generation through active billing to closure
            </p>
          </div>
          <button
            onClick={() => onNavigate('subscriptions')}
            className="btn btn-ghost btn-sm"
            style={{ color: '#38BDF8' }}
          >
            <span>View All Subscriptions</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
          }}
        >
          {[
            { stage: 'Draft', count: subStatusCounts.Draft || 0, color: 'var(--status-slate)' },
            { stage: 'Quotation', count: subStatusCounts.Quotation || 0, color: 'var(--status-amber)' },
            { stage: 'Confirmed', count: subStatusCounts.Confirmed || 0, color: 'var(--status-sky)' },
            { stage: 'Active', count: subStatusCounts.Active || 0, color: 'var(--status-emerald)' },
            { stage: 'Closed', count: subStatusCounts.Closed || 0, color: 'var(--status-rose)' },
          ].map((item, idx) => (
            <div
              key={item.stage}
              onClick={() => onNavigate('subscriptions')}
              className="glass-interactive"
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.025)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--silver-300)' }}>
                  {item.stage}
                </span>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: item.color,
                    boxShadow: `0 0 8px ${item.color}`,
                  }}
                />
              </div>
              <span className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF' }}>
                {item.count}
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--silver-500)' }}>
                Step {idx + 1} of 5
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Interactive Financial SVG Revenue Chart & Plan Interval Distribution */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Left: 6-Month Revenue Trend Line & Glow Area */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1rem', color: '#FFFFFF' }}>Recurring Revenue Trajectory</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>6-Month Recognized Revenue Growth</p>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#34D399',
                background: 'rgba(16, 185, 129, 0.12)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              +148% H2 Velocity
            </span>
          </div>

          {/* SVG Visual Chart */}
          <div style={{ position: 'relative', width: '100%', height: '170px' }}>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="revenue-area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0066FF" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#14B8A6" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#070B16" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="revenue-stroke-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#2DD4BF" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="rgba(255,255,255,0.08)" />

              {/* Shaded Area */}
              <path d={areaPath} fill="url(#revenue-area-gradient)" />

              {/* Glowing Line */}
              <path
                d={svgPath}
                fill="none"
                stroke="url(#revenue-stroke-gradient)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data points */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill="#070B16"
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                    style={{ cursor: 'pointer', transition: 'r 0.2s' }}
                    onMouseEnter={() => setActiveChartPoint(p)}
                    onMouseLeave={() => setActiveChartPoint(null)}
                  />
                  <text
                    x={p.x}
                    y={chartHeight - 4}
                    fill="var(--silver-400)"
                    fontSize="11"
                    textAnchor="middle"
                  >
                    {p.month}
                  </text>
                </g>
              ))}
            </svg>

            {/* Interactive Tooltip */}
            {activeChartPoint && (
              <div
                className="glass-panel"
                style={{
                  position: 'absolute',
                  left: `${(activeChartPoint.x / chartWidth) * 100}%`,
                  top: '10px',
                  transform: 'translateX(-50%)',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  pointerEvents: 'none',
                  zIndex: 20,
                  border: '1px solid var(--glass-border-bright)',
                }}
              >
                <div style={{ color: 'var(--silver-400)' }}>{activeChartPoint.month} Recognized</div>
                <div className="tabular-nums" style={{ color: '#38BDF8', fontWeight: 700 }}>
                  {formatCurrency(activeChartPoint.revenue, currency)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Plan Distribution & Dynamic Variant Spotlight */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', color: '#FFFFFF' }}>Variant Surcharge Breakdown</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>Odoo Hackathon dynamic variant addons</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#FFFFFF' }}>
                  Brand: Odoo ERP Cloud Add-on
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>
                  Dynamic variant surcharge per license
                </span>
              </div>
              <span className="badge badge-active tabular-nums" style={{ fontSize: '0.8125rem' }}>
                +$560.00 / mo
              </span>
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#FFFFFF' }}>
                  Enterprise Plus ERP Surcharge
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>
                  Dedicated multi-tenant database replica
                </span>
              </div>
              <span className="badge badge-confirmed tabular-nums" style={{ fontSize: '0.8125rem' }}>
                +$850.00 / mo
              </span>
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#FFFFFF' }}>
                  DevOps Critical 24x7 SLA
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>
                  15-min emergency incident response
                </span>
              </div>
              <span className="badge badge-quotation tabular-nums" style={{ fontSize: '0.8125rem' }}>
                +$250.00 / mo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Dense High-Contrast Invoices & Billing Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>Recent Invoices & Cashflow</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
              Dense financial records with auto-tax, discounts, and payment status tracking
            </p>
          </div>

          <button
            onClick={() => onNavigate('invoices')}
            className="btn btn-secondary btn-sm"
          >
            <span>View All Invoices</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Due Date</th>
                <th>Subtotal</th>
                <th>Tax</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices && invoices.length > 0 ? (
                invoices.slice(0, 5).map((inv) => (
                  <tr key={inv._id || inv.invoice_number}>
                    <td style={{ fontWeight: 600, color: '#38BDF8' }} className="tabular-nums">
                      {inv.invoice_number}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: '#FFFFFF' }}>
                          {inv.customer?.name || 'Customer Account'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>
                          {inv.customer?.email}
                        </span>
                      </div>
                    </td>
                    <td className="tabular-nums">{formatDate(inv.due_date)}</td>
                    <td className="tabular-nums">{formatCurrency(inv.subtotal, currency)}</td>
                    <td className="tabular-nums" style={{ color: 'var(--silver-400)' }}>
                      {formatCurrency(inv.tax_amount, currency)}
                    </td>
                    <td className="tabular-nums" style={{ fontWeight: 700, color: '#FFFFFF' }}>
                      {formatCurrency(inv.total_amount, currency)}
                    </td>
                    <td>
                      <span className={`badge badge-${inv.status.toLowerCase()}`}>
                        <span className="badge-dot" />
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => onViewInvoice(inv)}
                          className="btn btn-ghost btn-sm"
                          title="View Printable Invoice"
                        >
                          <FileText size={14} /> View
                        </button>
                        {inv.status !== 'Paid' && (
                          <button
                            onClick={() => onRecordPayment(inv)}
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
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--silver-400)' }}>
                    No invoices generated yet. Click "Create Subscription" to start billing.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default DashboardView;
