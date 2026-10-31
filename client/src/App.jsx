import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import FinanceDashboard from './components/dashboard/FinanceDashboard';
import ProductsManager from './components/products/ProductsManager';
import PlansManager from './components/plans/PlansManager';
import InvoicesManager from './components/invoices/InvoicesManager';
import SubscriptionsManager from './components/subscriptions/SubscriptionsManager';
import DiscountsManager from './components/discounts/DiscountsManager';
import SalesWorkspace from './components/sales/SalesWorkspace';
import CustomerPortal from './components/customer/CustomerPortal';
import BillingRunModal from './components/billing/BillingRunModal';
import ApiSettingsModal from './components/settings/ApiSettingsModal';
import PaymentRecordModal from './components/invoices/PaymentRecordModal';
import InvoiceDetailModal from './components/invoices/InvoiceDetailModal';
import Login from './components/auth/Login';
import { 
  productsApi, 
  plansApi, 
  subscriptionsApi, 
  invoicesApi, 
  paymentsApi, 
  discountsApi, 
  financeApi,
  quotationTemplatesApi,
  authApi,
  config
} from './services/api';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(() => authApi.getToken());
  const [currentUser, setCurrentUser] = useState(() => authApi.getCurrentUser());
  const [activeTab, setActiveTab] = useState(() => {
    const user = authApi.getCurrentUser();
    if (user?.role === 'customer') return 'portal';
    if (user?.role === 'staff') return 'sales';
    return 'dashboard';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Core Data Stores
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [quotationTemplates, setQuotationTemplates] = useState([]);
  const [metrics, setMetrics] = useState({});

  // Global Modals
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activePaymentInvoice, setActivePaymentInvoice] = useState(null);
  const [activeDetailInvoice, setActiveDetailInvoice] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch all data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [
        productsData,
        plansData,
        subsData,
        invoicesData,
        paymentsData,
        discountsData,
        metricsData,
        quotesData
      ] = await Promise.all([
        productsApi.getAll(),
        plansApi.getAll(),
        subscriptionsApi.getAll(),
        invoicesApi.getAll(),
        paymentsApi.getAll(),
        discountsApi.getAll(),
        financeApi.getOverviewMetrics(),
        quotationTemplatesApi.getAll().catch(() => [])
      ]);

      setProducts(productsData || []);
      setPlans(plansData || []);
      setSubscriptions(subsData || []);
      setInvoices(invoicesData || []);
      setPayments(paymentsData || []);
      setDiscounts(discountsData || []);
      setMetrics(metricsData || {});
      setQuotationTemplates(quotesData || []);
    } catch (err) {
      console.error('Error loading application data:', err);
      showToast('Failed to load data. Falling back to offline sandbox.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const handleLoginSuccess = (user, jwtToken) => {
    setCurrentUser(user);
    setToken(jwtToken);
    if (user.role === 'customer') {
      setActiveTab('portal');
    } else if (user.role === 'staff') {
      setActiveTab('sales');
    } else {
      setActiveTab('dashboard');
    }
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    authApi.logout();
    setCurrentUser(null);
    setToken(null);
    showToast('Signed out successfully.');
  };

  // ---------------- PRODUCT HANDLERS ----------------
  const handleCreateProduct = async (formData) => {
    const created = await productsApi.create(formData);
    await loadData();
    showToast(`Created product "${created.name}" with ${created.variants?.length || 0} variant(s)!`);
  };

  const handleUpdateProduct = async (id, formData) => {
    await productsApi.update(id, formData);
    await loadData();
    showToast('Product successfully updated!');
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await productsApi.delete(id);
      await loadData();
      showToast('Product deleted.');
    }
  };

  // ---------------- PLAN HANDLERS ----------------
  const handleCreatePlan = async (formData) => {
    const created = await plansApi.create(formData);
    await loadData();
    showToast(`Subscription plan "${created.name}" created!`);
  };

  const handleUpdatePlan = async (id, formData) => {
    await plansApi.update(id, formData);
    await loadData();
    showToast('Plan updated successfully!');
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm('Delete this plan from catalog?')) {
      await plansApi.delete(id);
      await loadData();
      showToast('Plan removed.');
    }
  };

  // ---------------- INVOICE & PAYMENT HANDLERS ----------------
  const handleUpdateInvoiceStatus = async (id, status) => {
    await invoicesApi.updateStatus(id, status);
    await loadData();
    showToast(`Invoice status updated to ${status}`);
  };

  const handleRecordPayment = async (paymentData) => {
    const result = await paymentsApi.recordPayment(paymentData);
    await loadData();
    showToast(`Payment of $${paymentData.amount} recorded! Invoice marked as paid.`);
    return result;
  };

  // ---------------- SUBSCRIPTION LIFECYCLE ----------------
  const handleUpdateSubscriptionStatus = async (id, newStatus) => {
    await subscriptionsApi.updateStatus(id, newStatus);
    await loadData();
    showToast(`Subscription advanced to "${newStatus}"!`);
  };

  const handleCreateSubscriptionFromTemplate = async (quotePayload) => {
    try {
      // Find matching plan
      const planObj = plans.find(p => p.name === quotePayload.plan_name) || plans[0];
      const planId = planObj?._id || plans[0]?._id;

      // Find matching products for lines
      const processedItems = (quotePayload.items || []).map(item => {
        const prod = products.find(p => p.name === item.product_name) || products[0];
        return {
          product_id: prod?._id || item.product_id,
          product_name: item.product_name,
          quantity: item.qty || item.quantity || 1,
          unit_price: item.unit_price || prod?.sales_price || 100,
          variant_name: item.variant || '',
          variant_addon: item.variant_addon || 0,
          tax_pct: item.tax_pct || 10
        };
      });

      const payload = {
        customer_name: quotePayload.customer_name,
        customer_email: quotePayload.customer_email,
        plan_id: planId,
        status: quotePayload.status || 'Quotation',
        items: processedItems,
        payment_terms: quotePayload.payment_terms || 'Net 30',
        validity_days: quotePayload.validity_days || 30
      };

      await subscriptionsApi.create(payload);
      await loadData();
      showToast(`Quotation successfully emitted for ${quotePayload.customer_name}! Added to pipeline.`);
    } catch (err) {
      console.error('Error creating subscription quotation:', err);
      showToast(err.message || 'Failed to create quotation', 'error');
      throw err;
    }
  };

  // ---------------- DISCOUNTS HANDLERS ----------------
  const handleCreateDiscount = async (formData) => {
    const created = await discountsApi.create(formData);
    await loadData();
    showToast(`Coupon rule "${created.code}" created!`);
  };

  const handleUpdateDiscount = async (id, formData) => {
    await discountsApi.update(id, formData);
    await loadData();
    showToast('Coupon rule updated!');
  };

  const handleDeleteDiscount = async (id) => {
    if (window.confirm('Delete this coupon rule?')) {
      await discountsApi.delete(id);
      await loadData();
      showToast('Coupon rule deleted.');
    }
  };

  // ---------------- BILLING RUN AUTOMATION ----------------
  const handleExecuteBillingRun = async () => {
    const result = await invoicesApi.triggerBillingRun();
    await loadData();
    showToast(`Generated ${result.count} new invoices totaling $${result.totalAmount.toLocaleString()}!`);
    return result;
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to standard hackathon seed?')) {
      config.resetDatabase();
      loadData();
      showToast('Data reset to default hackathon seed!');
    }
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen royal-bg text-slate-100 flex flex-col relative selection:bg-amber-400 selection:text-slate-950">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border backdrop-blur-md ${
            toast.type === 'error'
              ? 'bg-rose-950/90 text-rose-300 border-rose-800'
              : 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onTriggerBilling={() => setIsBillingModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onResetData={handleResetData}
        activeTab={activeTab}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentUser={currentUser}
          onLogout={handleLogout}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          metrics={metrics}
        />

        {/* Content Pane */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {isLoading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-semibold text-slate-400">Loading SaaS Pulse Admin & Finance Engine...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <FinanceDashboard
                  metrics={metrics}
                  invoices={invoices}
                  subscriptions={subscriptions}
                  payments={payments}
                  onTriggerBilling={() => setIsBillingModalOpen(true)}
                  onRecordPaymentClick={(inv) => setActivePaymentInvoice(inv)}
                  onViewInvoice={(inv) => setActiveDetailInvoice(inv)}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'products' && (
                <ProductsManager
                  products={products}
                  onCreateProduct={handleCreateProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                />
              )}

              {activeTab === 'plans' && (
                <PlansManager
                  plans={plans}
                  onCreatePlan={handleCreatePlan}
                  onUpdatePlan={handleUpdatePlan}
                  onDeletePlan={handleDeletePlan}
                />
              )}

              {activeTab === 'invoices' && (
                <InvoicesManager
                  invoices={invoices}
                  onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                  onRecordPayment={handleRecordPayment}
                />
              )}

              {activeTab === 'subscriptions' && (
                <SubscriptionsManager
                  subscriptions={subscriptions}
                  onUpdateSubscriptionStatus={handleUpdateSubscriptionStatus}
                />
              )}

              {activeTab === 'sales' && (
                <SalesWorkspace
                  quotationTemplates={quotationTemplates}
                  products={products}
                  plans={plans}
                  subscriptions={subscriptions}
                  onCreateSubscriptionFromTemplate={handleCreateSubscriptionFromTemplate}
                  onAdvanceSubscriptionStatus={handleUpdateSubscriptionStatus}
                  onRefresh={loadData}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'portal' && (
                <CustomerPortal
                  currentUser={currentUser}
                  subscriptions={subscriptions}
                  invoices={invoices}
                  onRefresh={loadData}
                  onPayInvoice={(inv) => setActivePaymentInvoice(inv)}
                  onViewInvoice={(inv) => setActiveDetailInvoice(inv)}
                />
              )}

              {activeTab === 'discounts' && (
                <DiscountsManager
                  discounts={discounts}
                  onCreateDiscount={handleCreateDiscount}
                  onUpdateDiscount={handleUpdateDiscount}
                  onDeleteDiscount={handleDeleteDiscount}
                />
              )}

              {activeTab === 'settings' && (
                <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Backend Integration Contract & System Health</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Full view of schema blueprints, REST endpoints, and backend connectivity.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                  >
                    Open API Blueprint & Settings Modal
                  </button>
                </div>
              )}
            </>
          )}
        </main>

      </div>

      {/* Global Modals */}
      <BillingRunModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        subscriptions={subscriptions}
        onExecuteBillingRun={handleExecuteBillingRun}
      />

      <ApiSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onRefreshData={loadData}
      />

      <PaymentRecordModal
        isOpen={!!activePaymentInvoice}
        onClose={() => setActivePaymentInvoice(null)}
        invoice={activePaymentInvoice}
        onRecordPayment={handleRecordPayment}
      />

      <InvoiceDetailModal
        isOpen={!!activeDetailInvoice}
        onClose={() => setActiveDetailInvoice(null)}
        invoice={activeDetailInvoice}
        onRecordPayment={(inv) => setActivePaymentInvoice(inv)}
      />

    </div>
  );
}
