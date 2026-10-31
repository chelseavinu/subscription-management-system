// Initial Seed Data for Hackathon Demo
// Perfectly aligns with Member 1 & 2 Database Blueprint

export const INITIAL_PRODUCTS = [
  {
    _id: 'prod_001',
    name: 'Enterprise Cloud ERP Suite',
    type: 'service',
    sales_price: 1200,
    cost_price: 450,
    tax_pct: 18,
    category: 'Software & Cloud',
    description: 'Comprehensive business management suite including CRM, Inventory, and Accounting.',
    variants: [
      { name: 'Brand', option: 'Odoo Engine', extra_price: 560 },
      { name: 'Hosting', option: 'Dedicated Private Cloud', extra_price: 250 },
      { name: 'Support', option: '24/7 Dedicated Account Rep', extra_price: 180 }
    ],
    created_at: '2026-10-15T09:00:00Z'
  },
  {
    _id: 'prod_002',
    name: 'AI Analytics & Reporting Copilot',
    type: 'service',
    sales_price: 499,
    cost_price: 120,
    tax_pct: 18,
    category: 'AI & Data',
    description: 'Autonomous financial forecasting and anomaly detection engine powered by LLMs.',
    variants: [
      { name: 'Model Tier', option: 'GPT-4 / Gemini Ultra', extra_price: 200 },
      { name: 'Data Refresh', option: 'Real-Time Streaming', extra_price: 150 }
    ],
    created_at: '2026-10-18T11:30:00Z'
  },
  {
    _id: 'prod_003',
    name: 'Multi-Channel Payment Gateway Gateway Pro',
    type: 'service',
    sales_price: 299,
    cost_price: 80,
    tax_pct: 12,
    category: 'Fintech Tools',
    description: 'High-throughput merchant routing with auto-reconciliation and chargeback protection.',
    variants: [
      { name: 'Fraud Shield', option: 'Machine Learning Guard', extra_price: 99 },
      { name: 'Multi-Currency', option: '140+ Currencies FX', extra_price: 140 }
    ],
    created_at: '2026-10-20T14:15:00Z'
  },
  {
    _id: 'prod_004',
    name: 'Hardware POS Terminal Terminal-X',
    type: 'product',
    sales_price: 750,
    cost_price: 400,
    tax_pct: 18,
    category: 'Hardware',
    description: 'NFC enabled touch POS terminal with cellular fallback and dual screens.',
    variants: [
      { name: 'Accessories', option: 'Barcode Scanner + Stand', extra_price: 160 },
      { name: 'Warranty', option: '3-Year Rapid Swap Onsite', extra_price: 120 }
    ],
    created_at: '2026-10-22T10:00:00Z'
  },
  {
    _id: 'prod_005',
    name: 'Monthly Priority SLA & Dev Consulting',
    type: 'service',
    sales_price: 850,
    cost_price: 300,
    tax_pct: 18,
    category: 'Professional Services',
    description: '10 hours per month dedicated senior engineering architect review and support.',
    variants: [
      { name: 'Response Time', option: '15-Minute Guaranteed SLA', extra_price: 350 }
    ],
    created_at: '2026-10-25T16:00:00Z'
  }
];

export const INITIAL_PLANS = [
  {
    _id: 'plan_001',
    name: 'Startup Launchpad (Monthly)',
    billing_interval: 'monthly',
    min_quantity: 1,
    auto_close: true,
    allow_pause: true,
    trial_period_days: 14,
    description: 'Ideal for early-stage companies scaling their initial subscription workflows.',
    base_discount_pct: 0,
    active: true
  },
  {
    _id: 'plan_002',
    name: 'Growth Scale (Monthly)',
    billing_interval: 'monthly',
    min_quantity: 3,
    auto_close: false,
    allow_pause: true,
    trial_period_days: 7,
    description: 'Our most popular plan for fast-growing SaaS businesses with automated billing cycles.',
    base_discount_pct: 5,
    active: true
  },
  {
    _id: 'plan_003',
    name: 'Enterprise Annual Elite',
    billing_interval: 'yearly',
    min_quantity: 5,
    auto_close: false,
    allow_pause: false,
    trial_period_days: 30,
    description: 'Full custom deployment with volume licensing, dedicated DB, and yearly billing terms.',
    base_discount_pct: 15,
    active: true
  },
  {
    _id: 'plan_004',
    name: 'Agile Weekly Sprint Tier',
    billing_interval: 'weekly',
    min_quantity: 1,
    auto_close: true,
    allow_pause: true,
    trial_period_days: 3,
    description: 'High-frequency recurring billing designed for short projects and seasonal agencies.',
    base_discount_pct: 0,
    active: true
  }
];

