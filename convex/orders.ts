import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    shippingAddress: v.string(),
    paymentMethod: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!cart) throw new Error("Carrito no encontrado");

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_cartId", (q) => q.eq("cartId", cart._id))
      .collect();
    if (items.length === 0) throw new Error("El carrito está vacío");

    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const product = await ctx.db.get(item.productId) as any;
      if (!product) continue;
      if (product.stock < item.quantity) throw new Error(`Stock insuficiente para ${product.name}`);

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;
      orderItems.push({
        productId: item.productId,
        vendorId: product.vendorId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    const taxAmount = Math.round(subtotal * 0.18);
    const shippingCost = subtotal > 200000 ? 0 : 15000;
    const totalAmount = subtotal + taxAmount + shippingCost;
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

    const orderId = await ctx.db.insert("orders", {
      userId: args.userId,
      orderNumber,
      status: "PENDING",
      subtotal,
      taxAmount,
      shippingCost,
      totalAmount,
      shippingAddress: args.shippingAddress,
      paymentMethod: args.paymentMethod,
      notes: args.notes,
    });

    for (const oi of orderItems) {
      await ctx.db.insert("orderItems", { orderId, ...oi });
      const product = (await ctx.db.get(oi.productId)) as any;
      if (product) {
        await ctx.db.patch(oi.productId, {
          stock: Math.max(0, product.stock - oi.quantity),
          salesCount: product.salesCount + oi.quantity,
        });
      }
    }

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_cartId", (q) => q.eq("cartId", cart._id))
      .collect();
    for (const ci of cartItems) {
      await ctx.db.delete(ci._id);
    }

    return orderId;
  },
});

export const getUserOrders = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return Promise.all(
      orders.map(async (order) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
          .collect();
        const enriched = await Promise.all(
          items.map(async (item) => {
            const product = await ctx.db.get(item.productId);
            return { ...item, product };
          })
        );
        return { ...order, items: enriched };
      })
    );
  },
});

export const getOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;
    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .collect();
    return { ...order, items };
  },
});
