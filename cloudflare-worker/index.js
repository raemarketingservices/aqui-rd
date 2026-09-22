// Self-hosted Supabase configuration
const SUPABASE_URL = 'http://84.46.254.137:8000/pg/query';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    };
    if (method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    try {
      let resp;
      if (path === '/auth/login' && method === 'POST') resp = await handleLogin(request);
      else if (path === '/auth/register' && method === 'POST') resp = await handleRegister(request);
      else if (path === '/stores' && method === 'GET') resp = await handleGetStores();
      else if (path.startsWith('/stores/') && method === 'GET') resp = await handleGetStore(path);
      else if (path === '/products' && method === 'GET') resp = await handleGetProducts(url);
      else if (path.startsWith('/products/') && method === 'GET') resp = await handleGetProduct(path);
      else if (path === '/categories' && method === 'GET') resp = await handleGetCategories();
      else if (path === '/chat' && method === 'POST') resp = await handleChat(request);
      else if (path.startsWith('/chat/store/') && method === 'POST') resp = await handleStoreChat(request, path);
      else if (path === '/vendor/register' && method === 'POST') resp = await handleVendorRegister(request);
      else if (path === '/vendor/update' && method === 'PUT') resp = await handleVendorUpdate(request);
      else if (path === '/vendor/profile' && method === 'GET') resp = await handleVendorProfile(request);
      else if (path === '/vendor/products' && method === 'POST') resp = await handleVendorCreateProduct(request);
      else if (path === '/vendor/products' && method === 'GET') resp = await handleVendorGetProducts(request);
      else if (path === '/vendor/inbox' && method === 'GET') resp = await handleVendorInbox(request);
      else if (path === '/vendor/inbox/reply' && method === 'POST') resp = await handleVendorInboxReply(request);
      else if (path === '/chat/representative' && method === 'POST') resp = await handleRepresentativeRequest(request);
      else if (path === '/admin/metrics' && method === 'GET') resp = await handleAdminMetrics();
      else if (path === '/admin/vendor-requests' && method === 'GET') resp = await handleVendorRequests();
      else if (path.match(/^\/admin\/vendor-requests\/.+\/approve$/) && method === 'PUT') resp = await handleApproveVendor(path);
      else if (path.match(/^\/admin\/vendor-requests\/.+\/reject$/) && method === 'PUT') resp = await handleRejectVendor(path);
      else if (path === '/banners' && method === 'GET') resp = await handleGetBanners();
      else return jsonResponse({ error: 'Endpoint no encontrado' }, 404, corsHeaders);

      const response = resp instanceof Response ? resp : jsonResponse(resp, 200, corsHeaders);
      Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
      return response;
    } catch (e) {
      return jsonResponse({ error: e.message }, 500, corsHeaders);
    }
  },
};

// --- Supabase PostgreSQL helper ---
async function pgQuery(query) {
  const body = JSON.stringify({ query });
  const resp = await fetch(SUPABASE_URL, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body,
  });
  const data = await resp.json();
  if (data.error) throw new Error(data.error);
  return data;
}

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

