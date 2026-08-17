import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("users").first();
    if (existing) return "already seeded";

    const adminId = await ctx.db.insert("users", {
      name: "Administrador AQUÍ",
      email: "admin@aqui.com.do",
      password: "admin123",
      role: "ADMIN",
    });

    const v1UserId = await ctx.db.insert("users", {
      name: "Tech Store RD",
      email: "vendedor1@aqui.com.do",
      password: "vendor123",
      role: "VENDOR",
      phone: "809-555-0101",
    });

    const v1VendorId = await ctx.db.insert("vendors", {
      userId: v1UserId,
      businessName: "Tech Store RD",
      slug: "tech-store-rd",
      description: "Tu tienda de tecnología en República Dominicana.",
      rating: 4.8,
      totalSales: 156,
      status: "APPROVED",
    });
    await ctx.db.patch(v1UserId, { vendorId: v1VendorId });

    const v2UserId = await ctx.db.insert("users", {
      name: "Hogar y Estilo",
      email: "vendedor2@aqui.com.do",
      password: "vendor123",
      role: "VENDOR",
      phone: "809-555-0202",
    });

    const v2VendorId = await ctx.db.insert("vendors", {
      userId: v2UserId,
      businessName: "Hogar y Estilo",
      slug: "hogar-y-estilo",
      description: "Todo para tu hogar. Decoración, muebles y más.",
      rating: 4.5,
      totalSales: 89,
      status: "APPROVED",
    });
    await ctx.db.patch(v2UserId, { vendorId: v2VendorId });

    const v3UserId = await ctx.db.insert("users", {
      name: "Bienestar Total",
      email: "vendedor3@aqui.com.do",
      password: "vendor123",
      role: "VENDOR",
      phone: "809-555-0303",
    });

    const v3VendorId = await ctx.db.insert("vendors", {
      userId: v3UserId,
      businessName: "Bienestar Total",
      slug: "bienestar-total",
      description: "Productos para tu bienestar y salud.",
      rating: 4.7,
      totalSales: 234,
      status: "APPROVED",
    });
    await ctx.db.patch(v3UserId, { vendorId: v3VendorId });

    await ctx.db.insert("users", {
      name: "Juan Pérez",
      email: "cliente@aqui.com.do",
      password: "customer123",
      role: "CUSTOMER",
      phone: "809-555-0404",
    });

    const catIds: Record<string, any> = {};
    for (const [name, slug, image] of [
      ["Tecnología", "tecnologia", "https://cdn-icons-png.flaticon.com/512/1051/1051277.png"],
      ["Bienestar", "bienestar", "https://cdn-icons-png.flaticon.com/512/1051/1051256.png"],
      ["Hogar", "hogar", "https://cdn-icons-png.flaticon.com/512/1051/1051284.png"],
      ["Auto", "auto", "https://cdn-icons-png.flaticon.com/512/1051/1051288.png"],
      ["Moda", "moda", "https://cdn-icons-png.flaticon.com/512/1051/1051316.png"],
    ] as const) {
      catIds[slug] = await ctx.db.insert("categories", { name, slug, image });
    }

    const products = [
      { vendorId: v1VendorId, categoryId: catIds["tecnologia"], name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max", description: "El iPhone más potente con chip A17 Pro.", price: 6599900, compareAtPrice: 7299900, stock: 25, images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop"] },
      { vendorId: v1VendorId, categoryId: catIds["tecnologia"], name: "MacBook Air M3", slug: "macbook-air-m3", description: "Ultraligero con chip M3 y pantalla Liquid Retina.", price: 5499900, stock: 15, images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop"] },
      { vendorId: v1VendorId, categoryId: catIds["tecnologia"], name: "Samsung Galaxy S24 Ultra", slug: "samsung-galaxy-s24-ultra", description: "Smartphone avanzado con S Pen y cámara de 200MP.", price: 5899900, compareAtPrice: 6499900, stock: 30, images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop"] },
      { vendorId: v1VendorId, categoryId: catIds["tecnologia"], name: "AirPods Pro 2", slug: "airpods-pro-2", description: "Auriculares con cancelación activa de ruido.", price: 1299900, stock: 50, images: ["https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop"] },
      { vendorId: v2VendorId, categoryId: catIds["hogar"], name: "Sofá Modular 7 Piezas", slug: "sofa-modular", description: "Sofá modular de alta calidad con funda removible.", price: 8999900, compareAtPrice: 10999900, stock: 8, images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop"] },
      { vendorId: v2VendorId, categoryId: catIds["hogar"], name: "Lámpara LED de Pie", slug: "lampara-led-pie", description: "Lámpara de pie con luz LED regulable.", price: 349900, stock: 20, images: ["https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=400&fit=crop"] },
      { vendorId: v3VendorId, categoryId: catIds["bienestar"], name: "Kit Yoga Premium", slug: "kit-yoga-premium", description: "Mat antideslizante, bloques, correa y bolso.", price: 249900, compareAtPrice: 349900, stock: 40, images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop"] },
      { vendorId: v3VendorId, categoryId: catIds["bienestar"], name: "Máquina de Masaje", slug: "maquina-masaje", description: "Máquina portátil con 6 cabezales y 20 niveles.", price: 1899900, stock: 12, images: ["https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop"] },
    ];

    for (const p of products) {
      await ctx.db.insert("products", {
        ...p,
        status: "ACTIVE",
        rating: 4 + Math.random(),
        reviewCount: Math.floor(Math.random() * 50),
        salesCount: Math.floor(Math.random() * 200),
      });
    }

    return "seeded";
  },
});
