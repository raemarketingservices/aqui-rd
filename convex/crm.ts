import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// ── QUERIES ──────────────────────────────────────────────

export const getConversations = query({
  args: {
    platform: v.optional(v.union(v.literal("whatsapp"), v.literal("instagram"), v.literal("facebook"), v.literal("all"))),
    status: v.optional(v.union(v.literal("open"), v.literal("pending"), v.literal("closed"), v.literal("all"))),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("crmConversations").withIndex("by_lastMessageAt").order("desc");

    const all = await q.collect();

    return all.filter((c) => {
      if (args.platform && args.platform !== "all" && c.platform !== args.platform) return false;
      if (args.status && args.status !== "all" && c.status !== args.status) return false;
      return true;
    });
  },
});

export const getConversation = query({
  args: { conversationId: v.id("crmConversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

export const getConversationById = query({
  args: { conversationId: v.id("crmConversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

export const getMessages = query({
  args: {
    conversationId: v.id("crmConversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const messages = await ctx.db
      .query("crmMessages")
      .withIndex("by_conversationId_timestamp", (q) => q.eq("conversationId", args.conversationId))
      .order("desc")
      .take(limit);
    return messages.reverse();
  },
});

export const getAutoResponses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("crmAutoResponses").collect();
  },
});

export const getFAQs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("crmFAQ").collect();
  },
});

export const getSetting = internalQuery({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("crmSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    return setting?.value || null;
  },
});

export const getAllSettings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("crmSettings").collect();
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("crmConversations").collect();
    return all.reduce((sum, c) => sum + c.unreadCount, 0);
  },
});

// ── MUTATIONS ─────────────────────────────────────────────

export const processIncomingMessage = internalMutation({
  args: {
    platform: v.union(v.literal("whatsapp"), v.literal("instagram"), v.literal("facebook"), v.literal("app")),
    platformConversationId: v.string(),
    platformMessageId: v.string(),
    customerPlatformId: v.string(),
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    messageType: v.string(),
    content: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    // Find or create conversation
    let conversation = await ctx.db
      .query("crmConversations")
      .withIndex("by_platformConversationId", (q) =>
        q.eq("platformConversationId", args.platformConversationId)
      )
      .first();

    const now = Date.now();

    if (!conversation) {
      const convId = await ctx.db.insert("crmConversations", {
        platform: args.platform,
        platformConversationId: args.platformConversationId,
        customerName: args.customerName,
        customerPhone: args.customerPhone,
        customerPlatformId: args.customerPlatformId,
        lastMessageAt: args.timestamp,
        lastMessagePreview: args.content.slice(0, 100),
        status: "open",
        unreadCount: 1,
        tags: [],
      });
      conversation = await ctx.db.get(convId);
    } else {
      await ctx.db.patch(conversation._id, {
        lastMessageAt: args.timestamp,
        lastMessagePreview: args.content.slice(0, 100),
        unreadCount: conversation.unreadCount + 1,
        status: conversation.status === "closed" ? "open" : conversation.status,
      });
    }

    if (!conversation) return null;

    // Check for duplicate message
    const existing = await ctx.db
      .query("crmMessages")
      .withIndex("by_platformMessageId", (q) => q.eq("platformMessageId", args.platformMessageId))
      .first();
    if (existing) return conversation._id;

    // Save message
    await ctx.db.insert("crmMessages", {
      conversationId: conversation._id,
      platformMessageId: args.platformMessageId,
      sender: "customer",
      senderName: args.customerName,
      messageType: args.messageType as any,
      content: args.content,
      timestamp: args.timestamp,
      delivered: true,
      read: false,
    });

    return conversation._id;
  },
});

export const sendMessage = internalMutation({
  args: {
    conversationId: v.id("crmConversations"),
    platformMessageId: v.string(),
    sender: v.union(v.literal("customer"), v.literal("bot"), v.literal("agent")),
    senderName: v.string(),
    content: v.string(),
    messageType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("crmMessages", {
      conversationId: args.conversationId,
      platformMessageId: args.platformMessageId,
      sender: args.sender,
      senderName: args.senderName,
      messageType: (args.messageType as any) || "text",
      content: args.content,
      timestamp: Date.now(),
      delivered: true,
      read: false,
    });

    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
      lastMessagePreview: args.content.slice(0, 100),
    });
  },
});

