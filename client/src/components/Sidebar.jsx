import React from 'react';
import { 
  LayoutDashboard, 
  Repeat, 
  FileText, 
  CreditCard, 
  Boxes, 
  Building2, 
  Settings, 
  Activity,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  activeSubCount = 0, 
  overdueInvCount = 0,
  currentRole,
  mobileNavOpen,
  setMobileNavOpen
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Finance Dashboard',
      icon: LayoutDashboard,
      badge: null,
      roles: ['admin', 'staff', 'customer'],
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      icon: Repeat,
      badge: activeSubCount > 0 ? activeSubCount : null,
      badgeColor: 'var(--status-emerald)',
      roles: ['admin', 'staff', 'customer'],
    },
    {
      id: 'invoices',
      label: 'Invoices & Billing',
      icon: FileText,
      badge: overdueInvCount > 0 ? `${overdueInvCount} Overdue` : null,
      badgeColor: 'var(--status-rose)',
      roles: ['admin', 'staff', 'customer'],
    },
    {
      id: 'payments',
      label: 'Payments & Ledger',
      icon: CreditCard,
      badge: null,
      roles: ['admin', 'staff', 'customer'],
    },
    {
      id: 'products',
      label: 'Products & Plans',
      icon: Boxes,
      badge: null,
      roles: ['admin', 'staff'],
    },
    {
      id: 'customer-portal',
      label: 'Customer Portal',
      icon: Building2,
      badge: 'Acme',
      badgeColor: 'var(--status-sky)',
      roles: ['admin', 'staff', 'customer'],
    },
    {
      id: 'settings',
      label: 'System & RBAC',
      icon: Settings,
      badge: null,
      roles: ['admin', 'staff'],
    },
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(currentRole));

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 90,
          }}
        />
      )}

      <aside
        className={`glass-panel ${mobileNavOpen ? 'mobile-open' : ''}`}
        style={{
          width: '240px',
          margin: '12px 0 16px 16px',
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
          border: '1px solid var(--glass-border)',
          transition: 'transform var(--transition-normal)',
          zIndex: 95,
        }}
      >
        {/* Navigation list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div
            style={{
              padding: '0 12px 10px',
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--silver-400)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Management Suite
          </div>

          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (setMobileNavOpen) setMobileNavOpen(false);
                }}
                className={`btn btn-ghost btn-sm ${isActive ? 'active-nav-item' : ''}`}
                style={{
                  width: '100%',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  position: 'relative',
                  background: isActive ? 'linear-gradient(90deg, rgba(0, 102, 255, 0.18) 0%, rgba(20, 184, 166, 0.08) 100%)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--silver-300)',
                  border: isActive ? '1px solid rgba(0, 102, 255, 0.35)' : '1px solid transparent',
                  fontWeight: isActive ? 600 : 500,
                  boxShadow: isActive ? '0 4px 16px rgba(0, 102, 255, 0.15)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon
                    size={17}
                    color={isActive ? '#38BDF8' : 'var(--silver-400)'}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-pill)',
                      background: item.badgeColor ? `${item.badgeColor}22` : 'rgba(255, 255, 255, 0.08)',
                      color: item.badgeColor || 'var(--silver-200)',
                      border: `1px solid ${item.badgeColor ? `${item.badgeColor}55` : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom System & Subscription Engine Info */}
        <div
          style={{
            marginTop: '20px',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--silver-300)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={13} color="var(--status-emerald)" />
              Odoo Engine
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--status-emerald)', fontWeight: 600 }}>Connected</span>
          </div>

          <div style={{ fontSize: '0.6875rem', color: 'var(--silver-400)', lineHeight: 1.4 }}>
            Sub-2s Invoicing & Variant Surcharges Active
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '6px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              fontSize: '0.6875rem',
            }}
          >
            <span style={{ color: 'var(--silver-400)' }}>Current Persona</span>
            <span style={{ color: '#38BDF8', fontWeight: 600, textTransform: 'capitalize' }}>{currentRole}</span>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
