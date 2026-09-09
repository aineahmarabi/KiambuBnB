"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import nodemailer from "nodemailer";

export const sendBookingReceivedEmail = action({
  args: {
    guestName: v.string(),
    email: v.string(),
    checkIn: v.number(),
    checkOut: v.number(),
  },
  handler: async (ctx, args) => {
    if (!process.env.SMTP_PASSWORD) {
      console.warn("SMTP_PASSWORD not set, skipping email.");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "patkui14@gmail.com",
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const checkInStr = new Date(args.checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const checkOutStr = new Date(args.checkOut).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    const mailOptions = {
      from: '"Ficus & Figs" <patkui14@gmail.com>',
      to: args.email,
      subject: "Booking Request Received!",
      text: `Dear ${args.guestName},\n\nWe have received your booking request for Ficus & Figs.\n\nDates: ${checkInStr} to ${checkOutStr}\nStatus: Pending Payment\n\nTo secure your dates, please complete your payment using the M-PESA or Equity Bank details provided during checkout.\n\nWe will send a final confirmation email once your payment is verified. Reply to this email if you need assistance.\n\nWarm regards,\nFicus & Figs`,
    };

    await transporter.sendMail(mailOptions);
  },
});

export const sendPaymentConfirmedEmail = action({
  args: {
    guestName: v.string(),
    email: v.string(),
    checkIn: v.number(),
    checkOut: v.number(),
  },
  handler: async (ctx, args) => {
    if (!process.env.SMTP_PASSWORD) {
      console.warn("SMTP_PASSWORD not set, skipping email.");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "patkui14@gmail.com",
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const checkInStr = new Date(args.checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const checkOutStr = new Date(args.checkOut).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    const mailOptions = {
      from: '"Ficus & Figs" <patkui14@gmail.com>',
      to: args.email,
      subject: "Payment Confirmed - Booking Secured!",
      text: `Dear ${args.guestName},\n\nYour payment has been successfully verified!\n\nDates: ${checkInStr} to ${checkOutStr}\nStatus: Confirmed\n\nYour reservation at Ficus & Figs is now fully secured. We will be in touch closer to your arrival date with any final details.\n\nWe look forward to hosting you.\n\nWarm regards,\nFicus & Figs`,
    };

    await transporter.sendMail(mailOptions);
  },
});
