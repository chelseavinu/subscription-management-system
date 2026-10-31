import React from 'react';
import { 
  Zap, 
  Settings, 
  RotateCcw, 
  Layers, 
  Crown
} from 'lucide-react';
import { config } from '../../services/api';

export default function Navbar({ 
  onTriggerBilling, 
  onOpenSettings, 
  onResetData 
}) {
  const mode = config.getMode();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#07090e]/85 backdrop-blur-xl px-6 lg:px-10 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Royal Minimalist Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600/30 to-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_15px_-3px_rgba(212,175,55,0.3)]">
            <Crown className="w-4 h-4 text-amber-300" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-base tracking-wider text-white font-sans uppercase">
              Aurelia
            </span>
            <span className="text-[11px] font-medium text-slate-400 tracking-widest uppercase">
              Finance
            </span>
          </div>
        </div>

        {/* Minimal Actions */}
        <div className="flex items-center gap-3">
          
          {/* Royal Gold Trigger Billing Run */}
          <button
            onClick={onTriggerBilling}
            id="btn-trigger-billing-navbar"
            className="btn-royal-gold inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs tracking-wide"
            title="Batch Billing Run - generate cycle invoices"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Trigger Billing Run</span>
          </button>

          {/* Mode Pill (Minimal) */}
          <button
            onClick={onOpenSettings}
            className="royal-pill flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
            title="API Engine Mode"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${mode === 'live' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <span className="text-[11px] font-medium capitalize">{mode === 'live' ? 'Live API' : 'Demo Mode'}</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="API Blueprint & Database Contract"
            className="royal-pill p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Reset */}
          <button
            onClick={onResetData}
            title="Reset Data to Seed"
            className="royal-pill p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Profile Monogram */}
          <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center font-bold text-[11px] text-amber-300 ml-1">
            FL
          </div>

        </div>

      </div>
    </header>
  );
}
