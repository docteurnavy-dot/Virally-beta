import { v } from "convex/values";
import { authenticatedMutation, authenticatedQuery } from "./auth";
import { Doc } from "./_generated/dataModel";
import { ConvexError } from "convex/values";
import { checkWorkspaceAccess } from "./workspaces";

// Get all analytics entries for a workspace
export const getAnalytics = authenticatedQuery({
  args: {
    workspaceId: v.id("workspaces"),
    platform: v.optional(
      v.union(
        v.literal("instagram"),
        v.literal("tiktok"),
        v.literal("youtube"),
        v.literal("twitter"),
        v.literal("linkedin"),
        v.literal("other")
      )
    ),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await checkWorkspaceAccess(ctx, args.workspaceId, ctx.user._id);

    let entries = await ctx.db
      .query("analytics")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    // Apply filters
    if (args.platform) {
      entries = entries.filter((e) => e.platform === args.platform);
    }
    if (args.startDate) {
      entries = entries.filter((e) => e.publishedDate >= args.startDate!);
    }
    if (args.endDate) {
      entries = entries.filter((e) => e.publishedDate <= args.endDate!);
    }

    // Sort by published date (newest first)
    entries.sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));

    return entries;
  },
});

// Get a single analytics entry
export const getAnalyticsEntry = authenticatedQuery({
  args: { entryId: v.id("analytics") },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new ConvexError("Analytics entry not found");
    }

    await checkWorkspaceAccess(ctx, entry.workspaceId, ctx.user._id);
    return entry;
  },
});

// Create an analytics entry
export const createAnalyticsEntry = authenticatedMutation({
  args: {
    workspaceId: v.id("workspaces"),
    platform: v.union(
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("youtube"),
      v.literal("twitter"),
      v.literal("linkedin"),
      v.literal("other")
    ),
    contentTitle: v.string(),
    contentUrl: v.optional(v.string()),
    publishedDate: v.string(),
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    saves: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { role } = await checkWorkspaceAccess(
      ctx,
      args.workspaceId,
      ctx.user._id
    );

    if (role === "viewer") {
      throw new ConvexError("You don't have permission to add analytics");
    }

    const now = Date.now();

    const entryId = await ctx.db.insert("analytics", {
      workspaceId: args.workspaceId,
      platform: args.platform,
      contentTitle: args.contentTitle,
      contentUrl: args.contentUrl,
      publishedDate: args.publishedDate,
      views: args.views,
      likes: args.likes,
      comments: args.comments,
      shares: args.shares,
      saves: args.saves,
      createdBy: ctx.user._id,
      createdAt: now,
      updatedAt: now,
    });

    return entryId;
  },
});

// Update an analytics entry
export const updateAnalyticsEntry = authenticatedMutation({
  args: {
    entryId: v.id("analytics"),
    platform: v.optional(
      v.union(
        v.literal("instagram"),
        v.literal("tiktok"),
        v.literal("youtube"),
        v.literal("twitter"),
        v.literal("linkedin"),
        v.literal("other")
      )
    ),
    contentTitle: v.optional(v.string()),
    contentUrl: v.optional(v.string()),
    publishedDate: v.optional(v.string()),
    views: v.optional(v.number()),
    likes: v.optional(v.number()),
    comments: v.optional(v.number()),
    shares: v.optional(v.number()),
    saves: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new ConvexError("Analytics entry not found");
    }

    const { role } = await checkWorkspaceAccess(
      ctx,
      entry.workspaceId,
      ctx.user._id
    );

    if (role === "viewer") {
      throw new ConvexError("You don't have permission to edit analytics");
    }

    const updates: Partial<Doc<"analytics">> = {
      updatedAt: Date.now(),
    };

    if (args.platform !== undefined) updates.platform = args.platform;
    if (args.contentTitle !== undefined) updates.contentTitle = args.contentTitle;
    if (args.contentUrl !== undefined) updates.contentUrl = args.contentUrl;
    if (args.publishedDate !== undefined)
      updates.publishedDate = args.publishedDate;
    if (args.views !== undefined) updates.views = args.views;
    if (args.likes !== undefined) updates.likes = args.likes;
    if (args.comments !== undefined) updates.comments = args.comments;
    if (args.shares !== undefined) updates.shares = args.shares;
    if (args.saves !== undefined) updates.saves = args.saves;

    await ctx.db.patch(args.entryId, updates);
    return null;
  },
});

