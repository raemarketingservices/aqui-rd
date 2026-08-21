/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as cart from "../cart.js";
import type * as categories from "../categories.js";
import type * as chatbot from "../chatbot.js";
import type * as facebook from "../facebook.js";
import type * as landing from "../landing.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as support from "../support.js";
import type * as users from "../users.js";
import type * as vendorReviews from "../vendorReviews.js";
import type * as vendors from "../vendors.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  cart: typeof cart;
  categories: typeof categories;
  chatbot: typeof chatbot;
  facebook: typeof facebook;
  landing: typeof landing;
  orders: typeof orders;
  products: typeof products;
  seed: typeof seed;
  settings: typeof settings;
  support: typeof support;
  users: typeof users;
  vendorReviews: typeof vendorReviews;
  vendors: typeof vendors;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
