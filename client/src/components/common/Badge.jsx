import React from 'react';

export default function Badge({ status, text, size = 'sm' }) {
  const normalized = (status || text || '').toLowerCase();
  
  let styles = 'bg-white/[0.03] text-slate-300 border-white/[0.06]';
  let dotColor = 'bg-slate-400';

  if (['active', 'paid', 'confirmed', 'completed', 'live'].includes(normalized)) {
    styles = 'bg-emerald-500/[0.08] text-emerald-300 border-emerald-500/20';
    dotColor = 'bg-emerald-400';
  } else if (['overdue', 'closed', 'cancelled', 'expired', 'failed'].includes(normalized)) {
    styles = 'bg-rose-500/[0.08] text-rose-300 border-rose-500/20';
    dotColor = 'bg-rose-400';
  } else if (['quotation', 'pending', 'warning'].includes(normalized)) {
    styles = 'bg-amber-500/[0.08] text-amber-300 border-amber-500/20';
    dotColor = 'bg-amber-400';
  } else if (['draft', 'inactive'].includes(normalized)) {
    styles = 'bg-white/[0.02] text-slate-400 border-white/[0.05]';
    dotColor = 'bg-slate-500';
  } else if (['monthly', 'yearly', 'weekly', 'daily', 'service'].includes(normalized)) {
    styles = 'bg-indigo-500/[0.08] text-indigo-300 border-indigo-500/20';
    dotColor = 'bg-indigo-400';
  } else if (['product', 'hardware'].includes(normalized)) {
    styles = 'bg-sky-500/[0.08] text-sky-300 border-sky-500/20';
    dotColor = 'bg-sky-400';
  }

  const sizeStyles = size === 'xs' 
    ? 'text-[10px] px-2 py-0.5 tracking-wide' 
    : size === 'md' 
    ? 'text-xs px-2.5 py-1 font-semibold tracking-wide' 
    : 'text-[11px] px-2.5 py-0.5 font-medium tracking-wide';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-sm ${sizeStyles} ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className="capitalize">{text || status}</span>
    </span>
  );
}
