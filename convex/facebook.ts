import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

function parsePrice(text: string): number | null {
  const patterns = [
    /(?:RD\$|RD\s?\$|US\$|USD\$|\$)\s*([\d][\d.,]*)/i,
    /(?:precio|price|costo|cost|sale|vende)\s*(?:por|for|:)?\s*(?:RD\$|RD\s?\$|US\$|USD\$|\$)?\s*([\d][\d.,]*)/i,
    /([\d]{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?)/,
    /(\d{2,6}(?:[.,]\d{2})?)/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      let cleaned = m[1].replace(/\./g, "").replace(/,/g, ".");
      const value = parseFloat(cleaned);
      if (!isNaN(value) && value > 0 && value < 10000000) return Math.round(value * 100);
    }
  }
  return null;
}

async function scrapeWithMicrolink(url: string): Promise<{
  ok: boolean;
  name: string;
  description: string;
  price: number;
  images: string[];
  error?: string;
}> {
  try {
    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
    const res = await fetch(apiUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow",
    });
    const data = await res.json();

    if (data.status !== "success" || !data.data) {
      return {
        ok: false,
        name: "Producto de Facebook",
        description: "",
        price: 0,
        images: [],
        error: "No se pudieron extraer datos",
      };
    }

    const title = (data.data.title || "").trim();
    const description = (data.data.description || "").trim();
    const imageUrl = data.data.image?.url || "";
    const finalUrl = data.data.url || url;

    const cleanTitle = title
      .replace(/^\d+\s*comments?\s*\|\s*/i, "")
      .replace(/\s*\|\s*Facebook.*$/i, "")
      .replace(/\s*\|\s*Meta.*$/i, "")
      .trim()
      .slice(0, 90);

    const allText = `${title} ${description}`;
    const price = parsePrice(allText);

    const images: string[] = [];
    if (imageUrl && imageUrl.startsWith("http")) {
      images.push(imageUrl);
    }

    return {
      ok: true,
      name: cleanTitle || "Producto de Facebook",
      description: description.slice(0, 500),
      price: price ?? 0,
      images,
    };
  } catch (e: any) {
    return {
      ok: false,
      name: "Producto de Facebook",
      description: "",
      price: 0,
      images: [],
      error: e.message,
    };
  }
}

export const scrapeAndImport = action({
  args: {
    vendorId: v.id("vendors"),
    urls: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.urls.length === 0) throw new Error("Pega al menos un enlace");

    const results: any[] = [];
    const productsToCreate: any[] = [];

    for (const url of args.urls.slice(0, 20)) {
      const trimmed = url.trim();
      if (!trimmed) continue;

      const isFB =
        trimmed.includes("facebook.com") || trimmed.includes("fb.com");
      if (!isFB) {
        results.push({ url: trimmed, ok: false, error: "No es un enlace de Facebook" });
        continue;
      }

      const scraped = await scrapeWithMicrolink(trimmed);
      results.push({ url: trimmed, ...scraped });

      if (scraped.ok && scraped.name && scraped.name !== "Producto de Facebook") {
        productsToCreate.push({
          name: scraped.name,
          description: scraped.description,
          price: scraped.price,
          images: scraped.images,
        });
      }
    }

    if (productsToCreate.length > 0) {
      await ctx.runMutation(internal.facebook.createProducts, {
        vendorId: args.vendorId,
        products: productsToCreate,
      });
    }

    return { created: productsToCreate.length, results };
  },
});

export const createProducts = internalMutation({
  args: {
    vendorId: v.id("vendors"),
    products: v.array(
      v.object({
        name: v.string(),
        description: v.string(),
        price: v.number(),
        images: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    let created = 0;
    for (const product of args.products) {
      const baseSlug = product.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "producto";
      const slug = `${baseSlug}-${Date.now().toString(36)}-${created}`;
      const sku = `FB-${Date.now().toString(36).toUpperCase()}-${created}`;

      await ctx.db.insert("products", {
        name: product.name,
        slug,
        description: product.description,
        price: product.price || 0,
        stock: 1,
        status: product.price ? "ACTIVE" : "DRAFT",
        images: product.images,
        vendorId: args.vendorId,
        rating: 0,
        reviewCount: 0,
        salesCount: 0,
        sku,
        condition: "NEW",
        availability: "SINGLE",
      });
      created++;
    }
    return created;
  },
});