export const markAsRead = mutation({
  args: { conversationId: v.id("crmConversations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, { unreadCount: 0 });

    const unread = await ctx.db
      .query("crmMessages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    for (const msg of unread) {
      await ctx.db.patch(msg._id, { read: true });
    }
  },
});

export const updateConversationStatus = mutation({
  args: {
    conversationId: v.id("crmConversations"),
    status: v.union(v.literal("open"), v.literal("pending"), v.literal("closed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, { status: args.status });
  },
});

export const assignConversation = mutation({
  args: {
    conversationId: v.id("crmConversations"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, { assignedTo: args.userId });
  },
});

export const addTag = mutation({
  args: {
    conversationId: v.id("crmConversations"),
    tag: v.string(),
  },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (conv && !conv.tags.includes(args.tag)) {
      await ctx.db.patch(args.conversationId, { tags: [...conv.tags, args.tag] });
    }
  },
});

export const removeTag = mutation({
  args: {
    conversationId: v.id("crmConversations"),
    tag: v.string(),
  },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (conv) {
      await ctx.db.patch(args.conversationId, { tags: conv.tags.filter((t) => t !== args.tag) });
    }
  },
});

// ── AUTO RESPONSES CRUD ──────────────────────────────────

export const createAutoResponse = mutation({
  args: {
    trigger: v.string(),
    response: v.string(),
    isActive: v.boolean(),
    priority: v.number(),
    platform: v.optional(v.union(v.literal("all"), v.literal("whatsapp"), v.literal("instagram"), v.literal("facebook"))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("crmAutoResponses", args);
  },
});

export const updateAutoResponse = mutation({
  args: {
    id: v.id("crmAutoResponses"),
    trigger: v.optional(v.string()),
    response: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    priority: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const deleteAutoResponse = mutation({
  args: { id: v.id("crmAutoResponses") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ── FAQ CRUD ──────────────────────────────────────────────

export const createFAQ = mutation({
  args: {
    question: v.string(),
    answer: v.string(),
    keywords: v.array(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("crmFAQ", args);
  },
});

export const updateFAQ = mutation({
  args: {
    id: v.id("crmFAQ"),
    question: v.optional(v.string()),
    answer: v.optional(v.string()),
    keywords: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const deleteFAQ = mutation({
  args: { id: v.id("crmFAQ") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ── SETTINGS ──────────────────────────────────────────────

export const setSetting = mutation({
  args: { key: v.string(), value: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("crmSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
    } else {
      await ctx.db.insert("crmSettings", { key: args.key, value: args.value });
    }
  },
});

export const deleteSetting = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("crmSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const seedCRMSettings = mutation({
  args: {},
  handler: async (ctx) => {
    const settingsToSeed: Array<{ key: string; value: string }> = [
      { key: "botEnabled", value: "true" },
      { key: "webhookVerifyToken", value: "uniko-crm-verify-2026" },
      { key: "welcomeMessage", value: "¡Hola! 👋 Bienvenido a AQUÍ Marketplace. ¿En qué puedo ayudarte?" },
      { key: "awayMessage", value: "Estamos fuera de horario. Te responderemos lo más pronto posible." },
      { key: "whatsappPhoneNumberId", value: "1296409576886051" },
      { key: "whatsappAppSecret", value: "a50e46281b367dc22553e5f2ba1bdafb" },
      { key: "whatsappAccessToken", value: "EAAO2fsVCekABSfOQKtVrQFxTqpZAY4kaCFVZAhsgiKxsPbntkwlbtrtiOrj8zrmRraAWRZBsr4xbZB7ZC5HCZCnwmtR6yf6kFKM8Vbtrj8lXkvecW603je9joctMq7NqbZAlEiqNdkYijGClX5xrXt0yZBTr4XR577vBxZAwFmW6CUBMh9UevMCfa5SeZBXmXznZAsu3wZDZD" },
      { key: "agentPhoneNumber", value: "" },
    ];

    for (const s of settingsToSeed) {
      const existing = await ctx.db
        .query("crmSettings")
        .withIndex("by_key", (q) => q.eq("key", s.key))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, { value: s.value });
      } else {
        await ctx.db.insert("crmSettings", s);
      }
    }

    return "Settings seeded successfully";
  },
});

export const updateBotState = internalMutation({
  args: {
    conversationId: v.id("crmConversations"),
    botState: v.string(),
    selectedProductId: v.optional(v.string()),
    shippingInfo: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const patch: any = { botState: args.botState };
    if (args.selectedProductId !== undefined) patch.selectedProductId = args.selectedProductId;
    if (args.shippingInfo !== undefined) patch.shippingInfo = args.shippingInfo;
    await ctx.db.patch(args.conversationId, patch);
    return "ok";
  },
});

// ── IN-APP CHAT ──────────────────────────────────────────

export const getOrCreateAppConversation = mutation({
  args: {
    userId: v.id("users"),
    userName: v.string(),
  },
  handler: async (ctx, args) => {
    const platformConversationId = `app_${args.userId}`;
    let conversation = await ctx.db
      .query("crmConversations")
      .withIndex("by_platformConversationId", (q) =>
        q.eq("platformConversationId", platformConversationId)
      )
      .first();

    if (!conversation) {
      const convId = await ctx.db.insert("crmConversations", {
        platform: "app",
        platformConversationId,
        customerName: args.userName,
        customerPlatformId: args.userId,
        lastMessageAt: Date.now(),
        status: "open",
        unreadCount: 0,
        tags: ["app-chat"],
      });
      conversation = await ctx.db.get(convId);
    }

    return conversation;
  },
});

export const saveAppMessagePublic = mutation({
  args: {
    conversationId: v.id("crmConversations"),
    platformMessageId: v.string(),
    sender: v.union(v.literal("customer"), v.literal("bot"), v.literal("agent")),
    senderName: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("crmMessages", {
      conversationId: args.conversationId,
      platformMessageId: args.platformMessageId,
      sender: args.sender,
      senderName: args.senderName,
      messageType: "text",
      content: args.content,
      timestamp: Date.now(),
      delivered: true,
      read: false,
    });

    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
      lastMessagePreview: args.content.slice(0, 100),
    });
  },
});

export const getAppConversations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const platformConversationId = `app_${args.userId}`;
    const conversation = await ctx.db
      .query("crmConversations")
      .withIndex("by_platformConversationId", (q) =>
        q.eq("platformConversationId", platformConversationId)
      )
      .first();
    return conversation ? [conversation] : [];
  },
});

export const getAppMessages = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    const platformConversationId = `app_${args.userId}`;
    const conversation = await ctx.db
      .query("crmConversations")
      .withIndex("by_platformConversationId", (q) =>
        q.eq("platformConversationId", platformConversationId)
      )
      .first();

    if (!conversation) return [];

    const messages = await ctx.db
      .query("crmMessages")
      .withIndex("by_conversationId_timestamp", (q) => q.eq("conversationId", conversation._id))
      .order("desc")
      .take(limit);

    return messages.reverse();
  },
});
