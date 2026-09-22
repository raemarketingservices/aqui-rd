import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

export const sendAppMessage = action({
  args: {
    userId: v.id("users"),
    userName: v.string(),
    content: v.string(),
  },
  handler: async (ctx: any, args: any): Promise<any> => {
    let conversation: any = await ctx.runMutation(api.crm.getOrCreateAppConversation, {
      userId: args.userId,
      userName: args.userName,
    });

    if (!conversation) return null;

    const msgId = `app_msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await ctx.runMutation(api.crm.saveAppMessagePublic, {
      conversationId: conversation._id,
      platformMessageId: msgId,
      sender: "customer",
      senderName: args.userName,
      content: args.content,
    });

    const botResult = await ctx.runAction(internal.crmBot.processMessage, {
      conversationId: conversation._id,
      content: args.content,
      platform: "app",
    });

    const botText = botResult?.reply || "No pude procesar tu mensaje. Intenta de nuevo.";

    const botMsgId = `app_bot_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await ctx.runMutation(api.crm.saveAppMessagePublic, {
      conversationId: conversation._id,
      platformMessageId: botMsgId,
      sender: "bot",
      senderName: "UNIKO Bot",
      content: botText,
    });

    return conversation._id;
  },
});
