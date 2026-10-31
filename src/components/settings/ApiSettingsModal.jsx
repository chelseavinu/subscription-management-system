import React, { useState } from 'react';
import { 
  Code2, 
  Database, 
  Server, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Radio, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { config, initLocalStorage } from '../../services/api';

export default function ApiSettingsModal({ isOpen, onClose, onRefreshData }) {
  const [mode, setMode] = useState(config.getMode());
  const [baseUrl, setBaseUrl] = useState(config.getBaseUrl());
  const [pingStatus, setPingStatus] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!isOpen) return null;

  const handleSave = () => {
    config.setMode(mode);
    config.setBaseUrl(baseUrl);
    onRefreshData();
    onClose();
  };

  const handlePingBackend = async () => {
    setPingStatus('testing');
    try {
      const cleanUrl = baseUrl.replace(/\/$/, '');
      const res = await fetch(`${cleanUrl}/products`, { method: 'GET', signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        setPingStatus('online');
      } else {
        setPingStatus(`error_${res.status}`);
      }
    } catch (e) {
      setPingStatus('offline');
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data (products, plans, invoices, payments) back to original hackathon seed?')) {
      config.resetDatabase();
      onRefreshData();
      alert('Data successfully reset to initial seed!');
    }
  };

  const schemas = [
    {
      title: '1. Users',
      endpoint: 'POST /api/auth/login, POST /api/auth/register',
      schema: `{ _id, email, password_hash, role: 'admin' | 'staff' | 'customer' }`
    },
    {
      title: '2. Products & Variants (+560)',
      endpoint: 'GET /api/products, POST /api/products',
      schema: `{ name, type, sales_price, cost_price, variants: [{ name: 'Brand', option: 'Odoo', extra_price: 560 }] }`
    },
    {
      title: '3. Subscription Plans',
      endpoint: 'GET /api/plans, POST /api/plans',
      schema: `{ name, billing_interval: 'daily'|'weekly'|'monthly'|'yearly', min_quantity, auto_close, allow_pause }`
    },
    {
      title: '4. Subscriptions',
      endpoint: 'GET /api/subscriptions, POST /api/subscriptions, PATCH /api/subscriptions/:id/status',
      schema: `{ subscription_number, customer_id, plan_id, status: 'draft'|'quotation'|'confirmed'|'active'|'closed', items: [...] }`
    },
    {
      title: '5. Invoices & Billing Run',
      endpoint: 'GET /api/invoices, POST /api/invoices/generate-billing-cycle',
      schema: `{ invoice_number, subscription_id, customer_id, due_date, total_amount, tax_amount, status: 'draft'|'confirmed'|'paid' }`
    },
    {
      title: '6. Payments',
      endpoint: 'GET /api/payments, POST /api/payments',
      schema: `{ invoice_id, amount, payment_method, date, notes }`
    },
    {
      title: '7. Discounts',
      endpoint: 'GET /api/discounts, POST /api/discounts',
      schema: `{ code, type: 'percentage'|'fixed', value, min_qty, min_amount, expiry_date, usage_limit }`
    }
  ];

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-10 my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Backend Integration & API Blueprint</h3>
              <p className="text-xs text-slate-400">Member 1 & 2 REST Contract & Real-time Mode Switching</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm font-semibold">✕</button>
        </div>

        <div className="p-6 max-h-[calc(85vh-90px)] overflow-y-auto space-y-6">
          
          {/* Operating Mode Selector */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Execution Architecture
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('mock')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  mode === 'mock'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Demo Sandbox (Mock)</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  100% resilient for hackathon demo. Stores and persists full state in browser storage with instant response.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode('live')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  mode === 'live'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Live Backend API</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Connects to Member 1 & 2's Express / FastAPI server (e.g. Render, Railway, localhost).
                </p>
              </button>
            </div>
          </div>

          {/* Backend URL Input & Health Check */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Backend Endpoint Configuration
            </span>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:5000/api"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handlePingBackend}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors whitespace-nowrap"
              >
                Test Ping
              </button>
            </div>

            {pingStatus && (
              <div className="text-xs flex items-center gap-2">
                {pingStatus === 'testing' && <span className="text-amber-400">Testing connection...</span>}
                {pingStatus === 'online' && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Live backend responsive and healthy!
                  </span>
                )}
                {pingStatus === 'offline' && (
                  <span className="text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Backend unreachable. The app will automatically fallback to local mock engine so your demo never breaks!
                  </span>
                )}
                {pingStatus.startsWith('error') && (
                  <span className="text-rose-400">Backend returned status {pingStatus.replace('error_', '')}</span>
                )}
              </div>
            )}
          </div>

          {/* Minimal Database Blueprint Contract Reference */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Hackathon API Contract (Member 1 & 2 Endpoints)
              </span>
              <span className="text-[11px] text-slate-500">7 Core Entities</span>
            </div>

            <div className="space-y-2">
              {schemas.map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">{s.title}</span>
                    <button
                      onClick={() => copyToClipboard(s.schema, idx)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-[11px]"
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="font-mono text-[11px] text-indigo-400">{s.endpoint}</p>
                  <p className="font-mono text-[11px] text-slate-400 mt-1 bg-slate-900 p-2 rounded-lg break-all">
                    {s.schema}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Reset Demo Data Button */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Reset Hackathon Demo Data</p>
              <p className="text-[11px] text-slate-400">
                Restores original products (with +560 Odoo), 4 plans, sample subscriptions, and invoices.
              </p>
            </div>
            <button
              onClick={handleResetData}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Data
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            Apply & Save
          </button>
        </div>

      </div>
    </div>
  );
}
