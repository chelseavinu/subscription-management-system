// Brightloop Subscription Platform - Unified Client Logic

let availableProducts = [];
let availablePlans = [];
let activeUser = {
  name: 'Sarah Connor',
  email: 'admin@brightloop.io',
  role: 'admin',
  token: 'mock-admin-token'
};

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initModals();
  initDefaults();
  loadAllData();

  // Event Listeners
  document.getElementById('btn-refresh').addEventListener('click', loadAllData);
  document.getElementById('btn-open-billing-modal').addEventListener('click', () => openModal('modal-billing'));
  document.getElementById('btn-execute-billing-run').addEventListener('click', executeBillingRun);
  document.getElementById('btn-submit-payment').addEventListener('click', submitPayment);
  document.getElementById('btn-calc-quote').addEventListener('click', calculateQuotePreview);
  document.getElementById('btn-submit-quote').addEventListener('click', submitQuote);
  document.getElementById('quote-product-select').addEventListener('change', updateVariantDropdown);

  // Member 1 Listeners
  document.getElementById('btn-submit-new-product').addEventListener('click', submitNewProduct);
  document.getElementById('btn-submit-new-plan').addEventListener('click', submitNewPlan);
  document.getElementById('btn-submit-register').addEventListener('click', submitRegistration);
});

// Tab Navigation
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
    });
  });
}

// Modal handling
function initModals() {
  document.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', () => {
      const modalId = el.getAttribute('data-close');
      closeModal(modalId);
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('active');
    }
  });
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

function initDefaults() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('billing-run-date').value = today;
  updateUserBadge();
}

function updateUserBadge() {
  document.getElementById('active-user-role').textContent = activeUser.role.toUpperCase();
  const sessionBox = document.getElementById('session-user-info');
  if (sessionBox) {
    sessionBox.innerHTML = `
      Logged in as: <strong>${activeUser.name}</strong> (${activeUser.email})<br>
      Active Role: <span class="badge badge-${activeUser.role === 'admin' ? 'confirmed' : (activeUser.role === 'staff' ? 'quotation' : 'active')}">${activeUser.role.toUpperCase()}</span><br>
      <small style="color:var(--text-muted); font-family:monospace;">Token: ${activeUser.token ? activeUser.token.slice(0, 32) + '...' : 'None'}</small>
    `;
  }
}

// Global Fetch Wrapper to pass Active Role & Token
function apiFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'x-user-role': activeUser.role,
    'x-user-name': activeUser.name,
    'Authorization': activeUser.token ? `Bearer ${activeUser.token}` : '',
    ...(options.headers || {})
  };
  return fetch(url, { ...options, headers });
}

// Load all API data
async function loadAllData() {
  await Promise.all([
    fetchMetrics(),
    fetchSubscriptions(),
    fetchInvoices(),
    fetchPayments(),
    fetchCatalogData()
  ]);
}

