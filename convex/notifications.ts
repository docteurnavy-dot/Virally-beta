import { v } from "convex/values";
import { authenticatedQuery, authenticatedMutation } from "./auth";

/**
 * Get all notifications for the current user
 */
export const getMyNotifications = authenticatedQuery({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("notifications"),
      _creationTime: v.number(),
      userId: v.id("users"),
      type: v.string(),
      title: v.string(),
      message: v.string(),
      workspaceId: v.optional(v.id("workspaces")),
      invitationId: v.optional(v.id("workspaceInvitations")),
      fromUserId: v.optional(v.id("users")),
      read: v.boolean(),
      createdAt: v.number(),
      fromUser: v.optional(
        v.object({
          name: v.optional(v.string()),
          email: v.optional(v.string()),
          image: v.optional(v.string()),
        })
      ),
      workspace: v.optional(
        v.object({
          name: v.string(),
        })
      ),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_time", (q) => q.eq("userId", ctx.user._id))
      .order("desc")
      .take(limit);

    // Enrich with user and workspace data
    const enriched = await Promise.all(
      notifications.map(async (n) => {
        let fromUser = undefined;
        let workspace = undefined;

        if (n.fromUserId) {
          const user = await ctx.db.get(n.fromUserId);
          if (user) {
            fromUser = {
              name: user.name,
              email: user.email,
              image: user.image,
            };
          }
        }

        if (n.workspaceId) {
          const ws = await ctx.db.get(n.workspaceId);
          if (ws) {
            workspace = { name: ws.name };
          }
        }

        return {
          ...n,
          type: n.type as string,
          fromUser,
          workspace,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get unread notification count
 */
export const getUnreadCount = authenticatedQuery({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) =>
        q.eq("userId", ctx.user._id).eq("read", false)
      )
      .collect();

    return unread.length;
  },
});

/**
 * Mark a notification as read
 */
export const markAsRead = authenticatedMutation({
  args: {
    notificationId: v.id("notifications"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== ctx.user._id) {
      return null;
    }

    await ctx.db.patch(args.notificationId, { read: true });
    return null;
  },
});

/**
 * Mark all notifications as read
 */
export const markAllAsRead = authenticatedMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) =>
        q.eq("userId", ctx.user._id).eq("read", false)
      )
      .collect();

    for (const n of unread) {
      await ctx.db.patch(n._id, { read: true });
    }

    return null;
  },
});
