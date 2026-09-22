import { internalAction, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";

type BotResult = { reply: string; source: string; sendImages?: string[] } | null;

// ── HELPER: Parse number from text (digits or Spanish words) ──
function parseNumber(text: string): number {
  const clean = text.trim().toLowerCase().replace(/[^a-záéíóúñ0-9]/g, "");
  // Direct digit
  if (/^\d+$/.test(clean)) return parseInt(clean, 10);
  // Spanish word numbers
  const wordMap: Record<string, number> = {
    uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
    seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  };
  if (wordMap[clean] !== undefined) return wordMap[clean];
  // Extract leading digits from partially dirty input
  const match = text.trim().match(/^(\d+)/);
  if (match) return parseInt(match[1], 10);
  return 0;
}

// ── HELPER: Show product detail ──
function productDetail(p: any): { text: string; images: string[] } {
  let text = `📦 *${p.name}*\n\n`;
  if (p.brand) text += `🏷️ Marca: ${p.brand}\n`;
  if (p.color) text += `🎨 Color: ${p.color}\n`;
  if (p.description) {
    const desc = p.description.substring(0, 300);
    text += `\n📝 ${desc}${p.description.length > 300 ? "..." : ""}\n`;
  }
  text += `\n💰 *RD$${(p.price / 100).toLocaleString("es-DO")}*`;
  if (p.compareAtPrice) text += ` ~~RD$${(p.compareAtPrice / 100).toLocaleString("es-DO")}~~`;
  text += `\n\n¿Te interesa?\n*1* — 🛒 Comprar ahora\n*2* — 📦 Ver catálogo`;
  return { text, images: p.images?.slice(0, 1) || [] };
}

// ── HELPER: Show catalog ──
async function showCatalog(ctx: any, conversationId?: string): Promise<BotResult> {
  const storeProducts: any[] = await ctx.runAction(internal.crmBot.searchProducts, { query: "" });
  if (storeProducts.length === 0) {
    const botName: string | null = await ctx.runQuery(internal.crm.getSetting, { key: "botName" });
    return { reply: `${botName || "AQUÍ"} aún no tiene productos disponibles. ¡Vuelve pronto! 🛒`, source: "catalog" };
  }

  let list = "📦 *Nuestros productos:*\n\n";
  storeProducts.slice(0, 8).forEach((p: any, i: number) => {
    list += `*${i + 1}.* ${p.name} — 💰 RD$${(p.price / 100).toLocaleString("es-DO")}\n`;
  });
  list += `\n📝 Responde con el *número* del producto para verlo.`;

  // Set botState so we know the user is browsing the catalog
  if (conversationId) {
    await ctx.runMutation(internal.crm.updateBotState, {
      conversationId,
      botState: "viewing_catalog",
      selectedProductId: "",
    });
  }

  return { reply: list, source: "catalog" };
}

// ── HELPER: Get store payment methods ──
async function getPaymentMethods(ctx: any): Promise<string> {
  const storeId: string | null = await ctx.runQuery(internal.crm.getSetting, { key: "selectedStoreId" });
  let methods = "• Efectivo contra entrega\n• Tarjeta de crédito/débito\n• Transferencia bancaria";
  if (storeId) {
    const store: any = await ctx.runQuery(internal.crmBot.getStoreById, { storeId: storeId as any });
    if (store?.paymentMethods) {
      const pm = store.paymentMethods;
      const list: string[] = [];
      if (pm.cash) list.push("Efectivo");
      if (pm.card) list.push("Tarjeta de crédito/débito");
      if (pm.transfer) list.push("Transferencia bancaria");
      if (pm.mobile) list.push("Pago móvil");
      if (pm.other) list.push(pm.other);
      if (list.length > 0) methods = list.map((m) => `• ${m}`).join("\n");
    }
  }
  return methods;
}

// ── HELPER: Notify agent on personal WhatsApp ──
async function notifyAgent(ctx: any, customerName: string, customerPhone: string, lastMessage: string): Promise<void> {
  const agentPhone: string | null = await ctx.runQuery(internal.crm.getSetting, { key: "agentPhoneNumber" });
  const token: string | null = await ctx.runQuery(internal.crm.getSetting, { key: "whatsappAccessToken" });
  const phoneNumberId: string | null = await ctx.runQuery(internal.crm.getSetting, { key: "whatsappPhoneNumberId" });

  if (!agentPhone || !token || !phoneNumberId) {
    console.log("[BOT] Agent notification skipped: no agentPhoneNumber configured");
    return;
  }

  const cleanAgentPhone = agentPhone.replace(/\D/g, "");
  const msg = `🔔 *¡Un cliente necesita ayuda!*\n\n👤 *Cliente:* ${customerName}\n📱 *Teléfono:* ${customerPhone}\n💬 *Último mensaje:* ${lastMessage}\n\nResponde directamente al cliente en la conversación.`;

  try {
    await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: cleanAgentPhone,
        type: "text",
        text: { body: msg },
      }),
    });
    console.log(`[BOT] Agent notification sent to ${agentPhone}`);
  } catch (e: any) {
    console.error("[BOT] Failed to notify agent:", e.message);
  }
}

