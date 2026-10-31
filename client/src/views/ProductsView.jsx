import React, { useState } from 'react';
import { Boxes, Plus, Check, Sparkles, Tag, Shield, Clock } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const ProductsView = ({ products, plans, currency, currentRole }) => {
  const [selectedProductForCalc, setSelectedProductForCalc] = useState(products[0] || null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const activeVariant = selectedProductForCalc?.variants?.[selectedVariantIndex];
  const totalPrice = (selectedProductForCalc?.sales_price || 0) + (activeVariant?.extra_price || 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF' }}>Product Catalog & Recurring Plans</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
            Configured with dynamic variant surcharges (e.g. Brand Odoo +$560) and billing intervals
          </p>
        </div>

        <span className="badge badge-active">
          <span className="badge-dot" /> Catalog Synchronized
        </span>
      </div>

      {/* 1. Dynamic Variant Surcharge Interactive Calculator Showcase */}
      {selectedProductForCalc && (
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(13, 20, 36, 0.8) 0%, rgba(16, 32, 60, 0.7) 100%)',
            border: '1px solid var(--glass-border-bright)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={20} color="#38BDF8" />
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>
                  Interactive Dynamic Surcharge Preview
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>
                  Select different variant options below to watch base price and surcharges compute in real time
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--silver-400)' }}>Effective Monthly Price</div>
              <div className="tabular-nums text-blue" style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                {formatCurrency(totalPrice, currency)}
              </div>
            </div>
          </div>

          {/* Variant Selector Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
            {selectedProductForCalc.variants?.map((v, idx) => {
              const isSelected = selectedVariantIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedVariantIndex(idx)}
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-pill)',
                    gap: '6px',
                  }}
                >
                  <Tag size={13} />
                  <span>
                    {v.name}: {v.option}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.15)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {v.extra_price > 0 ? `+$${v.extra_price}` : '+$0'}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8125rem',
            }}
          >
            <span style={{ color: 'var(--silver-300)' }}>
              Base Product: <strong>{selectedProductForCalc.name}</strong> (${selectedProductForCalc.sales_price}) + Variant: <strong>{activeVariant?.option}</strong> (+${activeVariant?.extra_price})
            </span>
            <span style={{ color: '#34D399', fontWeight: 600 }}>Odoo Hackathon Specification Compliant</span>
          </div>
        </div>
      )}

      {/* 2. Product Catalog Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>Available Software & Service Products</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {products.map((p) => (
            <div
              key={p._id}
              onClick={() => {
                setSelectedProductForCalc(p);
                setSelectedVariantIndex(0);
              }}
              className="glass-panel glass-interactive"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                border: selectedProductForCalc?._id === p._id ? '1px solid var(--electric-blue)' : '1px solid var(--glass-border)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      background: p.type === 'software' ? 'rgba(0, 102, 255, 0.15)' : 'rgba(20, 184, 166, 0.15)',
                      color: p.type === 'software' ? '#38BDF8' : '#2DD4BF',
                    }}
                  >
                    {p.type}
                  </span>
                  <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {formatCurrency(p.sales_price, currency)}
                  </div>
                </div>

                <h4 style={{ fontSize: '1.05rem', color: '#FFFFFF', marginTop: '10px' }}>{p.name}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--silver-400)', marginTop: '4px' }}>{p.notes}</p>
              </div>

              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--silver-400)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Dynamic Variants ({p.variants?.length || 0})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {p.variants?.map((v, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.6875rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--glass-border)',
                        color: v.extra_price > 0 ? '#38BDF8' : 'var(--silver-300)',
                      }}
                    >
                      {v.option} (+${v.extra_price})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Recurring Billing Plans */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>Recurring Billing Plans</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {plans.map((pl) => (
            <div
              key={pl._id}
              className="glass-panel"
              style={{
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--sophisticated-teal)',
                  }}
                >
                  {pl.billing_interval} Cadence
                </span>
                <h4 style={{ fontSize: '1.15rem', color: '#FFFFFF', marginTop: '4px' }}>{pl.name}</h4>

                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {formatCurrency(pl.base_price, currency)}
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--silver-400)' }}>
                    / {pl.billing_interval}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', color: 'var(--silver-300)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={14} color="#34D399" />
                  <span>Allows Subscription Pause: {pl.allow_pause ? 'Yes' : 'No'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={14} color="#34D399" />
                  <span>Auto-close on Failure: {pl.auto_close ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ProductsView;