// 1. Financial Metrics
async function fetchMetrics() {
  try {
    const res = await apiFetch('/api/billing/metrics');
    const json = await res.json();
    if (json.success) {
      const m = json.data.metrics;
      document.getElementById('metric-mrr').textContent = `$${m.mrr.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      document.getElementById('metric-arr').textContent = `ARR: $${m.arr.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      document.getElementById('metric-active-subs').textContent = m.active_subscriptions_count;
      
      const totalSubs = Object.values(json.data.subscription_breakdown).reduce((a, b) => a + b, 0);
      document.getElementById('metric-total-subs').textContent = `Total in System: ${totalSubs}`;
      document.getElementById('metric-invoiced').textContent = `$${m.total_invoiced_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      document.getElementById('metric-outstanding').textContent = `Outstanding: $${m.total_outstanding_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      document.getElementById('metric-collected').textContent = `$${m.total_collected_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      document.getElementById('metric-unpaid-invoices').textContent = `Unpaid Invoices: ${m.unpaid_invoices_count} (${m.overdue_invoices_count} overdue)`;
    }
  } catch (err) {
    console.error('Failed to fetch metrics:', err);
  }
}

// 2. Subscriptions
async function fetchSubscriptions() {
  try {
    const res = await apiFetch('/api/subscriptions');
    const json = await res.json();
    const tbody = document.getElementById('subscriptions-table-body');
    tbody.innerHTML = '';

    if (!json.success || !json.data.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No subscriptions found. Click 'Quotation & Variant Calculator' to create one!</td></tr>`;
      return;
    }

    json.data.forEach(sub => {
      const nextDate = sub.next_billing_date ? sub.next_billing_date.split('T')[0] : 'N/A';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 600; color: var(--accent-cyan);">${sub.subscription_number}</td>
        <td>
          <div style="font-weight: 500;">${sub.customer_name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${sub.customer_email}</div>
        </td>
        <td>
          <div>${sub.plan_name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: capitalize;">${sub.billing_interval} (${sub.payment_terms})</div>
        </td>
        <td><span class="badge badge-${sub.status}">${sub.status}</span></td>
        <td>${nextDate}</td>
        <td style="font-weight: 600;">$${sub.recurring_total.toFixed(2)}</td>
        <td class="actions-cell">
          ${renderSubscriptionActions(sub)}
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Failed to fetch subscriptions:', err);
  }
}

function renderSubscriptionActions(sub) {
  let btns = '';
  if (sub.status === 'draft') {
    btns += `<button class="btn btn-secondary btn-sm" onclick="transitionSub('${sub._id}', 'quotation')">Send Quote</button>`;
    btns += `<button class="btn btn-primary btn-sm" onclick="transitionSub('${sub._id}', 'confirmed')">Confirm</button>`;
  } else if (sub.status === 'quotation') {
    btns += `<button class="btn btn-primary btn-sm" onclick="transitionSub('${sub._id}', 'confirmed')">Accept & Confirm</button>`;
    btns += `<button class="btn btn-secondary btn-sm" onclick="transitionSub('${sub._id}', 'closed', 'Quote expired/declined')">Decline</button>`;
  } else if (sub.status === 'confirmed') {
    btns += `<button class="btn btn-primary btn-sm" onclick="transitionSub('${sub._id}', 'active')">Activate</button>`;
  } else if (sub.status === 'active') {
    if (sub.allow_pause !== false) {
      btns += `<button class="btn btn-secondary btn-sm" onclick="transitionSub('${sub._id}', 'paused', 'Customer requested pause')">Pause</button>`;
    }
    btns += `<button class="btn btn-secondary btn-sm" style="color: var(--danger);" onclick="transitionSub('${sub._id}', 'closed', 'Contract ended')">Close</button>`;
  } else if (sub.status === 'paused') {
    btns += `<button class="btn btn-primary btn-sm" onclick="transitionSub('${sub._id}', 'active', 'Resumed by customer')">Resume</button>`;
  } else if (sub.status === 'closed') {
    btns += `<button class="btn btn-secondary btn-sm" onclick="renewSub('${sub._id}')">Renew</button>`;
  }
  return btns;
}

async function transitionSub(id, status, reason = '') {
  try {
    const res = await apiFetch(`/api/subscriptions/${id}/transition`, {
      method: 'POST',
      body: JSON.stringify({ status, reason })
    });
    const json = await res.json();
    if (json.success) {
      showToast(`Subscription status updated to '${status}'`, 'success');
      loadAllData();
    } else {
      showToast(json.message || 'Status transition failed', 'error');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function renewSub(id) {
  try {
    const res = await apiFetch(`/api/subscriptions/${id}/renew`, {
      method: 'POST',
      body: JSON.stringify({ months: 12 })
    });
    const json = await res.json();
    if (json.success) {
      showToast('Subscription renewed successfully for 12 months', 'success');
      loadAllData();
    } else {
      showToast(json.message || 'Renewal failed', 'error');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 3. Invoices
async function fetchInvoices() {
  try {
    const res = await apiFetch('/api/invoices');
    const json = await res.json();
    const tbody = document.getElementById('invoices-table-body');
    tbody.innerHTML = '';

    if (!json.success || !json.data.length) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">No invoices generated yet. Click 'Trigger Billing Run' to run the billing day engine!</td></tr>`;
      return;
    }

    json.data.forEach(inv => {
      const dueDate = inv.due_date ? inv.due_date.split('T')[0] : 'N/A';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 600; color: #fff;">${inv.invoice_number}</td>
        <td style="color: var(--accent-cyan);">${inv.subscription_number}</td>
        <td>
          <div style="font-weight: 500;">${inv.customer_name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${inv.customer_email}</div>
        </td>
        <td>${dueDate}</td>
        <td style="font-weight: 600;">$${inv.total_amount.toFixed(2)}</td>
        <td style="color: var(--success);">$${inv.amount_paid.toFixed(2)}</td>
        <td style="color: ${inv.amount_due > 0 ? 'var(--warning)' : 'var(--text-muted)'}; font-weight: 600;">$${inv.amount_due.toFixed(2)}</td>
        <td>
          <span class="badge badge-${inv.status}">${inv.status}</span>
          ${inv.payment_status === 'partially_paid' ? '<span class="badge badge-partially_paid" style="margin-left: 4px;">Partial</span>' : ''}
        </td>
        <td class="actions-cell">
          ${renderInvoiceActions(inv)}
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Failed to fetch invoices:', err);
  }
}

function renderInvoiceActions(inv) {
  let btns = '';
  if (inv.status === 'draft') {
    btns += `<button class="btn btn-secondary btn-sm" onclick="confirmInvoice('${inv._id}')">Confirm</button>`;
  }
  if (inv.status !== 'paid' && inv.status !== 'cancelled') {
    btns += `<button class="btn btn-primary btn-sm" onclick="openPaymentModal('${inv._id}', '${inv.invoice_number}', '${inv.customer_name}', ${inv.amount_due})">Pay</button>`;
  }
  btns += `<button class="btn btn-secondary btn-sm" onclick="sendInvoice('${inv._id}')" title="Simulate Email Dispatch">Send</button>`;
  btns += `<button class="btn btn-secondary btn-sm" onclick="printInvoice('${inv._id}')" title="Print Invoice">View</button>`;
  return btns;
}

async function confirmInvoice(id) {
  try {
    const res = await apiFetch(`/api/invoices/${id}/confirm`, { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      showToast('Invoice confirmed', 'success');
      loadAllData();
    } else {
      showToast(json.message, 'error');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function sendInvoice(id) {
  try {
    const res = await apiFetch(`/api/invoices/${id}/send`, { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      showToast(json.data.message, 'info');
      loadAllData();
    } else {
      showToast(json.message, 'error');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function printInvoice(id) {
  try {
    const res = await apiFetch(`/api/invoices/${id}/print`);
    const json = await res.json();
    if (json.success) {
      const inv = json.data.invoice;
      const comp = json.data.company;

      const html = `
        <div style="border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px;">
          <h2 style="margin: 0; font-size: 1.4rem;">${comp.name}</h2>
          <p style="margin: 2px 0; font-size: 0.85rem; color: #444;">${comp.address} | Tax ID: ${comp.tax_id} | ${comp.email}</p>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
          <div>
            <strong>BILLED TO:</strong><br>
            ${inv.customer_name}<br>
            ${inv.customer_email}<br>
            ${inv.customer_address || ''}
          </div>
          <div style="text-align: right;">
            <strong>INVOICE: ${inv.invoice_number}</strong><br>
            Sub Ref: ${inv.subscription_number}<br>
            Issue Date: ${inv.issue_date.split('T')[0]}<br>
            Due Date: ${inv.due_date.split('T')[0]}<br>
            Status: <strong>${inv.status.toUpperCase()}</strong>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
              <th style="color: #333; padding: 8px;">Item Description</th>
              <th style="color: #333; padding: 8px; text-align: center;">Qty</th>
              <th style="color: #333; padding: 8px; text-align: right;">Unit Price</th>
              <th style="color: #333; padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${inv.items.map(it => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="color: #111; padding: 8px;">${it.product_name} ${it.variant_info ? `<br><small style="color:#666;">${it.variant_info}</small>` : ''}</td>
                <td style="color: #111; padding: 8px; text-align: center;">${it.quantity}</td>
                <td style="color: #111; padding: 8px; text-align: right;">$${it.unit_price.toFixed(2)}</td>
                <td style="color: #111; padding: 8px; text-align: right;">$${it.line_total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="display: flex; justify-content: flex-end;">
          <div style="width: 250px; font-size: 0.9rem;">
            <div style="display:flex; justify-content:space-between; padding: 4px 0;"><span>Subtotal:</span><span>$${inv.subtotal.toFixed(2)}</span></div>
            <div style="display:flex; justify-content:space-between; padding: 4px 0;"><span>Tax Amount:</span><span>$${inv.tax_amount.toFixed(2)}</span></div>
            ${inv.discount_amount > 0 ? `<div style="display:flex; justify-content:space-between; padding: 4px 0; color: green;"><span>Discount:</span><span>-$${inv.discount_amount.toFixed(2)}</span></div>` : ''}
            <div style="display:flex; justify-content:space-between; padding: 6px 0; border-top: 1px solid #000; font-weight: bold; font-size: 1.1rem;"><span>Total:</span><span>$${inv.total_amount.toFixed(2)}</span></div>
            <div style="display:flex; justify-content:space-between; padding: 4px 0; color: green;"><span>Paid:</span><span>$${inv.amount_paid.toFixed(2)}</span></div>
            <div style="display:flex; justify-content:space-between; padding: 4px 0; font-weight: bold; color: ${inv.amount_due > 0 ? '#b91c1c' : '#333'};"><span>Balance Due:</span><span>$${inv.amount_due.toFixed(2)}</span></div>
          </div>
        </div>
      `;

      document.getElementById('printable-invoice-content').innerHTML = html;
      openModal('modal-invoice-view');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 4. Payments
async function fetchPayments() {
  try {
    const res = await apiFetch('/api/payments');
    const json = await res.json();
    const tbody = document.getElementById('payments-table-body');
    tbody.innerHTML = '';

    if (!json.success || !json.data.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No payment records yet.</td></tr>`;
      return;
    }

    json.data.forEach(p => {
      const pDate = p.payment_date ? p.payment_date.split('T')[0] : 'N/A';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 600; color: var(--success);">${p.payment_number}</td>
        <td style="color: #fff;">${p.invoice_number}</td>
        <td>${p.customer_name || 'Customer'}</td>
        <td style="text-transform: capitalize;">${p.payment_method.replace('_', ' ')}</td>
        <td style="font-family: monospace; font-size: 0.8rem;">${p.transaction_reference || 'N/A'}</td>
        <td style="font-weight: 600; color: var(--success);">$${p.amount.toFixed(2)}</td>
        <td>${pDate}</td>
        <td><span class="badge badge-paid">${p.status}</span></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Failed to fetch payments:', err);
  }
}

function openPaymentModal(invoiceId, invoiceNum, customerName, amountDue) {
  document.getElementById('pay-invoice-id').value = invoiceId;
  document.getElementById('pay-invoice-num').value = invoiceNum;
  document.getElementById('pay-customer-name').value = customerName;
  document.getElementById('pay-amount-due').value = `$${amountDue.toFixed(2)}`;
  document.getElementById('pay-amount').value = amountDue.toFixed(2);
  openModal('modal-payment');
}

async function submitPayment() {
  const invoice_id = document.getElementById('pay-invoice-id').value;
  const amount = Number(document.getElementById('pay-amount').value);
  const payment_method = document.getElementById('pay-method').value;
  const transaction_reference = document.getElementById('pay-ref').value;

  if (!amount || amount <= 0) {
    showToast('Enter a valid positive payment amount', 'error');
    return;
  }

  try {
    const res = await apiFetch('/api/payments', {
      method: 'POST',
      body: JSON.stringify({
        invoice_id,
        amount,
        payment_method,
        transaction_reference
      })
    });
    const json = await res.json();
    if (json.success) {
      showToast(json.message, 'success');
      closeModal('modal-payment');
      loadAllData();
    } else {
      showToast(json.message, 'error');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 5. Billing Run
async function executeBillingRun() {
  const target_date = document.getElementById('billing-run-date').value;
  const dry_run = document.getElementById('billing-dry-run').checked;
  const auto_confirm = document.getElementById('billing-auto-confirm').checked;

  try {
    const res = await apiFetch('/api/billing/trigger-run', {
      method: 'POST',
      body: JSON.stringify({ target_date, dry_run, auto_confirm })
    });
    const json = await res.json();
    const resultDiv = document.getElementById('billing-run-result');
    resultDiv.style.display = 'block';

    if (json.success) {
      const d = json.data;
      resultDiv.innerHTML = `
        <div style="color: var(--success); font-weight: 600; margin-bottom: 6px;">&#10004; ${json.message}</div>
        <div>Evaluated: <strong>${d.subscriptions_evaluated}</strong> active subscriptions</div>
        <div>Generated Invoices: <strong>${d.invoices_generated}</strong></div>
        <div>Skipped (Already Billed): <strong>${d.skipped_already_billed}</strong></div>
        ${d.errors.length ? `<div style="color: var(--danger);">Errors: ${d.errors.length}</div>` : ''}
      `;
      showToast(json.message, 'success');
      loadAllData();
    } else {
      resultDiv.innerHTML = `<div style="color: var(--danger);">&#10008; ${json.message}</div>`;
      showToast(json.message, 'error');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 6. Catalog (Member 1) & Quote Sandbox
async function fetchCatalogData() {
  try {
    const [pRes, plRes] = await Promise.all([
      apiFetch('/api/catalog/products'),
      apiFetch('/api/catalog/plans')
    ]);
    const pJson = await pRes.json();
    const plJson = await plRes.json();

    if (pJson.success) {
      availableProducts = pJson.data;
      const pSelect = document.getElementById('quote-product-select');
      pSelect.innerHTML = availableProducts.map(p => `
        <option value="${p._id}">${p.name} ($${p.sales_price})</option>
      `).join('');
      updateVariantDropdown();
      renderCatalogProductsTable();
    }

    if (plJson.success) {
      availablePlans = plJson.data;
      const plSelect = document.getElementById('quote-plan-select');
      plSelect.innerHTML = availablePlans.map(pl => `
        <option value="${pl._id}">${pl.name} (${pl.billing_interval} - min ${pl.min_quantity} qty)</option>
      `).join('');
      renderCatalogPlansTable();
    }

    calculateQuotePreview();
  } catch (err) {
    console.error('Catalog fetch error:', err);
  }
}

function renderCatalogProductsTable() {
  const tbody = document.getElementById('catalog-products-table');
  if (!tbody) return;
  tbody.innerHTML = availableProducts.map(p => `
    <tr>
      <td style="font-weight: 500;">${p.name}</td>
      <td style="text-transform: capitalize;">${p.type || 'software'}</td>
      <td style="font-weight: 600;">$${p.sales_price}</td>
      <td style="font-size: 0.8rem; color: var(--accent-cyan);">
        ${(p.variants && p.variants.length) ? p.variants.map(v => `${v.name}: ${v.option} (+$${v.extra_price})`).join(', ') : 'Standard'}
      </td>
    </tr>
  `).join('');
}

function renderCatalogPlansTable() {
  const tbody = document.getElementById('catalog-plans-table');
  if (!tbody) return;
  tbody.innerHTML = availablePlans.map(pl => `
    <tr>
      <td style="font-weight: 500;">${pl.name}</td>
      <td style="text-transform: capitalize;">${pl.billing_interval}</td>
      <td>${pl.min_quantity || 1}</td>
      <td style="font-size: 0.75rem;">
        ${pl.auto_close ? 'Auto-close' : 'Continuous'} &bull; ${pl.allow_pause !== false ? 'Pause allowed' : 'No pause'}
      </td>
    </tr>
  `).join('');
}

function updateVariantDropdown() {
  const pSelect = document.getElementById('quote-product-select');
  const vSelect = document.getElementById('quote-variant-select');
  const product = availableProducts.find(p => p._id === pSelect.value);

  if (product && product.variants && product.variants.length > 0) {
    vSelect.innerHTML = product.variants.map((v, i) => `
      <option value="${i}">${v.name}: ${v.option} (+$${v.extra_price})</option>
    `).join('');
    vSelect.disabled = false;
  } else {
    vSelect.innerHTML = `<option value="">Standard Edition (No extra charge)</option>`;
    vSelect.disabled = true;
  }

  calculateQuotePreview();
}

async function calculateQuotePreview() {
  const pSelect = document.getElementById('quote-product-select');
  const vSelect = document.getElementById('quote-variant-select');
  const plSelect = document.getElementById('quote-plan-select');
  const qty = Number(document.getElementById('quote-quantity').value) || 1;
  const discountCode = document.getElementById('quote-discount-code').value.trim();

  const product = availableProducts.find(p => p._id === pSelect.value);
  if (!product) return;

  let selectedVariant = null;
  if (!vSelect.disabled && vSelect.value !== '') {
    const variantIndex = Number(vSelect.value);
    selectedVariant = product.variants[variantIndex];
  }

  const itemsPayload = [{
    product_id: product._id,
    product_name: product.name,
    variant: selectedVariant,
    quantity: qty,
    unit_price: product.sales_price,
    tax_pct: product.tax_pct || 10
  }];

  try {
    const res = await apiFetch('/api/subscriptions/calculate-preview', {
      method: 'POST',
      body: JSON.stringify({
        plan_id: plSelect.value,
        items: itemsPayload,
        discount_code: discountCode
      })
    });
    const json = await res.json();
    if (json.success) {
      const calc = json.data;
      const baseUnit = product.sales_price;
      const varExtra = selectedVariant ? selectedVariant.extra_price : 0;

      document.getElementById('preview-base-price').textContent = `$${baseUnit.toFixed(2)}`;
      document.getElementById('preview-variant-price').textContent = `+$${varExtra.toFixed(2)}`;
      document.getElementById('preview-subtotal').textContent = `$${calc.subtotal.toFixed(2)}`;
      document.getElementById('preview-tax').textContent = `$${calc.tax_total.toFixed(2)}`;
      document.getElementById('preview-discount').textContent = `-$${calc.discount_total.toFixed(2)}`;
      document.getElementById('preview-total').textContent = `$${calc.recurring_total.toFixed(2)}`;
    } else {
      showToast(json.message, 'error');
    }
  } catch (err) {
    console.error('Preview error:', err);
  }
}

async function submitQuote() {
  const customer_name = document.getElementById('quote-customer-name').value;
  const customer_email = document.getElementById('quote-customer-email').value;
  const pSelect = document.getElementById('quote-product-select');
  const vSelect = document.getElementById('quote-variant-select');
  const plSelect = document.getElementById('quote-plan-select');
  const qty = Number(document.getElementById('quote-quantity').value) || 1;
  const discount_code = document.getElementById('quote-discount-code').value.trim();

  const product = availableProducts.find(p => p._id === pSelect.value);
  let selectedVariant = null;
  if (!vSelect.disabled && vSelect.value !== '') {
    selectedVariant = product.variants[Number(vSelect.value)];
  }

  const payload = {
    customer_name,
    customer_email,
    plan_id: plSelect.value,
    items: [{
      product_id: product._id,
      product_name: product.name,
      variant: selectedVariant,
      quantity: qty,
      unit_price: product.sales_price,
      tax_pct: product.tax_pct || 10
    }],
    discount_code,
    validity_days: 15
  };

  try {
    const res = await apiFetch('/api/subscriptions/quote-template', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success) {
      showToast(`Quotation ${json.data.subscription_number} generated!`, 'success');
      loadAllData();
      document.querySelector('[data-tab="tab-subscriptions"]').click();
    } else {
      showToast(json.message, 'error');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 7. Member 1 Handlers: Add Product, Add Plan, Auth Demo
async function submitNewProduct() {
  const name = document.getElementById('new-prod-name').value.trim();
  const type = document.getElementById('new-prod-type').value;
  const sales_price = Number(document.getElementById('new-prod-price').value);
  const option = document.getElementById('new-prod-var-option').value.trim();
  const extra_price = Number(document.getElementById('new-prod-var-extra').value) || 0;

  if (!name || isNaN(sales_price)) {
    showToast('Name and price are required', 'error');
    return;
  }

  const payload = {
    name,
    type,
    sales_price,
    tax_pct: 10,
    variants: option ? [{ name: 'Brand', option, extra_price }] : []
  };

  try {
    const res = await apiFetch('/api/catalog/products', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success) {
      showToast(`Product "${name}" added with variant (+$${extra_price})`, 'success');
      closeModal('modal-create-product');
      fetchCatalogData();
    } else {
      showToast(json.message, 'error');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function submitNewPlan() {
  const name = document.getElementById('new-plan-name').value.trim();
  const billing_interval = document.getElementById('new-plan-interval').value;
  const min_quantity = Number(document.getElementById('new-plan-minqty').value) || 1;
  const auto_close = document.getElementById('new-plan-autoclose').checked;
  const allow_pause = document.getElementById('new-plan-allowpause').checked;

  if (!name) {
    showToast('Plan name is required', 'error');
    return;
  }

  const payload = {
    name,
    billing_interval,
    min_quantity,
    auto_close,
    allow_pause
  };

  try {
    const res = await apiFetch('/api/catalog/plans', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success) {
      showToast(`Plan "${name}" created successfully!`, 'success');
      closeModal('modal-create-plan');
      fetchCatalogData();
    } else {
      showToast(json.message, 'error');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function demoLogin(email, password, role) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const json = await res.json();
    if (json.success) {
      activeUser = {
        name: json.data.name,
        email: json.data.email,
        role: json.data.role,
        token: json.token
      };
      updateUserBadge();
      showToast(`Switched session to ${json.data.role.toUpperCase()} (${json.data.name})`, 'success');
      loadAllData();
    } else {
      // Fallback local session switch for demo
      activeUser = {
        name: role === 'admin' ? 'Sarah Connor (Admin)' : (role === 'staff' ? 'David Miller (Staff)' : 'Acme Retail (Customer)'),
        email,
        role,
        token: `mock-${role}-jwt-token`
      };
      updateUserBadge();
      showToast(`Switched active role to ${role.toUpperCase()}`, 'info');
      loadAllData();
    }
  } catch (err) {
    activeUser.role = role;
    updateUserBadge();
    showToast(`Role switched to ${role.toUpperCase()}`, 'info');
  }
}

async function submitRegistration() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const role = document.getElementById('reg-role').value;

  if (!name || !email || !password) {
    showToast('All fields are required', 'error');
    return;
  }

  try {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });
    const json = await res.json();
    if (json.success) {
      showToast(`Account created for ${json.data.name} (${json.data.role})!`, 'success');
      document.getElementById('reg-name').value = '';
      document.getElementById('reg-email').value = '';
      document.getElementById('reg-password').value = '';
    } else {
      showToast(json.message, 'error');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Toast notification helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
