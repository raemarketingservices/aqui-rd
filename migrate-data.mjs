import http from 'http';

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q';
const SUPABASE = 'http://84.46.254.137:8000/pg/query';
const D1_API = 'https://aqui-rd-api.aqui-rd.workers.dev';

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { timeout: 15000 }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function pgQuery(query) {
  const body = JSON.stringify({ query });
  return new Promise((resolve, reject) => {
    const req = http.request(SUPABASE, {
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
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  const s = String(val).replace(/'/g, "''");
  return `'${s}'`;
}

async function main() {
  console.log('Fetching data from D1 API...');

  // 1. Fetch vendors
  const storesData = await httpGet(`${D1_API}/stores`);
  const vendors = storesData.stores || [];
  console.log(`Found ${vendors.length} vendors`);

  // 2. Fetch products
  const productsData = await httpGet(`${D1_API}/products`);
  const products = productsData.products || [];
  console.log(`Found ${products.length} products`);

  // 3. Fetch categories
  const catsData = await httpGet(`${D1_API}/categories`);
  const categories = catsData.categories || [];
  console.log(`Found ${categories.length} categories`);

  // 4. Fetch banners
  let banners = [];
  try {
    const bannersData = await httpGet(`${D1_API}/banners`);
    banners = bannersData.banners || [];
  } catch { console.log('No banners endpoint'); }
  console.log(`Found ${banners.length} banners\n`);

  // Insert vendors (and create a placeholder user for each)
  console.log('Inserting vendors...');
  for (const v of vendors) {
    const userId = v.userId || `user_${v.id}`;
    // Create user
    await pgQuery(`INSERT INTO users (id, name, email, password, role) VALUES (${esc(userId)}, ${esc(v.name || '')}, ${esc(v.email || `${v.id}@placeholder.com`)}, 'migrated', 'VENDOR') ON CONFLICT (id) DO NOTHING`);
    // Create vendor
    await pgQuery(`INSERT INTO vendors (id, user_id, business_name, description, logo, slug, rating, total_sales, status, whatsapp, socials, payment_methods, created_at, address, rnc, email, categories) VALUES (${esc(v.id)}, ${esc(userId)}, ${esc(v.name)}, ${esc(v.description || '')}, ${esc(v.imageUrl || '')}, ${esc(v.slug || '')}, ${v.rating || 0}, ${v.totalSales || 0}, 'APPROVED', ${esc(v.whatsapp || '')}, ${esc(v.socials || '')}, ${esc(v.paymentMethods || '')}, ${esc(v.createdAt || Date.now())}, ${esc(v.address || '')}, ${esc(v.rnc || '')}, ${esc(v.email || '')}, ${esc(JSON.stringify(v.categories || []))}) ON CONFLICT (id) DO NOTHING`);
    console.log(`  ${v.name} ✓`);
  }

  // Insert products
  console.log('\nInserting products...');
  for (const p of products) {
    const vendorId = p.storeId || p.vendorId || vendors[0]?.id || 'unknown';
    const priceInCentavos = (p.price || 0) * 100;
    const compareInCentavos = (p.originalPrice || 0) * 100;
    const images = p.images || (p.imageUrl ? [p.imageUrl] : []);

    await pgQuery(`INSERT INTO products (id, vendor_id, name, description, price, compare_at_price, images, category_id, stock, status, rating, review_count, sales_count, whatsapp, created_at) VALUES (${esc(p.id)}, ${esc(vendorId)}, ${esc(p.name)}, ${esc(p.description || '')}, ${priceInCentavos}, ${compareInCentavos}, ${esc(JSON.stringify(images))}, ${esc(p.category || '')}, ${p.stock || 0}, 'ACTIVE', ${p.rating || 0}, ${p.reviewsCount || 0}, ${p.salesCount || 0}, ${esc(p.whatsapp || '')}, ${esc(p.createdAt || Date.now())}) ON CONFLICT (id) DO NOTHING`);
    console.log(`  ${p.name} ✓`);
  }

  // Insert categories
  console.log('\nInserting categories...');
  for (const c of categories) {
    await pgQuery(`INSERT INTO categories (id, name, image) VALUES (${esc(c.id || `cat_${c.name}`)}, ${esc(c.name)}, ${esc(c.icon || '')}) ON CONFLICT (id) DO NOTHING`);
    console.log(`  ${c.name} ✓`);
  }

  // Insert banners
  console.log('\nInserting banners...');
  for (const b of banners) {
    await pgQuery(`INSERT INTO banners (id, title, image_url, link, position, is_active) VALUES (${esc(b.id)}, ${esc(b.title || '')}, ${esc(b.imageUrl || b.image_url || '')}, ${esc(b.link || '')}, ${b.position || 0}, ${b.isActive !== false ? 'TRUE' : 'FALSE'}) ON CONFLICT (id) DO NOTHING`);
    console.log(`  ${b.title || b.id} ✓`);
  }

  // Insert default admin user
  console.log('\nInserting admin user...');
  await pgQuery(`INSERT INTO users (id, name, email, password, role) VALUES ('admin_unikord', 'Administrador', 'admin@uniko-rd.com', 'unikordadmin', 'ADMIN') ON CONFLICT (id) DO NOTHING`);
  console.log('  admin@uniko-rd.com ✓');

  // Insert FAQ
  console.log('\nInserting FAQ...');
  const faqs = [
    { id: 'faq_envios', keywords: 'envio,envios,envío,envíos,entrega,domicilio,enviar', answer: 'Realizamos envíos a todas las provincias de RD. Santo Domingo: 24-48h. Interior: 48-72h vía MetroPac o Caribe Tours.' },
    { id: 'faq_pagos', keywords: 'pago,pagos,pagar,transferencia,contra entrega,tarjeta', answer: 'Aceptamos: Contra Entrega, Transferencia Bancaria (Banreservas/Popular), y Pago Móvil.' },
    { id: 'faq_garantia', keywords: 'garantía,garantia,defecto,devolución,devolucion', answer: 'Ofrecemos garantía local de 6 meses directa con nuestro centro en Santo Domingo.' },
    { id: 'faq_registro', keywords: 'registro,registrar,vendedor,tienda,vender', answer: 'Puedes registrarte como vendedor desde la sección "Registrar mi Tienda". Tu solicitud será revisada por un administrador.' },
    { id: 'faq_producto', keywords: 'producto,productos,buscar,búsqueda,busqueda,encontrar', answer: 'Puedo ayudarte a encontrar productos. ¿Qué estás buscando exactamente? Puedes usar el buscador o explorar las categorías.' },
  ];
  for (const f of faqs) {
    await pgQuery(`INSERT INTO crm_faq (id, keywords, answer, is_active) VALUES (${esc(f.id)}, ${esc(f.keywords)}, ${esc(f.answer)}, TRUE) ON CONFLICT (id) DO NOTHING`);
    console.log(`  ${f.id} ✓`);
  }

  // Verify
  console.log('\n--- Verification ---');
  const vCount = await pgQuery('SELECT COUNT(*) as count FROM vendors');
  const pCount = await pgQuery('SELECT COUNT(*) as count FROM products');
  const cCount = await pgQuery('SELECT COUNT(*) as count FROM categories');
  const uCount = await pgQuery('SELECT COUNT(*) as count FROM users');
  console.log(`Users: ${uCount[0]?.count || uCount.rows?.[0]?.count}`);
  console.log(`Vendors: ${vCount[0]?.count || vCount.rows?.[0]?.count}`);
  console.log(`Products: ${pCount[0]?.count || pCount.rows?.[0]?.count}`);
  console.log(`Categories: ${cCount[0]?.count || cCount.rows?.[0]?.count}`);

  console.log('\nMigration complete!');
}

import https from 'https';

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
