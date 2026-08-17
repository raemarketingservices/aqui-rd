import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getDashboard = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const vendors = await ctx.db.query("vendors").collect();
    const products = await ctx.db.query("products").collect();
    const orders = await ctx.db.query("orders").collect();
    const pendingVendors = vendors.filter((v) => v.status === "PENDING");
    const totalRevenue = orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      stats: {
        totalUsers: users.length,
        totalVendors: vendors.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingVendors: pendingVendors.length,
        totalRevenue,
      },
      recentOrders: orders.slice(0, 10),
    };
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return Promise.all(
      users.map(async (u) => {
        const vendor = u.vendorId ? await ctx.db.get(u.vendorId) : null;
        return { ...u, vendor, password: undefined };
      })
    );
  },
});

export const updateRole = mutation({
  args: { userId: v.id("users"), role: v.union(v.literal("CUSTOMER"), v.literal("VENDOR"), v.literal("ADMIN")) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: args.role });
    return "ok";
  },
});

export const getAllVendors = query({
  args: {},
  handler: async (ctx) => {
    const vendors = await ctx.db.query("vendors").collect();
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

export const updateVendorStatus = mutation({
  args: {
    vendorId: v.id("vendors"),
    status: v.union(v.literal("PENDING"), v.literal("APPROVED"), v.literal("REJECTED")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.vendorId, { status: args.status });
    return "ok";
  },
});

export const getSiteSettings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("siteSettings").collect();
  },
});

export const updateSiteSetting = mutation({
  args: {
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
      return existing._id;
    }
    return await ctx.db.insert("siteSettings", {
      key: args.key,
      value: args.value,
    });
  },
});

export const getChatbotConfig = query({
  args: {},
  handler: async (ctx) => {
    const configs = await ctx.db.query("chatbotConfig").collect();
    return configs.length > 0 ? configs[0] : null;
  },
});

export const updateChatbotConfig = mutation({
  args: {
    faqs: v.array(v.object({
      question: v.string(),
      answer: v.string(),
    })),
    knowledgeBase: v.string(),
    welcomeMessage: v.string(),
    updatedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const configs = await ctx.db.query("chatbotConfig").collect();
    if (configs.length > 0) {
      await ctx.db.patch(configs[0]._id, {
        faqs: args.faqs,
        knowledgeBase: args.knowledgeBase,
        welcomeMessage: args.welcomeMessage,
        updatedBy: args.updatedBy,
      });
      return configs[0]._id;
    }
    return await ctx.db.insert("chatbotConfig", {
      faqs: args.faqs,
      knowledgeBase: args.knowledgeBase,
      welcomeMessage: args.welcomeMessage,
      updatedBy: args.updatedBy,
    });
  },
});

export const getAllVendorsWithDetails = query({
  args: {},
  handler: async (ctx) => {
    const vendors = await ctx.db.query("vendors").collect();
    return Promise.all(
      vendors.map(async (vendor) => {
        const user = await ctx.db.get(vendor.userId);
        const products = await ctx.db
          .query("products")
          .withIndex("by_vendorId", (q) => q.eq("vendorId", vendor._id))
          .collect();
        const orders = await ctx.db.query("orders").collect();
        const vendorOrderIds = new Set();
        const orderItems = await ctx.db.query("orderItems").collect();
        const vendorOrders = orderItems
          .filter((item) => item.vendorId === vendor._id)
          .map((item) => item.orderId);
        const uniqueOrderIds = [...new Set(vendorOrders)];
        const vendorOrderDetails = await Promise.all(
          uniqueOrderIds.map(async (orderId) => await ctx.db.get(orderId))
        );
        return {
          ...vendor,
          user: user ? { ...user, password: undefined } : null,
          products,
          productCount: products.length,
          orders: vendorOrderDetails.filter(Boolean),
          orderCount: uniqueOrderIds.length,
        };
      })
    );
  },
});
