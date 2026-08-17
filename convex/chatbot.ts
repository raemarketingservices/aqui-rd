import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getConfig = query({
  args: {},
  handler: async (ctx) => {
    const configs = await ctx.db.query("chatbotConfig").collect();
    return configs.length > 0 ? configs[0] : null;
  },
});

export const updateConfig = mutation({
  args: {
    faqs: v.array(v.object({
      question: v.string(),
      answer: v.string(),
    })),
    knowledgeBase: v.string(),
    welcomeMessage: v.string(),
    updatedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const configs = await ctx.db.query("chatbotConfig").collect();
    if (configs.length > 0) {
      await ctx.db.patch(configs[0]._id, {
        faqs: args.faqs,
        knowledgeBase: args.knowledgeBase,
        welcomeMessage: args.welcomeMessage,
        updatedBy: args.updatedBy,
      });
      return configs[0]._id;
    }
    return await ctx.db.insert("chatbotConfig", {
      faqs: args.faqs,
      knowledgeBase: args.knowledgeBase,
      welcomeMessage: args.welcomeMessage,
      updatedBy: args.updatedBy,
    });
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const configs = await ctx.db.query("chatbotConfig").collect();
    if (configs.length > 0) return "already seeded";

    const defaultFaqs = [
      { question: "¿Qué es AQUÍ RD?", answer: "AQUÍ RD es el marketplace dominicano donde encuentras miles de productos de vendedores locales. Todo lo que buscas, en un solo lugar, con envíos a todo el país." },
      { question: "¿Cómo puedo comprar?", answer: "Solo necesitas crear una cuenta, explorar los productos, agregar al carrito y completar el checkout. Aceptamos tarjetas de crédito, débito y transferencias bancarias." },
      { question: "¿Hacen envíos a todo el país?", answer: "¡Sí! Realizamos envíos a todas las provincias de la República Dominicana. El costo de envío es de RD$150, y es GRATIS en compras mayores a RD$2,000." },
      { question: "¿Cuánto tarda el envío?", answer: "Los envíos dentro de Santo Domingo se realizan en 1-2 días hábiles. Para otras provincias el tiempo es de 3-5 días hábiles dependiendo de la ubicación." },
      { question: "¿Puedo vender en AQUÍ RD?", answer: "¡Por supuesto! Puedes registrar tu tienda en nuestra plataforma. Solo haz clic en 'Vender en AQUÍ' y completa el formulario. Tu tienda estará activa en menos de 24 horas." },
      { question: "¿Cómo devuelvo un producto?", answer: "Puedes solicitar una devolución dentro de los 7 días posteriores a la recepción del producto. El producto debe estar en buenas condiciones y con su empaque original." },
      { question: "¿Tienen tienda física?", answer: "AQUÍ RD es una plataforma 100% online. Puedes disfrutar de nuestra experiencia de compra desde cualquier dispositivo con acceso a internet." },
      { question: "¿Cómo contacto soporte?", answer: "Puedes escribirnos por WhatsApp al número que encontrarás en nuestra página, o enviar un email a soporte@aquird.com.do. También puedes usar este chatbot para preguntas frecuentes." },
      { question: "¿Qué métodos de pago aceptan?", answer: "Aceptamos tarjetas de crédito y débito (Visa, MasterCard), transferencias bancarias, y pagos en efectivo mediante pagosmóviles." },
      { question: "¿Los productos son originales?", answer: "Todos los vendedores en AQUÍ RD son verificados. Trabajamos para garantizar la calidad y autenticidad de todos los productos publicados en nuestra plataforma." },
    ];

    return await ctx.db.insert("chatbotConfig", {
      faqs: defaultFaqs,
      knowledgeBase: "AQUÍ RD es el marketplace líder de la República Dominicana. Conectamos vendedores locales con compradores de todo el país. Ofrecemos productos en categorías como tecnología, bienestar, hogar, auto, deportes, moda y más. Envíos a todo RD, pagos seguros y atención al cliente 24/7.",
      welcomeMessage: "¡Hola! 👋 Soy el asistente de AQUÍ RD. ¿En qué puedo ayudarte hoy? Puedo responder preguntas sobre compras, envíos, pagos, vender en la plataforma y más.",
    });
  },
});
