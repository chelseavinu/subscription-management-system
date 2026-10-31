/**
 * Brightloop API Client
 * Connects to the Express backend with automatic JWT bearer handling
 * and robust mock fallback for offline resilience.
 */

const BASE_URL = '/api';

export const getAuthToken = () => {
  return localStorage.getItem('brightloop_token') || '';
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('brightloop_token', token);
  } else {
    localStorage.removeItem('brightloop_token');
  }
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('brightloop_user');
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('brightloop_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('brightloop_user');
  }
};

/**
 * Universal fetch wrapper
 */
export const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

// ==========================================
// Authentication & Profile Services
// ==========================================

export const loginApi = async (email, password) => {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (res.token) {
    setAuthToken(res.token);
    setCurrentUser(res.user);
  }
  return res;
};

export const registerApi = async (name, email, password) => {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  if (res.token) {
    setAuthToken(res.token);
    setCurrentUser(res.user);
  }
  return res;
};

export const forgotPasswordApi = async (email) => {
  return await apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const resetPasswordApi = async (email, newPassword) => {
  return await apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, newPassword }),
  });
};

export const getMeApi = async () => {
  return await apiFetch('/auth/me');
};

export const updateProfileApi = async (profileData) => {
  const res = await apiFetch('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
  if (res.user) {
    setCurrentUser(res.user);
  }
  return res;
};

export const changePasswordApi = async (currentPassword, newPassword) => {
  return await apiFetch('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
};

export const getCustomersApi = async () => {
  return await apiFetch('/customers');
};

// ==========================================
// Catalog Services (Products & Plans)
// ==========================================

export const getProductsApi = async () => {
  return await apiFetch('/products');
};

export const getPlansApi = async () => {
  return await apiFetch('/plans?all=true');
};

export const createProductApi = async (productData) => {
  return await apiFetch('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
};

// ==========================================
// Subscriptions & Quotations Services
// ==========================================

export const getSubscriptionsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return await apiFetch(`/subscriptions${query ? `?${query}` : ''}`);
};

export const getSubscriptionByIdApi = async (id) => {
  return await apiFetch(`/subscriptions/${id}`);
};

export const createSubscriptionApi = async (subData) => {
  return await apiFetch('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(subData),
  });
};

export const updateSubscriptionStatusApi = async (id, status) => {
  return await apiFetch(`/subscriptions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

export const generateInvoiceApi = async (subId) => {
  return await apiFetch(`/subscriptions/${subId}/generate-invoice`, {
    method: 'POST',
  });
};

// ==========================================
// Quotation Templates Services (Sales Workspace)
// ==========================================

export const getQuotationTemplatesApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return await apiFetch(`/quotation-templates${query ? `?${query}` : ''}`);
};

export const getQuotationTemplateByIdApi = async (id) => {
  return await apiFetch(`/quotation-templates/${id}`);
};

export const createQuotationTemplateApi = async (templateData) => {
  return await apiFetch('/quotation-templates', {
    method: 'POST',
    body: JSON.stringify(templateData),
  });
};

// ==========================================
// Sales Workspace Services
// ==========================================

export const getSalesOverviewApi = async () => {
  return await apiFetch('/sales/overview');
};

// ==========================================
// Invoices Services
// ==========================================

export const getInvoicesApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return await apiFetch(`/invoices${query ? `?${query}` : ''}`);
};

export const getInvoiceByIdApi = async (id) => {
  return await apiFetch(`/invoices/${id}`);
};

export const updateInvoiceStatusApi = async (id, status) => {
  return await apiFetch(`/invoices/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

// ==========================================
// Payments Services
// ==========================================

export const getPaymentsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return await apiFetch(`/payments${query ? `?${query}` : ''}`);
};

export const recordPaymentApi = async (paymentData) => {
  return await apiFetch('/payments', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
};

// ==========================================
// Analytics Services
// ==========================================

export const getDashboardMetricsApi = async () => {
  return await apiFetch('/analytics/dashboard');
};
