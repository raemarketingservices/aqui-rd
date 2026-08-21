import { v } from "convex/values";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

async function getAdminIds(ctx: QueryCtx | MutationCtx): Promise<Id<"users">[]> {
  const admins = await ctx.db
    .query("users")
    .withIndex("by_role", (q) => q.eq("role", "ADMIN"))
    .collect();
  return admins.map((a) => a._id);
}

async function notify(
  ctx: MutationCtx,
  userIds: Id<"users">[],
  type: string,
  title: string,
  message: string
) {
  for (const userId of userIds) {
    await ctx.db.insert("notifications", {
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: Date.now(),
    });
  }
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En Proceso",
  COMPLETED: "Completado",
};

// ── CHAT ────────────────────────────────────────────────────────────────

export const getConversation = query({
  args: { vendorId: v.id("vendors") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_vendorId", (q) => q.eq("vendorId", args.vendorId))
      .first();
    if (!conversation) return null;
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id))
      .order("asc")
      .collect();
    return { conversation, messages };
  },
});

export const getConversationsAdmin = query({
  args: { adminUserId: v.id("users") },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminUserId);
    if (!admin || admin.role !== "ADMIN") return [];
    const conversations = await ctx.db.query("conversations").order("desc").collect();
    const result = [];
    for (const convo of conversations) {
      const vendor = await ctx.db.get(convo.vendorId);
      const unreadCount = await ctx.db
        .query("messages")
        .withIndex("by_conversationId", (q) => q.eq("conversationId", convo._id))
        .filter((q) => q.eq(q.field("senderRole"), "VENDOR"))
        .collect();
      result.push({
        _id: convo._id,
        vendorId: convo.vendorId,
        lastMessage: convo.lastMessage,
        lastMessageAt: convo.lastMessageAt,
        vendor: vendor
          ? {
              businessName: vendor.businessName,
              logo: vendor.logo || null,
              slug: vendor.slug,
            }
          : null,
        unreadCount: unreadCount.length,
      });
    }
    return result.sort((a: any, b: any) => b.lastMessageAt - a.lastMessageAt);
  },
});

export const getConversationMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();
    return messages;
  },
});

export const sendMessage = mutation({
  args: {
    senderId: v.id("users"),
    conversationId: v.optional(v.id("conversations")),
    vendorId: v.optional(v.id("vendors")),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const sender = await ctx.db.get(args.senderId);
    if (!sender) throw new Error("Usuario no encontrado");
    if (sender.role !== "ADMIN" && sender.role !== "VENDOR")
      throw new Error("Solo administradores y vendedores pueden usar el chat");
    const text = args.text.trim();
    if (!text) throw new Error("Escribe un mensaje");

    let conversationId = args.conversationId;
    let vendorId = args.vendorId;

    if (!conversationId) {
      if (!vendorId) throw new Error("Falta la conversación");
      const vid: Id<"vendors"> = vendorId;
      const existing = await ctx.db
        .query("conversations")
        .withIndex("by_vendorId", (q) => q.eq("vendorId", vid))
        .first();
      if (existing) {
        conversationId = existing._id;
      } else {
        conversationId = await ctx.db.insert("conversations", {
          vendorId: vid,
          lastMessage: text,
          lastMessageAt: Date.now(),
        });
      }
    } else {
      const convo = await ctx.db.get(conversationId);
      vendorId = convo?.vendorId;
    }

    await ctx.db.patch(conversationId, { lastMessage: text, lastMessageAt: Date.now() });
    await ctx.db.insert("messages", {
      conversationId,
      senderId: args.senderId,
      senderRole: sender.role as "ADMIN" | "VENDOR",
      text,
      createdAt: Date.now(),
    });

    if (sender.role === "VENDOR") {
      const vendor = await ctx.db.get(vendorId as Id<"vendors">);
      await notify(
        ctx,
        await getAdminIds(ctx),
        "chat",
        "Nuevo mensaje",
        `${vendor?.businessName || "Vendedor"} te envió un mensaje: "${text.slice(0, 60)}"`
      );
    } else {
      const vendor = await ctx.db.get(vendorId as Id<"vendors">);
      if (vendor) {
        await notify(
          ctx,
          [vendor.userId],
          "chat",
          "Mensaje del soporte",
          `El administrador respondió: "${text.slice(0, 60)}"`
        );
      }
    }
    return { conversationId, vendorId };
  },
});

