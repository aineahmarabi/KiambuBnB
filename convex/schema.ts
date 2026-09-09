import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  bookings: defineTable({
    bookingId: v.optional(v.string()),
    guestName: v.string(),
    email: v.string(),
    adults: v.number(),
    children: v.number(),
    checkIn: v.number(), // stored as timestamp
    checkOut: v.number(), // stored as timestamp
    status: v.string(), // "hosting", "upcoming", "past", "cancelled"
    specialRequests: v.optional(v.string()),
    totalPrice: v.optional(v.number()),
    bookingType: v.optional(v.string()), // "stay" or "event"
    eventType: v.optional(v.string()), // e.g. "Wedding", "Party"
    eventGuests: v.optional(v.number()), // For events only
  }),
  guests: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    totalStays: v.number(),
    lastVisit: v.optional(v.number()), // timestamp
    vip: v.boolean(),
  }),
  inquiries: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    status: v.string(), // "unread", "read"
    createdAt: v.number(),
  }),
  settings: defineTable({
    key: v.string(), // "global"
    propertyName: v.optional(v.string()),
    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    email: v.optional(v.string()),
    instagram: v.optional(v.string()),
    facebook: v.optional(v.string()),
    tiktok: v.optional(v.string()),
    adminPasscode: v.optional(v.string()),
    failedAttempts: v.optional(v.number()),
    lockoutUntil: v.optional(v.number()),
    acceptingBookings: v.boolean(),
    maintenanceMode: v.boolean(),
    basePricePerNight: v.optional(v.number()),
  }),
});
