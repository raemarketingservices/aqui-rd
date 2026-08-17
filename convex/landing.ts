import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("landingContent").collect();
  },
});

export const getBySection = query({
  args: { section: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("landingContent")
      .withIndex("by_section", (q) => q.eq("section", args.section))
      .collect();
  },
});

export const upsert = mutation({
  args: {
    section: v.string(),
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("landingContent")
      .withIndex("by_section", (q) =>
        q.eq("section", args.section).eq("key", args.key)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
      return existing._id;
    } else {
      return await ctx.db.insert("landingContent", {
        section: args.section,
        key: args.key,
        value: args.value,
      });
    }
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const defaults: Array<{ section: string; key: string; value: string }> = [
      {
        section: "hero",
        key: "title",
        value: "Marketplace #1 de la República Dominicana",
      },
      {
        section: "hero",
        key: "subtitle",
        value:
          "Descubre miles de productos de vendedores confiables. Envíos a todo el país, pagos seguros y la mejor experiencia de compra online.",
      },
      {
        section: "hero",
        key: "cta",
        value: "Empezar a Comprar",
      },
      {
        section: "platform",
        key: "title",
        value: "Tu plataforma de compras favorita",
      },
      {
        section: "platform",
        key: "description",
        value:
          "Conectamos vendedores dominicanos con compradores de todo el país. Seguridad, confianza y los mejores precios.",
      },
      {
        section: "howItWorks",
        key: "title",
        value: "¿Cómo funciona?",
      },
      {
        section: "appPreview",
        key: "title",
        value: "La experiencia de Aquí RD en tu bolsillo",
      },
      {
        section: "appPreview",
        key: "subtitle",
        value: "Disponible en Tus Dispositivos",
      },
      {
        section: "testimonials",
        key: "title",
        value: "Lo que dicen nuestros usuarios",
      },
      {
        section: "brandValues",
        key: "title",
        value: "Los valores que nos definen",
      },
      {
        section: "features",
        key: "title",
        value: "¿Por qué elegir AQUÍ RD?",
      },
      {
        section: "faq",
        key: "title",
        value: "Preguntas Frecuentes",
      },
      {
        section: "faq",
        key: "items",
        value: JSON.stringify([
          {
            q: "¿Cuánto tarda el envío?",
            a: "Los envíos estándar tardan de 2 a 5 días hábiles dependiendo de tu ubicación. También ofrecemos envío express para entregas en 24-48 horas en las principales ciudades.",
          },
          {
            q: "¿Puedo devolver un producto?",
            a: "Sí, tienes hasta 15 días después de recibir tu pedido para solicitar una devolución. El producto debe estar en su estado original y sin usar.",
          },
          {
            q: "¿Qué métodos de pago aceptan?",
            a: "Aceptamos tarjetas de crédito y débito (Visa, Mastercard), transferencia bancaria, pagos en efectivo a través de agentes autorizados y billeteras móviles.",
          },
          {
            q: "¿Cómo me convierto en vendedor?",
            a: "Solo necesitas crear una cuenta, completar tu perfil de vendedor y solicitar la verificación. Una vez aprobado, podrás publicar tus productos y empezar a vender.",
          },
          {
            q: "¿Tienen atención al cliente?",
            a: "Sí, nuestro equipo de atención al cliente está disponible de lunes a sábado de 8am a 8pm. Puedes contactarnos por chat, correo electrónico o teléfono.",
          },
          {
            q: "¿Las transacciones son seguras?",
            a: "Absolutamente. Utilizamos encriptación SSL de 256 bits y el dinero está protegido hasta que confirmes que recibiste tu pedido correctamente.",
          },
        ]),
      },
      {
        section: "cta",
        key: "title",
        value: "¿Listo para empezar?",
      },
      {
        section: "cta",
        key: "subtitle",
        value: "Únete a miles de dominicanos que ya compran y venden en AQUÍ RD",
      },
      {
        section: "cta",
        key: "buttonText",
        value: "Crear mi Cuenta Gratis",
      },
      {
        section: "footer",
        key: "description",
        value:
          "El marketplace #1 de la República Dominicana. Conectamos vendedores y compradores de todo el país.",
      },
    ];

    for (const item of defaults) {
      const existing = await ctx.db
        .query("landingContent")
        .withIndex("by_section", (q) =>
          q.eq("section", item.section).eq("key", item.key)
        )
        .unique();

      if (!existing) {
        await ctx.db.insert("landingContent", item);
      }
    }

    return { seeded: defaults.length };
  },
});
