import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("CUSTOMER"), v.literal("VENDOR"), v.literal("ADMIN")),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
    vendorId: v.optional(v.id("vendors")),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  vendors: defineTable({
    userId: v.id("users"),
    businessName: v.string(),
    description: v.optional(v.string()),
    logo: v.optional(v.string()),
    slug: v.string(),
    rating: v.number(),
    totalSales: v.number(),
    status: v.union(v.literal("PENDING"), v.literal("APPROVED"), v.literal("REJECTED")),
    whatsapp: v.optional(v.string()),
    socials: v.optional(v.object({
      instagram: v.optional(v.string()),
      facebook: v.optional(v.string()),
      twitter: v.optional(v.string()),
      tiktok: v.optional(v.string()),
      youtube: v.optional(v.string()),
    })),
  })
    .index("by_userId", ["userId"])
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    image: v.optional(v.string()),
    parentId: v.optional(v.id("categories")),
    description: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_parentId", ["parentId"]),

  products: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    stock: v.number(),
    status: v.union(v.literal("DRAFT"), v.literal("ACTIVE"), v.literal("INACTIVE")),
    images: v.array(v.string()),
    vendorId: v.id("vendors"),
    categoryId: v.optional(v.id("categories")),
    rating: v.number(),
    reviewCount: v.number(),
    salesCount: v.number(),
    whatsapp: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_vendorId", ["vendorId"])
    .index("by_categoryId", ["categoryId"])
    .index("by_status", ["status"])
    .index("by_price", ["price"])
    .index("by_salesCount", ["salesCount"]),

  carts: defineTable({
    userId: v.id("users"),
  })
    .index("by_userId", ["userId"]),

  cartItems: defineTable({
    cartId: v.id("carts"),
    productId: v.id("products"),
    quantity: v.number(),
  })
    .index("by_cartId", ["cartId"])
    .index("by_cartId_productId", ["cartId", "productId"]),

  orders: defineTable({
    userId: v.id("users"),
    orderNumber: v.string(),
    status: v.union(
      v.literal("PENDING"),
      v.literal("PAID"),
      v.literal("PROCESSING"),
      v.literal("SHIPPED"),
      v.literal("DELIVERED"),
      v.literal("CANCELLED")
    ),
    subtotal: v.number(),
    taxAmount: v.number(),
    shippingCost: v.number(),
    totalAmount: v.number(),
    shippingAddress: v.string(),
    paymentMethod: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_orderNumber", ["orderNumber"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    vendorId: v.id("vendors"),
    name: v.string(),
    price: v.number(),
    quantity: v.number(),
    subtotal: v.number(),
  })
    .index("by_orderId", ["orderId"])
    .index("by_vendorId", ["vendorId"]),

  reviews: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    rating: v.number(),
    title: v.optional(v.string()),
    comment: v.optional(v.string()),
  })
    .index("by_productId", ["productId"])
    .index("by_userId", ["userId"]),

  siteSettings: defineTable({
    key: v.string(),
    value: v.any(),
  }).index("by_key", ["key"]),

  chatbotConfig: defineTable({
    faqs: v.array(v.object({
      question: v.string(),
      answer: v.string(),
    })),
    knowledgeBase: v.string(),
    welcomeMessage: v.string(),
    updatedBy: v.optional(v.id("users")),
  }),

  landingContent: defineTable({
    section: v.string(),
    key: v.string(),
    value: v.string(),
  }).index("by_section", ["section", "key"]),
});
