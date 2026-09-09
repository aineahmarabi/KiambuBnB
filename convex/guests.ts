import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getGuests = query({
  handler: async (ctx) => {
    return await ctx.db.query("guests").order("desc").collect();
  },
});

export const deleteGuest = mutation({
  args: { id: v.id("guests") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
export const updateGuest = mutation({
  args: {
    id: v.id("guests"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    vip: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});
