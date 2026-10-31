import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Tag, 
  Layers, 
  Edit3, 
  Trash2, 
  Sparkles, 
  DollarSign, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import Badge from '../common/Badge';
import ProductModal from './ProductModal';

export default function ProductsManager({ 
  products = [], 
  onCreateProduct, 
  onUpdateProduct, 
  onDeleteProduct 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || p.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (formData) => {
    if (editingProduct) {
      await onUpdateProduct(editingProduct._id, formData);
    } else {
      await onCreateProduct(formData);
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
              Products & Dynamic Variants
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-300 border border-white/[0.08]">
              {products.length} Items
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure tiered offerings, profit margins, and dynamic variant rules (including the <strong className="text-amber-300">+560 Odoo Logic</strong>).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          id="btn-add-product"
          className="btn-royal-gold flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold text-slate-950 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search products by title, category, or spec..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/[0.06] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Type filter tabs */}
        <div className="flex items-center royal-pill rounded-lg p-0.5 text-xs">
          {[
            { id: 'all', label: 'All Types' },
            { id: 'service', label: 'Services' },
            { id: 'product', label: 'Products' },
            { id: 'consu', label: 'Consumables' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1 rounded-md capitalize text-xs font-medium transition-all ${
                selectedType === tab.id
                  ? 'bg-white/[0.08] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="royal-panel p-12 text-center rounded-2xl text-slate-400">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-300">No products match your filter</p>
          <p className="text-xs text-slate-500 mt-1">Try another search or add a new product entry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((prod) => {
            const extraTotal = (prod.variants || []).reduce((sum, v) => sum + (Number(v.extra_price) || 0), 0);
            const totalWithVariants = Number(prod.sales_price || 0) + extraTotal;
            const hasOdooVariant = (prod.variants || []).some(
              (v) => v.name?.toLowerCase().includes('brand') && v.option?.toLowerCase().includes('odoo')
            );

            return (
              <div 
                key={prod._id}
                className="royal-card rounded-2xl p-5 flex flex-col justify-between group"
              >

                <div>
                  {/* Top tags & Action */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge status={prod.type} />
                      <span className="text-[10px] font-mono font-semibold text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                        {prod.category || 'General'}
                      </span>
                      {hasOdooVariant && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-300" /> +560 Odoo Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        title="Edit Product"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(prod._id)}
                        title="Delete Product"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-base font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors font-sans">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {prod.description || 'No description provided.'}
                  </p>

                  {/* Pricing Matrix Pill */}
                  <div className="mt-4 p-3 rounded-xl bg-black/30 border border-white/[0.05] flex items-center justify-between text-xs">
                    <div>
                      <span className="swiss-label">Base Price</span>
                      <span className="font-extrabold text-sm text-white font-mono mt-0.5 block">
                        ${Number(prod.sales_price || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-center">
                      <span className="swiss-label">Cost</span>
                      <span className="font-medium text-slate-300 font-mono mt-0.5 block">
                        ${Number(prod.cost_price || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="swiss-label">Tax Rate</span>
                      <span className="font-bold text-slate-300 font-mono mt-0.5 block">
                        {prod.tax_pct || 18}%
                      </span>
                    </div>
                  </div>

                  {/* Variants List Section */}
                  <div className="mt-3.5 space-y-1.5">
                    <span className="swiss-label flex items-center gap-1">
                      <Layers className="w-3 h-3 text-indigo-400" /> 
                      Variants ({(prod.variants || []).length})
                    </span>

                    {(prod.variants || []).length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic">No variants configured</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {prod.variants.map((v, i) => (
                          <div 
                            key={i}
                            className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono flex items-center gap-1.5 ${
                              v.extra_price === 560
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                                : 'bg-white/[0.03] border-white/[0.07] text-slate-300'
                            }`}
                          >
                            <span className="text-slate-400">{v.name}:</span>
                            <span className="font-semibold">{v.option}</span>
                            <span className="text-emerald-400 font-bold">
                              (+${Number(v.extra_price || 0)})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer with Configured Max Price */}
                <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Max Configured Price:</span>
                  <span className="text-sm font-extrabold text-emerald-400 font-mono">
                    ${totalWithVariants.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Creation / Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={editingProduct}
      />

    </div>
  );
}