function generateId() {
  return Array.from({ length: 24 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
}

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  const s = String(val).replace(/'/g, "''");
  return `'${s}'`;
}

// --- AUTH ---
async function handleLogin(request) {
  const { email, password } = await request.json();
  const result = await pgQuery(`SELECT * FROM users WHERE email = ${esc(email)} AND password = ${esc(password)} LIMIT 1`);
  const user = result.rows?.[0];
  if (!user) return jsonResponse({ error: 'Credenciales inválidas' }, 401);
  const token = 'tok_' + user.id + '_' + generateId();
  const vendorResult = await pgQuery(`SELECT * FROM vendors WHERE user_id = ${esc(user.id)} LIMIT 1`);
  const vendor = vendorResult.rows?.[0];
  return jsonResponse({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar },
    vendor: vendor ? { id: vendor.id, businessName: vendor.business_name, slug: vendor.slug, status: vendor.status } : null,
  });
}

async function handleRegister(request) {
  const { name, email, password, role } = await request.json();
  const existing = await pgQuery(`SELECT id FROM users WHERE email = ${esc(email)} LIMIT 1`);
  if (existing.rows?.length > 0) return jsonResponse({ error: 'Email ya registrado' }, 409);
  const id = generateId();
  await pgQuery(`INSERT INTO users (id, name, email, password, role, created_at) VALUES (${esc(id)}, ${esc(name)}, ${esc(email)}, ${esc(password)}, ${esc(role || 'CUSTOMER')}, ${esc(Date.now())})`);
  const token = 'tok_' + id + '_' + generateId();
  return jsonResponse({ token, user: { id, name, email, role: role || 'CUSTOMER' } });
}

// --- VENDOR REGISTRATION ---
async function handleVendorRegister(request) {
  const body = await request.json();
  const { userId, businessName, description, whatsapp, email, address, rnc, paymentMethods, logo } = body;

  if (!userId || !businessName) return jsonResponse({ error: 'userId y businessName son requeridos' }, 400);

  const existing = await pgQuery(`SELECT id FROM vendors WHERE user_id = ${esc(userId)} LIMIT 1`);
  if (existing.rows?.length > 0) return jsonResponse({ error: 'Ya tienes una tienda registrada' }, 409);

  const id = generateId();
  const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + generateId().substring(0, 8);

  await pgQuery(`INSERT INTO vendors (id, user_id, business_name, description, logo, slug, rating, total_sales, status, whatsapp, socials, payment_methods, created_at, address, rnc, email) VALUES (${esc(id)}, ${esc(userId)}, ${esc(businessName)}, ${esc(description || '')}, ${esc(logo || '')}, ${esc(slug)}, 0, 0, 'PENDING', ${esc(whatsapp || '')}, '', ${esc(paymentMethods || '')}, ${esc(Date.now())}, ${esc(address || '')}, ${esc(rnc || '')}, ${esc(email || '')})`);

  return jsonResponse({
    success: true,
    vendor: { id, businessName, slug, status: 'PENDING' },
    message: 'Tienda registrada. Pendiente de aprobación por un administrador.',
  });
}

async function handleVendorUpdate(request) {
  const body = await request.json();
  const { vendorId, businessName, description, whatsapp, email, address, rnc, paymentMethods, logo } = body;

  if (!vendorId) return jsonResponse({ error: 'vendorId es requerido' }, 400);

  const vendor = await pgQuery(`SELECT id FROM vendors WHERE id = ${esc(vendorId)} LIMIT 1`);
  if (!vendor.rows?.length) return jsonResponse({ error: 'Tienda no encontrada' }, 404);

  const updates = [];
  if (businessName !== undefined) updates.push(`business_name = ${esc(businessName)}`);
  if (description !== undefined) updates.push(`description = ${esc(description)}`);
  if (whatsapp !== undefined) updates.push(`whatsapp = ${esc(whatsapp)}`);
  if (email !== undefined) updates.push(`email = ${esc(email)}`);
  if (address !== undefined) updates.push(`address = ${esc(address)}`);
  if (rnc !== undefined) updates.push(`rnc = ${esc(rnc)}`);
  if (paymentMethods !== undefined) updates.push(`payment_methods = ${esc(paymentMethods)}`);
  if (logo !== undefined) updates.push(`logo = ${esc(logo)}`);

  if (updates.length === 0) return jsonResponse({ error: 'No hay campos para actualizar' }, 400);

  await pgQuery(`UPDATE vendors SET ${updates.join(', ')} WHERE id = ${esc(vendorId)}`);
  return jsonResponse({ success: true, message: 'Tienda actualizada' });
}

async function handleVendorProfile(request) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token.startsWith('tok_')) return jsonResponse({ error: 'No autenticado' }, 401);

  // Token format: tok_<userId>_<random>
  const tokenParts = token.split('_');
  if (tokenParts.length < 3) return jsonResponse({ error: 'Token inválido' }, 401);
  const userId = tokenParts[1];

  const result = await pgQuery(`SELECT u.*, v.id as vendor_id, v.business_name, v.slug, v.description as store_desc, v.logo, v.whatsapp as store_whatsapp, v.email as store_email, v.address, v.rnc, v.payment_methods, v.status as store_status FROM users u LEFT JOIN vendors v ON v.user_id = u.id WHERE u.id = ${esc(userId)} LIMIT 1`);
  return jsonResponse({ profile: result.rows?.[0] || {} });
}

