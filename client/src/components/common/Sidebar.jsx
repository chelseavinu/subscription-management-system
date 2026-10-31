import React from 'react';
import { 
  BarChart3, 
  Package, 
  CalendarRange, 
  FileText, 
  RefreshCw, 
  Tag, 
  Code2,
  LogOut
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  onSelectTab, 
  metrics = {},
  currentUser,
  onLogout
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Financial Overview',
      icon: BarChart3
    },
    {
      id: 'products',
      label: 'Products & Variants',
      icon: Package
    },
    {
      id: 'plans',
      label: 'Subscription Plans',
      icon: CalendarRange
    },
    {
      id: 'invoices',
      label: 'Invoices & Receivables',
      icon: FileText,
      badge: metrics.overdueCount > 0 ? `${metrics.overdueCount}` : null,
      badgeType: 'overdue'
    },
    {
      id: 'subscriptions',
      label: 'Subscription Lifecycle',
      icon: RefreshCw,
      badge: metrics.activeSubscriptionsCount ? `${metrics.activeSubscriptionsCount}` : null,
      badgeType: 'active'
    },
    {
      id: 'discounts',
      label: 'Discounts & Rules',
      icon: Tag
    },
    {
      id: 'settings',
      label: 'API & Blueprint',
      icon: Code2
    }
  ];

  return (
    <aside className="w-full md:w-56 lg:w-64 border-r border-white/[0.05] bg-[#07090e]/60 backdrop-blur-xl p-4 flex flex-col justify-between shrink-0">
      
      {/* Navigation Links - Pure Minimalist */}
      <div className="space-y-1">
        <p className="px-3 py-2 royal-label">Navigation</p>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${
                isActive
                  ? 'bg-white/[0.06] text-white font-semibold border border-white/[0.08]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-amber-400' : 'text-slate-500'
                }`} />
                <span className="text-xs truncate tracking-tight">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                  item.badgeType === 'overdue'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Understated Financial Summary & User Logout */}
      <div className="pt-4 border-t border-white/[0.05] px-2 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium text-[11px]">Active MRR</span>
          <span className="font-mono font-bold text-white text-xs">
            ${(metrics.mrr || 0).toLocaleString()}
          </span>
        </div>

        {currentUser && (
          <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-amber-400 capitalize">{currentUser.role || 'Member'}</p>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

    </aside>
  );
}
