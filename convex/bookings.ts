import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getBookings = query({
  handler: async (ctx) => {
    return await ctx.db.query("bookings").collect();
  },
});

export const createBooking = mutation({
  args: {
    guestName: v.string(),
    email: v.string(),
    adults: v.number(),
    children: v.number(),
    checkIn: v.number(),
    checkOut: v.number(),
    specialRequests: v.optional(v.string()),
    totalPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Determine status (if checkIn is today or past but checkout is future -> hosting, else upcoming)
    const now = Date.now();
    let status = "upcoming";
    if (args.checkIn <= now && args.checkOut >= now) {
      status = "hosting";
    }

    // Generate custom booking ID
    const recentBooking = await ctx.db.query("bookings").order("desc").first();
    let nextIdNumber = 1;
    if (recentBooking && recentBooking.bookingId && recentBooking.bookingId.startsWith("BnB-")) {
      const parts = recentBooking.bookingId.split("-");
      if (parts.length === 2 && !isNaN(parseInt(parts[1]))) {
        nextIdNumber = parseInt(parts[1]) + 1;
      }
    }
    const bookingIdString = `BnB-${nextIdNumber.toString().padStart(3, "0")}`;

    const bookingId = await ctx.db.insert("bookings", {
      ...args,
      status,
      bookingId: bookingIdString,
    });

    // Handle guest profile creation/update
    const existingGuest = await ctx.db
      .query("guests")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingGuest) {
      await ctx.db.patch(existingGuest._id, {
        totalStays: existingGuest.totalStays + 1,
        lastVisit: args.checkIn,
      });
    } else {
      await ctx.db.insert("guests", {
        name: args.guestName,
        email: args.email,
        totalStays: 1,
        lastVisit: args.checkIn,
        vip: false,
      });
    }

    return bookingId;
  },
});

export const deleteBooking = mutation({
  args: { id: v.id("bookings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateBookingStatus = mutation({
  args: { 
    id: v.id("bookings"), 
    status: v.string(),
    checkOut: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const patchData: any = { status: args.status };
    if (args.checkOut !== undefined) {
      patchData.checkOut = args.checkOut;
    }
    await ctx.db.patch(args.id, patchData);
  },
});
