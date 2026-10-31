import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import DashboardView from '../DashboardView';
import SubscriptionsView from '../SubscriptionsView';
import InvoicesView from '../InvoicesView';
import PaymentsView from '../PaymentsView';
import ProductsView from '../ProductsView';
import SettingsView from '../SettingsView';

export const AdminPortal = ({
  user,
  onLogout,
  currency,
  onCurrencyChange,
  onRoleChange,
  metrics,
  subscriptions,
  invoices,
  payments,
  products,
  plans,
  loadSystemData,
  onUpdateSubStatus,
  onGenerateInvoice,
  onCreateSubscription,
  onRecordPaymentSubmit,
  onUpdateInvoiceStatus,
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Modals State
  const [isCreateSubOpen, setIsCreateSubOpen] = useState(false);
  const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  const activeSubCount = subscriptions.filter((s) => s.status === 'Active').length;
  const overdueInvCount = invoices.filter((i) => i.status === 'Overdue').length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Top Admin Navbar */}
      <Navbar
        user={user}
        onLogout={onLogout}
        onOpenAuth={() => {}}
        currentRole="admin"
        onRoleChange={onRoleChange}
        currency={currency}
        onCurrencyChange={onCurrencyChange}
        onOpenNewSub={() => setIsCreateSubOpen(true)}
        searchQuery={globalSearch}
        onSearchChange={setGlobalSearch}
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
      />

      {/* Main Split Layout: Admin Sidebar & Content */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          maxWidth: '1440px',
          width: '100%',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeSubCount={activeSubCount}
          overdueInvCount={overdueInvCount}
          currentRole="admin"
          mobileNavOpen={mobileNavOpen}
          setMobileNavOpen={setMobileNavOpen}
        />

        <main
          style={{
            flex: 1,
            padding: '16px 24px 40px 20px',
            minWidth: 0,
            overflowY: 'auto',
          }}
        >
          {activeTab === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              subscriptions={subscriptions}
              invoices={invoices}
              currency={currency}
              onNavigate={setActiveTab}
              onOpenNewSub={() => setIsCreateSubOpen(true)}
              onRecordPayment={(inv) => setSelectedInvoiceForPay(inv)}
              onViewInvoice={(inv) => setViewingInvoice(inv)}
              currentRole="admin"
            />
          )}

          {activeTab === 'subscriptions' && (
            <SubscriptionsView
              subscriptions={subscriptions}
              products={products}
              plans={plans}
              currency={currency}
              onUpdateStatus={onUpdateSubStatus}
              onGenerateInvoice={onGenerateInvoice}
              onCreateSubscription={onCreateSubscription}
              currentRole="admin"
              isCreateModalOpen={isCreateSubOpen}
              setIsCreateModalOpen={setIsCreateSubOpen}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesView
              invoices={invoices}
              currency={currency}
              onRecordPaymentSubmit={onRecordPaymentSubmit}
              onUpdateInvoiceStatus={onUpdateInvoiceStatus}
              currentRole="admin"
              selectedInvoiceForPay={selectedInvoiceForPay}
              setSelectedInvoiceForPay={setSelectedInvoiceForPay}
              viewingInvoice={viewingInvoice}
              setViewingInvoice={setViewingInvoice}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              payments={payments}
              currency={currency}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={products}
              plans={plans}
              currency={currency}
              currentRole="admin"
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              onRefreshData={loadSystemData}
              currentRole="admin"
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPortal;