// Delete an analytics entry
export const deleteAnalyticsEntry = authenticatedMutation({
  args: { entryId: v.id("analytics") },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new ConvexError("Analytics entry not found");
    }

    const { role } = await checkWorkspaceAccess(
      ctx,
      entry.workspaceId,
      ctx.user._id
    );

    if (role === "viewer") {
      throw new ConvexError("You don't have permission to delete analytics");
    }

    await ctx.db.delete(args.entryId);
    return null;
  },
});

// Get analytics summary/stats
export const getAnalyticsSummary = authenticatedQuery({
  args: {
    workspaceId: v.id("workspaces"),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await checkWorkspaceAccess(ctx, args.workspaceId, ctx.user._id);

    let entries = await ctx.db
      .query("analytics")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    // Apply date filters
    if (args.startDate) {
      entries = entries.filter((e) => e.publishedDate >= args.startDate!);
    }
    if (args.endDate) {
      entries = entries.filter((e) => e.publishedDate <= args.endDate!);
    }

    // Calculate totals
    const totals = entries.reduce(
      (acc, entry) => ({
        views: acc.views + entry.views,
        likes: acc.likes + entry.likes,
        comments: acc.comments + entry.comments,
        shares: acc.shares + entry.shares,
        saves: acc.saves + (entry.saves || 0),
      }),
      { views: 0, likes: 0, comments: 0, shares: 0, saves: 0 }
    );

    // Calculate by platform
    const byPlatform: Record<
      string,
      { views: number; likes: number; comments: number; shares: number; count: number }
    > = {};

    for (const entry of entries) {
      if (!byPlatform[entry.platform]) {
        byPlatform[entry.platform] = {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          count: 0,
        };
      }
      byPlatform[entry.platform].views += entry.views;
      byPlatform[entry.platform].likes += entry.likes;
      byPlatform[entry.platform].comments += entry.comments;
      byPlatform[entry.platform].shares += entry.shares;
      byPlatform[entry.platform].count += 1;
    }

    // Calculate engagement rate (likes + comments + shares) / views * 100
    const engagementRate =
      totals.views > 0
        ? ((totals.likes + totals.comments + totals.shares) / totals.views) * 100
        : 0;

    // Get top performing content
    const topContent = [...entries]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((e) => ({
        title: e.contentTitle,
        platform: e.platform,
        views: e.views,
        likes: e.likes,
        engagementRate:
          e.views > 0
            ? ((e.likes + e.comments + e.shares) / e.views) * 100
            : 0,
      }));

    return {
      totalPosts: entries.length,
      totals,
      engagementRate: Math.round(engagementRate * 100) / 100,
      byPlatform,
      topContent,
    };
  },
});

// Get analytics trend data for charts
export const getAnalyticsTrend = authenticatedQuery({
  args: {
    workspaceId: v.id("workspaces"),
    days: v.optional(v.number()), // Default 30 days
  },
  handler: async (ctx, args) => {
    await checkWorkspaceAccess(ctx, args.workspaceId, ctx.user._id);

    const daysToFetch = args.days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToFetch);
    const startDateStr = startDate.toISOString().split("T")[0];

    const entries = await ctx.db
      .query("analytics")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const filteredEntries = entries.filter(
      (e) => e.publishedDate >= startDateStr
    );

    // Group by date
    const byDate: Record<
      string,
      { views: number; likes: number; comments: number; shares: number }
    > = {};

    for (const entry of filteredEntries) {
      if (!byDate[entry.publishedDate]) {
        byDate[entry.publishedDate] = {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
        };
      }
      byDate[entry.publishedDate].views += entry.views;
      byDate[entry.publishedDate].likes += entry.likes;
      byDate[entry.publishedDate].comments += entry.comments;
      byDate[entry.publishedDate].shares += entry.shares;
    }

    // Convert to array and sort by date
    const trendData = Object.entries(byDate)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return trendData;
  },
});
