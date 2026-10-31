import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Edit3, 
  Trash2
} from 'lucide-react';
import Badge from '../common/Badge';
import DiscountModal from './DiscountModal';

export default function DiscountsManager({
  discounts = [],
  onCreateDiscount,
  onUpdateDiscount,
  onDeleteDiscount
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);

  const filteredDiscounts = discounts.filter((d) => {
    return (
      d.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleOpenCreate = () => {
    setEditingDiscount(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (discount) => {
    setEditingDiscount(discount);
    setIsModalOpen(true);
  };

  const handleSaveDiscount = async (formData) => {
    if (editingDiscount) {
      await onUpdateDiscount(editingDiscount._id, formData);
    } else {
      await onCreateDiscount(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Minimalist Royal Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 royal-panel p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
              Discounts & Incentive Rules
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-300 border border-white/[0.08]">
              {discounts.length} Rules
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure promotional percentage cuts, fixed dollar waivers, spend tiers, and redemption caps.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          id="btn-add-discount"
          className="btn-royal-gold flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold text-slate-950 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Rule</span>
        </button>
      </div>


      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by coupon code (e.g. HACKATHON2026)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
        />
      </div>

      {/* Discounts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDiscounts.map((discount) => {
          const usedPct = discount.usage_limit ? Math.min(100, Math.round(((discount.used_count || 0) / discount.usage_limit) * 100)) : 0;
          const isExpired = discount.expiry_date && new Date(discount.expiry_date) < new Date('2026-10-31');

          return (
            <div 
              key={discount._id}
              className="liquid-card rounded-2xl p-5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-wider">
                      {discount.code}
                    </span>
                    <Badge status={discount.type} text={discount.type === 'percentage' ? '% Off' : 'Fixed $'} />
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(discount)}
                      title="Edit Discount"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteDiscount(discount._id)}
                      title="Delete Discount"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Big Discount Value Display */}
                <div className="my-3">
                  <span className="text-2xl font-black text-white font-mono flex items-center gap-1">
                    {discount.type === 'percentage' ? `${discount.value}% OFF` : `-$${discount.value} USD`}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    Min requirement: {discount.min_qty || 1} unit(s) • Min spend ${discount.min_amount || 0}
                  </p>
                </div>

                {/* Usage Progress */}
                <div className="mt-4 p-3 rounded-xl bg-black/30 border border-white/[0.05] space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="swiss-label">Redemption Cap</span>
                    <span className="font-mono font-semibold text-white text-xs">
                      {discount.used_count || 0} / {discount.usage_limit || '∞'} ({usedPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${usedPct >= 90 ? 'bg-rose-500' : 'bg-indigo-500 shadow-[0_0_8px_#6366f1]'}`}
                      style={{ width: `${usedPct}%` }}
                    />
                  </div>
                </div>

              </div>

              {/* Expiry & Active Status */}
              <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Expires: {discount.expiry_date || 'No Expiry'}
                </span>

                <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  discount.active !== false && !isExpired
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                }`}>
                  {isExpired ? 'EXPIRED' : discount.active !== false ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <DiscountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDiscount}
        discountToEdit={editingDiscount}
      />

    </div>
  );
}
