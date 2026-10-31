// API and Data Service Layer with Dual Mode (Live Backend + Local Mock Engine)
// Seamlessly switches between live Express/FastAPI backend and in-browser mock engine.

import {
  INITIAL_PRODUCTS,
  INITIAL_PLANS,
  INITIAL_DISCOUNTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS
} from '../data/initialData';

const STORAGE_KEYS = {
  MODE: 'saas_api_mode', // 'mock' or 'live'
  BASE_URL: 'saas_backend_url',
  PRODUCTS: 'saas_products',
  PLANS: 'saas_plans',
  DISCOUNTS: 'saas_discounts',
  CUSTOMERS: 'saas_customers',
  SUBSCRIPTIONS: 'saas_subscriptions',
  INVOICES: 'saas_invoices',
  PAYMENTS: 'saas_payments'
};

// Safe JSON parse from LocalStorage
function getStorageItem(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error('Storage read error for ' + key, e);
    return fallback;
  }
}

function setStorageItem(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage write error for ' + key, e);
  }
}

// Initialize seed data if not yet initialized
export function initLocalStorage(forceReset = false) {
  if (forceReset || !localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    setStorageItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    setStorageItem(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    setStorageItem(STORAGE_KEYS.DISCOUNTS, INITIAL_DISCOUNTS);
    setStorageItem(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    setStorageItem(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
    setStorageItem(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    setStorageItem(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    if (!localStorage.getItem(STORAGE_KEYS.MODE)) {
      localStorage.setItem(STORAGE_KEYS.MODE, 'live');
    }
    if (!localStorage.getItem(STORAGE_KEYS.BASE_URL)) {
      localStorage.setItem(STORAGE_KEYS.BASE_URL, 'http://localhost:5000/api');
    }
  }
}

// Configuration getters & setters
export const config = {
  getMode: () => localStorage.getItem(STORAGE_KEYS.MODE) || 'live',
  setMode: (mode) => localStorage.setItem(STORAGE_KEYS.MODE, mode),
  getBaseUrl: () => localStorage.getItem(STORAGE_KEYS.BASE_URL) || 'http://localhost:5000/api',
  setBaseUrl: (url) => localStorage.setItem(STORAGE_KEYS.BASE_URL, url),
  resetDatabase: () => initLocalStorage(true)
};

// Ensure initialized on load
initLocalStorage();

// Helper to handle live fetch or fallback to mock
async function fetchWithFallback(endpoint, options = {}, mockHandler) {
  const mode = config.getMode();
  if (mode === 'live') {
    const baseUrl = config.getBaseUrl().replace(/\/$/, '');
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      };
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers
      });
      if (!response.ok) {
        throw new Error(`Backend error (${response.status}): ${response.statusText}`);
      }
      const data = await response.json();
      // Normalize response unwrapping for both raw arrays/objects and { success: true, data: [...] } envelopes
      return (data && data.data !== undefined) ? data.data : data;
    } catch (err) {
      console.warn(`[API] Live backend call to ${endpoint} failed. Falling back to local data. Reason:`, err.message);
      // Fall through to mock handler for maximum resilience during demo
      return mockHandler();
    }
  }
  return mockHandler();
}

// ---------------- PRODUCTS API ----------------
export const productsApi = {
  getAll: async () => {
    return fetchWithFallback('/products', { method: 'GET' }, () => {
      return getStorageItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    });
  },

  create: async (productData) => {
    return fetchWithFallback(
      '/products',
      { method: 'POST', body: JSON.stringify(productData) },
      () => {
        const products = getStorageItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        const newProduct = {
          _id: `prod_${Date.now()}`,
          ...productData,
          created_at: new Date().toISOString()
        };
        const updated = [newProduct, ...products];
        setStorageItem(STORAGE_KEYS.PRODUCTS, updated);
        return newProduct;
      }
    );
  },

  update: async (id, productData) => {
    return fetchWithFallback(
      `/products/${id}`,
      { method: 'PUT', body: JSON.stringify(productData) },
      () => {
        const products = getStorageItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        const index = products.findIndex((p) => p._id === id);
        if (index === -1) throw new Error('Product not found');
        const updatedProduct = { ...products[index], ...productData, updated_at: new Date().toISOString() };
        products[index] = updatedProduct;
        setStorageItem(STORAGE_KEYS.PRODUCTS, products);
        return updatedProduct;
      }
    );
  },

  delete: async (id) => {
    return fetchWithFallback(
      `/products/${id}`,
      { method: 'DELETE' },
      () => {
        const products = getStorageItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        const filtered = products.filter((p) => p._id !== id);
        setStorageItem(STORAGE_KEYS.PRODUCTS, filtered);
        return { success: true };
      }
    );
  }
};

// ---------------- PLANS API ----------------
export const plansApi = {
  getAll: async () => {
    return fetchWithFallback('/plans', { method: 'GET' }, () => {
      return getStorageItem(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    });
  },

  create: async (planData) => {
    return fetchWithFallback(
      '/plans',
      { method: 'POST', body: JSON.stringify(planData) },
      () => {
        const plans = getStorageItem(STORAGE_KEYS.PLANS, INITIAL_PLANS);
        const newPlan = {
          _id: `plan_${Date.now()}`,
          ...planData,
          active: planData.active ?? true,
          created_at: new Date().toISOString()
        };
        const updated = [newPlan, ...plans];
        setStorageItem(STORAGE_KEYS.PLANS, updated);
        return newPlan;
      }
    );
  },

  update: async (id, planData) => {
    return fetchWithFallback(
      `/plans/${id}`,
      { method: 'PUT', body: JSON.stringify(planData) },
      () => {
        const plans = getStorageItem(STORAGE_KEYS.PLANS, INITIAL_PLANS);
        const index = plans.findIndex((p) => p._id === id);
        if (index === -1) throw new Error('Plan not found');
        const updatedPlan = { ...plans[index], ...planData };
        plans[index] = updatedPlan;
        setStorageItem(STORAGE_KEYS.PLANS, plans);
        return updatedPlan;
      }
    );
  },

  delete: async (id) => {
    return fetchWithFallback(
      `/plans/${id}`,
      { method: 'DELETE' },
      () => {
        const plans = getStorageItem(STORAGE_KEYS.PLANS, INITIAL_PLANS);
        const filtered = plans.filter((p) => p._id !== id);
        setStorageItem(STORAGE_KEYS.PLANS, filtered);
        return { success: true };
      }
    );
  }
};

// ---------------- SUBSCRIPTIONS API ----------------
export const subscriptionsApi = {
  getAll: async () => {
    return fetchWithFallback('/subscriptions', { method: 'GET' }, () => {
      return getStorageItem(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
    });
  },

  updateStatus: async (id, target_status) => {
    return fetchWithFallback(
      `/subscriptions/${id}/transition`,
      { method: 'POST', body: JSON.stringify({ target_status }) },
      () => {
        const subs = getStorageItem(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
        const index = subs.findIndex((s) => s._id === id);
        if (index === -1) throw new Error('Subscription not found');
        subs[index] = { ...subs[index], status: target_status };
        setStorageItem(STORAGE_KEYS.SUBSCRIPTIONS, subs);
        return subs[index];
      }
    );
  }
};

// ---------------- INVOICES & BILLING API ----------------
export const invoicesApi = {
  getAll: async () => {
    return fetchWithFallback('/invoices', { method: 'GET' }, () => {
      return getStorageItem(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    });
  },

  updateStatus: async (id, status) => {
    return fetchWithFallback(
      `/invoices/${id}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
      () => {
        const invoices = getStorageItem(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
        const index = invoices.findIndex((i) => i._id === id);
        if (index === -1) throw new Error('Invoice not found');
        invoices[index] = { ...invoices[index], status };
        setStorageItem(STORAGE_KEYS.INVOICES, invoices);
        return invoices[index];
      }
    );
  },

  // Hackathon Special: Trigger Billing Run
  // Generates invoices for all active subscriptions due today or on demand
  triggerBillingRun: async () => {
    return fetchWithFallback(
      '/invoices/generate-billing-cycle',
      { method: 'POST' },
      () => {
        const subs = getStorageItem(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
        const invoices = getStorageItem(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
        const today = new Date().toISOString().split('T')[0];

        // Find active subscriptions
        const activeSubs = subs.filter((s) => s.status === 'active');
        const generatedInvoices = [];

        activeSubs.forEach((sub, idx) => {
          const invNum = `INV-2026-${String(invoices.length + generatedInvoices.length + 1).padStart(3, '0')}`;
          
          const newInv = {
            _id: `inv_gen_${Date.now()}_${idx}`,
            invoice_number: invNum,
            subscription_id: sub._id,
            subscription_number: sub.subscription_number,
            customer_id: sub.customer_id,
            customer_name: sub.customer_name,
            customer_email: sub.customer_email,
            issue_date: today,
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            subtotal: sub.billing_cycle_amount,
            tax_amount: Number((sub.billing_cycle_amount * 0.18).toFixed(2)),
            total_amount: Number((sub.billing_cycle_amount * 1.18).toFixed(2)),
            status: 'confirmed',
            items: sub.items.map((i) => ({
              name: `${i.product_name} ${i.variants_selected?.length ? '(' + i.variants_selected.map(v => v.name + ': ' + v.option).join(', ') + ')' : ''}`,
              qty: i.qty,
              unit_price: i.unit_price,
              amount: i.subtotal
            })),
            generated_by_billing_cycle: true
          };
          generatedInvoices.push(newInv);
        });

        const allInvoices = [...generatedInvoices, ...invoices];
        setStorageItem(STORAGE_KEYS.INVOICES, allInvoices);

        return {
          success: true,
          count: generatedInvoices.length,
          invoices: generatedInvoices,
          totalAmount: generatedInvoices.reduce((sum, inv) => sum + inv.total_amount, 0)
        };
      }
    );
  }
};

// ---------------- PAYMENTS API ----------------
export const paymentsApi = {
  getAll: async () => {
    return fetchWithFallback('/payments', { method: 'GET' }, () => {
      return getStorageItem(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    });
  },

  recordPayment: async (paymentData) => {
    return fetchWithFallback(
      '/payments',
      { method: 'POST', body: JSON.stringify(paymentData) },
      () => {
        const payments = getStorageItem(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
        const invoices = getStorageItem(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);

        const newPayment = {
          _id: `pay_${Date.now()}`,
          ...paymentData,
          date: new Date().toISOString(),
          transaction_ref: paymentData.transaction_ref || `tx_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        };

        // Mark invoice as paid
        const invIndex = invoices.findIndex((i) => i._id === paymentData.invoice_id);
        if (invIndex !== -1) {
          invoices[invIndex] = {
            ...invoices[invIndex],
            status: 'paid',
            paid_at: newPayment.date
          };
          setStorageItem(STORAGE_KEYS.INVOICES, invoices);
        }

        const updatedPayments = [newPayment, ...payments];
        setStorageItem(STORAGE_KEYS.PAYMENTS, updatedPayments);

        return {
          payment: newPayment,
          invoice: invIndex !== -1 ? invoices[invIndex] : null
        };
      }
    );
  }
};

// ---------------- DISCOUNTS API ----------------
export const discountsApi = {
  getAll: async () => {
    return fetchWithFallback('/discounts', { method: 'GET' }, () => {
      return getStorageItem(STORAGE_KEYS.DISCOUNTS, INITIAL_DISCOUNTS);
    });
  },

  create: async (discountData) => {
    return fetchWithFallback(
      '/discounts',
      { method: 'POST', body: JSON.stringify(discountData) },
      () => {
        const discounts = getStorageItem(STORAGE_KEYS.DISCOUNTS, INITIAL_DISCOUNTS);
        const newDiscount = {
          _id: `disc_${Date.now()}`,
          ...discountData,
          used_count: 0,
          active: discountData.active ?? true,
          created_at: new Date().toISOString()
        };
        const updated = [newDiscount, ...discounts];
        setStorageItem(STORAGE_KEYS.DISCOUNTS, updated);
        return newDiscount;
      }
    );
  },

  update: async (id, discountData) => {
    return fetchWithFallback(
      `/discounts/${id}`,
      { method: 'PUT', body: JSON.stringify(discountData) },
      () => {
        const discounts = getStorageItem(STORAGE_KEYS.DISCOUNTS, INITIAL_DISCOUNTS);
        const index = discounts.findIndex((d) => d._id === id);
        if (index === -1) throw new Error('Discount not found');
        discounts[index] = { ...discounts[index], ...discountData };
        setStorageItem(STORAGE_KEYS.DISCOUNTS, discounts);
        return discounts[index];
      }
    );
  },

  delete: async (id) => {
    return fetchWithFallback(
      `/discounts/${id}`,
      { method: 'DELETE' },
      () => {
        const discounts = getStorageItem(STORAGE_KEYS.DISCOUNTS, INITIAL_DISCOUNTS);
        const filtered = discounts.filter((d) => d._id !== id);
        setStorageItem(STORAGE_KEYS.DISCOUNTS, filtered);
        return { success: true };
      }
    );
  }
};

// ---------------- FINANCE METRICS ENGINE ----------------
export const financeApi = {
  getOverviewMetrics: async () => {
    const [subs, invoices, payments] = await Promise.all([
      subscriptionsApi.getAll(),
      invoicesApi.getAll(),
      paymentsApi.getAll()
    ]);

    const activeSubs = subs.filter((s) => s.status === 'active');
    
    // Monthly Recurring Revenue (MRR) calculation:
    // Normalize monthly, yearly (/12), weekly (*4.33)
    const mrr = activeSubs.reduce((acc, sub) => {
      const amount = sub.billing_cycle_amount || 0;
      if (sub.plan_name?.toLowerCase().includes('yearly')) return acc + amount / 12;
      if (sub.plan_name?.toLowerCase().includes('weekly')) return acc + amount * 4.33;
      return acc + amount;
    }, 0);

    const paidInvoices = invoices.filter((i) => i.status === 'paid');
    const totalCollectedRevenue = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    const unpaidInvoices = invoices.filter((i) => i.status === 'confirmed' || i.status === 'draft');
    const totalUnpaidAmount = unpaidInvoices.reduce((acc, i) => acc + (Number(i.total_amount) || 0), 0);

    const overdueInvoices = invoices.filter((i) => i.status === 'overdue');
    const totalOverdueAmount = overdueInvoices.reduce((acc, i) => acc + (Number(i.total_amount) || 0), 0);

    const totalInvoiceAmount = invoices.reduce((acc, i) => acc + (Number(i.total_amount) || 0), 0);
    const collectionRate = totalInvoiceAmount > 0 ? (totalCollectedRevenue / totalInvoiceAmount) * 100 : 0;

    return {
      activeSubscriptionsCount: activeSubs.length,
      totalSubscriptionsCount: subs.length,
      mrr: Math.round(mrr),
      arr: Math.round(mrr * 12),
      totalCollectedRevenue: Number(totalCollectedRevenue.toFixed(2)),
      totalUnpaidAmount: Number(totalUnpaidAmount.toFixed(2)),
      unpaidCount: unpaidInvoices.length,
      totalOverdueAmount: Number(totalOverdueAmount.toFixed(2)),
      overdueCount: overdueInvoices.length,
      collectionRate: Number(collectionRate.toFixed(1)),
      recentPayments: payments.slice(0, 5),
      invoicesBreakdown: {
        paid: paidInvoices.length,
        unpaid: unpaidInvoices.length,
        overdue: overdueInvoices.length,
        draft: invoices.filter((i) => i.status === 'draft').length
      }
    };
  }
};

// ---------------- AUTHENTICATION API ----------------
export const authApi = {
  login: async (email, password) => {
    const baseUrl = config.getBaseUrl().replace(/\/$/, '');
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Invalid email or password');
    }
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (name, email, password) => {
    const baseUrl = config.getBaseUrl().replace(/\/$/, '');
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  forgotPassword: async (email) => {
    const baseUrl = config.getBaseUrl().replace(/\/$/, '');
    const res = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to request password reset');
    }
    return data;
  },

  getCurrentUser: () => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  getToken: () => localStorage.getItem('token'),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// ---------------- QUOTATION TEMPLATES API ----------------
export const quotationTemplatesApi = {
  getAll: async () => {
    return fetchWithFallback('/quotation-templates', { method: 'GET' }, () => {
      return [
        {
          _id: 'qt_enterprise_01',
          name: 'Enterprise ERP Cloud Bundle',
          description: 'Includes full Odoo ERP integration variant, dedicated cloud compute, and priority SLA.',
          category: 'Enterprise',
          validity_days: 30,
          payment_terms: 'Net 30',
          plan: { name: 'Enterprise Yearly Commitment Plan', billing_interval: 'yearly', base_price: 1990 },
          items: [
            { product_name: 'Enterprise ERP Cloud Engine', variant_name: 'Brand: Odoo', variant_addon: 560, unit_price: 2400, quantity: 1, tax_pct: 10 },
            { product_name: 'AI Operations Co-Pilot', variant_name: 'Tier: Pro', variant_addon: 120, unit_price: 490, quantity: 2, tax_pct: 10 }
          ]
        },
        {
          _id: 'qt_smb_01',
          name: 'SMB SaaS Growth Starter',
          description: 'Monthly scalable subscription tailored for agile digital-native organizations.',
          category: 'SMB',
          validity_days: 15,
          payment_terms: 'Immediate',
          plan: { name: 'Standard Monthly Growth Plan', billing_interval: 'monthly', base_price: 199 },
          items: [
            { product_name: 'Custom Domain & Security Addon', variant_name: 'Standard', variant_addon: 0, unit_price: 49, quantity: 1, tax_pct: 10 }
          ]
        }
      ];
    });
  }
};
