import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles,
  ShieldCheck,
  Briefcase,
  Building2
} from 'lucide-react';
import Logo from '../../components/Logo';

export const AuthScreen = ({ onLogin, onRegister, onForgotPassword }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('client@business.com');
  const [password, setPassword] = useState('Client#1234');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const handleDemoFill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setErrorMsg('');
    setSuccessNotice('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessNotice('');

    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else if (mode === 'register') {
        // Public registration: strictly customer account
        await onRegister(name, email, password);
      } else if (mode === 'forgot') {
        const res = await onForgotPassword(email);
        setSuccessNotice(res.message || 'Password reset link sent to your email.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '36px',
          background: 'linear-gradient(180deg, rgba(14, 21, 38, 0.95) 0%, rgba(8, 13, 24, 0.98) 100%)',
          border: '1px solid var(--glass-border-bright)',
          boxShadow: '0 24px 64px -16px rgba(0, 0, 0, 0.8), 0 0 50px rgba(0, 102, 255, 0.2)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        {/* Branding */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px', marginBottom: '24px' }}>
          <Logo size="lg" />
          <h2 style={{ fontSize: '1.5rem', color: '#FFFFFF', marginTop: '12px' }}>
            {mode === 'login' && 'Sign In to Brightloop'}
            {mode === 'register' && 'Create Customer Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
            {mode === 'login' && 'Access Customer Portal, Sales Workspace, or Finance Dashboard'}
            {mode === 'register' && 'Register your company account for self-service subscription management'}
            {mode === 'forgot' && 'Enter your registered email to receive reset instructions'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            padding: '4px',
            borderRadius: 'var(--radius-pill)',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--glass-border)',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); setSuccessNotice(''); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: mode === 'login' ? 'var(--electric-blue)' : 'transparent',
              color: mode === 'login' ? '#FFFFFF' : 'var(--silver-400)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); setSuccessNotice(''); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: mode === 'register' ? 'var(--electric-blue)' : 'transparent',
              color: mode === 'register' ? '#FFFFFF' : 'var(--silver-400)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => { setMode('forgot'); setErrorMsg(''); setSuccessNotice(''); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: mode === 'forgot' ? 'var(--electric-blue)' : 'transparent',
              color: mode === 'forgot' ? '#FFFFFF' : 'var(--silver-400)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            Reset
          </button>
        </div>

        {/* Demo Persona Fast-Login Buttons */}
        {mode === 'login' && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0, 102, 255, 0.06)',
              border: '1px solid rgba(0, 102, 255, 0.2)',
              marginBottom: '18px',
            }}
          >
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
              Quick Persona Fill:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleDemoFill('client@business.com', 'Client#1234')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '6px 4px', flexDirection: 'column', gap: '2px', border: email.includes('client') ? '1px solid #38BDF8' : '1px solid var(--glass-border)' }}
              >
                <Building2 size={13} color="#93C5FD" />
                <span>Customer</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('staff@brightloop.com', 'Staff#1234')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '6px 4px', flexDirection: 'column', gap: '2px', border: email.includes('staff') ? '1px solid #2DD4BF' : '1px solid var(--glass-border)' }}
              >
                <Briefcase size={13} color="#2DD4BF" />
                <span>Sales Staff</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('admin@brightloop.com', 'Admin#1234')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '6px 4px', flexDirection: 'column', gap: '2px', border: email.includes('admin') ? '1px solid #0066FF' : '1px solid var(--glass-border)' }}
              >
                <ShieldCheck size={13} color="#38BDF8" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        )}

        {/* Alerts */}
        {errorMsg && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.35)', color: '#FB7185', fontSize: '0.8125rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> <span>{errorMsg}</span>
          </div>
        )}
        {successNotice && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34D399', fontSize: '0.8125rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} /> <span>{successNotice}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'register' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Company / Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--silver-400)' }} />
                <input
                  type="text"
                  placeholder="e.g. Acme Global Enterprises"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--silver-400)' }} />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div className="form-label">
                <span>Password</span>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '0', fontSize: '0.75rem', color: '#38BDF8' }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--silver-400)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px', paddingRight: '36px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--silver-400)',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {mode === 'register' && (
                <div style={{ fontSize: '0.6875rem', color: 'var(--silver-400)', marginTop: '4px' }}>
                  Policy: &gt;8 chars, uppercase, lowercase, special character. Public accounts register strictly as Customer.
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Sign In to Workspace'}
                  {mode === 'register' && 'Register Customer Account'}
                  {mode === 'forgot' && 'Send Password Reset'}
                </span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;
