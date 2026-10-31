import React, { useState } from 'react';
import { 
  Crown, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  User,
  KeyRound,
  CheckCircle2,
  X
} from 'lucide-react';
import { authApi } from '../../services/api';

export default function Login({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  // Forgot Password Modal State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(null);
  const [forgotError, setForgotError] = useState(null);

  const demoAccounts = [
    {
      role: 'Admin',
      label: 'Platform Admin',
      email: 'admin@brightloop.com',
      password: 'Admin#1234',
      badge: 'Full Access',
      badgeColor: 'border-amber-400/40 text-amber-300 bg-amber-400/10'
    },
    {
      role: 'Staff',
      label: 'Operations Staff',
      email: 'staff@brightloop.com',
      password: 'Staff#1234',
      badge: 'Billing & Ops',
      badgeColor: 'border-blue-400/40 text-blue-300 bg-blue-400/10'
    },
    {
      role: 'Client',
      label: 'Acme Global',
      email: 'client@business.com',
      password: 'Client#1234',
      badge: 'Customer',
      badgeColor: 'border-emerald-400/40 text-emerald-300 bg-emerald-400/10'
    }
  ];

  const handleQuickFill = (account) => {
    setAuthMode('login');
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
  };

  // Password rules validation for registration
  const passwordCriteria = {
    length: password.length > 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    if (authMode === 'register') {
      if (!name || !email || !password) {
        setError('Please provide your name, corporate email, and a secure password.');
        return;
      }
      if (!isPasswordValid) {
        setError('Password must satisfy all security criteria (> 8 chars, uppercase, lowercase, special char).');
        return;
      }
    } else {
      if (!email || !password) {
        setError('Please provide both email and password.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (authMode === 'register') {
        const data = await authApi.register(name, email, password);
        if (onLoginSuccess) {
          onLoginSuccess(data.user, data.token);
        }
      } else {
        const data = await authApi.login(email, password);
        if (onLoginSuccess) {
          onLoginSuccess(data.user, data.token);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccess(null);

    try {
      const res = await authApi.forgotPassword(forgotEmail);
      setForgotSuccess(res.message || `Password reset link dispatched to ${forgotEmail}.`);
    } catch (err) {
      setForgotError(err.message || 'Failed to dispatch reset link.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 royal-bg relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-amber-500/10 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-amber-400/10 to-transparent border border-amber-400/30 shadow-[0_0_25px_-5px_rgba(212,175,55,0.35)] mb-3">
            <Crown className="w-7 h-7 text-amber-300" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-sans">
            Brightloop <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">Finance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">
            Subscription Management & Recurring Billing Platform
          </p>
        </div>

        {/* Card Panel */}
        <div className="royal-panel rounded-3xl p-6 sm:p-8 space-y-5">
          
          {/* Tab Selector: Sign In vs Sign Up */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs font-bold">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(null); }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-400/20 text-amber-300 border border-amber-400/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setError(null); }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-400/20 text-amber-300 border border-amber-400/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Customer Sign Up
            </button>
          </div>

          <div className="space-y-1 text-center">
            <h2 className="text-base font-bold text-white tracking-tight">
              {authMode === 'login' ? 'Welcome back to your workspace' : 'Create a new Customer account'}
            </h2>
            <p className="text-xs text-slate-400">
              {authMode === 'login' 
                ? 'Sign in or select a demo role below'
                : 'Access your dedicated self-service subscription portal'
              }
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Field (Sign Up Only) */}
            {authMode === 'register' && (
              <div className="space-y-1.5 animate-in fade-in">
                <label className="royal-label block" htmlFor="login-name">Organization / Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="login-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Acme Global Inc."
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 transition-all font-sans"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="royal-label block" htmlFor="login-email">Corporate Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 transition-all font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="royal-label block" htmlFor="login-password">Password</label>
                {authMode === 'login' ? (
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(true); setForgotEmail(email); }}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-mono transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                ) : (
                  <span className="text-[10px] text-amber-400 font-mono">Strict Rule: &gt;8 chars</span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-500" />}
                </button>
              </div>
            </div>

            {/* Password Security Criteria (Sign Up Only) */}
            {authMode === 'register' && (
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-[10px] font-mono">
                <p className="text-slate-400 font-semibold mb-1">Password Requirements:</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <span className={passwordCriteria.length ? 'text-emerald-400' : 'text-slate-500'}>
                    {passwordCriteria.length ? '✓' : '○'} &gt; 8 characters
                  </span>
                  <span className={passwordCriteria.uppercase ? 'text-emerald-400' : 'text-slate-500'}>
                    {passwordCriteria.uppercase ? '✓' : '○'} Uppercase letter
                  </span>
                  <span className={passwordCriteria.lowercase ? 'text-emerald-400' : 'text-slate-500'}>
                    {passwordCriteria.lowercase ? '✓' : '○'} Lowercase letter
                  </span>
                  <span className={passwordCriteria.special ? 'text-emerald-400' : 'text-slate-500'}>
                    {passwordCriteria.special ? '✓' : '○'} Special character
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-royal-gold py-2.5 px-4 rounded-xl text-xs font-bold tracking-wide flex items-center justify-center gap-2 mt-2 shadow-[0_4px_18px_-4px_rgba(212,175,55,0.4)] disabled:opacity-50 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>{authMode === 'login' ? 'Authenticating...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <span>{authMode === 'login' ? 'Sign In to Workspace' : 'Complete Registration'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Demo Accounts (Login Only) */}
          {authMode === 'login' && (
            <div className="pt-4 border-t border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold text-[11px] tracking-wide text-amber-300/80 uppercase">
                  <Sparkles className="w-3.5 h-3.5" /> Demo Fast-Fill Profiles
                </span>
                <span className="text-[10px] text-slate-500">One-click</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickFill(acc)}
                    className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-amber-400/30 transition-all text-left flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                        {acc.role}
                      </span>
                      <span className={`text-[9px] font-mono px-1 py-0.5 rounded border ${acc.badgeColor}`}>
                        {acc.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate w-full font-mono">
                      {acc.email.split('@')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-slate-500 text-[11px] flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secured with JWT & Bcrypt | Brightloop Enterprise v1.0.0</span>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm royal-panel rounded-3xl p-6 space-y-4 border border-amber-400/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Reset Account Password</h3>
              </div>
              <button onClick={() => setShowForgotPassword(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter your registered corporate email. A password recovery link will arrive in your inbox.
            </p>

            {forgotError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {forgotError}
              </div>
            )}

            {forgotSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@brightloop.com"
                required
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs"
              />

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full btn-royal-gold py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                {forgotLoading ? 'Dispatching Link...' : 'Send Recovery Link'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