// ══════════════════════════════════════════════════════════
// ── MAIN BOT HANDLER ─────────────────────────────────────
// ══════════════════════════════════════════════════════════

export const processMessage = internalAction({
  args: {
    conversationId: v.id("crmConversations"),
    content: v.string(),
    platform: v.union(v.literal("whatsapp"), v.literal("instagram"), v.literal("facebook"), v.literal("app")),
    isAudio: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<BotResult> => {
    const text = args.content.toLowerCase().trim();
    const originalText = args.content.trim();

    const botEnabled = await ctx.runQuery(internal.crm.getSetting, { key: "botEnabled" });
    if (botEnabled === "false") return null;

    // Get conversation state
    const conv: any = await ctx.runQuery(api.crm.getConversationById, { conversationId: args.conversationId });
    const botState = conv?.botState || "idle";
    const selectedProductId = conv?.selectedProductId;
    const num = parseNumber(text);

    console.log(`[BOT] conv=${args.conversationId} state=${botState} text="${text}" num=${num} selectedProduct=${selectedProductId || "none"}`);

    // ═══ VOICE NOTE ═══
    if (args.isAudio || text === "__audio_message__") {
      return { reply: "🎧 No pude transcribir tu nota de voz. ¿Podrías escribir tu mensaje, por favor? 😊", source: "voiceRetry" };
    }

    // ═══ STATE: COLLECTING SHIPPING INFO ═══
    if (botState === "collecting_name") {
      await ctx.runMutation(internal.crm.updateBotState, { conversationId: args.conversationId, botState: "collecting_phone", shippingInfo: { ...conv?.shippingInfo, name: originalText } });
      return { reply: `Gracias, *${originalText}*. 📱 ¿Cuál es tu número de teléfono?`, source: "shippingFlow" };
    }
    if (botState === "collecting_phone") {
      await ctx.runMutation(internal.crm.updateBotState, { conversationId: args.conversationId, botState: "collecting_address", shippingInfo: { ...conv?.shippingInfo, phone: originalText } });
      return { reply: "📍 ¿Cuál es tu dirección de entrega?\n\n(Calle, número, sector, ciudad, provincia)", source: "shippingFlow" };
    }
    if (botState === "collecting_address") {
      await ctx.runMutation(internal.crm.updateBotState, { conversationId: args.conversationId, botState: "collecting_payment", shippingInfo: { ...conv?.shippingInfo, address: originalText } });
      const paymentMethods = await getPaymentMethods(ctx);
      return { reply: `💰 ¿Cuál es tu método de pago preferido?\n\n${paymentMethods}`, source: "shippingFlow" };
    }
    if (botState === "collecting_payment") {
      const info = { ...conv?.shippingInfo, paymentMethod: originalText };
      await ctx.runMutation(internal.crm.updateBotState, { conversationId: args.conversationId, botState: "confirming_order", shippingInfo: info });
      const product: any = selectedProductId ? await ctx.runQuery(internal.crmBot.getProductById, { productId: selectedProductId as any }) : null;
      return {
        reply: `📋 *Resumen de tu pedido:*\n\n🛒 *${product?.name || "Producto"}* — RD$${((product?.price || 0) / 100).toLocaleString("es-DO")}\n\n👤 *Datos:*\n• Nombre: ${info.name}\n• Teléfono: ${info.phone}\n• Dirección: ${info.address}\n• Pago: ${info.paymentMethod}\n\n✅ ¿Confirmas el pedido? Responde *"sí"* o *"no"*.`,
        source: "shippingFlow",
      };
    }
    if (botState === "confirming_order") {
      await ctx.runMutation(internal.crm.updateBotState, { conversationId: args.conversationId, botState: "idle", selectedProductId: "", shippingInfo: null });
      if (text === "sí" || text === "si" || text === "yes") {
        const info = conv?.shippingInfo || {};
        const product: any = selectedProductId ? await ctx.runQuery(internal.crmBot.getProductById, { productId: selectedProductId as any }) : null;
        return { reply: `🎉 *¡Pedido confirmado!*\n\nGracias, ${info.name}. Tu pedido de *${product?.name || "producto"}* ha sido recibido.\n\n📦 Te contactaremos pronto.\n\n💡 Escribe *"catálogo"* para ver más.`, source: "orderConfirmed" };
      }
      return { reply: "❌ Pedido cancelado. ¿En qué más puedo ayudarte?", source: "shippingFlow" };
    }

    // ═══ STATE: VIEWING CATALOG (number selection) ═══
    if (botState === "viewing_catalog") {
      if (num > 0) {
        const storeProducts: any[] = await ctx.runAction(internal.crmBot.searchProducts, { query: "" });
        const idx = num - 1;
        console.log(`[BOT] viewing_catalog: num=${num} idx=${idx} products=${storeProducts.length}`);
        if (idx >= 0 && idx < storeProducts.length) {
          const selected = storeProducts[idx];
          await ctx.runMutation(internal.crm.updateBotState, { conversationId: args.conversationId, botState: "viewing_product", selectedProductId: selected._id });
          const detail = productDetail(selected);
          return { reply: detail.text, source: "productDetail", sendImages: detail.images };
        }
        return { reply: `❌ Opción no válida. Responde con un número del *1* al *${storeProducts.length}*.`, source: "catalog" };
      }
      // Text while in catalog — check for keywords
      if (text.includes("catálogo") || text.includes("catalogo") || text.includes("productos")) {
        return await showCatalog(ctx, args.conversationId);
      }
      if (text.includes("comprar")) {
        return { reply: "📝 Responde con el *número* del producto que deseas comprar.", source: "catalog" };
      }
      // Any other text — reset to idle and process normally
      await ctx.runMutation(internal.crm.updateBotState, { conversationId: args.conversationId, botState: "idle" });
      // Fall through to normal processing below
    }

    // ═══ STATE: VIEWING PRODUCT ═══
    if (botState === "viewing_product" && selectedProductId) {
      const product: any = await ctx.runQuery(internal.crmBot.getProductById, { productId: selectedProductId as any });
      if (!product) {
        await ctx.runMutation(internal.crm.updateBotState, { conversationId: args.conversationId, botState: "idle" });
        return null;
      }

      // Number options: 1=comprar, 2=catálogo, other=catalog product selection
      if (num === 1) {
        await ctx.runMutation(internal.crm.updateBotState, { conversationId: args.conversationId, botState: "collecting_name", shippingInfo: { productId: product._id, productName: product.name, productPrice: product.price } });
        return { reply: `¡Genial! Vamos con tu pedido de *${product.name}*.\n\n👤 ¿Cuál es tu nombre y apellido?`, source: "salesFlow" };
      }
      if (num === 2) {
        return await showCatalog(ctx, args.conversationId);
      }
      // Other number → select from catalog
      if (num > 2) {
        const storeProducts: any[] = await ctx.runAction(internal.crmBot.searchProducts, { query: "" });
        const idx = num - 1;
        if (idx >= 0 && idx < storeProducts.length) {
          const selected = storeProducts[idx];
          await ctx.runMutation(internal.crm.updateBotState, { conversationId: args.conversationId, botState: "viewing_product", selectedProductId: selected._id });
          const detail = productDetail(selected);
          return { reply: detail.text, source: "productDetail", sendImages: detail.images };
        }
      }

      if (text.includes("comprar") || text.includes("interesa") || text.includes("lo quiero") || text.includes("lo llevo") || text === "1") {
        await ctx.runMutation(internal.crm.updateBotState, { conversationId: args.conversationId, botState: "collecting_name", shippingInfo: { productId: product._id, productName: product.name, productPrice: product.price } });
        return { reply: `¡Genial! Vamos con tu pedido de *${product.name}*.\n\n👤 ¿Cuál es tu nombre y apellido?`, source: "salesFlow" };
      }

      if (text.includes("catálogo") || text.includes("catalogo") || text.includes("otro") || text.includes("ver más") || text === "2") {
        return await showCatalog(ctx, args.conversationId);
      }

      if (text.includes("descripción") || text.includes("detalles")) {
        let detail = `📦 *${product.name}*\n\n`;
        if (product.description) detail += `${product.description}\n\n`;
        if (product.brand) detail += `🏷️ Marca: ${product.brand}\n`;
        if (product.color) detail += `🎨 Color: ${product.color}\n`;
        if (product.sku) detail += `📋 SKU: ${product.sku}\n`;
        if (product.location) detail += `📍 ${product.location}\n`;
        detail += `\n💰 *RD$${(product.price / 100).toLocaleString("es-DO")}*\n\n*1* — 🛒 Comprar\n*2* — 📦 Catálogo`;
        return { reply: detail, source: "productDetail" };
      }

      return { reply: `📦 *${product.name}*\n💰 RD$${(product.price / 100).toLocaleString("es-DO")}\n\n*1* — 🛒 Comprar\n*2* — 📦 Catálogo`, source: "productDetail" };
    }

    // ═══ NUMBERS IN IDLE STATE (menu + catalog) ═══
    if (botState === "idle" && num > 0) {
      // Menu options from greeting
      if (num === 1) return await showCatalog(ctx, args.conversationId);
      if (num === 2) return { reply: "📦 *Envíos:*\n\n• Envíos a toda la RD\n• Tiempo: 2-5 días hábiles\n• Costo al confirmar pedido\n\n¿Te gustaría hacer un pedido?", source: "faqAuto" };
      if (num === 3) {
        const paymentMethods = await getPaymentMethods(ctx);
        return { reply: `💰 *Métodos de pago:*\n\n${paymentMethods}\n\n¿Qué producto te interesa?`, source: "faqAuto" };
      }
      if (num === 4) {
        const conv: any = await ctx.runQuery(api.crm.getConversationById, { conversationId: args.conversationId });
        await notifyAgent(ctx, conv?.customerName || "Cliente", conv?.customerPhone || conv?.customerPlatformId || "N/A", "Solicitó agente desde el menú");
        return { reply: "Un momento, te conecto con un agente. ⏳\n\n📩 *Ya le notificamos.* Te responderá pronto.", source: "humanHandoff" };
      }

      // Product selection from catalog (any other number)
      const storeProducts: any[] = await ctx.runAction(internal.crmBot.searchProducts, { query: "" });
      const idx = num - 1;
      if (idx >= 0 && idx < storeProducts.length) {
        const selected = storeProducts[idx];
        await ctx.runMutation(internal.crm.updateBotState, { conversationId: args.conversationId, botState: "viewing_product", selectedProductId: selected._id });
        const detail = productDetail(selected);
        return { reply: detail.text, source: "productDetail", sendImages: detail.images };
      }
    }

    // ═══ FAQ AUTO-TRIGGERS ═══
    const faqTriggers: Record<string, string> = {
      "envío": "📦 *Envíos:*\n• Envíamos a toda la RD\n• Tiempo: 2-5 días hábiles\n• Costo al confirmar\n\n¿Quieres hacer un pedido?",
      "envios": "📦 *Envíos:*\n• Envíamos a toda la RD\n• Tiempo: 2-5 días hábiles\n• Costo al confirmar\n\n¿Quieres hacer un pedido?",
      "pago": "💰 *Métodos de pago:*\n• Efectivo\n• Tarjeta\n• Transferencia\n\n¿Qué producto te interesa?",
      "pagos": "💰 *Métodos de pago:*\n• Efectivo\n• Tarjeta\n• Transferencia\n\n¿Qué producto te interesa?",
      "garantía": "🛡️ *Garantía:*\n• Todos los productos tienen garantía\n• Devolución en 30 días\n\n¿En qué puedo ayudarte?",
      "garantia": "🛡️ *Garantía:*\n• Todos los productos tienen garantía\n• Devolución en 30 días\n\n¿En qué puedo ayudarte?",
      "devolución": "🔄 *Devoluciones:*\n• 30 días para devolver\n• Producto sin uso y con empaque\n\n¿Necesitas ayuda con algo más?",
      "devoluciones": "🔄 *Devoluciones:*\n• 30 días para devolver\n• Producto sin uso y con empaque\n\n¿Necesitas ayuda con algo más?",
      "entrega": "📦 *Entrega:*\n• 2-5 días hábiles\n• Toda la RD\n\n¿Quieres ordenar algo?",
      "horario": "🕐 *Horario:*\n• 8am - 8pm, Dom-Jue\n\n¿En qué puedo ayudarte?",
      "contacto": "📞 *Contacto:*\n• WhatsApp: Aquí\n• IG: @unikord\n\n¿En qué puedo ayudarte?",
    };
    for (const [trigger, response] of Object.entries(faqTriggers)) {
      if (text.includes(trigger)) return { reply: response, source: "faqAuto" };
    }

    // ═══ CUSTOM AUTO-RESPONSES ═══
    const autoResponses: any[] = await ctx.runQuery(api.crm.getAutoResponses);
    for (const ar of autoResponses) {
      if (!ar.isActive) continue;
      if (ar.platform && ar.platform !== "all" && ar.platform !== args.platform) continue;
      const triggers: string[] = ar.trigger.toLowerCase().split(",").map((t: string) => t.trim());
      for (const trigger of triggers) {
        if (text.includes(trigger)) return { reply: ar.response, source: "autoResponse" };
      }
    }

    // ═══ CUSTOM FAQ ═══
    const faqs: any[] = await ctx.runQuery(api.crm.getFAQs);
    for (const faq of faqs) {
      if (!faq.isActive) continue;
      for (const keyword of faq.keywords) {
        if (text.includes(keyword.toLowerCase())) return { reply: faq.answer, source: "faq" };
      }
    }

    // ═══ CATALOG / PRODUCTOS ═══
    if (text.includes("catálogo") || text.includes("catalogo") || text.includes("productos") || text.includes("ver productos") || text.includes("tienda")) {
      return await showCatalog(ctx, args.conversationId);
    }

    // ═══ PRODUCT SEARCH ═══
    const productResults: any[] = await ctx.runAction(internal.crmBot.searchProducts, { query: args.content });
    if (productResults.length > 0) {
      if (productResults.length === 1 || productResults[0].score >= 15) {
        const p = productResults[0];
        await ctx.runMutation(internal.crm.updateBotState, { conversationId: args.conversationId, botState: "viewing_product", selectedProductId: p._id });
        const detail = productDetail(p);
        return { reply: detail.text, source: "productDetail", sendImages: detail.images };
      }
      let list = "🔍 *Encontré:*\n\n";
      productResults.slice(0, 5).forEach((p: any, i: number) => {
        list += `*${i + 1}.* ${p.name} — RD$${(p.price / 100).toLocaleString("es-DO")}\n`;
      });
      list += `\nResponde con el *número* para ver detalles.`;
      await ctx.runMutation(internal.crm.updateBotState, { conversationId: args.conversationId, botState: "viewing_catalog", selectedProductId: "" });
      return { reply: list, source: "productList" };
    }

    // ═══ GREETING ═══
    const greetings = ["hola", "buenos dias", "buenas tardes", "buenas noches", "hello", "hi", "hey"];
    if (greetings.some((g) => text.startsWith(g) || text === g)) {
      const botName: string | null = await ctx.runQuery(internal.crm.getSetting, { key: "botName" });
      const name = botName || "AQUÍ";
      return {
        reply: `¡Hola! 👋 Bienvenido a *${name}*.\n\n¿En qué puedo ayudarte?\n\n1️⃣ Ver productos\n2️⃣ Info de envíos\n3️⃣ Métodos de pago\n4️⃣ Hablar con un agente\n\nResponde con el *número* o escribe tu pregunta.`,
        source: "welcome",
      };
    }

    // ═══ HUMAN HANDOFF ═══
    if (["agente", "humano", "persona", "soporte"].some((t) => text.includes(t))) {
      const conv: any = await ctx.runQuery(api.crm.getConversationById, { conversationId: args.conversationId });
      await notifyAgent(ctx, conv?.customerName || "Cliente", conv?.customerPhone || conv?.customerPlatformId || "N/A", originalText);
      return { reply: "Un momento, te conecto con un agente. ⏳\n\n📩 *Ya le notificamos.* Te responderá pronto.", source: "humanHandoff" };
    }

    // ═══ DEFAULT ═══
    const botName2: string | null = await ctx.runQuery(internal.crm.getSetting, { key: "botName" });
    const name2 = botName2 || "AQUÍ";
    return {
      reply: `🤔 No entendí.\n\nSoy el bot de *${name2}*. ¿En qué puedo ayudarte?\n\n1️⃣ Ver productos\n2️⃣ Info de envíos\n3️⃣ Métodos de pago\n4️⃣ Hablar con un agente\n\nResponde con el *número* o escribe tu pregunta.`,
      source: "default",
    };
  },
});

// ══════════════════════════════════════════════════════════
// ── PRODUCT SEARCH ────────────────────────────────────────
// ══════════════════════════════════════════════════════════

export const searchProducts = internalAction({
  args: { query: v.string() },
  handler: async (ctx, args): Promise<any[]> => {
    const selectedStoreId: string | null = await ctx.runQuery(internal.crm.getSetting, { key: "selectedStoreId" });
    console.log(`[BOT] searchProducts: selectedStoreId=${selectedStoreId || "none"}`);
    let allProducts: any[];
    if (selectedStoreId) {
      allProducts = await ctx.runQuery(internal.crmBot.getProductsByVendor, { vendorId: selectedStoreId as any });
    } else {
      allProducts = await ctx.runQuery(internal.crmBot.getActiveProducts);
    }
    console.log(`[BOT] searchProducts: total=${allProducts.length} query="${args.query}"`);
    if (!args.query || args.query.trim() === "") return allProducts.slice(0, 10);

    const words = args.query.toLowerCase().replace(/[^\w\sáéíóúñ]/g, "").split(/\s+/).filter((w) => w.length > 2);
    if (words.length === 0) return allProducts.slice(0, 5);

    const scored = allProducts.map((p: any) => {
      const nameLower = (p.name || "").toLowerCase();
      const descLower = (p.description || "").toLowerCase();
      const brandLower = (p.brand || "").toLowerCase();
      const tagsLower = (p.tags || []).join(" ").toLowerCase();
      let score = 0;
      for (const word of words) {
        if (nameLower.includes(word)) score += 10;
        if (brandLower.includes(word)) score += 8;
        if (tagsLower.includes(word)) score += 5;
        if (descLower.includes(word)) score += 3;
      }
      return { ...p, score };
    });
    return scored.filter((p: any) => p.score > 0).sort((a: any, b: any) => b.score - a.score).slice(0, 5);
  },
});

export const getActiveProducts = internalQuery({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").withIndex("by_status", (q) => q.eq("status", "ACTIVE")).collect();
    return products.map((p) => ({
      _id: p._id, name: p.name, description: p.description, price: p.price,
      compareAtPrice: p.compareAtPrice, brand: p.brand, color: p.color, sku: p.sku,
      tags: p.tags, images: p.images, slug: p.slug, location: p.location, vendorId: p.vendorId,
    }));
  },
});

