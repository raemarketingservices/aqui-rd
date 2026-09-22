const https = require('https');
const http = require('http');

// Configuration - Self-hosted Supabase instance
const SUPABASE_URL = 'http://84.46.254.137:8000/pg/query';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q';

// Helper function to execute SQL via Supabase API
function sql(query) {
  const body = JSON.stringify({ query });
  return new Promise((resolve, reject) => {
    const lib = SUPABASE_URL.startsWith('https') ? https : http;
    const req = lib.request(SUPABASE_URL, {
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

// Helper function to generate a simple ID (similar to the Cloudflare worker)
function generateId() {
  return Array.from({ length: 24 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
}

// Helper function to escape SQL strings
function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  const s = String(val).replace(/'/g, "''");
  return `'${s}'`;
}

async function main() {
  console.log('Seeding Supabase database...\n');

  // Start transaction-like behavior by doing everything in sequence
  try {
    // 1. Create admin user
    console.log('Creating admin user...');
    const adminId = generateId();
    await sql(`INSERT INTO users (id, name, email, password, role, created_at) VALUES (${esc(adminId)}, ${esc('Administrador Uniko RD')}, ${esc('admin@uniko-rd.com')}, ${esc('admin123')}, ${esc('ADMIN')}, ${esc(Date.now())}) ON CONFLICT (email) DO NOTHING`);
    console.log('  Admin user created ✓');

    // 2. Create vendor users and vendor records
    console.log('Creating vendor users...');

    const vendors = [
      {
        id: generateId(),
        userId: generateId(),
        name: 'Tech Store RD',
        email: 'vendedor1@uniko-rd.com',
        password: 'vendor123',
        phone: '809-555-0101',
        businessName: 'Tech Store RD',
        description: 'Tu tienda de tecnología en República Dominicana.',
        slug: 'tech-store-rd',
        rating: 4.8,
        totalSales: 156,
        status: 'APPROVED'
      },
      {
        id: generateId(),
        userId: generateId(),
        name: 'Hogar y Estilo',
        email: 'vendedor2@uniko-rd.com',
        password: 'vendor123',
        phone: '809-555-0202',
        businessName: 'Hogar y Estilo',
        description: 'Todo para tu hogar. Decoración, muebles y más.',
        slug: 'hogar-y-estilo',
        rating: 4.5,
        totalSales: 89,
        status: 'APPROVED'
      },
      {
        id: generateId(),
        userId: generateId(),
        name: 'Bienestar Total',
        email: 'vendedor3@uniko-rd.com',
        password: 'vendor123',
        phone: '809-555-0303',
        businessName: 'Bienestar Total',
        description: 'Productos para tu bienestar y salud.',
        slug: 'bienestar-total',
        rating: 4.7,
        totalSales: 234,
        status: 'APPROVED'
      }
    ];

    for (const vendor of vendors) {
      // Create user
      await sql(`INSERT INTO users (id, name, email, password, role, phone, created_at) VALUES (${esc(vendor.userId)}, ${esc(vendor.name)}, ${esc(vendor.email)}, ${esc(vendor.password)}, ${esc('VENDOR')}, ${esc(vendor.phone)}, ${esc(Date.now())}) ON CONFLICT (email) DO NOTHING`);

      // Create vendor record
      await sql(`INSERT INTO vendors (id, user_id, business_name, description, logo, slug, rating, total_sales, status, whatsapp, socials, payment_methods, created_at, address, rnc, email, categories) VALUES (${esc(vendor.id)}, ${esc(vendor.userId)}, ${esc(vendor.businessName)}, ${esc(vendor.description)}, '', ${esc(vendor.slug)}, ${vendor.rating}, ${vendor.totalSales}, ${esc(vendor.status)}, '', '', '', ${esc(Date.now())}, '', '', ${esc(vendor.email)}, '[]') ON CONFLICT (id) DO NOTHING`);

      console.log(`  Vendor ${vendor.name} created ✓`);
    }

    // 3. Create regular customer user
    console.log('Creating customer user...');
    const customerId = generateId();
    await sql(`INSERT INTO users (id, name, email, password, role, phone, created_at) VALUES (${esc(customerId)}, ${esc('Juan Pérez')}, ${esc('cliente@uniko-rd.com')}, ${esc('customer123')}, ${esc('CUSTOMER')}, ${esc('809-555-0404')}, ${esc(Date.now())}) ON CONFLICT (email) DO NOTHING`);
    console.log('  Customer user created ✓');

    // 4. Create categories
    console.log('Creating categories...');
    const categories = [
      { name: 'Tecnología', slug: 'tecnologia', image: 'https://cdn-icons-png.flaticon.com/512/1051/1051277.png' },
      { name: 'Bienestar', slug: 'bienestar', image: 'https://cdn-icons-png.flaticon.com/512/1051/1051256.png' },
      { name: 'Hogar', slug: 'hogar', image: 'https://cdn-icons-png.flaticon.com/512/1051/1051284.png' },
      { name: 'Auto', slug: 'auto', image: 'https://cdn-icons-png.flaticon.com/512/1051/1051288.png' },
      { name: 'Moda', slug: 'moda', image: 'https://cdn-icons-png.flaticon.com/512/1051/1051316.png' }
    ];

    const categoryIds = {};
    for (const cat of categories) {
      const catId = generateId();
      await sql(`INSERT INTO categories (id, name, slug, image, parent_id, description, created_at) VALUES (${esc(catId)}, ${esc(cat.name)}, ${esc(cat.slug)}, ${esc(cat.image)}, NULL, '', ${esc(Date.now())})`);
      categoryIds[cat.slug] = catId;
      console.log(`  Category ${cat.name} created ✓`);
    }

    // 5. Create sample products
    console.log('Creating sample products...');
    const products = [
      {
        vendorSlug: 'tech-store-rd',
        categorySlug: 'tecnologia',
        name: 'iPhone 15 Pro Max',
        slug: 'iphone-15-pro-max',
        description: 'El iPhone más potente con chip A17 Pro.',
        price: 6599900, // in cents
        compareAtPrice: 7299900,
        stock: 25,
        images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop']
      },
      {
        vendorSlug: 'tech-store-rd',
        categorySlug: 'tecnologia',
        name: 'MacBook Air M3',
        slug: 'macbook-air-m3',
        description: 'Ultraligero con chip M3 y pantalla Liquid Retina.',
        price: 5499900,
        compareAtPrice: 0,
        stock: 15,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop']
      },
      {
        vendorSlug: 'tech-store-rd',
        categorySlug: 'tecnologia',
        name: 'Samsung Galaxy S24 Ultra',
        slug: 'samsung-galaxy-s24-ultra',
        description: 'Smartphone avanzado con S Pen y cámara de 200MP.',
        price: 5899900,
        compareAtPrice: 6499900,
        stock: 30,
        images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop']
      },
      {
        vendorSlug: 'tech-store-rd',
        categorySlug: 'tecnologia',
        name: 'AirPods Pro 2',
        slug: 'airpods-pro-2',
        description: 'Auriculares con cancelación activa de ruido.',
        price: 1299900,
        compareAtPrice: 0,
        stock: 50,
        images: ['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop']
      },
      {
        vendorSlug: 'hogar-y-estilo',
        categorySlug: 'hogar',
        name: 'Sofá Modular 7 Piezas',
        slug: 'sofa-modular',
        description: 'Sofá modular de alta calidad con funda removible.',
        price: 8999900,
        compareAtPrice: 10999900,
        stock: 8,
        images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop']
      },
      {
        vendorSlug: 'hogar-y-estilo',
        categorySlug: 'hogar',
        name: 'Lámpara LED de Pie',
        slug: 'lampara-led-pie',
        description: 'Lámpara de pie con luz LED regulable.',
        price: 349900,
        compareAtPrice: 0,
        stock: 20,
        images: ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=400&fit=crop']
      },
      {
        vendorSlug: 'bienestar-total',
        categorySlug: 'bienestar',
        name: 'Kit Yoga Premium',
        slug: 'kit-yoga-premium',
        description: 'Mat antideslizante, bloques, correa y bolso.',
        price: 249900,
        compareAtPrice: 349900,
        stock: 40,
        images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop']
      },
      {
        vendorSlug: 'bienestar-total',
        categorySlug: 'bienestar',
        name: 'Máquina de Masaje',
        slug: 'maquina-masaje',
        description: 'Máquina portátil con 6 cabezales y 20 niveles.',
        price: 1899900,
        compareAtPrice: 0,
        stock: 12,
        images: ['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop']
      }
    ];

    for (const product of products) {
      const vendor = vendors.find(v => v.slug === product.vendorSlug);
      const categoryId = categoryIds[product.categorySlug];

      if (!vendor || !categoryId) {
        console.log(`  Skipping product ${product.name} - vendor or category not found`);
        continue;
      }

      const productId = generateId();
      const compareAtPrice = product.compareAtPrice !== undefined ? product.compareAtPrice : 0;
      const sku = `SKU-${Date.now().toString(36).slice(-6).toUpperCase()}`;
      await sql(`INSERT INTO products (id, vendor_id, name, slug, description, price, compare_at_price, images, category_id, stock, status, rating, review_count, sales_count, whatsapp, condition, brand, color, sku, tags, location, availability, video_url, created_at) VALUES (${esc(productId)}, ${esc(vendor.id)}, ${esc(product.name)}, ${esc(product.slug)}, ${esc(product.description)}, ${product.price}, ${compareAtPrice}, ${esc(JSON.stringify(product.images))}, ${esc(categoryId)}, ${product.stock}, 'ACTIVE', ${4 + Math.random()}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 200)}, '', NULL, NULL, NULL, ${esc(sku)}, '[]', NULL, NULL, NULL, ${esc(Date.now())})`);

      console.log(`  Product ${product.name} created ✓`);
    }

    console.log('\n✅ Database seeded successfully!');
  } catch (error) {
    console.error('\n❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

main();