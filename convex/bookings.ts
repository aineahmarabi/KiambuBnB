import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getBookings = query({
  handler: async (ctx) => {
    return await ctx.db.query("bookings").collect();
  },
});

export const checkAvailability = query({
  args: {
    checkIn: v.number(),
    checkOut: v.number(),
  },
  handler: async (ctx, args) => {
    const bookings = await ctx.db.query("bookings").collect();
    
    // Find any overlapping bookings
    const overlapping = bookings.filter((b) => 
      b.status !== "cancelled" && 
      b.checkIn < args.checkOut && 
      b.checkOut > args.checkIn
    );

    if (overlapping.length > 0) {
      // Basic suggestion logic: find next available 3-day gap
      const duration = args.checkOut - args.checkIn;
      let nextAvailableStart = args.checkIn + (24 * 60 * 60 * 1000); // Check tomorrow
      
      while (true) {
        const nextAvailableEnd = nextAvailableStart + duration;
        const stillOverlapping = bookings.filter((b) => 
          b.status !== "cancelled" && 
          b.checkIn < nextAvailableEnd && 
          b.checkOut > nextAvailableStart
        );
        
        if (stillOverlapping.length === 0) {
          return { available: false, suggestedArrival: nextAvailableStart, suggestedDeparture: nextAvailableEnd };
        }
        nextAvailableStart += (24 * 60 * 60 * 1000);
      }
    }

    return { available: true };
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
    bookingType: v.optional(v.string()),
    eventType: v.optional(v.string()),
    eventGuests: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // PRE-CHECK: Prevent overlapping bookings
    const allBookings = await ctx.db.query("bookings").collect();
    const overlapping = allBookings.filter((b) => 
      b.status !== "cancelled" && 
      b.checkIn < args.checkOut && 
      b.checkOut > args.checkIn
    );

    if (overlapping.length > 0) {
      throw new Error("Dates unavailable");
    }

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
