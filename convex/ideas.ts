import { v } from "convex/values";
import { authenticatedMutation, authenticatedQuery } from "./auth";
import { Doc } from "./_generated/dataModel";
import { ConvexError } from "convex/values";
import { checkWorkspaceAccess } from "./workspaces";

// Get all ideas for a workspace
export const getIdeas = authenticatedQuery({
  args: {
    workspaceId: v.id("workspaces"),
    viralScore: v.optional(
      v.union(
        v.literal("trending"),
        v.literal("viral"),
        v.literal("evergreen"),
        v.literal("not_relevant")
      )
    ),
    source: v.optional(
      v.union(
        v.literal("manual"),
        v.literal("competitor"),
        v.literal("trend"),
        v.literal("ai")
      )
    ),
  },
  handler: async (ctx, args) => {
    await checkWorkspaceAccess(ctx, args.workspaceId, ctx.user._id);

    let ideas = await ctx.db
      .query("ideas")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    // Apply filters
    if (args.viralScore) {
      ideas = ideas.filter((i) => i.viralScore === args.viralScore);
    }
    if (args.source) {
      ideas = ideas.filter((i) => i.source === args.source);
    }

    // Sort by creation date (newest first)
    ideas.sort((a, b) => b.createdAt - a.createdAt);

    return ideas;
  },
});

// Get a single idea
export const getIdea = authenticatedQuery({
  args: { ideaId: v.id("ideas") },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) {
      throw new ConvexError("Idea not found");
    }

    await checkWorkspaceAccess(ctx, idea.workspaceId, ctx.user._id);
    return idea;
  },
});

// Create an idea
export const createIdea = authenticatedMutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    description: v.string(),
    source: v.union(
      v.literal("manual"),
      v.literal("competitor"),
      v.literal("trend"),
      v.literal("ai")
    ),
    competitorName: v.optional(v.string()),
    competitorUrl: v.optional(v.string()),
    viralScore: v.union(
      v.literal("trending"),
      v.literal("viral"),
      v.literal("evergreen"),
      v.literal("not_relevant")
    ),
    contentType: v.string(),
    hooks: v.array(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { role } = await checkWorkspaceAccess(
      ctx,
      args.workspaceId,
      ctx.user._id
    );

    if (role === "viewer") {
      throw new ConvexError("You don't have permission to create ideas");
    }

    const now = Date.now();

    const ideaId = await ctx.db.insert("ideas", {
      workspaceId: args.workspaceId,
      title: args.title,
      description: args.description,
      source: args.source,
      competitorName: args.competitorName,
      competitorUrl: args.competitorUrl,
      viralScore: args.viralScore,
      contentType: args.contentType,
      hooks: args.hooks,
      notes: args.notes,
      createdBy: ctx.user._id,
      createdAt: now,
      updatedAt: now,
    });

    return ideaId;
  },
});

// Update an idea
export const updateIdea = authenticatedMutation({
  args: {
    ideaId: v.id("ideas"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    source: v.optional(
      v.union(
        v.literal("manual"),
        v.literal("competitor"),
        v.literal("trend"),
        v.literal("ai")
      )
    ),
    competitorName: v.optional(v.string()),
    competitorUrl: v.optional(v.string()),
    viralScore: v.optional(
      v.union(
        v.literal("trending"),
        v.literal("viral"),
        v.literal("evergreen"),
        v.literal("not_relevant")
      )
    ),
    contentType: v.optional(v.string()),
    hooks: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) {
      throw new ConvexError("Idea not found");
    }

    const { role } = await checkWorkspaceAccess(
      ctx,
      idea.workspaceId,
      ctx.user._id
    );

    if (role === "viewer") {
      throw new ConvexError("You don't have permission to edit ideas");
    }

    const updates: Partial<Doc<"ideas">> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.source !== undefined) updates.source = args.source;
    if (args.competitorName !== undefined)
      updates.competitorName = args.competitorName;
    if (args.competitorUrl !== undefined)
      updates.competitorUrl = args.competitorUrl;
    if (args.viralScore !== undefined) updates.viralScore = args.viralScore;
    if (args.contentType !== undefined) updates.contentType = args.contentType;
    if (args.hooks !== undefined) updates.hooks = args.hooks;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.ideaId, updates);
    return null;
  },
});

// Delete an idea
export const deleteIdea = authenticatedMutation({
  args: { ideaId: v.id("ideas") },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) {
      throw new ConvexError("Idea not found");
    }

    const { role } = await checkWorkspaceAccess(
      ctx,
      idea.workspaceId,
      ctx.user._id
    );

    if (role === "viewer") {
      throw new ConvexError("You don't have permission to delete ideas");
    }

    await ctx.db.delete(args.ideaId);
    return null;
  },
});

// Get ideas stats for dashboard
export const getIdeasStats = authenticatedQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await checkWorkspaceAccess(ctx, args.workspaceId, ctx.user._id);

    const ideas = await ctx.db
      .query("ideas")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    return {
      total: ideas.length,
      trending: ideas.filter((i) => i.viralScore === "trending").length,
      viral: ideas.filter((i) => i.viralScore === "viral").length,
      evergreen: ideas.filter((i) => i.viralScore === "evergreen").length,
      notRelevant: ideas.filter((i) => i.viralScore === "not_relevant").length,
      bySource: {
        manual: ideas.filter((i) => i.source === "manual").length,
        competitor: ideas.filter((i) => i.source === "competitor").length,
        trend: ideas.filter((i) => i.source === "trend").length,
        ai: ideas.filter((i) => i.source === "ai").length,
      },
    };
  },
});
