/**
 * Brightloop Software - Official Receipt & Invoice Generator
 * Generates branded, printable, and downloadable HTML/PDF receipts.
 */

export function generateReceiptHtml(invoice, customer = {}) {
  const invoiceNumber = invoice.invoice_number || 'INV-DRAFT';
  const issueDate = invoice.issue_date || invoice.createdAt ? new Date(invoice.issue_date || invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
  const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
  const status = (invoice.status || 'Confirmed').toUpperCase();
  const isPaid = status === 'PAID';

  const customerName = invoice.customer_name || customer.name || 'Valued Customer';
  const customerEmail = invoice.customer_email || customer.email || 'billing@customer.com';

  const subtotal = Number(invoice.subtotal || invoice.total_amount || 0).toLocaleString();
  const taxAmount = Number(invoice.tax_amount || 0).toLocaleString();
  const totalAmount = Number(invoice.total_amount || 0).toLocaleString();

  const lines = (invoice.lines && invoice.lines.length > 0)
    ? invoice.lines
    : [
        {
          product_name: `Subscription Tier: ${invoice.subscription_number || 'Enterprise Cloud'}`,
          description: 'Recurring automated billing period',
          quantity: 1,
          unit_price: invoice.subtotal || invoice.total_amount || 0,
          amount: invoice.subtotal || invoice.total_amount || 0
        }
      ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Receipt - ${invoiceNumber} - Brightloop Software</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

    @media print {
      body {
        background: #FFFFFF !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print {
        display: none !important;
      }
      .receipt-wrapper {
        box-shadow: none !important;
        border: none !important;
        padding: 20px 0 !important;
        max-width: 100% !important;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0B0E14;
      color: #1E293B;
      padding: 40px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }

    .action-bar {
      width: 100%;
      max-width: 720px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      gap: 12px;
    }

    .btn-action {
      background: #4F46E5;
      color: #FFFFFF;
      border: none;
      padding: 10px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .btn-action:hover {
      background: #4338CA;
      transform: translateY(-1px);
    }

    .btn-back {
      background: #1E293B;
      color: #94A3B8;
      border: 1px solid #334155;
    }

    .btn-back:hover {
      background: #334155;
      color: #FFFFFF;
    }

    .receipt-wrapper {
      width: 100%;
      max-width: 720px;
      background: #FFFFFF;
      border-radius: 20px;
      padding: 48px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      position: relative;
      overflow: hidden;
    }

    .top-accent {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, #F59E0B, #6366F1, #10B981);
    }

    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 28px;
      margin-bottom: 32px;
    }

    .brand-col h1 {
      font-size: 24px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -0.5px;
    }

    .brand-col p {
      font-size: 13px;
      color: #64748B;
      margin-top: 4px;
    }

    .badge-status {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      font-family: 'JetBrains Mono', monospace;
    }

    .badge-paid {
      background: #ECFDF5;
      color: #059669;
      border: 1.5px solid #A7F3D0;
    }

    .badge-pending {
      background: #FFFBEB;
      color: #D97706;
      border: 1.5px solid #FDE68A;
    }

    .badge-overdue {
      background: #FEF2F2;
      color: #DC2626;
      border: 1.5px solid #FECACA;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      margin-bottom: 36px;
    }

    .meta-box h4 {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94A3B8;
      margin-bottom: 6px;
    }

    .meta-box p {
      font-size: 14px;
      font-weight: 600;
      color: #0F172A;
    }

    .meta-box .subtext {
      font-size: 12px;
      color: #64748B;
      font-weight: 400;
      margin-top: 2px;
    }

    .meta-box.right {
      text-align: right;
    }

    .invoice-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 16px;
      font-weight: 700;
      color: #4F46E5;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
    }

    th {
      background: #F8FAFC;
      color: #475569;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 12px 14px;
      text-align: left;
      border-top: 1px solid #E2E8F0;
      border-bottom: 1px solid #E2E8F0;
    }

    td {
      padding: 16px 14px;
      font-size: 13px;
      color: #334155;
      border-bottom: 1px solid #F1F5F9;
      vertical-align: middle;
    }

    .line-title {
      font-weight: 700;
      color: #0F172A;
    }

    .line-desc {
      font-size: 11px;
      color: #64748B;
      margin-top: 2px;
    }

    .num-col {
      font-family: 'JetBrains Mono', monospace;
      text-align: right;
    }

    .totals-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 36px;
    }

    .totals-table {
      width: 280px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      color: #64748B;
    }

    .total-row.grand {
      border-top: 2px solid #E2E8F0;
      margin-top: 10px;
      padding-top: 12px;
      color: #0F172A;
      font-size: 18px;
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
    }

    .watermark-paid {
      position: absolute;
      top: 45%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-15deg);
      font-size: 72px;
      font-weight: 900;
      color: rgba(16, 185, 129, 0.08);
      border: 6px dashed rgba(16, 185, 129, 0.15);
      padding: 10px 40px;
      border-radius: 16px;
      pointer-events: none;
      letter-spacing: 4px;
    }

    .footer {
      border-top: 1px solid #E2E8F0;
      padding-top: 24px;
      text-align: center;
      color: #94A3B8;
      font-size: 12px;
      line-height: 1.6;
    }

    .footer strong {
      color: #475569;
    }
  </style>
</head>
<body>

  <div class="action-bar no-print">
    <div style="font-size: 12px; color: #94A3B8;">Brightloop Official Receipt Record</div>
    <div style="display: flex; gap: 8px;">
      <button class="btn-action" onclick="window.print()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Print / Save as PDF
      </button>
    </div>
  </div>

  <div class="receipt-wrapper">
    <div class="top-accent"></div>

    ${isPaid ? '<div class="watermark-paid">PAID</div>' : ''}

    <div class="header-row">
      <div class="brand-col">
        <h1>Brightloop Software</h1>
        <p>Enterprise Subscription Management & Billing Engine</p>
        <p style="font-size: 11px; color: #94A3B8; margin-top: 2px;">support@brightloop.com • brightloop.com</p>
      </div>
      <div>
        <span class="badge-status ${isPaid ? 'badge-paid' : (status === 'OVERDUE' ? 'badge-overdue' : 'badge-pending')}">
          ${isPaid ? '✓ Paid in Full' : status}
        </span>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <h4>Customer Details</h4>
        <p>${customerName}</p>
        <p class="subtext">${customerEmail}</p>
      </div>

      <div class="meta-box right">
        <h4>Invoice Reference</h4>
        <p class="invoice-num">${invoiceNumber}</p>
        <p class="subtext">Issue Date: ${issueDate}</p>
        <p class="subtext">Due Date: ${dueDate}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${lines.map(line => `
          <tr>
            <td>
              <div class="line-title">${line.product_name || line.description || 'Subscription Line'}</div>
              ${line.variant ? `<div class="line-desc">Variant Surcharge: ${line.variant}</div>` : ''}
            </td>
            <td class="num-col" style="text-align: center;">${line.quantity || 1}</td>
            <td class="num-col">$${Number(line.unit_price || 0).toLocaleString()}</td>
            <td class="num-col" style="font-weight: 700; color: #0F172A;">$${Number(line.amount || ((line.quantity || 1) * (line.unit_price || 0))).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals-wrapper">
      <div class="totals-table">
        <div class="total-row">
          <span>Subtotal</span>
          <span style="font-family: 'JetBrains Mono', monospace;">$${subtotal}</span>
        </div>
        <div class="total-row">
          <span>Tax (18% Statutory Rate)</span>
          <span style="font-family: 'JetBrains Mono', monospace;">$${taxAmount}</span>
        </div>
        <div class="total-row grand">
          <span>Total ${isPaid ? 'Paid' : 'Due'}</span>
          <span>$${totalAmount}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p><strong>Thank you for choosing Brightloop Software.</strong></p>
      <p>This automated digital receipt serves as official proof of billing. For billing questions or inquiries, email <a href="mailto:billing@brightloop.com" style="color: #4F46E5; text-decoration: none;">billing@brightloop.com</a>.</p>
    </div>
  </div>

</body>
</html>`;
}

/**
 * Triggers a direct file download of the receipt HTML document.
 */
export function downloadReceiptFile(invoice, customer = {}) {
  const html = generateReceiptHtml(invoice, customer);
  const invoiceNumber = invoice.invoice_number || 'INV';
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `Brightloop-Receipt-${invoiceNumber}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens a print-ready window with the receipt, automatically prompting print/save-as-pdf,
 * and also downloads the receipt file.
 */
export function printOrDownloadReceipt(invoice, customer = {}) {
  // 1. Trigger the immediate file download
  downloadReceiptFile(invoice, customer);

  // 2. Open printable view in a new tab/window for instant print / save as PDF
  const html = generateReceiptHtml(invoice, customer);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
