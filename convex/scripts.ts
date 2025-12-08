import { v } from "convex/values";
import { authenticatedMutation, authenticatedQuery } from "./auth";
import { Doc } from "./_generated/dataModel";
import { ConvexError } from "convex/values";
import { checkWorkspaceAccess } from "./workspaces";

// Get all video scripts for a workspace
export const getScripts = authenticatedQuery({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("ready"), v.literal("filmed"))
    ),
  },
  handler: async (ctx, args) => {
    await checkWorkspaceAccess(ctx, args.workspaceId, ctx.user._id);

    let scripts = await ctx.db
      .query("videoScripts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    if (args.status) {
      scripts = scripts.filter((s) => s.status === args.status);
    }

    // Sort by creation date (newest first)
    scripts.sort((a, b) => b.createdAt - a.createdAt);

    return scripts;
  },
});

// Get a single script
export const getScript = authenticatedQuery({
  args: { scriptId: v.id("videoScripts") },
  handler: async (ctx, args) => {
    const script = await ctx.db.get(args.scriptId);
    if (!script) {
      throw new ConvexError("Script not found");
    }

    await checkWorkspaceAccess(ctx, script.workspaceId, ctx.user._id);
    return script;
  },
});

// Create a video script
export const createScript = authenticatedMutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    hook: v.string(),
    body: v.string(),
    cta: v.string(),
    musicSuggestion: v.optional(v.string()),
    leadMagnet: v.optional(v.string()),
    digitalProduct: v.optional(v.string()),
    duration: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("ready"), v.literal("filmed")),
  },
  handler: async (ctx, args) => {
    const { role } = await checkWorkspaceAccess(
      ctx,
      args.workspaceId,
      ctx.user._id
    );

    if (role === "viewer") {
      throw new ConvexError("You don't have permission to create scripts");
    }

    const now = Date.now();

    const scriptId = await ctx.db.insert("videoScripts", {
      workspaceId: args.workspaceId,
      title: args.title,
      hook: args.hook,
      body: args.body,
      cta: args.cta,
      musicSuggestion: args.musicSuggestion,
      leadMagnet: args.leadMagnet,
      digitalProduct: args.digitalProduct,
      duration: args.duration,
      status: args.status,
      createdBy: ctx.user._id,
      createdAt: now,
      updatedAt: now,
    });

    return scriptId;
  },
});

// Update a video script
export const updateScript = authenticatedMutation({
  args: {
    scriptId: v.id("videoScripts"),
    title: v.optional(v.string()),
    hook: v.optional(v.string()),
    body: v.optional(v.string()),
    cta: v.optional(v.string()),
    musicSuggestion: v.optional(v.string()),
    leadMagnet: v.optional(v.string()),
    digitalProduct: v.optional(v.string()),
    duration: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("ready"), v.literal("filmed"))
    ),
  },
  handler: async (ctx, args) => {
    const script = await ctx.db.get(args.scriptId);
    if (!script) {
      throw new ConvexError("Script not found");
    }

    const { role } = await checkWorkspaceAccess(
      ctx,
      script.workspaceId,
      ctx.user._id
    );

    if (role === "viewer") {
      throw new ConvexError("You don't have permission to edit scripts");
    }

    const updates: Partial<Doc<"videoScripts">> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.hook !== undefined) updates.hook = args.hook;
    if (args.body !== undefined) updates.body = args.body;
    if (args.cta !== undefined) updates.cta = args.cta;
    if (args.musicSuggestion !== undefined)
      updates.musicSuggestion = args.musicSuggestion;
    if (args.leadMagnet !== undefined) updates.leadMagnet = args.leadMagnet;
    if (args.digitalProduct !== undefined)
      updates.digitalProduct = args.digitalProduct;
    if (args.duration !== undefined) updates.duration = args.duration;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.scriptId, updates);
    return null;
  },
});

// Delete a video script
export const deleteScript = authenticatedMutation({
  args: { scriptId: v.id("videoScripts") },
  handler: async (ctx, args) => {
    const script = await ctx.db.get(args.scriptId);
    if (!script) {
      throw new ConvexError("Script not found");
    }

    const { role } = await checkWorkspaceAccess(
      ctx,
      script.workspaceId,
      ctx.user._id
    );

    if (role === "viewer") {
      throw new ConvexError("You don't have permission to delete scripts");
    }

    await ctx.db.delete(args.scriptId);
    return null;
  },
});

// Get scripts stats
export const getScriptsStats = authenticatedQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await checkWorkspaceAccess(ctx, args.workspaceId, ctx.user._id);

    const scripts = await ctx.db
      .query("videoScripts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    return {
      total: scripts.length,
      draft: scripts.filter((s) => s.status === "draft").length,
      ready: scripts.filter((s) => s.status === "ready").length,
      filmed: scripts.filter((s) => s.status === "filmed").length,
    };
  },
});
