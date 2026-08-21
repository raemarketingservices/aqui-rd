import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getByKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    return setting;
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("siteSettings").collect();
  },
});

export const getTaxSettings = query({
  args: {},
  handler: async (ctx) => {
    const taxesSetting = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "taxes"))
      .unique();
    if (taxesSetting && Array.isArray(taxesSetting.value)) {
      return taxesSetting.value;
    }
    const rate = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "taxRate"))
      .unique();
    const enabled = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "taxEnabled"))
      .unique();
    const name = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "taxName"))
      .unique();
    return [{
      name: name?.value ?? "Impuesto",
      rate: rate?.value ?? 18,
      enabled: enabled?.value !== false,
    }];
  },
});

export const getProductFormConfig = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "productFormFields"))
      .unique();
    return setting?.value ?? [];
  },
});

export const upsert = mutation({
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
