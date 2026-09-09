import { mutation } from "./_generated/server";

export const all = mutation({
  args: {},
  handler: async (ctx) => {
    const bookings = await ctx.db.query("bookings").collect();
    for (const b of bookings) await ctx.db.delete(b._id);
    
    const guests = await ctx.db.query("guests").collect();
    for (const g of guests) await ctx.db.delete(g._id);
    
    const inquiries = await ctx.db.query("inquiries").collect();
    for (const i of inquiries) await ctx.db.delete(i._id);
  },
});
