import { v } from "convex/values";
import { authenticatedMutation, authenticatedQuery } from "./auth";
import { Doc, Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";
import { QueryCtx } from "./_generated/server";

// Helper to check if user has access to workspace
async function checkWorkspaceAccess(
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">
): Promise<{ workspace: Doc<"workspaces">; role: "owner" | "editor" | "viewer" }> {
  const workspace = await ctx.db.get(workspaceId);
  if (!workspace) {
    throw new ConvexError("Workspace not found");
  }

  // Check if owner
  if (workspace.ownerId === userId) {
    return { workspace, role: "owner" };
  }

  // Check if member
  const membership = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_and_user", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId)
    )
    .unique();

  if (!membership) {
    throw new ConvexError("You don't have access to this workspace");
  }

  return { workspace, role: membership.role };
}

// Get all workspaces for the current user (owned + invited)
export const listMyWorkspaces = authenticatedQuery({
  args: {},
  handler: async (ctx) => {
    const userId = ctx.user._id;

    // Get owned workspaces
    const ownedWorkspaces = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    // Get workspaces where user is a member
    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const invitedWorkspaceIds = memberships.map((m) => m.workspaceId);
    const invitedWorkspaces: Doc<"workspaces">[] = [];

    for (const wsId of invitedWorkspaceIds) {
      const ws = await ctx.db.get(wsId);
      if (ws) {
        invitedWorkspaces.push(ws);
      }
    }

    return {
      owned: ownedWorkspaces,
      invited: invitedWorkspaces.map((ws) => ({
        ...ws,
        role: memberships.find((m) => m.workspaceId === ws._id)?.role,
      })),
    };
  },
});

// Get a single workspace by ID
export const getWorkspace = authenticatedQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const { workspace, role } = await checkWorkspaceAccess(
      ctx,
      args.workspaceId,
      ctx.user._id
    );

    // Get member count
    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    return {
      ...workspace,
      role,
      memberCount: members.length + 1, // +1 for owner
    };
  },
});

// Create a new workspace
export const createWorkspace = authenticatedMutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    niche: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      description: args.description,
      niche: args.niche,
      ownerId: ctx.user._id,
      createdAt: now,
      updatedAt: now,
    });

    return workspaceId;
  },
});

// Update a workspace
export const updateWorkspace = authenticatedMutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    niche: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { role } = await checkWorkspaceAccess(
      ctx,
      args.workspaceId,
      ctx.user._id
    );

    if (role === "viewer") {
      throw new ConvexError("You don't have permission to edit this workspace");
    }

    const updates: Partial<Doc<"workspaces">> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.niche !== undefined) updates.niche = args.niche;

    await ctx.db.patch(args.workspaceId, updates);
    return null;
  },
});

// Delete a workspace (owner only)
export const deleteWorkspace = authenticatedMutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new ConvexError("Workspace not found");
    }

    if (workspace.ownerId !== ctx.user._id) {
      throw new ConvexError("Only the owner can delete this workspace");
    }

    // Delete all related data
    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const event of events) {
      await ctx.db.delete(event._id);
    }

    const ideas = await ctx.db
      .query("ideas")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const idea of ideas) {
      await ctx.db.delete(idea._id);
    }

    const scripts = await ctx.db
      .query("videoScripts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const script of scripts) {
      await ctx.db.delete(script._id);
    }

    const analyticsEntries = await ctx.db
      .query("analytics")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const entry of analyticsEntries) {
      await ctx.db.delete(entry._id);
    }

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    const invitations = await ctx.db
      .query("workspaceInvitations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    for (const invitation of invitations) {
      await ctx.db.delete(invitation._id);
    }

    // Delete the workspace
    await ctx.db.delete(args.workspaceId);
    return null;
  },
});

// Get workspace members
export const getWorkspaceMembers = authenticatedQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await checkWorkspaceAccess(ctx, args.workspaceId, ctx.user._id);

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new ConvexError("Workspace not found");
    }

    // Get owner info
    const owner = await ctx.db.get(workspace.ownerId);

    // Get members
    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const members = [];
    for (const membership of memberships) {
      const user = await ctx.db.get(membership.userId);
      if (user) {
        members.push({
          userId: user._id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: membership.role,
          membershipId: membership._id,
        });
      }
    }

    return {
      owner: owner
        ? {
            userId: owner._id,
            email: owner.email,
            name: owner.name,
            image: owner.image,
            role: "owner" as const,
          }
        : null,
      members,
    };
  },
});

// Invite a user to workspace
export const inviteToWorkspace = authenticatedMutation({
  args: {
    workspaceId: v.id("workspaces"),
    email: v.string(),
    role: v.union(v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const { role } = await checkWorkspaceAccess(
      ctx,
      args.workspaceId,
      ctx.user._id
    );

    if (role !== "owner") {
      throw new ConvexError("Only the owner can invite members");
    }

    // Check if invitation already exists
    const existingInvitation = await ctx.db
      .query("workspaceInvitations")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingInvitation) {
      throw new ConvexError("An invitation is already pending for this email");
    }

    // Check if user is already a member
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email.toLowerCase()))
      .first();

    if (existingUser) {
      const existingMembership = await ctx.db
        .query("workspaceMembers")
        .withIndex("by_workspace_and_user", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("userId", existingUser._id)
        )
        .unique();

      if (existingMembership) {
        throw new ConvexError("This user is already a member of this workspace");
      }
    }

    const workspace = await ctx.db.get(args.workspaceId);
    
    const invitationId = await ctx.db.insert("workspaceInvitations", {
      workspaceId: args.workspaceId,
      email: args.email.toLowerCase(),
      role: args.role,
      invitedBy: ctx.user._id,
      status: "pending",
      createdAt: Date.now(),
    });

    // If user exists, create a notification for them
    if (existingUser) {
      await ctx.db.insert("notifications", {
        userId: existingUser._id,
        type: "workspace_invitation",
        title: "Nueva invitación",
        message: `${ctx.user.name || ctx.user.email} te ha invitado a unirte a "${workspace?.name}"`,
        workspaceId: args.workspaceId,
        invitationId: invitationId,
        fromUserId: ctx.user._id,
        read: false,
        createdAt: Date.now(),
      });
    }

    return null;
  },
});