export const getProductsByVendor = internalQuery({
  args: { vendorId: v.id("vendors") },
  handler: async (ctx, args) => {
    const products = await ctx.db.query("products").withIndex("by_vendorId", (q) => q.eq("vendorId", args.vendorId)).collect();
    const active = products.filter((p) => p.status === "ACTIVE");
    console.log(`[BOT] getProductsByVendor: vendorId=${args.vendorId} total=${products.length} active=${active.length}`);
    return active.map((p) => ({
      _id: p._id, name: p.name, description: p.description, price: p.price,
      compareAtPrice: p.compareAtPrice, brand: p.brand, color: p.color, sku: p.sku,
      tags: p.tags, images: p.images, slug: p.slug, location: p.location, vendorId: p.vendorId,
    }));
  },
});

export const getProductById = internalQuery({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const p = await ctx.db.get(args.productId);
    if (!p) return null;
    return {
      _id: p._id, name: p.name, description: p.description, price: p.price,
      compareAtPrice: p.compareAtPrice, brand: p.brand, color: p.color, sku: p.sku,
      tags: p.tags, images: p.images, slug: p.slug, location: p.location,
      availability: p.availability, stock: p.stock,
    };
  },
});

export const getStoreById = internalQuery({
  args: { storeId: v.id("vendors") },
  handler: async (ctx, args) => await ctx.db.get(args.storeId),
});

