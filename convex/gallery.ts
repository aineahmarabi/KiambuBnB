import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate an upload URL for the admin to post files to
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Save the uploaded image metadata to the database
export const saveImage = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
      throw new Error("Failed to get URL for storage ID");
    }
    
    await ctx.db.insert("galleryImages", {
      storageId: args.storageId,
      url,
      createdAt: Date.now(),
    });
  },
});

// Get all gallery images sorted by newest first
export const getImages = query({
  handler: async (ctx) => {
    const images = await ctx.db.query("galleryImages").order("desc").collect();
    return images;
  },
});

// Delete an image from both the database and storage
export const deleteImage = mutation({
  args: { id: v.id("galleryImages"), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
    await ctx.db.delete(args.id);
  },
});
