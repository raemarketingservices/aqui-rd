import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getAll = query({
  args: {
    categoryId: v.optional(v.id("categories")),
    vendorId: v.optional(v.id("vendors")),
    search: v.optional(v.string()),
    sort: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("products").withIndex("by_status", (q) => q.eq("status", "ACTIVE"));

    if (args.categoryId) {
      q = q.filter((q) => q.eq(q.field("categoryId"), args.categoryId));
    }
    if (args.vendorId) {
      q = q.filter((q) => q.eq(q.field("vendorId"), args.vendorId));
    }

    let products = await q.collect();

    if (args.search) {
      const search = args.search.toLowerCase();
      products = products.filter(
        (p) => p.name.toLowerCase().includes(search) || (p.description && p.description.toLowerCase().includes(search))
      );
    }

    if (args.sort === "price_asc") products.sort((a, b) => a.price - b.price);
    else if (args.sort === "price_desc") products.sort((a, b) => b.price - a.price);
    else if (args.sort === "rating") products.sort((a, b) => b.rating - a.rating);
    else if (args.sort === "popular") products.sort((a, b) => b.salesCount - a.salesCount);
    else products.sort((a, b) => b._creationTime - a._creationTime);

    if (args.limit) products = products.slice(0, args.limit);

    const enriched = await Promise.all(
      products.map(async (p) => {
        const vendor = await ctx.db.get(p.vendorId);
        const category = p.categoryId ? await ctx.db.get(p.categoryId) : null;
        return { ...p, vendor, category };
      })
    );

    return enriched;
  },
});

export const getById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) return null;
    const vendor = await ctx.db.get(product.vendorId);
    const category = product.categoryId ? await ctx.db.get(product.categoryId) : null;
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_productId", (q) => q.eq("productId", args.productId))
      .collect();
    const reviewsWithUser = await Promise.all(
      reviews.map(async (r) => {
        const user = await ctx.db.get(r.userId);
        return { ...r, user };
      })
    );
    return { ...product, vendor, category, reviews: reviewsWithUser };
  },
});

export const getVendorProducts = query({
  args: { vendorId: v.id("vendors") },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_vendorId", (q) => q.eq("vendorId", args.vendorId))
      .collect();
    return Promise.all(
      products.map(async (p) => {
        const category = p.categoryId ? await ctx.db.get(p.categoryId) : null;
        return { ...p, category };
      })
    );
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    stock: v.number(),
    images: v.array(v.string()),
    vendorId: v.id("vendors"),
    categoryId: v.optional(v.id("categories")),
    whatsapp: v.optional(v.string()),
    condition: v.optional(v.union(
      v.literal("NEW"),
      v.literal("USED_LIKE_NEW"),
      v.literal("USED_GOOD"),
      v.literal("USED_ACCEPTABLE")
    )),
    brand: v.optional(v.string()),
    color: v.optional(v.string()),
    sku: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    availability: v.optional(v.union(v.literal("SINGLE"), v.literal("MULTIPLE"))),
    videoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sku = args.sku || `AQUI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    return await ctx.db.insert("products", {
      ...args,
      sku,
      status: "ACTIVE",
      rating: 0,
      reviewCount: 0,
      salesCount: 0,
    });
  },
});

export const update = mutation({
  args: {
    productId: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    compareAtPrice: v.optional(v.number()),
    stock: v.optional(v.number()),
    images: v.optional(v.array(v.string())),
    categoryId: v.optional(v.id("categories")),
    status: v.optional(v.union(v.literal("DRAFT"), v.literal("ACTIVE"), v.literal("INACTIVE"))),
    whatsapp: v.optional(v.string()),
    condition: v.optional(v.union(
      v.literal("NEW"),
      v.literal("USED_LIKE_NEW"),
      v.literal("USED_GOOD"),
      v.literal("USED_ACCEPTABLE")
    )),
    brand: v.optional(v.string()),
    color: v.optional(v.string()),
    sku: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    availability: v.optional(v.union(v.literal("SINGLE"), v.literal("MULTIPLE"))),
    videoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { productId, ...data } = args;
    const updates: Record<string, any> = {};
    Object.entries(data).forEach(([k, v]) => { if (v !== undefined) updates[k] = v; });
    await ctx.db.patch(productId, updates);
    return "ok";
  },
});

export const remove = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.productId);
    return "ok";
  },
});

export const updateProductImages = mutation({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    
    const imageMap: Record<string, string[]> = {
      "iphone-15-pro-max": ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop"],
      "macbook-air-m3": ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop"],
      "samsung-galaxy-s24-ultra": ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop"],
      "airpods-pro-2": ["https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop"],
      "sofa-modular": ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop"],
      "lampara-led-pie": ["https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=400&fit=crop"],
      "kit-yoga-premium": ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop"],
      "maquina-masaje": ["https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop"],
    };

    let updated = 0;
    for (const product of products) {
      const newImages = imageMap[product.slug];
      if (newImages) {
        await ctx.db.patch(product._id, { images: newImages });
        updated++;
      }
    }

    return `Updated ${updated} products`;
  },
});
