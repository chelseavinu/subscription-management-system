import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  ChevronDown, 
  User, 
  ShieldCheck, 
  Briefcase, 
  CreditCard,
  LogOut,
  LogIn,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';
import Logo from './Logo';

export const Navbar = ({ 
  user, 
  onLogout, 
  onOpenAuth, 
  onRoleChange, 
  currentRole,
  currency,
  onCurrencyChange,
  onOpenNewSub,
  searchQuery,
  onSearchChange,
  mobileNavOpen,
  setMobileNavOpen
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Payment Received',
      desc: 'Wire transfer $2,706 received for INV-2026-0001',
      time: '12m ago',
    },
    {
      id: 2,
      type: 'warning',
      title: 'Invoice Overdue',
      desc: 'Acme Global invoice INV-2026-0003 is 5 days overdue ($495.00)',
      time: '1h ago',
    },
    {
      id: 3,
      type: 'info',
      title: 'New Quotation Pending',
      desc: 'Starlight Media submitted quotation for AI Module ($706.60)',
      time: '3h ago',
    },
  ];

  return (
    <header
      className="glass-panel"
      style={{
        position: 'sticky',
        top: '12px',
        zIndex: 100,
        margin: '12px 16px 0 16px',
        borderRadius: 'var(--radius-lg)',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        border: '1px solid var(--glass-border-bright)',
      }}
    >
      {/* Left: Mobile hamburger & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          style={{ display: 'inline-flex', padding: '6px' }}
          aria-label="Toggle navigation menu"
        >
          {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Logo size="md" />
      </div>

      {/* Center: Search & Currency */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '440px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--silver-400)',
            }}
          />
          <input
            type="text"
            placeholder="Search subscriptions, invoices, customers (Press ⌘K)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="form-input"
            style={{
              paddingLeft: '36px',
              paddingRight: '60px',
              height: '38px',
              fontSize: '0.8125rem',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(10, 16, 30, 0.75)',
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--silver-400)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            ⌘K
          </span>
        </div>
      </div>

      {/* Right: Actions, Currency, Role Switcher, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Currency Switcher */}
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className="form-select"
          style={{
            width: 'auto',
            height: '36px',
            padding: '4px 10px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.04)',
            color: 'var(--silver-200)',
            cursor: 'pointer',
          }}
          aria-label="Currency Selector"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="INR">INR (₹)</option>
        </select>

        {/* Role Switcher Pill */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="btn btn-secondary btn-sm"
            style={{
              height: '36px',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--glass-border-bright)',
              background: currentRole === 'admin' 
                ? 'rgba(0, 102, 255, 0.15)' 
                : currentRole === 'staff' 
                ? 'rgba(20, 184, 166, 0.15)' 
                : 'rgba(56, 189, 248, 0.15)',
              color: '#FFFFFF',
            }}
            title="Switch User Role Persona"
          >
            {currentRole === 'admin' ? (
              <ShieldCheck size={14} color="#38BDF8" />
            ) : currentRole === 'staff' ? (
              <Briefcase size={14} color="#2DD4BF" />
            ) : (
              <User size={14} color="#93C5FD" />
            )}
            <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{currentRole}</span>
            <ChevronDown size={12} color="var(--silver-400)" />
          </button>

          {showRoleMenu && (
            <div
              className="glass-panel-elevated"
              style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                width: '200px',
                padding: '8px',
                zIndex: 200,
              }}
            >
              <div style={{ padding: '4px 8px 8px', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--silver-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Simulate Persona
              </div>
              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', color: currentRole === 'admin' ? '#38BDF8' : 'var(--silver-200)' }}
                onClick={() => { onRoleChange('admin'); setShowRoleMenu(false); }}
              >
                <ShieldCheck size={14} /> Admin (Full Access)
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', color: currentRole === 'staff' ? '#2DD4BF' : 'var(--silver-200)' }}
                onClick={() => { onRoleChange('staff'); setShowRoleMenu(false); }}
              >
                <Briefcase size={14} /> Operations Staff
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', color: currentRole === 'customer' ? '#93C5FD' : 'var(--silver-200)' }}
                onClick={() => { onRoleChange('customer'); setShowRoleMenu(false); }}
              >
                <User size={14} /> Customer (Acme Global)
              </button>
            </div>
          )}
        </div>

        {/* Quick New Subscription button */}
        {currentRole !== 'customer' && (
          <button
            onClick={onOpenNewSub}
            className="btn btn-primary btn-sm"
            style={{ height: '36px', padding: '6px 14px', borderRadius: 'var(--radius-pill)' }}
          >
            <Plus size={15} />
            <span>New Sub</span>
          </button>
        )}

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-secondary btn-sm"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%', position: 'relative' }}
            aria-label="Notifications"
          >
            <Bell size={16} />
            <span
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--status-emerald)',
                boxShadow: '0 0 8px var(--status-emerald)',
              }}
            />
          </button>

          {showNotifications && (
            <div
              className="glass-panel-elevated"
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '320px',
                padding: '12px',
                zIndex: 200,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Notifications</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--sophisticated-teal)', fontWeight: 600 }}>3 New</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: n.type === 'success' ? '#34D399' : n.type === 'warning' ? '#FBBF24' : '#38BDF8' }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--silver-400)' }}>{n.time}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--silver-300)' }}>{n.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile / Auth Button */}
        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="btn btn-secondary btn-sm"
              style={{ height: '36px', padding: '4px 10px', borderRadius: 'var(--radius-pill)', gap: '8px' }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0066FF 0%, #14B8A6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.8125rem' }}>
                {user.name.split(' ')[0]}
              </span>
            </button>

            {showUserMenu && (
              <div
                className="glass-panel-elevated"
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '220px',
                  padding: '10px',
                  zIndex: 200,
                }}
              >
                <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--glass-border)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#FFFFFF' }}>{user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>{user.email}</div>
                  <span className={`badge badge-${user.role === 'admin' ? 'active' : user.role === 'staff' ? 'confirmed' : 'draft'}`} style={{ marginTop: '6px' }}>
                    {user.role}
                  </span>
                </div>
                <div style={{ marginTop: '6px' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => { onLogout(); setShowUserMenu(false); }}
                    style={{ width: '100%', justifyContent: 'flex-start', color: '#FB7185' }}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="btn btn-primary btn-sm"
            style={{ height: '36px', borderRadius: 'var(--radius-pill)' }}
          >
            <LogIn size={14} /> Sign In
          </button>
        )}
      </div>
    </header>
  );
};
export default Navbar;