export const INITIAL_DISCOUNTS = [
  {
    _id: 'disc_001',
    code: 'HACKATHON2026',
    type: 'percentage',
    value: 20,
    min_qty: 1,
    min_amount: 500,
    expiry_date: '2026-12-31',
    usage_limit: 100,
    used_count: 34,
    active: true
  },
  {
    _id: 'disc_002',
    code: 'WELCOME500',
    type: 'fixed',
    value: 500,
    min_qty: 2,
    min_amount: 1500,
    expiry_date: '2026-11-30',
    usage_limit: 50,
    used_count: 12,
    active: true
  },
  {
    _id: 'disc_003',
    code: 'ODOOFAN560',
    type: 'fixed',
    value: 560,
    min_qty: 1,
    min_amount: 1000,
    expiry_date: '2027-01-01',
    usage_limit: 25,
    used_count: 8,
    active: true
  },
  {
    _id: 'disc_004',
    code: 'VIPENTERPRISE',
    type: 'percentage',
    value: 30,
    min_qty: 5,
    min_amount: 3000,
    expiry_date: '2026-10-31',
    usage_limit: 10,
    used_count: 10,
    active: false
  }
];

export const INITIAL_CUSTOMERS = [
  { _id: 'cust_001', name: 'Acme Global Logistics', email: 'billing@acmelogistics.com', company: 'Acme Corp' },
  { _id: 'cust_002', name: 'Apex FinTech Labs', email: 'finance@apexfintech.io', company: 'Apex Labs' },
  { _id: 'cust_003', name: 'CyberSphere Security', email: 'accounts@cybersphere.net', company: 'CyberSphere Inc' },
  { _id: 'cust_004', name: 'Nova Health Systems', email: 'payables@novahealth.org', company: 'Nova Health' },
  { _id: 'cust_005', name: 'Starlight Media Studios', email: 'ops@starlightmedia.com', company: 'Starlight Studios' }
];

