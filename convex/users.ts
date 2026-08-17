import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("CUSTOMER"), v.literal("VENDOR")),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existing) throw new Error("El email ya está registrado");

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: args.password,
      role: args.role,
      phone: args.phone,
    });

    if (args.role === "VENDOR") {
      const slug = args.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const vendorId = await ctx.db.insert("vendors", {
        userId,
        businessName: args.name,
        slug: slug + "-" + Date.now().toString(36),
        rating: 0,
        totalSales: 0,
        status: "PENDING",
      });
      await ctx.db.patch(userId, { vendorId });
    }

    return userId;
  },
});

export const login = query({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (!user) return null;
    if (user.password !== args.password) return null;
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      vendorId: user.vendorId,
    };
  },
});

export const getMe = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    let vendor = null;
    if (user.vendorId) {
      vendor = await ctx.db.get(user.vendorId);
    }
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      vendor,
    };
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...data } = args;
    const updates: Record<string, any> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.avatar !== undefined) updates.avatar = data.avatar;
    await ctx.db.patch(userId, updates);
    return "ok";
  },
});

export const changePassword = mutation({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("Usuario no encontrado");
    if (user.password !== args.currentPassword) throw new Error("La contraseña actual es incorrecta");
    await ctx.db.patch(args.userId, { password: args.newPassword });
    return "ok";
  },
});
