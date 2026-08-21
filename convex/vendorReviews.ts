import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getVendorReviews = query({
  args: { vendorId: v.id("vendors") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("vendorReviews")
      .withIndex("by_vendorId", (q) => q.eq("vendorId", args.vendorId))
      .order("desc")
      .collect();
    return Promise.all(
      reviews.map(async (r) => {
        const user = await ctx.db.get(r.userId);
        return { ...r, user };
      })
    );
  },
});

export const create = mutation({
  args: {
    vendorId: v.id("vendors"),
    userId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.rating < 1 || args.rating > 5) throw new Error("Rating debe ser 1-5");

    const existing = await ctx.db
      .query("vendorReviews")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("vendorId"), args.vendorId))
      .first();
    if (existing) throw new Error("Ya dejaste una reseña en esta tienda");

    const reviewId = await ctx.db.insert("vendorReviews", {
      vendorId: args.vendorId,
      userId: args.userId,
      rating: args.rating,
      comment: args.comment,
      createdAt: Date.now(),
    });

    const allReviews = await ctx.db
      .query("vendorReviews")
      .withIndex("by_vendorId", (q) => q.eq("vendorId", args.vendorId))
      .collect();
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await ctx.db.patch(args.vendorId, { rating: Math.round(avgRating * 10) / 10 });

    return reviewId;
  },
});
