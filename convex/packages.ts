import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getPackages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("packages").collect();
  },
});

export const createPackage = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    description: v.string(),
    priceKES: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("packages", args);
  },
});

export const updatePackage = mutation({
  args: {
    id: v.id("packages"),
    title: v.string(),
    category: v.string(),
    description: v.string(),
    priceKES: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    return await ctx.db.patch(id, rest);
  },
});

export const deletePackage = mutation({
  args: { id: v.id("packages") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const seedPackages = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("packages").collect();
    if (existing.length > 0) return "Already seeded";
    
    const initialPackages = [
      { title: "Ruracio", category: "Bridal Pick-Up Home", description: "House Hiring + Grounds", priceKES: 100000, isActive: true },
      { title: "Bridal Pick Up", category: "Bridal Pick-Up Home", description: "House Hiring + Photoshoot", priceKES: 100000, isActive: true },
      { title: "Extended Bridal", category: "Bridal Pick-Up Home", description: "House Hiring + Separate Day", priceKES: 150000, isActive: true },
      { title: "Micro", category: "Event Venue Rental", description: "0-10 Pax", priceKES: 20000, isActive: true },
      { title: "Intimate", category: "Event Venue Rental", description: "10-30 Pax", priceKES: 50000, isActive: true },
      { title: "Standard", category: "Event Venue Rental", description: "30-50 Pax", priceKES: 80000, isActive: true },
      { title: "Grand", category: "Event Venue Rental", description: "50-70 Pax", priceKES: 100000, isActive: true },
      { title: "Premium", category: "Event Venue Rental", description: "Up to 100 Pax", priceKES: 130000, isActive: true }
    ];
    
    for (const pkg of initialPackages) {
      await ctx.db.insert("packages", pkg);
    }
    return "Seeded";
  }
});
