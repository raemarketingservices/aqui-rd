import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const vendors = await ctx.db
      .query("vendors")
      .withIndex("by_status", (q) => q.eq("status", "APPROVED"))
      .collect();
    return Promise.all(
      vendors.map(async (v) => {
        const user = await ctx.db.get(v.userId);
        const products = await ctx.db
          .query("products")
          .withIndex("by_vendorId", (q) => q.eq("vendorId", v._id))
          .collect();
        return { ...v, user, productCount: products.length };
      })
    );
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const vendor = await ctx.db
      .query("vendors")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!vendor) return null;
    const user = await ctx.db.get(vendor.userId);
    const products = await ctx.db
      .query("products")
      .withIndex("by_vendorId", (q) => q.eq("vendorId", vendor._id))
      .collect();
    const enriched = await Promise.all(
      products.map(async (p) => {
        const category = p.categoryId ? await ctx.db.get(p.categoryId) : null;
        return { ...p, category };
      })
    );
    return { ...vendor, user, products: enriched };
  },
});

export const update = mutation({
  args: {
    userId: v.id("users"),
    businessName: v.optional(v.string()),
    description: v.optional(v.string()),
    logo: v.optional(v.string()),
    paymentMethods: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user?.vendorId) throw new Error("No eres vendedor");
    const updates: Record<string, any> = {};
    if (args.businessName !== undefined) updates.businessName = args.businessName;
    if (args.description !== undefined) updates.description = args.description;
    if (args.logo !== undefined) updates.logo = args.logo;
    if (args.paymentMethods !== undefined) updates.paymentMethods = args.paymentMethods;
    await ctx.db.patch(user.vendorId, updates);
    return "ok";
  },
});

export const updateSocials = mutation({
  args: {
    vendorId: v.id("vendors"),
    whatsapp: v.optional(v.string()),
    socials: v.optional(v.object({
      instagram: v.optional(v.string()),
      facebook: v.optional(v.string()),
      twitter: v.optional(v.string()),
      tiktok: v.optional(v.string()),
      youtube: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, any> = {};
    if (args.whatsapp !== undefined) updates.whatsapp = args.whatsapp;
    if (args.socials !== undefined) updates.socials = args.socials;
    await ctx.db.patch(args.vendorId, updates);
    return "ok";
  },
});
