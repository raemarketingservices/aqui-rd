import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getCart = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    let cart = await ctx.db
      .query("carts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!cart) {
      const cartId = await ctx.db.insert("carts", { userId: args.userId });
      cart = await ctx.db.get(cartId);
    }

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_cartId", (q) => q.eq("cartId", cart!._id))
      .collect();

    const enriched = await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        const vendor = product ? await ctx.db.get(product.vendorId) : null;
        return { ...item, product: product ? { ...product, vendor } : null };
      })
    );

    const total = enriched.reduce((sum, item) => {
      if (!item.product) return sum;
      return sum + item.product.price * item.quantity;
    }, 0);

    return { ...cart, items: enriched, total };
  },
});

export const addItem = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    let cart = await ctx.db
      .query("carts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!cart) {
      const cartId = await ctx.db.insert("carts", { userId: args.userId });
      cart = await ctx.db.get(cartId);
    }

    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_cartId_productId", (q) =>
        q.eq("cartId", cart!._id).eq("productId", args.productId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { quantity: existing.quantity + args.quantity });
    } else {
      await ctx.db.insert("cartItems", {
        cartId: cart._id,
        productId: args.productId,
        quantity: args.quantity,
      });
    }
    return "ok";
  },
});

export const updateQuantity = mutation({
  args: { cartItemId: v.id("cartItems"), quantity: v.number() },
  handler: async (ctx, args) => {
    if (args.quantity <= 0) {
      await ctx.db.delete(args.cartItemId);
    } else {
      await ctx.db.patch(args.cartItemId, { quantity: args.quantity });
    }
    return "ok";
  },
});

export const removeItem = mutation({
  args: { cartItemId: v.id("cartItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.cartItemId);
    return "ok";
  },
});

export const clearCart = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (cart) {
      const items = await ctx.db
        .query("cartItems")
        .withIndex("by_cartId", (q) => q.eq("cartId", cart._id))
        .collect();
      for (const item of items) {
        await ctx.db.delete(item._id);
      }
    }
    return "ok";
  },
});