// --- STORES ---
async function handleGetStores() {
  const vendorsResult = await pgQuery(`SELECT * FROM vendors WHERE status = 'APPROVED'`);
  const vendors = vendorsResult.rows || [];
  const stores = [];
  for (const v of vendors) {
    const pc = await pgQuery(`SELECT COUNT(*) as count FROM products WHERE vendor_id = ${esc(v.id)}`);
    const productCount = parseInt(pc.rows?.[0]?.count || '0');
    stores.push({
      id: v.id, name: v.business_name, slug: v.slug, description: v.description || '',
      province: v.address || 'Santo Domingo', city: '', isVerified: !!v.rating, isOficial: v.total_sales > 100,
      rating: parseFloat(v.rating) || 0, totalSales: v.total_sales || 0, imageUrl: v.logo || '',
      categories: JSON.parse(v.categories || '[]'), tags: [], userId: v.user_id, productCount,
      whatsapp: v.whatsapp || '', email: v.email || '', address: v.address || '',
      rnc: v.rnc || '', paymentMethods: v.payment_methods || '',
    });
  }
  return jsonResponse({ stores });
}

async function handleGetStore(path) {
  const id = path.split('/').pop();
  const vResult = await pgQuery(`SELECT * FROM vendors WHERE id = ${esc(id)} OR slug = ${esc(id)} LIMIT 1`);
  const v = vResult.rows?.[0];
  if (!v) return jsonResponse({ error: 'Tienda no encontrada' }, 404);

  const pResult = await pgQuery(`SELECT * FROM products WHERE vendor_id = ${esc(v.id)}`);
  return jsonResponse({
    id: v.id, name: v.business_name, slug: v.slug, description: v.description || '',
    province: v.address || 'Santo Domingo', city: '', isVerified: !!v.rating, isOficial: v.total_sales > 100,
    rating: parseFloat(v.rating) || 0, totalSales: v.total_sales || 0, imageUrl: v.logo || '',
    categories: JSON.parse(v.categories || '[]'), tags: [], userId: v.user_id, whatsapp: v.whatsapp || '',
    email: v.email || '', address: v.address || '', rnc: v.rnc || '',
    paymentMethods: v.payment_methods || '',
    products: (pResult.rows || []).map(p => {
      const pp = Math.round((p.price || 0) / 100);
      const cp = p.compare_at_price ? Math.round(p.compare_at_price / 100) : 0;
      const images = JSON.parse(p.images || '[]');
      return {
        id: p.id, storeId: p.vendor_id, storeName: v.business_name, name: p.name,
        description: p.description || '', price: pp, originalPrice: cp,
        discount: cp > pp ? Math.round(((cp - pp) / cp) * 100) : 0,
        rating: parseFloat(p.rating) || 0, reviewsCount: p.review_count || 0,
        imageUrl: images[0] || null, images,
        category: p.category_id || '', badge: '', isExpress: false, isFreeShipping: false, stock: p.stock || 0, whatsapp: p.whatsapp || v.whatsapp || '',
      };
    }),
  });
}

// --- PRODUCTS ---
async function handleGetProducts(url) {
  const storeId = url.searchParams.get('storeId');
  let result;
  if (storeId) {
    result = await pgQuery(`SELECT p.*, v.business_name as store_name, v.whatsapp as vendor_whatsapp FROM products p LEFT JOIN vendors v ON p.vendor_id = v.id WHERE p.vendor_id = ${esc(storeId)}`);
  } else {
    result = await pgQuery(`SELECT p.*, v.business_name as store_name, v.whatsapp as vendor_whatsapp FROM products p LEFT JOIN vendors v ON p.vendor_id = v.id ORDER BY p.created_at DESC`);
  }
  const products = (result.rows || []).map(p => {
    const priceInPesos = Math.round((p.price || 0) / 100);
    const compareInPesos = p.compare_at_price ? Math.round(p.compare_at_price / 100) : 0;
    const images = JSON.parse(p.images || '[]');
    return {
      id: p.id, storeId: p.vendor_id, storeName: p.store_name || '', name: p.name,
      description: p.description || '', price: priceInPesos, originalPrice: compareInPesos,
      discount: compareInPesos > priceInPesos ? Math.round(((compareInPesos - priceInPesos) / compareInPesos) * 100) : 0,
      rating: parseFloat(p.rating) || 0, reviewsCount: p.review_count || 0,
      imageUrl: images[0] || null, images,
      category: p.category_id || '', badge: '', isExpress: false, isFreeShipping: false, stock: p.stock || 0,
      whatsapp: p.whatsapp || p.vendor_whatsapp || '',
    };
  });
  return jsonResponse({ products });
}

