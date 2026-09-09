"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Users, Calendar, MessageSquare, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const bookings = useQuery(api.bookings?.getBookings || (() => []));
  const inquiries = useQuery(api.inquiries?.getInquiries || (() => []));
  
  const hostingCount = bookings?.filter((b: any) => b.status === "hosting").length || 0;
  const upcomingCount = bookings?.filter((b: any) => b.status === "upcoming").length || 0;
  const unreadCount = inquiries?.filter((i: any) => i.status === "unread").length || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div>
        <h1 className="font-serif text-4xl md:text-5xl font-light mb-2">Overview</h1>
        <p className="font-mono text-xs uppercase tracking-widest text-[#c2a27c]">System Status</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
         <div className="p-4 md:p-8 border border-white/10 bg-white/[0.02] rounded-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#c2a27c]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 relative z-10">
               <p className="font-mono text-[8px] sm:text-[10px] uppercase tracking-widest text-white/50">Currently Hosting</p>
               <Users className="w-4 h-4 text-[#c2a27c]" />
            </div>
            <p className="font-serif text-3xl md:text-5xl font-light relative z-10">{hostingCount}</p>
         </div>
         <div className="p-4 md:p-8 border border-white/10 bg-white/[0.02] rounded-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#c2a27c]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 relative z-10">
               <p className="font-mono text-[8px] sm:text-[10px] uppercase tracking-widest text-white/50">Upcoming</p>
               <Calendar className="w-4 h-4 text-[#c2a27c]" />
            </div>
            <p className="font-serif text-3xl md:text-5xl font-light relative z-10">{upcomingCount}</p>
         </div>
         <div className="p-4 md:p-8 border border-white/10 bg-white/[0.02] rounded-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#c2a27c]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 relative z-10">
               <p className="font-mono text-[8px] sm:text-[10px] uppercase tracking-widest text-white/50">New Inquiries</p>
               <MessageSquare className="w-4 h-4 text-[#c2a27c]" />
            </div>
            <p className="font-serif text-3xl md:text-5xl font-light relative z-10">{unreadCount}</p>
         </div>
         <div className="p-4 md:p-8 border border-white/10 bg-white/[0.02] rounded-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#c2a27c]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 relative z-10">
               <p className="font-mono text-[8px] sm:text-[10px] uppercase tracking-widest text-white/50">Total Bookings</p>
               <TrendingUp className="w-4 h-4 text-[#c2a27c]" />
            </div>
            <p className="font-serif text-3xl md:text-5xl font-light relative z-10">{bookings?.length || 0}</p>
         </div>
      </div>
      
      {/* Recent Activity */}
      <div className="mt-12 bg-white/[0.01] border border-white/5 rounded-xl">
        <div className="p-6 border-b border-white/10">
          <h2 className="font-serif text-2xl font-light">Recent Inquiries</h2>
        </div>
        <div className="divide-y divide-white/5">
          {inquiries?.slice(0, 5).map((inq: any) => (
            <div key={inq._id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start gap-4">
                <div className={`w-2 h-2 rounded-full mt-2 ${inq.status === 'unread' ? 'bg-[#c2a27c] animate-pulse shadow-[0_0_8px_rgba(194,162,124,0.6)]' : 'bg-white/20'}`} />
                <div>
                  <p className="font-serif text-xl">{inq.name} <span className="text-white/40 font-sans text-sm ml-2">&lt;{inq.email}&gt;</span></p>
                  <p className="text-sm text-white/60 mt-1 font-light">{inq.subject}</p>
                </div>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">
                {new Date(inq.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
          {inquiries?.length === 0 && (
            <div className="p-12 text-center text-white/40 font-light">No inquiries yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
