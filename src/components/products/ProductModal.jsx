import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Sparkles, Tag, DollarSign, HelpCircle, Layers } from 'lucide-react';
import Modal from '../common/Modal';

export default function ProductModal({ isOpen, onClose, onSave, productToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'service', // service | product | consu
    category: 'Software & Cloud',
    sales_price: 999,
    cost_price: 350,
    tax_pct: 18,
    description: '',
    variants: [
      { name: 'Brand', option: 'Odoo Engine', extra_price: 560 }
    ]
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        ...productToEdit,
        variants: productToEdit.variants || []
      });
    } else {
      setFormData({
        name: '',
        type: 'service',
        category: 'Software & Cloud',
        sales_price: 999,
        cost_price: 350,
        tax_pct: 18,
        description: '',
        variants: [
          { name: 'Brand', option: 'Odoo Engine', extra_price: 560 }
        ]
      });
    }
  }, [productToEdit, isOpen]);

  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: '', option: '', extra_price: 0 }]
    }));
  };

  const handleApplyOdooPreset = () => {
    // Hackathon +560 Odoo logic preset
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: 'Brand', option: 'Odoo Suite', extra_price: 560 }]
    }));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...formData.variants];
    updated[index] = {
      ...updated[index],
      [field]: field === 'extra_price' ? Number(value) || 0 : value
    };
    setFormData((prev) => ({ ...prev, variants: updated }));
  };

  const handleRemoveVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData);
  };

  // Calculations
  const salesPrice = Number(formData.sales_price) || 0;
  const costPrice = Number(formData.cost_price) || 0;
  const variantsTotalExtra = formData.variants.reduce((sum, v) => sum + (Number(v.extra_price) || 0), 0);
  const totalConfiguredPrice = salesPrice + variantsTotalExtra;
  const grossProfit = salesPrice - costPrice;
  const marginPct = salesPrice > 0 ? ((grossProfit / salesPrice) * 100).toFixed(1) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? `Edit Product: ${productToEdit.name}` : 'Create New Product & Variants'}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Core Product Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Enterprise Cloud ERP Suite"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Product Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 text-sm"
            >
              <option value="service">Service (SaaS / API / Subscriptions)</option>
              <option value="product">Storable Product (Hardware / Tangible)</option>
              <option value="consu">Consumable (API Credits / Usage Token)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. Software & Cloud"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Pricing Matrix */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Base Financials & Taxes
            </h4>
            <span className="text-xs text-slate-400">
              Profit Margin: <span className="font-bold text-emerald-400">{marginPct}%</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Base Sales Price ($)</label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={formData.sales_price}
                onChange={(e) => setFormData({ ...formData, sales_price: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Cost Price ($)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.tax_pct}
                onChange={(e) => setFormData({ ...formData, tax_pct: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Variants Builder (with +560 Logic requirement) */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-indigo-500/20 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" /> Product Variants Builder (+560 Logic)
              </h4>
              <p className="text-[11px] text-slate-400">
                Define variant attributes (e.g. Brand: Odoo adds +$560 extra price).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyOdooPreset}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center gap-1 transition-colors"
                title="Hackathon Requirement: Add Brand: Odoo with +560 extra price"
              >
                <Sparkles className="w-3.5 h-3.5" /> +560 Odoo Preset
              </button>
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-300 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Attribute
              </button>
            </div>
          </div>

          {/* Variants List */}
          {formData.variants.length === 0 ? (
            <div className="p-4 text-center rounded-lg border border-dashed border-slate-800 text-slate-500 text-xs">
              No variants defined. Click "Add Attribute" or "+560 Odoo Preset" above.
            </div>
          ) : (
            <div className="space-y-2.5">
              {formData.variants.map((v, idx) => (
                <div 
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center bg-slate-900/90 p-2.5 rounded-xl border border-slate-800"
                >
                  <div className="col-span-4 sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Attribute (e.g. Brand)"
                      value={v.name}
                      onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Option (e.g. Odoo)"
                      value={v.option}
                      onChange={(e) => handleVariantChange(idx, 'option', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-3">
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-xs text-emerald-400 font-bold">+$</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="560"
                        value={v.extra_price}
                        onChange={(e) => handleVariantChange(idx, 'extra_price', e.target.value)}
                        className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Real-time Configured Price Preview */}
          <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Base (${salesPrice}) + Variants Extra (${variantsTotalExtra}):
            </span>
            <span className="text-sm font-extrabold text-white font-mono">
              Total: <span className="text-emerald-400">${totalConfiguredPrice.toLocaleString()}</span>
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Product Description
          </label>
          <textarea
            rows="2"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief details about service level, capabilities, or licensing terms..."
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>

        {/* Modal Action Buttons */}
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
            {productToEdit ? 'Save Changes' : 'Create Product & Variants'}
          </button>
        </div>

      </form>
    </Modal>
  );
}
