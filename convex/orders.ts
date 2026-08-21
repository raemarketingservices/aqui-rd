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

    let totalTaxRate = 0;
    let taxBreakdown: { name: string; rate: number; amount: number }[] = [];

    const taxesSetting = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "taxes"))
      .unique();

    if (taxesSetting && Array.isArray(taxesSetting.value)) {
      for (const tax of taxesSetting.value) {
        if (tax.enabled !== false && tax.rate > 0) {
          const amount = Math.round(subtotal * (tax.rate / 100));
          taxBreakdown.push({ name: tax.name, rate: tax.rate, amount });
          totalTaxRate += tax.rate;
        }
      }
    } else {
      const taxSetting = await ctx.db
        .query("siteSettings")
        .withIndex("by_key", (q) => q.eq("key", "taxRate"))
        .unique();
      const taxEnabled = await ctx.db
        .query("siteSettings")
        .withIndex("by_key", (q) => q.eq("key", "taxEnabled"))
        .unique();
      const taxName = await ctx.db
        .query("siteSettings")
        .withIndex("by_key", (q) => q.eq("key", "taxName"))
        .unique();
      const rate = (taxSetting?.value ?? 18) as number;
      const enabled = taxEnabled?.value !== false;
      if (enabled && rate > 0) {
        const amount = Math.round(subtotal * (rate / 100));
        taxBreakdown.push({ name: (taxName?.value ?? "Impuesto") as string, rate, amount });
        totalTaxRate = rate;
      }
    }

    const taxAmount = taxBreakdown.reduce((sum, t) => sum + t.amount, 0);
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
