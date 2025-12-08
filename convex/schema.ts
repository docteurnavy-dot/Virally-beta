import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { getInternalSchema } from "./lib/internal_schema";

export default defineSchema({
  /*
   * INTERNAL AUTH SCHEMA - DO NOT MODIFY
   */
  ...getInternalSchema(),

  /*
   * APPLICATION TABLES
   */

  // Workspaces - Each user can have multiple workspaces for different brands
  workspaces: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    niche: v.string(),
    ownerId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_createdAt", ["createdAt"]),

  // Workspace members - For collaboration
  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"),
      v.literal("editor"),
      v.literal("viewer")
    ),
    invitedBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"])
    .index("by_workspace_and_user", ["workspaceId", "userId"]),

  // Calendar events - Content calendar items
  calendarEvents: defineTable({
    workspaceId: v.id("workspaces"),
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(), // ISO date string YYYY-MM-DD
    time: v.optional(v.string()), // HH:MM format
    funnelStage: v.union(
      v.literal("tofu"),
      v.literal("mofu"),
      v.literal("bofu")
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("published")
    ),
    contentType: v.string(), // reel, carousel, story, post, etc.
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_date", ["workspaceId", "date"])
    .index("by_workspace_and_status", ["workspaceId", "status"]),

  // Ideas - CRM-style idea organizer
  ideas: defineTable({
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
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_score", ["workspaceId", "viralScore"])
    .index("by_workspace_and_source", ["workspaceId", "source"]),

  // Video scripts - Script builder
  videoScripts: defineTable({
    workspaceId: v.id("workspaces"),
    title: v.string(),
    hook: v.string(),
    body: v.string(),
    cta: v.string(),
    musicSuggestion: v.optional(v.string()),
    leadMagnet: v.optional(v.string()),
    digitalProduct: v.optional(v.string()),
    duration: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("ready"),
      v.literal("filmed")
    ),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_status", ["workspaceId", "status"]),

  // Analytics - Manual metrics entry
  analytics: defineTable({
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
    publishedDate: v.string(), // ISO date string
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    saves: v.optional(v.number()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_platform", ["workspaceId", "platform"])
    .index("by_workspace_and_date", ["workspaceId", "publishedDate"]),

  // Chat messages - AI conversation history per workspace
  chatMessages: defineTable({
    workspaceId: v.id("workspaces"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_time", ["workspaceId", "createdAt"]),

  // Workspace invitations - Pending invitations
  workspaceInvitations: defineTable({
    workspaceId: v.id("workspaces"),
    email: v.string(),
    role: v.union(
      v.literal("editor"),
      v.literal("viewer")
    ),
    invitedBy: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined")
    ),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_email", ["email"])
    .index("by_email_and_status", ["email", "status"]),
});
