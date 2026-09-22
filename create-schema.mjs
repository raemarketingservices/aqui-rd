import https from 'https';
import http from 'http';

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q';
const BASE = 'http://84.46.254.137:8000/pg/query';

async function sql(query) {
  const body = JSON.stringify({ query });
  return new Promise((resolve, reject) => {
    const req = http.request(BASE, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 30000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) reject(new Error(parsed.error));
          else resolve(parsed);
        } catch { resolve(data); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('Connected to Supabase PostgreSQL via API!\n');

  // Drop old tables
  console.log('Dropping old tables...');
  await sql(`DROP TABLE IF EXISTS store_messages CASCADE`);
  await sql(`DROP TABLE IF EXISTS crm_conversations CASCADE`);
  await sql(`DROP TABLE IF EXISTS crm_faq CASCADE`);
  await sql(`DROP TABLE IF EXISTS orders CASCADE`);
  await sql(`DROP TABLE IF EXISTS banners CASCADE`);
  await sql(`DROP TABLE IF EXISTS products CASCADE`);
  await sql(`DROP TABLE IF EXISTS vendors CASCADE`);
  await sql(`DROP TABLE IF EXISTS categories CASCADE`);
  await sql(`DROP TABLE IF EXISTS users CASCADE`);
  console.log('Dropped old tables\n');

  // Create tables
  console.log('Creating tables...');

  await sql(`CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT '',
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER',
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
  )`);
  console.log('  users ✓');

  await sql(`CREATE TABLE vendors (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id),
    business_name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    logo VARCHAR(500) DEFAULT '',
    slug VARCHAR(255) DEFAULT '',
    rating DECIMAL(3,1) DEFAULT 0,
    total_sales INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'PENDING',
    whatsapp VARCHAR(50) DEFAULT '',
    socials TEXT DEFAULT '',
    payment_methods TEXT DEFAULT '',
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    address VARCHAR(255) DEFAULT '',
    rnc VARCHAR(50) DEFAULT '',
    email VARCHAR(255) DEFAULT '',
    categories TEXT DEFAULT '[]'
  )`);
  console.log('  vendors ✓');

  await sql(`CREATE TABLE products (
    id VARCHAR(64) PRIMARY KEY,
    vendor_id VARCHAR(64) REFERENCES vendors(id),
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    price INT DEFAULT 0,
    compare_at_price INT DEFAULT 0,
    images TEXT DEFAULT '[]',
    category_id VARCHAR(100) DEFAULT '',
    stock INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    rating DECIMAL(3,1) DEFAULT 0,
    review_count INT DEFAULT 0,
    sales_count INT DEFAULT 0,
    whatsapp VARCHAR(50) DEFAULT '',
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
  )`);
  console.log('  products ✓');

  await sql(`CREATE TABLE categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(500) DEFAULT ''
  )`);
  console.log('  categories ✓');

  await sql(`CREATE TABLE crm_faq (
    id VARCHAR(64) PRIMARY KEY,
    keywords TEXT DEFAULT '',
    answer TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true
  )`);
  console.log('  crm_faq ✓');

  await sql(`CREATE TABLE store_messages (
    id VARCHAR(64) PRIMARY KEY,
    vendor_id VARCHAR(64),
    customer_id VARCHAR(64) DEFAULT '',
    customer_name VARCHAR(255) DEFAULT '',
    message TEXT DEFAULT '',
    sender VARCHAR(50) DEFAULT 'USER',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
  )`);
  console.log('  store_messages ✓');

  await sql(`CREATE TABLE orders (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    vendor_id VARCHAR(64),
    total_amount INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
  )`);
  console.log('  orders ✓');

  await sql(`CREATE TABLE banners (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) DEFAULT '',
    image_url VARCHAR(500) DEFAULT '',
    link VARCHAR(500) DEFAULT '',
    position INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true
  )`);
  console.log('  banners ✓');

  // Create indexes
  console.log('\nCreating indexes...');
  await sql(`CREATE INDEX idx_products_vendor ON products(vendor_id)`);
  await sql(`CREATE INDEX idx_vendors_user ON vendors(user_id)`);
  await sql(`CREATE INDEX idx_vendors_status ON vendors(status)`);
  await sql(`CREATE INDEX idx_store_messages_vendor ON store_messages(vendor_id)`);
  await sql(`CREATE INDEX idx_orders_user ON orders(user_id)`);
  await sql(`CREATE INDEX idx_products_category ON products(category_id)`);
  console.log('Indexes created ✓\n');

  console.log('Schema created successfully!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
