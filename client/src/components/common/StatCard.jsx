import React from 'react';

export default function StatCard({ 
  title, 
  value, 
  subtext, 
  icon: Icon, 
  trend, 
  trendType = 'positive', 
  onClick 
}) {
  return (
    <div 
      onClick={onClick}
      className={`royal-card p-5 rounded-2xl relative group ${
        onClick ? 'cursor-pointer hover:border-amber-400/30' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="royal-label">{title}</span>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-white mt-1.5 tracking-tight font-sans">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className="p-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] text-slate-400 group-hover:text-amber-300 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3.5 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium text-[11px]">{subtext}</span>
        {trend && (
          <span className={`inline-flex items-center font-mono text-[11px] font-semibold ${
            trendType === 'positive' ? 'text-emerald-400' : trendType === 'negative' ? 'text-rose-400' : 'text-amber-400'
          }`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