// ══════════════════════════════════════════════════════════
// ── SEND MESSAGE VIA PLATFORM API ─────────────────────────
// ══════════════════════════════════════════════════════════

export const sendMessage = internalAction({
  args: {
    conversationId: v.id("crmConversations"),
    content: v.string(),
    sender: v.union(v.literal("customer"), v.literal("bot"), v.literal("agent")),
    senderName: v.string(),
    sendImages: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const conversation: any = await ctx.runQuery(api.crm.getConversationById, { conversationId: args.conversationId });
    if (!conversation) return { success: false, error: "Conversación no encontrada" };

    const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await ctx.runMutation(internal.crm.sendMessage, {
      conversationId: args.conversationId, platformMessageId: msgId,
      sender: args.sender, senderName: args.senderName, content: args.content,
    });

    if (conversation.platform === "whatsapp") {
      const token: string | null = await ctx.runQuery(internal.crm.getSetting, { key: "whatsappAccessToken" });
      const phoneNumberId: string | null = await ctx.runQuery(internal.crm.getSetting, { key: "whatsappPhoneNumberId" });
      if (token && phoneNumberId) {
        const to = conversation.customerPhone || conversation.customerPlatformId;

        // Send images first
        if (args.sendImages && args.sendImages.length > 0) {
          for (const imgUrl of args.sendImages.slice(0, 1)) {
            try {
              if (imgUrl.startsWith("data:")) {
                const b64 = imgUrl.split(",")[1];
                const binStr = atob(b64);
                const bytes = new Uint8Array(binStr.length);
                for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
                const blob = new Blob([bytes], { type: "image/jpeg" });
                const fd = new FormData();
                fd.append("messaging_product", "whatsapp");
                fd.append("file", blob, "img.jpg");
                const upResp = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/media`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
                const upData: any = await upResp.json();
                if (upData.id) {
                  await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
                    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "image", image: { id: upData.id } }),
                  });
                  await new Promise((r) => setTimeout(r, 500));
                }
              } else if (imgUrl.startsWith("http")) {
                await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
                  method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                  body: JSON.stringify({ messaging_product: "whatsapp", to, type: "image", image: { link: imgUrl } }),
                });
                await new Promise((r) => setTimeout(r, 500));
              }
            } catch (e) { console.error("Failed to send image:", e); }
          }
        }

        // Send text
        try {
          const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
            method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: args.content } }),
          });
          const data = await response.json();
          return { success: true, data };
        } catch (error: any) { return { success: false, error: error.message }; }
      }
    }

    if (conversation.platform === "instagram" || conversation.platform === "facebook") {
      const token: string | null = await ctx.runQuery(internal.crm.getSetting, { key: "pageAccessToken" });
      if (token) {
        try {
          const response = await fetch(`https://graph.facebook.com/v21.0/me/messages`, {
            method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ recipient: { id: conversation.customerPlatformId }, message: { text: args.content } }),
          });
          const data = await response.json();
          return { success: true, data };
        } catch (error: any) { return { success: false, error: error.message }; }
      }
    }
    return { success: true, queued: true };
  },
});

export const getConversationById = internalQuery({
  args: { conversationId: v.id("crmConversations") },
  handler: async (ctx, args) => await ctx.db.get(args.conversationId),
});
