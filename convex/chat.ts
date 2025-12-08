import { v } from "convex/values";
import { authenticatedMutation, authenticatedQuery } from "./auth";
import { ConvexError } from "convex/values";
import { checkWorkspaceAccess } from "./workspaces";

// Get chat messages for a workspace
export const getMessages = authenticatedQuery({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await checkWorkspaceAccess(ctx, args.workspaceId, ctx.user._id);

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_workspace_and_time", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .order("asc")
      .collect();

    // Apply limit if provided
    if (args.limit) {
      return messages.slice(-args.limit);
    }

    return messages;
  },
});

// Add a user message
export const addUserMessage = authenticatedMutation({
  args: {
    workspaceId: v.id("workspaces"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { role } = await checkWorkspaceAccess(
      ctx,
      args.workspaceId,
      ctx.user._id
    );

    if (role === "viewer") {
      throw new ConvexError("You don't have permission to send messages");
    }

    const messageId = await ctx.db.insert("chatMessages", {
      workspaceId: args.workspaceId,
      role: "user",
      content: args.content,
      createdBy: ctx.user._id,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

// Add an assistant message
export const addAssistantMessage = authenticatedMutation({
  args: {
    workspaceId: v.id("workspaces"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await checkWorkspaceAccess(ctx, args.workspaceId, ctx.user._id);

    const messageId = await ctx.db.insert("chatMessages", {
      workspaceId: args.workspaceId,
      role: "assistant",
      content: args.content,
      createdBy: ctx.user._id,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

// Clear chat history
export const clearChat = authenticatedMutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const { role } = await checkWorkspaceAccess(
      ctx,
      args.workspaceId,
      ctx.user._id
    );

    if (role === "viewer") {
      throw new ConvexError("You don't have permission to clear chat");
    }

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    return null;
  },
});