async function handleGetProduct(path) {
  const id = path.split('/').pop();
  const result = await pgQuery(`SELECT p.*, v.business_name as store_name, v.whatsapp as vendor_whatsapp FROM products p LEFT JOIN vendors v ON p.vendor_id = v.id WHERE p.id = ${esc(id)} LIMIT 1`);
  const p = result.rows?.[0];
  if (!p) return jsonResponse({ error: 'Producto no encontrado' }, 404);
  const priceInPesos = Math.round((p.price || 0) / 100);
  const compareInPesos = p.compare_at_price ? Math.round(p.compare_at_price / 100) : 0;
  const images = JSON.parse(p.images || '[]');
  return jsonResponse({
    id: p.id, storeId: p.vendor_id, storeName: p.store_name || '', name: p.name,
    description: p.description || '', price: priceInPesos, originalPrice: compareInPesos,
    discount: compareInPesos > priceInPesos ? Math.round(((compareInPesos - priceInPesos) / compareInPesos) * 100) : 0,
    rating: parseFloat(p.rating) || 0, reviewsCount: p.review_count || 0,
    imageUrl: images[0] || null, images,
    category: p.category_id || '', badge: '', isExpress: false, isFreeShipping: false, stock: p.stock || 0,
    whatsapp: p.whatsapp || p.vendor_whatsapp || '',
  });
}

// --- CATEGORIES ---
async function handleGetCategories() {
  const result = await pgQuery('SELECT * FROM categories');
  const cats = (result.rows || []).map(c => ({
    id: c.id, name: c.name, icon: c.image || '', productCount: 0,
  }));
  return jsonResponse({ categories: cats });
}

// --- CHAT ---
async function handleChat(request) {
  const { message, userId } = await request.json();
  const lower = (message || '').toLowerCase();

  const faq = await pgQuery('SELECT * FROM crm_faq WHERE is_active = TRUE');
  for (const f of (faq.rows || [])) {
    const keywords = (f.keywords || '').toLowerCase().split(',');
    if (keywords.some(k => lower.includes(k.trim()))) {
      return jsonResponse({ reply: f.answer, quickActions: [] });
    }
  }

  let reply = '¡Gracias por tu mensaje! El agente IA de AQUÍ RD está procesando tu solicitud. ¿Deseas confirmar la compra o tienes preguntas sobre envíos?';
  const quickActions = ['📍 Usar mi dirección guardada', '💵 Pago Contra Entrega', '🏦 Transferencia Bancaria'];

  if (lower.includes('hola') || lower.includes('buenos')) reply = '¡Hola! 👋 Bienvenido a AQUÍ RD Marketplace. ¿En qué puedo ayudarte hoy?';
  else if (lower.includes('tienda') || lower.includes('tiendas')) reply = 'Tenemos varias tiendas verificadas en nuestro marketplace. ¿Te interesa alguna categoría en particular?';
  else if (lower.includes('envío') || lower.includes('envio') || lower.includes('entrega')) reply = 'Realizamos envíos a todas las provincias de RD. Santo Domingo: 24-48h. Interior: 48-72h. ¿A qué dirección?';
  else if (lower.includes('pago') || lower.includes('pagar')) reply = 'Aceptamos: 💵 Contra Entrega, 🏦 Transferencia (Banreservas/Popular), 💳 Tarjeta. ¿Cuál prefieres?';
  else if (lower.includes('producto') || lower.includes('buscar')) reply = 'Puedo ayudarte a encontrar productos. ¿Qué estás buscando exactamente?';

  return jsonResponse({ reply, quickActions });
}

