/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analyticsData from "../analyticsData.js";
import type * as auth from "../auth.js";
import type * as calendar from "../calendar.js";
import type * as chat from "../chat.js";
import type * as http from "../http.js";
import type * as ideas from "../ideas.js";
import type * as lib_internal_schema from "../lib/internal_schema.js";
import type * as lib_roles from "../lib/roles.js";
import type * as rebolt from "../rebolt.js";
import type * as router from "../router.js";
import type * as scripts from "../scripts.js";
import type * as users from "../users.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analyticsData: typeof analyticsData;
  auth: typeof auth;
  calendar: typeof calendar;
  chat: typeof chat;
  http: typeof http;
  ideas: typeof ideas;
  "lib/internal_schema": typeof lib_internal_schema;
  "lib/roles": typeof lib_roles;
  rebolt: typeof rebolt;
  router: typeof router;
  scripts: typeof scripts;
  users: typeof users;
  workspaces: typeof workspaces;
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
