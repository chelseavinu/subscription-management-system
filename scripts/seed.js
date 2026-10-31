import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Discount from '../models/Discount.js';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/brightloop';

/**
 * Seed Database Function
 */
const seedData = async () => {
  try {
    console.log('[Seed] Connecting to database at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Database connected successfully.');

    // 1. Wipe existing data across all collections
    console.log('[Seed] Wiping existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Plan.deleteMany({}),
      Subscription.deleteMany({}),
      Invoice.deleteMany({}),
      Payment.deleteMany({}),
      Discount.deleteMany({}),
    ]);
    console.log('[Seed] Existing collections wiped.');

    // 2. Seed Users
    // Passwords satisfy the validation rules: strictly > 8 chars, uppercase, lowercase, special char
    console.log('[Seed] Creating seed users...');
    const usersToCreate = [
      {
        name: 'Brightloop Admin',
        email: 'admin@brightloop.com',
        password: 'Admin#1234',
        role: 'admin',
      },
      {
        name: 'Operations Staff',
        email: 'staff@brightloop.com',
        password: 'Staff#1234',
        role: 'staff',
      },
      {
        name: 'Client Business Corporation',
        email: 'client@business.com',
        password: 'Client#1234',
        role: 'customer',
      },
    ];

    // Using User.create() so Mongoose pre-save hook properly hashes passwords with bcryptjs
    const createdUsers = await User.create(usersToCreate);
    console.log(`[Seed] Created ${createdUsers.length} users:`);
    createdUsers.forEach((u) => {
      console.log(`   - ${u.name} (${u.email}) [Role: ${u.role}]`);
    });

    // 3. Seed Products
    console.log('[Seed] Creating sample products...');
    const productsToCreate = [
      {
        name: 'Enterprise ERP Cloud Engine',
        type: 'software',
        sales_price: 1200,
        cost_price: 450,
        notes: 'Core scalable ERP backend subscription license with variant addons',
        variants: [
          {
            name: 'Brand',
            option: 'Odoo',
            extra_price: 560,
          },
          {
            name: 'Brand',
            option: 'Standard Cloud',
            extra_price: 0,
          },
          {
            name: 'Brand',
            option: 'Enterprise Plus',
            extra_price: 850,
          },
        ],
      },
      {
        name: 'Dedicated Cloud DevOps & SLA Support',
        type: 'service',
        sales_price: 450,
        cost_price: 160,
        notes: '24/7 technical incident and continuous integration monitoring service',
        variants: [
          {
            name: 'Tier',
            option: 'Standard 8x5',
            extra_price: 0,
          },
          {
            name: 'Tier',
            option: 'Critical 24x7 Enterprise',
            extra_price: 250,
          },
        ],
      },
    ];

    const createdProducts = await Product.create(productsToCreate);
    console.log(`[Seed] Created ${createdProducts.length} sample products:`);
    createdProducts.forEach((p) => {
      console.log(`   - ${p.name} ($${p.sales_price}) [Variants: ${p.variants.map((v) => `${v.name}:${v.option} (+$${v.extra_price})`).join(', ')}]`);
    });

    // 4. Seed Plans
    console.log('[Seed] Creating sample billing plans...');
    const plansToCreate = [
      {
        name: 'Standard Monthly Growth Plan',
        billing_interval: 'monthly',
        base_price: 199,
        min_quantity: 1,
        auto_close: false,
        allow_pause: true,
        is_active: true,
      },
      {
        name: 'Enterprise Yearly Commitment Plan',
        billing_interval: 'yearly',
        base_price: 1990,
        min_quantity: 1,
        auto_close: false,
        allow_pause: false,
        is_active: true,
      },
    ];

    const createdPlans = await Plan.create(plansToCreate);
    console.log(`[Seed] Created ${createdPlans.length} sample billing plans:`);
    createdPlans.forEach((pl) => {
      console.log(`   - ${pl.name} ($${pl.base_price} / ${pl.billing_interval})`);
    });

    // 5. Seed a Sample Discount code for teammates
    const sampleDiscount = await Discount.create({
      code: 'HACKATHON20',
      type: 'percentage',
      value: 20,
      min_qty: 1,
      min_amount: 100,
      usage_limit: 100,
      times_used: 0,
      is_active: true,
    });
    console.log(`[Seed] Created sample discount code: ${sampleDiscount.code} (${sampleDiscount.value}% off)`);

    console.log('====================================================');
    console.log('✅ Database seeding completed successfully!');
    console.log('====================================================');
    console.log('Seed Credentials:');
    console.log('  Admin:    admin@brightloop.com  / Admin#1234');
    console.log('  Staff:    staff@brightloop.com  / Staff#1234');
    console.log('  Customer: client@business.com   / Client#1234');
    console.log('====================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    if (mongoose.connection) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedData();