// --- STORE CHAT ---
async function handleStoreChat(request, path) {
  const storeId = path.split('/').pop();
  const { message, productName, userName } = await request.json();

  const vResult = await pgQuery(`SELECT * FROM vendors WHERE id = ${esc(storeId)} LIMIT 1`);
  const vendor = vResult.rows?.[0];
  if (!vendor) return jsonResponse({ error: 'Tienda no encontrada' }, 404);

  const lower = (message || '').toLowerCase();
  let reply = '';

  if (lower.includes('precio') || lower.includes('costo') || lower.includes('cuanto')) {
    reply = `Gracias por tu interés en nuestro producto. ${productName ? `Sobre "${productName}": ` : ''}El precio es el que ves en la página. ¿Te gustaría proceder con la compra? Puedes pagar contra entrega o por transferencia.`;
  } else if (lower.includes('envío') || lower.includes('envio') || lower.includes('entrega') || lower.includes('llega')) {
    reply = 'Realizamos envíos a todo RD. Santo Domingo: 24-48 horas. Interior: 48-72 horas vía MetroPac o Caribe Tours. ¿A qué provincia te gustaría el envío?';
  } else if (lower.includes('disponible') || lower.includes('stock') || lower.includes('hay')) {
    reply = `${productName ? `"${productName}" ` : ''}Está disponible en nuestro inventario. Tenemos stock listo para envío inmediato. ¿Deseas confirmar tu pedido?`;
  } else if (lower.includes('garantia') || lower.includes('garantía')) {
    reply = 'Ofrecemos garantía local de 6 meses directa con nuestro centro en Santo Domingo. También puedes contactarnos por WhatsApp para soporte rápido.';
  } else if (lower.includes('whatsapp') || lower.includes('wa')) {
    reply = vendor.whatsapp
      ? `Puedes contactarnos directo por WhatsApp al ${vendor.whatsapp}. ¡Te atendemos al instante! 📱`
      : 'Próximamente habilitaremos nuestro WhatsApp. Por ahora puedes escribirnos aquí y te respondemos rápido.';
  } else {
    reply = `¡Hola! Soy el agente virtual de ${vendor.business_name}. ${productName ? `Veo que te interesa "${productName}". ` : ''}¿En qué puedo ayudarte? Preguntar sobre precio, disponibilidad, envíos o garantía.`;
  }

  return jsonResponse({
    reply,
    quickActions: ['💰 Precio', '📦 Disponibilidad', '🚚 Envíos', '🛡️ Garantía', '📱 WhatsApp'],
    storeName: vendor.business_name,
  });
}

// --- ADMIN ---
async function handleAdminMetrics() {
  const vendors = await pgQuery(`SELECT COUNT(*) as total, SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as active, SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending FROM vendors`);
  const v = vendors.rows?.[0] || {};
  const products = await pgQuery('SELECT COUNT(*) as total FROM products');
  const orders = await pgQuery(`SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE created_at > ${esc(Date.now() - 86400000)}`);
  const chats = await pgQuery(`SELECT COUNT(*) as total FROM store_messages WHERE created_at > ${esc(Date.now() - 86400000)}`);

  return jsonResponse({
    totalSales: parseInt(orders.rows?.[0]?.total || '0'),
    activeProducts: parseInt(products.rows?.[0]?.total || '0'),
    activeStores: parseInt(v.active || '0'),
    pendingStores: parseInt(v.pending || '0'),
    liveChats: parseInt(chats.rows?.[0]?.total || '0'),
    aiAgentActive: true,
  });
}

async function handleVendorRequests() {
  const result = await pgQuery("SELECT * FROM vendors WHERE status = 'PENDING' ORDER BY created_at DESC");
  const requests = (result.rows || []).map(v => ({
    id: v.id, storeName: v.business_name, initials: v.business_name.substring(0, 2).toUpperCase(),
    location: v.address || '', rncNumber: v.rnc || '', isVerified: false, status: v.status,
    createdAt: new Date(parseInt(v.created_at) || Date.now()).toISOString(),
  }));
  return jsonResponse({ requests });
}

async function handleApproveVendor(path) {
  const id = path.split('/')[3];
  await pgQuery(`UPDATE vendors SET status = 'APPROVED' WHERE id = ${esc(id)}`);
  return jsonResponse({ success: true });
}

async function handleRejectVendor(path) {
  const id = path.split('/')[3];
  await pgQuery(`UPDATE vendors SET status = 'REJECTED' WHERE id = ${esc(id)}`);
  return jsonResponse({ success: true });
}

