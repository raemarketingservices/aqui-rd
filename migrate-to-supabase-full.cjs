const { Client } = require('pg');

// Configuration - Self-hosted Supabase instance
const SUPABASE_URL = 'http://84.46.254.137:8000/pg/query';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q';

// Helper function to execute SQL via Supabase API
async function sql(query) {
  const body = JSON.stringify({ query });
  return new Promise((resolve, reject) => {
    const req = http.request(SUPABASE_URL, {
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

// We need to import http and https
const http = require('http');
const https = require('https');

// Since we are using http, we'll use the http module. If using https, change accordingly.

async function main() {
  console.log('Connected to Supabase PostgreSQL via API!\n');

  // Drop existing tables in reverse order (to avoid foreign key issues, though we don't have FK constraints)
  console.log('Dropping old tables...');
  const tablesToDrop = [
    'store_messages',
    'crm_conversations',
    'crm_faq',
    'orders',
    'banners',
    'products',
    'vendors',
    'categories',
    'users',
    'carts',
    'cart_items',
    'order_items',
    'reviews',
    'site_settings',
    'chatbot_config',
    'landing_content',
    'conversations',
    'messages',
    'tickets',
    'ticket_comments',
    'notifications',
    'vendor_reviews',
    'crm_messages',
    'crm_auto_responses',
    'crm_settings'
  ];

  for (const table of tablesToDrop) {
    await sql(`DROP TABLE IF EXISTS ${table} CASCADE`);
  }
  console.log('Dropped old tables\n');

  // Create tables
  console.log('Creating tables...');

  // 1. users
  await sql(`
    CREATE TABLE users (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL DEFAULT '',
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER',
      phone VARCHAR(20),
      avatar VARCHAR(500),
      vendorId VARCHAR(64),
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  users ✓');

  // 2. vendors
  await sql(`
    CREATE TABLE vendors (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64),
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
    )
  `);
  console.log('  vendors ✓');

  // 3. categories
  await sql(`
    CREATE TABLE categories (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) DEFAULT '',
      image VARCHAR(500) DEFAULT '',
      parent_id VARCHAR(64),
      description TEXT DEFAULT '',
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  categories ✓');

  // 4. products
  await sql(`
    CREATE TABLE products (
      id VARCHAR(64) PRIMARY KEY,
      vendor_id VARCHAR(64),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) DEFAULT '',
      description TEXT DEFAULT '',
      price INT DEFAULT 0, -- in cents
      compare_at_price INT DEFAULT 0, -- in cents
      images TEXT DEFAULT '[]', -- JSON array of strings
      category_id VARCHAR(64),
      stock INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'ACTIVE',
      rating DECIMAL(3,1) DEFAULT 0,
      review_count INT DEFAULT 0,
      sales_count INT DEFAULT 0,
      whatsapp VARCHAR(50) DEFAULT '',
      condition VARCHAR(50) DEFAULT NULL,
      brand VARCHAR(255) DEFAULT NULL,
      color VARCHAR(255) DEFAULT NULL,
      sku VARCHAR(255) DEFAULT NULL,
      tags TEXT DEFAULT '[]', -- JSON array of strings
      location VARCHAR(255) DEFAULT NULL,
      availability VARCHAR(50) DEFAULT NULL,
      video_url VARCHAR(500) DEFAULT NULL,
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  products ✓');

  // 5. carts
  await sql(`
    CREATE TABLE carts (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64),
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  carts ✓');

  // 6. cartItems
  await sql(`
    CREATE TABLE cart_items (
      id VARCHAR(64) PRIMARY KEY,
      cart_id VARCHAR(64),
      product_id VARCHAR(64),
      quantity INT DEFAULT 1,
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  cart_items ✓');

  // 7. orders
  await sql(`
    CREATE TABLE orders (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64),
      vendor_id VARCHAR(64),
      order_number VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'PENDING',
      subtotal INT DEFAULT 0, -- in cents
      tax_amount INT DEFAULT 0, -- in cents
      shipping_cost INT DEFAULT 0, -- in cents
      total_amount INT DEFAULT 0, -- in cents
      shipping_address TEXT DEFAULT '',
      payment_method VARCHAR(255) DEFAULT NULL,
      notes TEXT DEFAULT '',
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  orders ✓');

  // 8. 8. orderItems
  await sql(`
    CREATE TABLE order_items (
      id VARCHAR(64) PRIMARY KEY,
      order_id VARCHAR(64),
      product_id VARCHAR(64),
      vendor_id VARCHAR(64),
      name VARCHAR(255) NOT NULL,
      price INT DEFAULT 0, -- in cents
      quantity INT DEFAULT 1,
      subtotal INT DEFAULT 0, -- in cents
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  order_items ✓');

  // 9. reviews
  await sql(`
    CREATE TABLE reviews (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64),
      product_id VARCHAR(64),
      rating INT DEFAULT 0,
      title VARCHAR(255) DEFAULT NULL,
      comment TEXT DEFAULT '',
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  reviews ✓');

  // 10. siteSettings
  await sql(`
    CREATE TABLE site_settings (
      id VARCHAR(64) PRIMARY KEY,
      key VARCHAR(255) UNIQUE NOT NULL,
      value TEXT,
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  site_settings ✓');

  // 11. chatbotConfig
  await sql(`
    CREATE TABLE chatbot_config (
      id VARCHAR(64) PRIMARY KEY,
      faqs TEXT DEFAULT '[]', -- JSON array of objects: [{question: string, answer: string}]
      knowledge_base TEXT DEFAULT '',
      welcome_message TEXT DEFAULT '',
      updated_by VARCHAR(64),
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  chatbot_config ✓');

  // 12. landingContent
  await sql(`
    CREATE TABLE landing_content (
      id VARCHAR(64) PRIMARY KEY,
      section VARCHAR(255) NOT NULL,
      key VARCHAR(255) NOT NULL,
      value TEXT,
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  landing_content ✓');

  // 13. conversations
  await sql(`
    CREATE TABLE conversations (
      id VARCHAR(64) PRIMARY KEY,
      vendor_id VARCHAR(64),
      last_message TEXT DEFAULT '',
      last_message_at BIGINT DEFAULT 0,
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  conversations ✓');

  // 14. messages
  await sql(`
    CREATE TABLE messages (
      id VARCHAR(64) PRIMARY KEY,
      conversation_id VARCHAR(64),
      sender_id VARCHAR(64),
      sender_role VARCHAR(50), -- ADMIN or VENDOR
      text TEXT DEFAULT '',
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  messages ✓');

  // 15. tickets
  await sql(`
    CREATE TABLE tickets (
      id VARCHAR(64) PRIMARY KEY,
      vendor_id VARCHAR(64),
      vendor_name VARCHAR(255) DEFAULT '',
      subject VARCHAR(255) NOT NULL,
      description TEXT DEFAULT '',
      status VARCHAR(50) DEFAULT 'PENDING',
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
      updated_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  tickets ✓');

  // 16. ticketComments
  await sql(`
    CREATE TABLE ticket_comments (
      id VARCHAR(64) PRIMARY KEY,
      ticket_id VARCHAR(64),
      sender_id VARCHAR(64),
      sender_role VARCHAR(50), -- ADMIN or VENDOR
      text TEXT DEFAULT '',
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  ticket_comments ✓');

  // 17. notifications
  await sql(`
    CREATE TABLE notifications (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64),
      type VARCHAR(255) DEFAULT '',
      title VARCHAR(255) DEFAULT '',
      message TEXT DEFAULT '',
      read BOOLEAN DEFAULT FALSE,
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  notifications ✓');

  // 18. vendorReviews
  await sql(`
    CREATE TABLE vendor_reviews (
      id VARCHAR(64) PRIMARY KEY,
      vendor_id VARCHAR(64),
      user_id VARCHAR(64),
      rating INT DEFAULT 0,
      comment TEXT DEFAULT '',
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  vendor_reviews ✓');

  // 19. crmConversations
  await sql(`
    CREATE TABLE crm_conversations (
      id VARCHAR(64) PRIMARY KEY,
      platform VARCHAR(50), -- whatsapp, instagram, facebook, app
      platform_conversation_id VARCHAR(255),
      customer_name VARCHAR(255),
      customer_phone VARCHAR(50) DEFAULT NULL,
      customer_platform_id VARCHAR(255),
      last_message_at BIGINT DEFAULT 0,
      last_message_preview TEXT DEFAULT NULL,
      status VARCHAR(50) DEFAULT 'open',
      assigned_to VARCHAR(64) DEFAULT NULL,
      unread_count INT DEFAULT 0,
      tags TEXT DEFAULT '[]', -- JSON array of strings
      bot_state TEXT DEFAULT NULL,
      selected_product_id VARCHAR(64) DEFAULT NULL,
      shipping_info TEXT DEFAULT NULL, -- JSON
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  crm_conversations ✓');

  // 20. crmMessages
  await sql(`
    CREATE TABLE crm_messages (
      id VARCHAR(64) PRIMARY KEY,
      conversation_id VARCHAR(64),
      platform_message_id VARCHAR(255),
      sender VARCHAR(50), -- customer, bot, agent
      sender_name VARCHAR(255),
      message_type VARCHAR(50), -- text, image, video, audio, file, interactive, location
      content TEXT DEFAULT '',
      timestamp BIGINT DEFAULT 0,
      delivered BOOLEAN DEFAULT FALSE,
      read BOOLEAN DEFAULT FALSE,
      metadata TEXT DEFAULT NULL, -- JSON
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  crm_messages ✓');

  // 21. crmAutoResponses
  await sql(`
    CREATE TABLE crm_auto_responses (
      id VARCHAR(64) PRIMARY KEY,
      trigger TEXT NOT NULL,
      response TEXT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      priority INT DEFAULT 0,
      platform VARCHAR(50) DEFAULT NULL, -- all, whatsapp, instagram, facebook
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  crm_auto_responses ✓');

  // 22. crmFAQ
  await sql(`
    CREATE TABLE crm_faq (
      id VARCHAR(64) PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      keywords TEXT DEFAULT '[]', -- JSON array of strings
      is_active BOOLEAN DEFAULT TRUE,
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  crm_faq ✓');

  // 23. crmSettings
  await sql(`
    CREATE TABLE crm_settings (
      id VARCHAR(64) PRIMARY KEY,
      key VARCHAR(255) UNIQUE NOT NULL,
      value TEXT,
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  crm_settings ✓');

  // 24. banners
  await sql(`
    CREATE TABLE banners (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) DEFAULT '',
      image_url VARCHAR(500) DEFAULT '',
      link VARCHAR(500) DEFAULT '',
      position INT DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
    )
  `);
  console.log('  banners ✓');

  // Create indexes
  console.log('\nCreating indexes...');
  const indexes = [
    'CREATE INDEX idx_users_email ON users(email)',
    'CREATE INDEX idx_users_role ON users(role)',
    'CREATE INDEX idx_vendors_user_id ON vendors(user_id)',
    'CREATE INDEX idx_vendors_slug ON vendors(slug)',
    'CREATE INDEX idx_vendors_status ON vendors(status)',
    'CREATE INDEX idx_categories_slug ON categories(slug)',
    'CREATE INDEX idx_categories_parent_id ON categories(parent_id)',
    'CREATE INDEX idx_products_vendor_id ON products(vendor_id)',
    'CREATE INDEX idx_products_slug ON products(slug)',
    'CREATE INDEX idx_products_category_id ON products(category_id)',
    'CREATE INDEX idx_products_status ON products(status)',
    'CREATE INDEX idx_products_price ON products(price)',
    'CREATE INDEX idx_products_sales_count ON products(sales_count)',
    'CREATE INDEX idx_carts_user_id ON carts(user_id)',
    'CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id)',
    'CREATE INDEX idx_cart_items_product_id ON cart_items(product_id)',
    'CREATE INDEX idx_orders_user_id ON orders(user_id)',
    'CREATE INDEX idx_orders_order_number ON orders(order_number)',
    'CREATE INDEX idx_orders_status ON orders(status)',
    'CREATE INDEX idx_order_items_order_id ON order_items(order_id)',
    'CREATE INDEX idx_order_items_product_id ON order_items(product_id)',
    'CREATE INDEX idx_reviews_product_id ON reviews(product_id)',
    'CREATE INDEX idx_reviews_user_id ON reviews(user_id)',
    'CREATE INDEX idx_site_settings_key ON site_settings(key)',
    'CREATE INDEX idx_conversations_vendor_id ON conversations(vendor_id)',
    'CREATE INDEX idx_messages_conversation_id ON messages(conversation_id)',
    'CREATE INDEX idx_tickets_vendor_id ON tickets(vendor_id)',
    'CREATE INDEX idx_tickets_status ON tickets(status)',
    'CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id)',
    'CREATE INDEX idx_notifications_user_id ON notifications(user_id)',
    'CREATE INDEX idx_notifications_read ON notifications(read)',
    'CREATE INDEX idx_vendor_reviews_vendor_id ON vendor_reviews(vendor_id)',
    'CREATE INDEX idx_vendor_reviews_user_id ON vendor_reviews(user_id)',
    'CREATE INDEX idx_crm_conversations_platform ON crm_conversations(platform)',
    'CREATE INDEX idx_crm_conversations_status ON crm_conversations(status)',
    'CREATE INDEX idx_crm_conversations_platform_conversation_id ON crm_conversations(platform_conversation_id)',
    'CREATE INDEX idx_crm_messages_conversation_id ON crm_messages(conversation_id)',
    'CREATE INDEX idx_crm_messages_timestamp ON crm_messages(timestamp)',
    'CREATE INDEX idx_crm_auto_responses_is_active ON crm_auto_responses(is_active)',
    'CREATE INDEX idx_crm_faq_is_active ON crm_faq(is_active)',
    'CREATE INDEX idx_banners_is_active ON banners(is_active)',
    'CREATE INDEX idx_banners_position ON banners(position)'
  ];

  for (const index of indexes) {
    await sql(index);
  }
  console.log('Indexes created ✓\n');

  console.log('Schema created successfully!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});