import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSettings = query({
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("settings")
      .filter((q) => q.eq(q.field("key"), "global"))
      .first();
      
    // Return default settings if none exist yet
    if (!settings) {
      return {
        propertyName: "The Kiambu BnB",
        phone: "+254 712 345 678",
        whatsapp: "+254 712 345 678",
        email: "bookings@thekiambubnb.com",
        instagram: "",
        facebook: "",
        tiktok: "",
        failedAttempts: 0,
        lockoutUntil: 0,
        acceptingBookings: true,
        maintenanceMode: false,
        basePricePerNight: 100, // default price
      };
    }
    
    // NEVER return the passcode to the client for security
    const { adminPasscode, ...safeSettings } = settings as any;
    return safeSettings;
  },
});

export const updateSettings = mutation({
  args: {
    propertyName: v.optional(v.string()),
    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    email: v.optional(v.string()),
    instagram: v.optional(v.string()),
    facebook: v.optional(v.string()),
    tiktok: v.optional(v.string()),
    adminPasscode: v.optional(v.string()),
    acceptingBookings: v.boolean(),
    maintenanceMode: v.boolean(),
    basePricePerNight: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .filter((q) => q.eq(q.field("key"), "global"))
      .first();

    const { adminPasscode, ...restArgs } = args;
    const patchData: any = { ...restArgs };
    
    // Only update passcode if a new one is explicitly provided
    if (adminPasscode && adminPasscode.trim() !== "") {
      patchData.adminPasscode = adminPasscode;
    }

    if (existing) {
      await ctx.db.patch(existing._id, patchData);
    } else {
      await ctx.db.insert("settings", { key: "global", ...patchData });
    }
  },
});

export const verifyPasscode = mutation({
  args: { passcode: v.string() },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("settings")
      .filter((q) => q.eq(q.field("key"), "global"))
      .first();
      
    if (!settings) {
      if (args.passcode === (process.env.ADMIN_PASSCODE || "14328")) {
        return { success: true, message: "Access granted (Default)" };
      }
      return { success: false, message: "Incorrect passcode." };
    }

    const now = Date.now();
    const lockoutUntil = settings.lockoutUntil || 0;
    
    if (now < lockoutUntil) {
      const remainingMinutes = Math.ceil((lockoutUntil - now) / (60 * 1000));
      return { success: false, message: `System locked. Try again in ${remainingMinutes} minutes.` };
    }
    
    const correctPasscode = settings.adminPasscode || process.env.ADMIN_PASSCODE || "14328";
    
    if (args.passcode === correctPasscode) {
      await ctx.db.patch(settings._id, { failedAttempts: 0, lockoutUntil: 0 });
      return { success: true, message: "Access granted" };
    } else {
      const newFailedAttempts = (settings.failedAttempts || 0) + 1;
      let newLockoutUntil = 0;
      
      if (newFailedAttempts >= 5) {
        newLockoutUntil = now + 10 * 60 * 1000; // 10 minutes
      }
      
      await ctx.db.patch(settings._id, { 
        failedAttempts: newFailedAttempts, 
        lockoutUntil: newLockoutUntil 
      });
      
      return { success: false, message: newFailedAttempts >= 5 ? "System locked for 10 minutes." : `Incorrect passcode. ${5 - newFailedAttempts} attempts remaining.` };
    }
  },
});