export const INITIAL_SUBSCRIPTIONS = [
  {
    _id: 'sub_001',
    subscription_number: 'SUB-2026-001',
    customer_id: 'cust_001',
    customer_name: 'Acme Global Logistics',
    customer_email: 'billing@acmelogistics.com',
    plan_id: 'plan_002',
    plan_name: 'Growth Scale (Monthly)',
    status: 'active',
    start_date: '2026-09-01',
    expiry_date: '2027-09-01',
    next_billing_date: '2026-11-01',
    items: [
      {
        product_id: 'prod_001',
        product_name: 'Enterprise Cloud ERP Suite',
        variants_selected: [{ name: 'Brand', option: 'Odoo Engine', extra_price: 560 }],
        qty: 2,
        unit_price: 1760, // 1200 + 560
        tax_pct: 18,
        discount: 0,
        subtotal: 3520
      },
      {
        product_id: 'prod_002',
        product_name: 'AI Analytics & Reporting Copilot',
        variants_selected: [{ name: 'Model Tier', option: 'GPT-4 / Gemini Ultra', extra_price: 200 }],
        qty: 1,
        unit_price: 699,
        tax_pct: 18,
        discount: 50,
        subtotal: 649
      }
    ],
    billing_cycle_amount: 4169,
    total_tax: 750.42,
    created_at: '2026-09-01T10:00:00Z'
  },
  {
    _id: 'sub_002',
    subscription_number: 'SUB-2026-002',
    customer_id: 'cust_002',
    customer_name: 'Apex FinTech Labs',
    customer_email: 'finance@apexfintech.io',
    plan_id: 'plan_003',
    plan_name: 'Enterprise Annual Elite',
    status: 'active',
    start_date: '2026-01-15',
    expiry_date: '2027-01-15',
    next_billing_date: '2026-11-15',
    items: [
      {
        product_id: 'prod_003',
        product_name: 'Multi-Channel Payment Gateway Gateway Pro',
        variants_selected: [{ name: 'Multi-Currency', option: '140+ Currencies FX', extra_price: 140 }],
        qty: 5,
        unit_price: 439,
        tax_pct: 12,
        discount: 100,
        subtotal: 2095
      }
    ],
    billing_cycle_amount: 2095,
    total_tax: 251.40,
    created_at: '2026-01-15T12:00:00Z'
  },
  {
    _id: 'sub_003',
    subscription_number: 'SUB-2026-003',
    customer_id: 'cust_003',
    customer_name: 'CyberSphere Security',
    customer_email: 'accounts@cybersphere.net',
    plan_id: 'plan_001',
    plan_name: 'Startup Launchpad (Monthly)',
    status: 'active',
    start_date: '2026-08-10',
    expiry_date: '2027-08-10',
    next_billing_date: '2026-10-31', // Due today for billing run!
    items: [
      {
        product_id: 'prod_001',
        product_name: 'Enterprise Cloud ERP Suite',
        variants_selected: [{ name: 'Brand', option: 'Odoo Engine', extra_price: 560 }],
        qty: 1,
        unit_price: 1760,
        tax_pct: 18,
        discount: 0,
        subtotal: 1760
      }
    ],
    billing_cycle_amount: 1760,
    total_tax: 316.80,
    created_at: '2026-08-10T08:30:00Z'
  },
  {
    _id: 'sub_004',
    subscription_number: 'SUB-2026-004',
    customer_id: 'cust_004',
    customer_name: 'Nova Health Systems',
    customer_email: 'payables@novahealth.org',
    plan_id: 'plan_002',
    plan_name: 'Growth Scale (Monthly)',
    status: 'confirmed',
    start_date: '2026-10-28',
    expiry_date: '2027-10-28',
    next_billing_date: '2026-11-05',
    items: [
      {
        product_id: 'prod_005',
        product_name: 'Monthly Priority SLA & Dev Consulting',
        variants_selected: [{ name: 'Response Time', option: '15-Minute Guaranteed SLA', extra_price: 350 }],
        qty: 1,
        unit_price: 1200,
        tax_pct: 18,
        discount: 0,
        subtotal: 1200
      }
    ],
    billing_cycle_amount: 1200,
    total_tax: 216.00,
    created_at: '2026-10-28T14:00:00Z'
  },
  {
    _id: 'sub_005',
    subscription_number: 'SUB-2026-005',
    customer_id: 'cust_005',
    customer_name: 'Starlight Media Studios',
    customer_email: 'ops@starlightmedia.com',
    plan_id: 'plan_004',
    plan_name: 'Agile Weekly Sprint Tier',
    status: 'quotation',
    start_date: '2026-11-01',
    expiry_date: '2026-12-01',
    next_billing_date: '2026-11-01',
    items: [
      {
        product_id: 'prod_002',
        product_name: 'AI Analytics & Reporting Copilot',
        variants_selected: [],
        qty: 2,
        unit_price: 499,
        tax_pct: 18,
        discount: 50,
        subtotal: 948
      }
    ],
    billing_cycle_amount: 948,
    total_tax: 170.64,
    created_at: '2026-10-30T17:20:00Z'
  },
  {
    _id: 'sub_006',
    subscription_number: 'SUB-2026-006',
    customer_id: 'cust_001',
    customer_name: 'Acme Global Logistics',
    customer_email: 'billing@acmelogistics.com',
    plan_id: 'plan_001',
    plan_name: 'Startup Launchpad (Monthly)',
    status: 'draft',
    start_date: '2026-11-10',
    expiry_date: '2027-11-10',
    next_billing_date: '2026-11-10',
    items: [
      {
        product_id: 'prod_004',
        product_name: 'Hardware POS Terminal Terminal-X',
        variants_selected: [{ name: 'Accessories', option: 'Barcode Scanner + Stand', extra_price: 160 }],
        qty: 3,
        unit_price: 910,
        tax_pct: 18,
        discount: 0,
        subtotal: 2730
      }
    ],
    billing_cycle_amount: 2730,
    total_tax: 491.40,
    created_at: '2026-10-31T09:10:00Z'
  }
];

