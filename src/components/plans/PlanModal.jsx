import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Shield, Clock, Percent } from 'lucide-react';
import Modal from '../common/Modal';

export default function PlanModal({ isOpen, onClose, onSave, planToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    billing_interval: 'monthly', // daily | weekly | monthly | yearly
    min_quantity: 1,
    auto_close: true,
    allow_pause: true,
    trial_period_days: 14,
    base_discount_pct: 0,
    description: '',
    active: true
  });

  useEffect(() => {
    if (planToEdit) {
      setFormData(planToEdit);
    } else {
      setFormData({
        name: '',
        billing_interval: 'monthly',
        min_quantity: 1,
        auto_close: true,
        allow_pause: true,
        trial_period_days: 14,
        base_discount_pct: 0,
        description: '',
        active: true
      });
    }
  }, [planToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={planToEdit ? `Edit Plan: ${planToEdit.name}` : 'Create New Subscription Plan'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Plan Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Growth Scale (Monthly)"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>

        {/* Billing Interval & Min Qty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Billing Interval *
            </label>
            <select
              value={formData.billing_interval}
              onChange={(e) => setFormData({ ...formData, billing_interval: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 text-sm capitalize"
            >
              <option value="daily">Daily (High-Frequency / API test)</option>
              <option value="weekly">Weekly (Agile Sprints)</option>
              <option value="monthly">Monthly (Standard SaaS Cycle)</option>
              <option value="yearly">Yearly (Annual Enterprise Contract)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Minimum Seats / Quantity
            </label>
            <input
              type="number"
              min="1"
              required
              value={formData.min_quantity}
              onChange={(e) => setFormData({ ...formData, min_quantity: Number(e.target.value) || 1 })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Trial Days & Base Discount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Trial Period (Days)
            </label>
            <input
              type="number"
              min="0"
              value={formData.trial_period_days}
              onChange={(e) => setFormData({ ...formData, trial_period_days: Number(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Plan Incentive Discount (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.base_discount_pct}
              onChange={(e) => setFormData({ ...formData, base_discount_pct: Number(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Plan Description
          </label>
          <textarea
            rows="2"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Target audience and billing features..."
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>

        {/* Automation Toggles (auto_close & allow_pause from DB Blueprint) */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Subscription Lifecycle Policies
          </p>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-semibold text-white">Auto Close on Non-Payment</span>
              <p className="text-xs text-slate-400">
                Automatically transition subscription from active to closed if invoices remain unpaid.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.auto_close}
              onChange={(e) => setFormData({ ...formData, auto_close: e.target.checked })}
              className="w-5 h-5 accent-indigo-600 rounded bg-slate-900 border-slate-700"
            />
          </label>

          <div className="border-t border-slate-800/80 pt-2.5">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-white">Allow Customer Pause</span>
                <p className="text-xs text-slate-400">
                  Allows customers or sales agents to temporarily freeze billing without cancelling.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.allow_pause}
                onChange={(e) => setFormData({ ...formData, allow_pause: e.target.checked })}
                className="w-5 h-5 accent-indigo-600 rounded bg-slate-900 border-slate-700"
              />
            </label>
          </div>

          <div className="border-t border-slate-800/80 pt-2.5">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-semibold text-white">Plan Active in Catalog</span>
                <p className="text-xs text-slate-400">
                  Visible to sales representatives and available for new quotations.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-5 h-5 accent-indigo-600 rounded bg-slate-900 border-slate-700"
              />
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            {planToEdit ? 'Update Plan' : 'Create Plan'}
          </button>
        </div>

      </form>
    </Modal>
  );
}
