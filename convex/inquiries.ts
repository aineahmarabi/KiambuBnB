import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getInquiries = query({
  handler: async (ctx) => {
    return await ctx.db.query("inquiries").order("desc").collect();
  },
});

export const submitInquiry = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("inquiries", {
      ...args,
      status: "unread",
      createdAt: Date.now(),
    });
  },
});

export const markAsRead = mutation({
  args: { id: v.id("inquiries") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "read" });
  },
});
