import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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
    
    // Find any overlapping bookings (with 30-minute cleaning buffer)
    const BUFFER_MS = 30 * 60 * 1000;
    const overlapping = bookings.filter((b) => 
      b.status !== "cancelled" && 
      b.checkIn < (args.checkOut + BUFFER_MS) && 
      (b.checkOut + BUFFER_MS) > args.checkIn
    );

    if (overlapping.length > 0) {
      // Basic suggestion logic: find next available 3-day gap
      const duration = args.checkOut - args.checkIn;
      let nextAvailableStart = args.checkIn + (24 * 60 * 60 * 1000); // Check tomorrow
      
      while (true) {
        const nextAvailableEnd = nextAvailableStart + duration;
        const stillOverlapping = bookings.filter((b) => 
          b.status !== "cancelled" && 
          b.checkIn < (nextAvailableEnd + BUFFER_MS) && 
          (b.checkOut + BUFFER_MS) > nextAvailableStart
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
    // PRE-CHECK: Prevent overlapping bookings (with 30-minute buffer)
    const BUFFER_MS = 30 * 60 * 1000;
    const allBookings = await ctx.db.query("bookings").collect();
    const overlapping = allBookings.filter((b) => 
      b.status !== "cancelled" && 
      b.checkIn < (args.checkOut + BUFFER_MS) && 
      (b.checkOut + BUFFER_MS) > args.checkIn
    );

    if (overlapping.length > 0) {
      throw new Error("Dates unavailable");
    }

    // New bookings are unconditionally marked as upcoming and pending until admin confirms payment
    let status = "upcoming";
    const paymentStatus = "pending";

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
      paymentStatus,
      bookingId: bookingIdString,
    });

    // Schedule the booking received email
    await ctx.scheduler.runAfter(0, api.emails.sendBookingReceivedEmail, {
      guestName: args.guestName,
      email: args.email,
      checkIn: args.checkIn,
      checkOut: args.checkOut,
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

export const confirmPayment = mutation({
  args: { 
    id: v.id("bookings") 
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.id);
    if (!booking) throw new Error("Booking not found");

    // Promote to hosting if dates match today
    const now = Date.now();
    let newStatus = booking.status;
    if (booking.checkIn <= now && booking.checkOut >= now) {
      newStatus = "hosting";
    }

    await ctx.db.patch(args.id, {
      paymentStatus: "confirmed",
      status: newStatus,
    });

    // Schedule the payment confirmed email
    await ctx.scheduler.runAfter(0, api.emails.sendPaymentConfirmedEmail, {
      guestName: booking.guestName,
      email: booking.email,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
    });
  },
});
