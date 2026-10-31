import React, { useState, useEffect } from 'react';
import { Tag, Percent, DollarSign, Calendar, Shield, Hash } from 'lucide-react';
import Modal from '../common/Modal';

export default function DiscountModal({ isOpen, onClose, onSave, discountToEdit }) {
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage', // percentage | fixed
    value: 20,
    min_qty: 1,
    min_amount: 500,
    expiry_date: '2026-12-31',
    usage_limit: 100,
    active: true
  });

  useEffect(() => {
    if (discountToEdit) {
      setFormData(discountToEdit);
    } else {
      setFormData({
        code: '',
        type: 'percentage',
        value: 20,
        min_qty: 1,
        min_amount: 500,
        expiry_date: '2026-12-31',
        usage_limit: 100,
        active: true
      });
    }
  }, [discountToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code) return;
    onSave({
      ...formData,
      code: formData.code.toUpperCase().trim()
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={discountToEdit ? `Edit Rule: ${discountToEdit.code}` : 'Create Discount / Promo Rule'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Code & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Coupon Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. HACKATHON2026"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold uppercase placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Discount Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="percentage">Percentage Off (%)</option>
              <option value="fixed">Fixed Deduction ($ USD)</option>
            </select>
          </div>
        </div>

        {/* Discount Value */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Deduction Value * {formData.type === 'percentage' ? '(%)' : '($ USD)'}
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">
              {formData.type === 'percentage' ? '%' : '$'}
            </span>
            <input
              type="number"
              min="1"
              required
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) || 0 })}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Thresholds: Min Qty & Min Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Min Items / Quantity
            </label>
            <input
              type="number"
              min="1"
              value={formData.min_qty}
              onChange={(e) => setFormData({ ...formData, min_qty: Number(e.target.value) || 1 })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Min Order Value ($)
            </label>
            <input
              type="number"
              min="0"
              value={formData.min_amount}
              onChange={(e) => setFormData({ ...formData, min_amount: Number(e.target.value) || 0 })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Expiry Date & Usage Limit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Expiration Date
            </label>
            <input
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Max Redemption Limit
            </label>
            <input
              type="number"
              min="1"
              value={formData.usage_limit}
              onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) || 50 })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Active Toggle */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-semibold text-white">Rule Active</span>
              <p className="text-xs text-slate-400">Can be applied to new subscriptions and invoices.</p>
            </div>
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-5 h-5 accent-indigo-600 rounded bg-slate-900 border-slate-700"
            />
          </label>
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
            {discountToEdit ? 'Update Coupon' : 'Create Coupon Rule'}
          </button>
        </div>

      </form>
    </Modal>
  );
}
