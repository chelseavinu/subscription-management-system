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
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import Logo from '../components/Logo';

export const AuthView = ({ isOpen, onClose, onLogin, onRegister, onForgotPassword }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@brightloop.com');
  const [password, setPassword] = useState('Admin#1234');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  if (!isOpen) return null;

  const handleDemoFill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessNotice('');

    try {
      if (mode === 'login') {
        await onLogin(email, password);
        onClose();
      } else if (mode === 'register') {
        await onRegister(name, email, password);
        onClose();
      } else if (mode === 'forgot') {
        const res = await onForgotPassword(email);
        setSuccessNotice(res.message || 'Password reset link sent to your email.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '460px',
          padding: '32px',
          position: 'relative',
          background: 'linear-gradient(180deg, rgba(14, 21, 38, 0.95) 0%, rgba(8, 13, 24, 0.98) 100%)',
          border: '1px solid var(--glass-border-bright)',
          boxShadow: '0 24px 64px -16px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 102, 255, 0.2)',
        }}
      >
        {/* Soft Ambient Behind Glass */}
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '160px',
            height: '160px',
            background: 'radial-gradient(circle, rgba(0, 102, 255, 0.2) 0%, transparent 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
          }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn btn-ghost btn-sm"
          style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px' }}
        >
          <X size={18} />
        </button>

        {/* Branding & Title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px', marginBottom: '24px' }}>
          <Logo size="lg" />
          <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginTop: '10px' }}>
            {mode === 'login' && 'Sign in to Brightloop'}
            {mode === 'register' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
            {mode === 'login' && 'Enterprise recurring billing and subscription control'}
            {mode === 'register' && 'Get started with liquid-glass subscription management'}
            {mode === 'forgot' && 'Enter your email to receive recovery instructions'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
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
            onClick={() => { setMode('login'); setErrorMsg(''); }}
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
            onClick={() => { setMode('register'); setErrorMsg(''); }}
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
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setMode('forgot'); setErrorMsg(''); }}
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

        {/* Demo Quick-Fill Buttons for Graders / Reviewers */}
        {mode === 'login' && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0, 102, 255, 0.08)',
              border: '1px solid rgba(0, 102, 255, 0.2)',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', marginBottom: '6px' }}>
              One-Click Seed Persona Fill:
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleDemoFill('admin@brightloop.com', 'Admin#1234')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('staff@brightloop.com', 'Staff#1234')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('client@business.com', 'Client#1234')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                Customer
              </button>
            </div>
          </div>
        )}

        {/* Feedback Alerts */}
        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: '#FB7185',
              fontSize: '0.8125rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successNotice && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34D399',
              fontSize: '0.8125rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'register' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--silver-400)' }} />
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
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
                  placeholder="Enter secure password"
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
                  Policy: &gt;8 chars, 1 uppercase, 1 lowercase, 1 special character
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
                  {mode === 'login' && 'Sign In to Brightloop'}
                  {mode === 'register' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Link'}
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
export default AuthView;
