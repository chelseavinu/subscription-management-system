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
  Sparkles
} from 'lucide-react';
import { authApi } from '../../services/api';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await authApi.login(email, password);
      if (onLoginSuccess) {
        onLoginSuccess(data.user, data.token);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 royal-bg relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-amber-500/10 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-amber-400/10 to-transparent border border-amber-400/30 shadow-[0_0_25px_-5px_rgba(212,175,55,0.35)] mb-4">
            <Crown className="w-7 h-7 text-amber-300" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-sans">
            Brightloop <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">Finance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium tracking-wide">
            Subscription Management & Recurring Billing Platform
          </p>
        </div>

        {/* Card Panel */}
        <div className="royal-panel rounded-3xl p-6 sm:p-8 space-y-6">
          
          <div className="space-y-1 text-center">
            <h2 className="text-lg font-bold text-white tracking-tight">Sign in to your account</h2>
            <p className="text-xs text-slate-400">Enter your enterprise credentials or click a demo role below</p>
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
                  placeholder="name@brightloop.com"
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
                <span className="text-[10px] text-slate-500 font-mono">Strict Auth</span>
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
                  autoComplete="current-password"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-royal-gold py-2.5 px-4 rounded-xl text-xs font-bold tracking-wide flex items-center justify-center gap-2 mt-2 shadow-[0_4px_18px_-4px_rgba(212,175,55,0.4)] disabled:opacity-50 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Demo Accounts */}
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

        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-slate-500 text-[11px] flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secured with JWT & Bcrypt | Brightloop Enterprise v1.0.0</span>
        </div>

      </div>
    </div>
  );
}