export const INITIAL_INVOICES = [
  {
    _id: 'inv_001',
    invoice_number: 'INV-2026-001',
    subscription_id: 'sub_001',
    subscription_number: 'SUB-2026-001',
    customer_id: 'cust_001',
    customer_name: 'Acme Global Logistics',
    customer_email: 'billing@acmelogistics.com',
    issue_date: '2026-10-01',
    due_date: '2026-10-15',
    subtotal: 4169.00,
    tax_amount: 750.42,
    total_amount: 4919.42,
    status: 'paid', // draft | confirmed | paid | overdue
    items: [
      { name: 'Enterprise Cloud ERP Suite (Brand: Odoo Engine)', qty: 2, unit_price: 1760, amount: 3520 },
      { name: 'AI Analytics & Reporting Copilot (GPT-4 Tier)', qty: 1, unit_price: 649, amount: 649 }
    ],
    paid_at: '2026-10-08T15:20:00Z'
  },
  {
    _id: 'inv_002',
    invoice_number: 'INV-2026-002',
    subscription_id: 'sub_002',
    subscription_number: 'SUB-2026-002',
    customer_id: 'cust_002',
    customer_name: 'Apex FinTech Labs',
    customer_email: 'finance@apexfintech.io',
    issue_date: '2026-10-15',
    due_date: '2026-10-29',
    subtotal: 2095.00,
    tax_amount: 251.40,
    total_amount: 2346.40,
    status: 'overdue', // overdue for finance collection!
    items: [
      { name: 'Multi-Channel Payment Gateway Pro (Multi-Currency)', qty: 5, unit_price: 439, amount: 2095 }
    ]
  },
  {
    _id: 'inv_003',
    invoice_number: 'INV-2026-003',
    subscription_id: 'sub_003',
    subscription_number: 'SUB-2026-003',
    customer_id: 'cust_003',
    customer_name: 'CyberSphere Security',
    customer_email: 'accounts@cybersphere.net',
    issue_date: '2026-10-25',
    due_date: '2026-11-08',
    subtotal: 1760.00,
    tax_amount: 316.80,
    total_amount: 2076.80,
    status: 'confirmed', // unpaid, pending
    items: [
      { name: 'Enterprise Cloud ERP Suite (Brand: Odoo Engine)', qty: 1, unit_price: 1760, amount: 1760 }
    ]
  },
  {
    _id: 'inv_004',
    invoice_number: 'INV-2026-004',
    subscription_id: 'sub_004',
    subscription_number: 'SUB-2026-004',
    customer_id: 'cust_004',
    customer_name: 'Nova Health Systems',
    customer_email: 'payables@novahealth.org',
    issue_date: '2026-10-28',
    due_date: '2026-11-11',
    subtotal: 1200.00,
    tax_amount: 216.00,
    total_amount: 1416.00,
    status: 'draft',
    items: [
      { name: 'Monthly Priority SLA & Dev Consulting (15-min SLA)', qty: 1, unit_price: 1200, amount: 1200 }
    ]
  }
];

export const INITIAL_PAYMENTS = [
  {
    _id: 'pay_001',
    invoice_id: 'inv_001',
    invoice_number: 'INV-2026-001',
    customer_name: 'Acme Global Logistics',
    amount: 4919.42,
    payment_method: 'stripe',
    date: '2026-10-08T15:20:00Z',
    transaction_ref: 'ch_3Nxy882eZvKYlo2C1g9Rtx',
    notes: 'Auto-debit successful via Stripe ACH Corporate'
  }
];
