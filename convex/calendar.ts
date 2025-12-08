import { v } from "convex/values";
import { authenticatedMutation, authenticatedQuery } from "./auth";
import { Doc, Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";
import { checkWorkspaceAccess } from "./workspaces";

// Get calendar events for a workspace
export const getEvents = authenticatedQuery({
  args: {
    workspaceId: v.id("workspaces"),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await checkWorkspaceAccess(ctx, args.workspaceId, ctx.user._id);

    let query = ctx.db
      .query("calendarEvents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));

    const events = await query.collect();

    // Filter by date range if provided
    let filteredEvents = events;
    if (args.startDate) {
      filteredEvents = filteredEvents.filter((e) => e.date >= args.startDate!);
    }
    if (args.endDate) {
      filteredEvents = filteredEvents.filter((e) => e.date <= args.endDate!);
    }

    // Sort by date
    filteredEvents.sort((a, b) => a.date.localeCompare(b.date));

    return filteredEvents;
  },
});

// Get a single event
export const getEvent = authenticatedQuery({
  args: { eventId: v.id("calendarEvents") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    await checkWorkspaceAccess(ctx, event.workspaceId, ctx.user._id);
    return event;
  },
});

// Create a calendar event
export const createEvent = authenticatedMutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(),
    time: v.optional(v.string()),
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
    contentType: v.string(),
  },
  handler: async (ctx, args) => {
    const { role } = await checkWorkspaceAccess(
      ctx,
      args.workspaceId,
      ctx.user._id
    );

    if (role === "viewer") {
      throw new ConvexError("You don't have permission to create events");
    }

    const now = Date.now();

    const eventId = await ctx.db.insert("calendarEvents", {
      workspaceId: args.workspaceId,
      title: args.title,
      description: args.description,
      date: args.date,
      time: args.time,
      funnelStage: args.funnelStage,
      status: args.status,
      contentType: args.contentType,
      createdBy: ctx.user._id,
      createdAt: now,
      updatedAt: now,
    });

    return eventId;
  },
});

// Update a calendar event
export const updateEvent = authenticatedMutation({
  args: {
    eventId: v.id("calendarEvents"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    funnelStage: v.optional(
      v.union(v.literal("tofu"), v.literal("mofu"), v.literal("bofu"))
    ),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("scheduled"), v.literal("published"))
    ),
    contentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    const { role } = await checkWorkspaceAccess(
      ctx,
      event.workspaceId,
      ctx.user._id
    );

    if (role === "viewer") {
      throw new ConvexError("You don't have permission to edit events");
    }

    const updates: Partial<Doc<"calendarEvents">> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.date !== undefined) updates.date = args.date;
    if (args.time !== undefined) updates.time = args.time;
    if (args.funnelStage !== undefined) updates.funnelStage = args.funnelStage;
    if (args.status !== undefined) updates.status = args.status;
    if (args.contentType !== undefined) updates.contentType = args.contentType;

    await ctx.db.patch(args.eventId, updates);
    return null;
  },
});

// Delete a calendar event
export const deleteEvent = authenticatedMutation({
  args: { eventId: v.id("calendarEvents") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    const { role } = await checkWorkspaceAccess(
      ctx,
      event.workspaceId,
      ctx.user._id
    );

    if (role === "viewer") {
      throw new ConvexError("You don't have permission to delete events");
    }

    await ctx.db.delete(args.eventId);
    return null;
  },
});

// Bulk create events (for AI-generated content)
export const bulkCreateEvents = authenticatedMutation({
  args: {
    workspaceId: v.id("workspaces"),
    events: v.array(
      v.object({
        title: v.string(),
        description: v.optional(v.string()),
        date: v.string(),
        time: v.optional(v.string()),
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
        contentType: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { role } = await checkWorkspaceAccess(
      ctx,
      args.workspaceId,
      ctx.user._id
    );

    if (role === "viewer") {
      throw new ConvexError("You don't have permission to create events");
    }

    const now = Date.now();
    const createdIds: Id<"calendarEvents">[] = [];

    for (const event of args.events) {
      const eventId = await ctx.db.insert("calendarEvents", {
        workspaceId: args.workspaceId,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        funnelStage: event.funnelStage,
        status: event.status,
        contentType: event.contentType,
        createdBy: ctx.user._id,
        createdAt: now,
        updatedAt: now,
      });
      createdIds.push(eventId);
    }

    return createdIds;
  },
});

// Get events by funnel stage
export const getEventsByFunnelStage = authenticatedQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await checkWorkspaceAccess(ctx, args.workspaceId, ctx.user._id);

    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const tofu = events.filter((e) => e.funnelStage === "tofu");
    const mofu = events.filter((e) => e.funnelStage === "mofu");
    const bofu = events.filter((e) => e.funnelStage === "bofu");

    return { tofu, mofu, bofu };
  },
});
