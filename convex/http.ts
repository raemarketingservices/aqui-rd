import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// ── WEBHOOK VERIFICATION (GET) ──────────────────────────
http.route({
  path: "/webhook",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    const verifyToken = await ctx.runQuery(internal.crm.getSetting, { key: "webhookVerifyToken" });

    if (mode === "subscribe" && token === (verifyToken || "uniko-crm-verify-2026")) {
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }),
});

// ── WEBHOOK EVENTS (POST) ───────────────────────────────
http.route({
  path: "/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const rawBody = await request.text();
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const phoneNumberId = await ctx.runQuery(internal.crm.getSetting, { key: "whatsappPhoneNumberId" });
    const waToken = await ctx.runQuery(internal.crm.getSetting, { key: "whatsappAccessToken" });
    const botEnabled = await ctx.runQuery(internal.crm.getSetting, { key: "botEnabled" });

    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        if (!value) continue;

        // ── WHATSAPP MESSAGES ──
        if (value.messaging_product === "whatsapp" && value.messages) {
          for (const msg of value.messages) {
            // Skip own messages
            if (phoneNumberId && msg.from === phoneNumberId.replace(/\D/g, "").slice(-10)) continue;

            const contact = value.contacts?.[0];
            const content = msg.text?.body || msg.image?.caption || msg.video?.caption || "";
            const isAudio = msg.type === "audio";

            // For audio messages, try to transcribe with STT.ai
            let processedContent = content;
            if (isAudio && !content && waToken && phoneNumberId) {
              try {
                // Get media ID from audio or id field
                const mediaId = msg.audio?.id || msg.id;
                console.log("Audio message received, media ID:", mediaId);

                // Download audio from WhatsApp
                const mediaResp = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
                  headers: { Authorization: `Bearer ${waToken}` },
                });
                const mediaData: any = await mediaResp.json();
                console.log("Media URL response:", JSON.stringify(mediaData).substring(0, 200));

                if (mediaData.url) {
                  const audioResp = await fetch(mediaData.url, {
                    headers: { Authorization: `Bearer ${waToken}` },
                  });
                  const audioBytes = await audioResp.arrayBuffer();
                  console.log("Audio downloaded, size:", audioBytes.byteLength);

                  // Determine mime type
                  const mime = mediaData.mime_type || "audio/ogg";

                  // Send to STT.ai for transcription using multipart form
                  const boundary = "----FormBoundary" + Math.random().toString(36).slice(2);
                  const parts: string[] = [];
                  parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="language"\r\n\r\nauto`);
                  parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nlarge-v3-turbo`);
                  parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="voice.ogg"\r\nContent-Type: ${mime}\r\n\r\n`);

                  const encoder = new TextEncoder();
                  const header = encoder.encode(parts.join("\r\n"));
                  const fileData = new Uint8Array(audioBytes);
                  const footer = encoder.encode(`\r\n--${boundary}--\r\n`);
                  const body = new Uint8Array(header.length + fileData.length + footer.length);
                  body.set(header, 0);
                  body.set(fileData, header.length);
                  body.set(footer, header.length + fileData.length);

                  const sttResp = await fetch("https://api.stt.ai/v1/transcribe", {
                    method: "POST",
                    headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
                    body: body,
                  });
                  const sttData: any = await sttResp.json();
                  console.log("STT response:", JSON.stringify(sttData).substring(0, 300));

                  if (sttData.text && sttData.text.trim().length > 0) {
                    processedContent = sttData.text.trim();
                  }
                }
              } catch (e: any) {
                console.error("Voice transcription failed:", e.message || e);
              }
            }

            const conversationId = await ctx.runMutation(internal.crm.processIncomingMessage, {
              platform: "whatsapp",
              platformConversationId: msg.from,
              platformMessageId: msg.id,
              customerPlatformId: msg.from,
              customerName: contact?.profile?.name || "Cliente WA",
              customerPhone: msg.from,
              messageType: msg.type || "text",
              content: processedContent,
              timestamp: parseInt(msg.timestamp) * 1000,
            });

            // Bot auto-reply
            if (conversationId && processedContent && botEnabled !== "false") {
              try {
                const botResult: any = await ctx.runAction(internal.crmBot.processMessage, {
                  conversationId,
                  content: processedContent,
                  platform: "whatsapp",
                  isAudio,
                });

                if (botResult?.reply) {
                  // Use crmBot:sendMessage which handles images + text
                  await ctx.runAction(internal.crmBot.sendMessage, {
                    conversationId,
                    content: botResult.reply,
                    sender: "bot",
                    senderName: "Bot AQUÍ",
                    sendImages: botResult.sendImages,
                  });
                }
              } catch (botErr) {
                console.error("Bot error:", botErr);
              }
            }
          }
        }

        // ── INSTAGRAM / FACEBOOK MESSENGER ──
        if (value.messaging_product === "messenger" || (!value.messaging_product && value.messages)) {
          const pageToken = await ctx.runQuery(internal.crm.getSetting, { key: "pageAccessToken" });

          for (const msg of value.messages ?? []) {
            if (msg.is_echo) continue;
            const senderId = msg.sender?.id;
            const isInstagram = body.object === "instagram";
            const platform = isInstagram ? "instagram" as const : "facebook" as const;
            const content = msg.message?.text || "";

            const conversationId = await ctx.runMutation(internal.crm.processIncomingMessage, {
              platform,
              platformConversationId: senderId,
              platformMessageId: msg.message?.mid || `fb_${Date.now()}`,
              customerPlatformId: senderId,
              customerName: `Cliente ${platform}`,
              messageType: "text",
              content,
              timestamp: msg.timestamp || Date.now(),
            });

            if (conversationId && content && botEnabled !== "false") {
              try {
                const botResult: any = await ctx.runAction(internal.crmBot.processMessage, {
                  conversationId,
                  content,
                  platform,
                });

                if (botResult?.reply) {
                  const msgId = `bot_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
                  await ctx.runMutation(internal.crm.sendMessage, {
                    conversationId,
                    platformMessageId: msgId,
                    sender: "bot",
                    senderName: "Bot AQUÍ",
                    content: botResult.reply,
                  });

                  if (pageToken) {
                    await fetch("https://graph.facebook.com/v21.0/me/messages", {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${pageToken}`,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        recipient: { id: senderId },
                        message: { text: botResult.reply },
                      }),
                    });
                  }
                }
              } catch (botErr) {
                console.error("Bot error:", botErr);
              }
            }
          }
        }
      }
    }

    return new Response("OK", { status: 200 });
  }),
});

// ── SEND MESSAGE API (para agentes) ──────────────────────
http.route({
  path: "/api/send-message",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { conversationId, content } = await request.json();
    if (!conversationId || !content) {
      return new Response("Missing fields", { status: 400 });
    }

    const result = await ctx.runAction(internal.crmBot.sendMessage, {
      conversationId,
      content,
      sender: "agent",
      senderName: "Agente",
    });

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
