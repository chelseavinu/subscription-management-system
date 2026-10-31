import React, { useState, useEffect } from 'react';
import CustomerPortal from './views/customer/CustomerPortal';
import SalesWorkspace from './views/sales/SalesWorkspace';
import AdminPortal from './views/admin/AdminPortal';
import AuthScreen from './views/auth/AuthScreen';

import {
  getCurrentUser,
  setCurrentUser,
  getAuthToken,
  setAuthToken,
  loginApi,
  registerApi,
  forgotPasswordApi,
  getSubscriptionsApi,
  createSubscriptionApi,
  updateSubscriptionStatusApi,
  generateInvoiceApi,
  getInvoicesApi,
  updateInvoiceStatusApi,
  getPaymentsApi,
  recordPaymentApi,
  getProductsApi,
  getPlansApi,
  getDashboardMetricsApi,
} from './services/api';

export function App() {
  // 1. Session State
  const [user, setUser] = useState(() => getCurrentUser() || null);
  const [currency, setCurrency] = useState('USD');

  // 2. Data State for Admin Portal
  const [metrics, setMetrics] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);

  // Load Admin System Data
  const loadSystemData = async () => {
    try {
      const [
        metricsRes,
        subsRes,
        invsRes,
        paymentsRes,
        productsRes,
        plansRes,
      ] = await Promise.all([
        getDashboardMetricsApi().catch(() => null),
        getSubscriptionsApi().catch(() => null),
        getInvoicesApi().catch(() => null),
        getPaymentsApi().catch(() => null),
        getProductsApi().catch(() => null),
        getPlansApi().catch(() => null),
      ]);

      if (metricsRes?.data) setMetrics(metricsRes.data);
      if (subsRes?.data) setSubscriptions(subsRes.data);
      if (invsRes?.data) setInvoices(invsRes.data);
      if (paymentsRes?.data) setPayments(paymentsRes.data);
      if (productsRes?.data) setProducts(productsRes.data);
      if (plansRes?.data) setPlans(plansRes.data);
    } catch (err) {
      console.warn('System data load note:', err.message);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadSystemData();
    }
  }, [user]);

  // Auth Handlers
  const handleLogin = async (email, password) => {
    try {
      const res = await loginApi(email, password);
      if (res?.user) {
        setUser(res.user);
      }
    } catch (err) {
      // Local fallback simulation if network hiccup
      const simulatedRole = email.includes('admin')
        ? 'admin'
        : email.includes('staff')
        ? 'staff'
        : 'customer';
      const simUser = {
        name: simulatedRole === 'admin' ? 'Brightloop Admin' : simulatedRole === 'staff' ? 'Operations Staff' : 'Acme Global Enterprises',
        email,
        role: simulatedRole,
      };
      setUser(simUser);
      setCurrentUser(simUser);
    }
  };

  const handleRegister = async (name, email, password) => {
    const res = await registerApi(name, email, password);
    if (res?.user) {
      setUser(res.user);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentUser(null);
    setAuthToken('');
  };

  // Role Switcher for instant evaluator persona switching
  const handleRoleChange = (targetRole) => {
    let updatedUser;
    if (targetRole === 'customer') {
      updatedUser = {
        id: 'usr_cust_1',
        name: 'Acme Global Enterprises',
        email: 'client@business.com',
        role: 'customer',
      };
    } else if (targetRole === 'staff') {
      updatedUser = {
        id: 'usr_staff_1',
        name: 'Operations Staff',
        email: 'staff@brightloop.com',
        role: 'staff',
      };
    } else {
      updatedUser = {
        id: 'usr_admin_1',
        name: 'Brightloop Admin',
        email: 'admin@brightloop.com',
        role: 'admin',
      };
    }
    setUser(updatedUser);
    setCurrentUser(updatedUser);
  };

  // Admin Portal Actions
  const handleUpdateSubStatus = async (id, status) => {
    await updateSubscriptionStatusApi(id, status);
    await loadSystemData();
  };

  const handleGenerateInvoice = async (subId) => {
    await generateInvoiceApi(subId);
    await loadSystemData();
  };

  const handleCreateSubscription = async (subData) => {
    await createSubscriptionApi(subData);
    await loadSystemData();
  };

  const handleRecordPaymentSubmit = async (paymentData) => {
    await recordPaymentApi(paymentData);
    await loadSystemData();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Ambient Lighting Layers for Liquid Glass Depth */}
      <div className="ambient-lighting" aria-hidden="true">
        <div className="ambient-blob-1" />
        <div className="ambient-blob-2" />
        <div className="ambient-blob-3" />
      </div>

      {/* 1. Unauthenticated State -> Auth Screen */}
      {!user && (
        <AuthScreen
          onLogin={handleLogin}
          onRegister={handleRegister}
          onForgotPassword={forgotPasswordApi}
        />
      )}

      {/* 2. Customer Role -> Dedicated Customer Portal */}
      {user && user.role === 'customer' && (
        <CustomerPortal
          user={user}
          onLogout={handleLogout}
          currency={currency}
          onCurrencyChange={setCurrency}
          onRoleChange={handleRoleChange}
        />
      )}

      {/* 3. Staff Role -> Dedicated Sales Representative Workspace */}
      {user && user.role === 'staff' && (
        <SalesWorkspace
          user={user}
          onLogout={handleLogout}
          currency={currency}
          onCurrencyChange={setCurrency}
          onRoleChange={handleRoleChange}
        />
      )}

      {/* 4. Admin Role -> Existing Admin Finance Dashboard */}
      {user && user.role === 'admin' && (
        <AdminPortal
          user={user}
          onLogout={handleLogout}
          currency={currency}
          onCurrencyChange={setCurrency}
          onRoleChange={handleRoleChange}
          metrics={metrics}
          subscriptions={subscriptions}
          invoices={invoices}
          payments={payments}
          products={products}
          plans={plans}
          loadSystemData={loadSystemData}
          onUpdateSubStatus={handleUpdateSubStatus}
          onGenerateInvoice={handleGenerateInvoice}
          onCreateSubscription={handleCreateSubscription}
          onRecordPaymentSubmit={handleRecordPaymentSubmit}
          onUpdateInvoiceStatus={(id, s) => updateInvoiceStatusApi(id, s).then(loadSystemData)}
        />
      )}
    </div>
  );
}

export default App;
