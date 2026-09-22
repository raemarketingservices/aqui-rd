const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:raeadmin@84.46.254.137:5432/postgres?sslmode=disable&application_name=supabase',
  connectionTimeoutMillis: 15000,
});

async function createSchema() {
  await client.connect();
  console.log('Connected to PostgreSQL!');

  await client.query(`
    DROP TABLE IF EXISTS store_messages CASCADE;
    DROP TABLE IF EXISTS crm_conversations CASCADE;
    DROP TABLE IF EXISTS crm_faq CASCADE;
    DROP TABLE IF EXISTS orders CASCADE;
    DROP TABLE IF EXISTS banners CASCADE;
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS vendors CASCADE;
    DROP TABLE IF EXISTS categories CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);
  console.log('Dropped old tables');

  await client.query(`
    CREATE TABLE users (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL DEFAULT '',
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE TABLE vendors (
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
    );
    CREATE TABLE products (
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
    );
    CREATE TABLE categories (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      image VARCHAR(500) DEFAULT ''
    );
    CREATE TABLE crm_faq (
      id VARCHAR(64) PRIMARY KEY,
      keywords TEXT DEFAULT '',
      answer TEXT DEFAULT '',
      is_active BOOLEAN DEFAULT true
    );
    CREATE TABLE crm_conversations (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64),
      last_message_at BIGINT DEFAULT 0,
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    );
    CREATE TABLE store_messages (
      id VARCHAR(64) PRIMARY KEY,
      vendor_id VARCHAR(64) REFERENCES vendors(id),
      customer_id VARCHAR(64) DEFAULT '',
      customer_name VARCHAR(255) DEFAULT '',
      message TEXT DEFAULT '',
      sender VARCHAR(50) DEFAULT 'USER',
      status VARCHAR(50) DEFAULT 'ACTIVE',
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    );
    CREATE TABLE orders (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64),
      vendor_id VARCHAR(64),
      total_amount INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'PENDING',
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    );
    CREATE TABLE banners (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) DEFAULT '',
      image_url VARCHAR(500) DEFAULT '',
      link VARCHAR(500) DEFAULT '',
      position INT DEFAULT 0,
      is_active BOOLEAN DEFAULT true
    );
    CREATE INDEX idx_products_vendor ON products(vendor_id);
    CREATE INDEX idx_vendors_user ON vendors(user_id);
    CREATE INDEX idx_vendors_status ON vendors(status);
    CREATE INDEX idx_store_messages_vendor ON store_messages(vendor_id);
    CREATE INDEX idx_orders_user ON orders(user_id);
    CREATE INDEX idx_products_category ON products(category_id);
  `);
  console.log('Schema created successfully!');

  await client.end();
}

createSchema().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