// --- VENDOR PRODUCTS ---
async function handleVendorCreateProduct(request) {
  const body = await request.json();
  const { vendorId, name, description, price, compareAtPrice, images, categoryId, stock, whatsapp } = body;
  if (!vendorId || !name || !price) return jsonResponse({ error: 'vendorId, name, price son requeridos' }, 400);

  const id = generateId();
  const priceInCentavos = Math.round(price * 100);
  const compareInCentavos = compareAtPrice ? Math.round(compareAtPrice * 100) : 0;
  const imagesJson = JSON.stringify(images || []);

  await pgQuery(`INSERT INTO products (id, vendor_id, name, description, price, compare_at_price, images, category_id, stock, status, rating, review_count, sales_count, whatsapp, created_at) VALUES (${esc(id)}, ${esc(vendorId)}, ${esc(name)}, ${esc(description || '')}, ${priceInCentavos}, ${compareInCentavos}, ${esc(imagesJson)}, ${esc(categoryId || '')}, ${stock || 0}, 'ACTIVE', 0, 0, 0, ${esc(whatsapp || '')}, ${esc(Date.now())})`);

  return jsonResponse({ success: true, product: { id, name, price } });
}

async function handleVendorGetProducts(request) {
  const url = new URL(request.url);
  const vendorId = url.searchParams.get('vendorId');
  if (!vendorId) return jsonResponse({ error: 'vendorId requerido' }, 400);
  const result = await pgQuery(`SELECT * FROM products WHERE vendor_id = ${esc(vendorId)} ORDER BY created_at DESC`);
  const products = (result.rows || []).map(p => {
    const pp = Math.round((p.price || 0) / 100);
    const cp = p.compare_at_price ? Math.round(p.compare_at_price / 100) : 0;
    const images = JSON.parse(p.images || '[]');
    return { id: p.id, name: p.name, description: p.description || '', price: pp, originalPrice: cp, images, stock: p.stock || 0, status: p.status || 'ACTIVE', categoryId: p.category_id || '' };
  });
  return jsonResponse({ products });
}

// --- VENDOR INBOX ---
async function handleVendorInbox(request) {
  const url = new URL(request.url);
  const vendorId = url.searchParams.get('vendorId');
  if (!vendorId) return jsonResponse({ error: 'vendorId requerido' }, 400);
  const result = await pgQuery(`SELECT * FROM store_messages WHERE vendor_id = ${esc(vendorId)} ORDER BY created_at DESC LIMIT 50`);
  return jsonResponse({ messages: result.rows || [] });
}

async function handleVendorInboxReply(request) {
  const body = await request.json();
  const { vendorId, customerId, customerName, message } = body;
  if (!vendorId || !message) return jsonResponse({ error: 'vendorId y message requeridos' }, 400);

  const id = generateId();
  await pgQuery(`INSERT INTO store_messages (id, vendor_id, customer_id, customer_name, message, sender, created_at) VALUES (${esc(id)}, ${esc(vendorId)}, ${esc(customerId || '')}, ${esc(customerName || 'Vendedor')}, ${esc(message)}, 'VENDOR', ${esc(Date.now())})`);

  return jsonResponse({ success: true });
}

// --- REPRESENTATIVE REQUEST ---
async function handleRepresentativeRequest(request) {
  const { storeId, productName, userName, message, userId } = await request.json();
  const vResult = await pgQuery(`SELECT * FROM vendors WHERE id = ${esc(storeId)} LIMIT 1`);
  const vendor = vResult.rows?.[0];
  if (!vendor) return jsonResponse({ error: 'Tienda no encontrada' }, 404);

  const id = generateId();
  await pgQuery(`INSERT INTO store_messages (id, vendor_id, customer_id, customer_name, message, sender, status, created_at) VALUES (${esc(id)}, ${esc(storeId)}, ${esc(userId || '')}, ${esc(userName || 'Cliente')}, ${esc(`${userName || 'Un cliente'} solicita hablar con un representante sobre: ${productName || ''}. ${message || ''}`)}, 'USER', 'PENDING', ${esc(Date.now())})`);

  return jsonResponse({
    reply: `Tu solicitud ha sido enviada a ${vendor.business_name}. Un representante te contactará pronto por WhatsApp${vendor.whatsapp ? ' al ' + vendor.whatsapp : ''} o por esta ventana. Mientras tanto, ¿hay algo más en lo que pueda ayudarte?`,
    quickActions: ['📦 Ver otros productos', '🏠 Volver al catálogo'],
  });
}

async function handleGetBanners() {
  const result = await pgQuery('SELECT * FROM banners WHERE is_active = TRUE ORDER BY position ASC');
  return jsonResponse({ banners: result.rows || [] });
}