// Get pending invitations for current user
export const getMyPendingInvitations = authenticatedQuery({
  args: {},
  handler: async (ctx) => {
    const userEmail = ctx.user.email?.toLowerCase();
    if (!userEmail) return [];

    const invitations = await ctx.db
      .query("workspaceInvitations")
      .withIndex("by_email_and_status", (q) =>
        q.eq("email", userEmail).eq("status", "pending")
      )
      .collect();

    const result = [];
    for (const invitation of invitations) {
      const workspace = await ctx.db.get(invitation.workspaceId);
      const inviter = await ctx.db.get(invitation.invitedBy);
      if (workspace && inviter) {
        result.push({
          invitationId: invitation._id,
          workspace: {
            id: workspace._id,
            name: workspace.name,
            niche: workspace.niche,
          },
          invitedBy: {
            name: inviter.name,
            email: inviter.email,
          },
          role: invitation.role,
          createdAt: invitation.createdAt,
        });
      }
    }

    return result;
  },
});

// Accept invitation
export const acceptInvitation = authenticatedMutation({
  args: { invitationId: v.id("workspaceInvitations") },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new ConvexError("Invitation not found");
    }

    if (invitation.email !== ctx.user.email?.toLowerCase()) {
      throw new ConvexError("This invitation is not for you");
    }

    if (invitation.status !== "pending") {
      throw new ConvexError("This invitation has already been processed");
    }

    // Add user as member
    await ctx.db.insert("workspaceMembers", {
      workspaceId: invitation.workspaceId,
      userId: ctx.user._id,
      role: invitation.role,
      invitedBy: invitation.invitedBy,
      createdAt: Date.now(),
    });

    // Update invitation status
    await ctx.db.patch(args.invitationId, { status: "accepted" });

    return invitation.workspaceId;
  },
});

// Decline invitation
export const declineInvitation = authenticatedMutation({
  args: { invitationId: v.id("workspaceInvitations") },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new ConvexError("Invitation not found");
    }

    if (invitation.email !== ctx.user.email?.toLowerCase()) {
      throw new ConvexError("This invitation is not for you");
    }

    await ctx.db.patch(args.invitationId, { status: "declined" });
    return null;
  },
});

// Remove member from workspace
export const removeMember = authenticatedMutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new ConvexError("Workspace not found");
    }

    if (workspace.ownerId !== ctx.user._id) {
      throw new ConvexError("Only the owner can remove members");
    }

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", args.userId)
      )
      .unique();

    if (!membership) {
      throw new ConvexError("Member not found");
    }

    await ctx.db.delete(membership._id);
    return null;
  },
});

// Leave workspace (for invited members)
export const leaveWorkspace = authenticatedMutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new ConvexError("Workspace not found");
    }

    if (workspace.ownerId === ctx.user._id) {
      throw new ConvexError("Owner cannot leave the workspace. Delete it instead.");
    }

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", ctx.user._id)
      )
      .unique();

    if (!membership) {
      throw new ConvexError("You are not a member of this workspace");
    }

    await ctx.db.delete(membership._id);
    return null;
  },
});

// Get pending invitations for a workspace (owner only)
export const getPendingInvitations = authenticatedQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new ConvexError("Workspace not found");
    }

    if (workspace.ownerId !== ctx.user._id) {
      throw new ConvexError("Only the owner can view pending invitations");
    }

    const invitations = await ctx.db
      .query("workspaceInvitations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    return invitations;
  },
});

// Update member role (owner only)
export const updateMemberRole = authenticatedMutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    role: v.union(v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new ConvexError("Workspace not found");
    }

    if (workspace.ownerId !== ctx.user._id) {
      throw new ConvexError("Only the owner can update member roles");
    }

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", args.userId)
      )
      .unique();

    if (!membership) {
      throw new ConvexError("Member not found");
    }

    await ctx.db.patch(membership._id, { role: args.role });
    return null;
  },
});

// Cancel invitation (owner only)
export const cancelInvitation = authenticatedMutation({
  args: { invitationId: v.id("workspaceInvitations") },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new ConvexError("Invitation not found");
    }

    const workspace = await ctx.db.get(invitation.workspaceId);
    if (!workspace) {
      throw new ConvexError("Workspace not found");
    }

    if (workspace.ownerId !== ctx.user._id) {
      throw new ConvexError("Only the owner can cancel invitations");
    }

    await ctx.db.delete(args.invitationId);
    return null;
  },
});

// Export the helper for use in other files
export { checkWorkspaceAccess };