// ── TICKETS ─────────────────────────────────────────────────────────────

export const createTicket = mutation({
  args: {
    userId: v.id("users"),
    subject: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user?.vendorId) throw new Error("Solo vendedores pueden crear tickets");
    const vendor = await ctx.db.get(user.vendorId);
    const subject = args.subject.trim();
    const description = args.description.trim();
    if (!subject) throw new Error("Escribe un asunto");
    if (!description) throw new Error("Describe tu problema");

    await ctx.db.insert("tickets", {
      vendorId: user.vendorId,
      vendorName: vendor?.businessName || user.name,
      subject,
      description,
      status: "PENDING",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await notify(
      ctx,
      await getAdminIds(ctx),
      "ticket",
      "Nuevo ticket",
      `${vendor?.businessName || user.name} abrió un ticket: "${subject}"`
    );
    return "ok";
  },
});

export const getTickets = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return [];
    let tickets;
    if (user.role === "ADMIN") {
      tickets = await ctx.db.query("tickets").order("desc").collect();
    } else if (user.vendorId) {
      const vid: Id<"vendors"> = user.vendorId;
      tickets = await ctx.db
        .query("tickets")
        .withIndex("by_vendorId", (q) => q.eq("vendorId", vid))
        .order("desc")
        .collect();
    } else {
      return [];
    }
    const result = [];
    for (const ticket of tickets) {
      const comments = await ctx.db
        .query("ticketComments")
        .withIndex("by_ticketId", (q) => q.eq("ticketId", ticket._id))
        .order("asc")
        .collect();
      const commentsWithSender = [];
      for (const comment of comments) {
        const sender = await ctx.db.get(comment.senderId);
        commentsWithSender.push({
          ...comment,
          senderName: sender?.name || "Usuario",
        });
      }
      result.push({ ...ticket, comments: commentsWithSender });
    }
    return result;
  },
});

export const updateTicketStatus = mutation({
  args: {
    ticketId: v.id("tickets"),
    userId: v.id("users"),
    status: v.union(v.literal("PENDING"), v.literal("IN_PROGRESS"), v.literal("COMPLETED")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || user.role !== "ADMIN") throw new Error("Solo administradores");
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket no encontrado");
    await ctx.db.patch(args.ticketId, { status: args.status, updatedAt: Date.now() });
    const vendor = await ctx.db.get(ticket.vendorId);
    await notify(
      ctx,
      [vendor?.userId!].filter(Boolean),
      "ticket",
      "Estado del ticket actualizado",
      `Tu ticket "${ticket.subject}" ahora está: ${STATUS_LABEL[args.status]}`
    );
    return "ok";
  },
});

export const addTicketComment = mutation({
  args: {
    ticketId: v.id("tickets"),
    senderId: v.id("users"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const sender = await ctx.db.get(args.senderId);
    if (!sender) throw new Error("Usuario no encontrado");
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket no encontrado");
    const text = args.text.trim();
    if (!text) throw new Error("Escribe un comentario");

    if (sender.role === "VENDOR" && sender.vendorId !== ticket.vendorId)
      throw new Error("Este ticket no te pertenece");

    await ctx.db.insert("ticketComments", {
      ticketId: args.ticketId,
      senderId: args.senderId,
      senderRole: sender.role as "ADMIN" | "VENDOR",
      text,
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.ticketId, { updatedAt: Date.now() });

    if (sender.role === "VENDOR") {
      await notify(
        ctx,
        await getAdminIds(ctx),
        "ticket",
        "Nuevo comentario",
        `${sender.name} comentó en el ticket "${ticket.subject}"`
      );
    } else {
      const vendor = await ctx.db.get(ticket.vendorId);
      await notify(
        ctx,
        [vendor?.userId!].filter(Boolean),
        "ticket",
        "Nuevo comentario",
        `El soporte comentó en tu ticket "${ticket.subject}"`
      );
    }
    return "ok";
  },
});

// ── NOTIFICATIONS ───────────────────────────────────────────────────────

export const getNotifications = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    return notifications;
  },
});

export const markNotificationsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId_read", (q) => q.eq("userId", args.userId).eq("read", false))
      .collect();
    for (const n of notifications) {
      await ctx.db.patch(n._id, { read: true });
    }
    return "ok";
  },
});