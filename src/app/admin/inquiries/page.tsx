"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Mail, Send, Trash2 } from "lucide-react";

export default function InquiriesPage() {
  const inquiries = useQuery(api.inquiries?.getInquiries || (() => []));
  const markAsRead = useMutation(api.inquiries?.markAsRead || (() => Promise.resolve()));
  
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedInquiry = inquiries?.find((i: any) => i._id === selectedId) || inquiries?.[0];

  const handleMarkRead = async (id: string) => {
    await markAsRead({ id: id as any });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="font-serif text-4xl md:text-5xl font-light mb-2">Inquiries</h1>
        <p className="font-mono text-xs uppercase tracking-widest text-[#c2a27c]">Communications Inbox</p>
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden flex flex-col md:flex-row flex-1 min-h-0">
        
        {/* Inbox Sidebar */}
        <div className="w-full md:w-[400px] border-r border-white/10 flex flex-col bg-black/20">
          <div className="p-6 border-b border-white/10 bg-black/40">
            <h3 className="font-serif text-xl">Inbox</h3>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#c2a27c] mt-2">{inquiries?.filter((i:any)=>i.status==='unread').length || 0} Unread Messages</p>
          </div>
          <div className="flex-1 overflow-y-auto dark-scrollbar">
            {inquiries?.map((msg: any) => (
              <button 
                key={msg._id}
                onClick={() => {
                  setSelectedId(msg._id);
                  if (msg.status === "unread") handleMarkRead(msg._id);
                }}
                className={`w-full text-left p-6 border-b border-white/5 hover:bg-white/5 transition-colors relative ${
                  (selectedId ? selectedId === msg._id : inquiries[0]?._id === msg._id) 
                    ? "bg-[#c2a27c]/10" 
                    : "bg-transparent"
                }`}
              >
                {msg.status === "unread" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#c2a27c]" />}
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-serif text-lg ${msg.status === "unread" ? "text-[#e8e0d4]" : "text-white/60"}`}>
                    {msg.name}
                  </span>
                  <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest mt-1">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className={`text-sm mb-2 truncate ${msg.status === "unread" ? "text-white font-medium" : "text-white/50 font-light"}`}>
                  {msg.subject}
                </p>
                <p className="text-xs text-white/40 truncate font-light">{msg.message}</p>
              </button>
            ))}
            {inquiries?.length === 0 && (
              <div className="p-12 text-center text-sm text-white/30 font-light italic">No messages found.</div>
            )}
          </div>
        </div>

        {/* Message Detail View */}
        {selectedInquiry ? (
          <div className="flex-1 flex flex-col bg-black/10">
            <div className="p-8 md:p-12 border-b border-white/10 flex justify-between items-start">
               <div>
                  <h2 className="font-serif text-3xl md:text-4xl text-[#e8e0d4] mb-4">{selectedInquiry.subject}</h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm font-light text-white/60">
                    <span className="text-[#c2a27c] font-medium">{selectedInquiry.name}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="font-mono text-xs">{selectedInquiry.email}</span>
                  </div>
               </div>
               <div className="flex gap-2">
                 <button className="p-3 hover:bg-white/5 text-white/40 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-400/20" title="Delete">
                   <Trash2 className="w-5 h-5" />
                 </button>
               </div>
            </div>
            <div className="p-8 md:p-12 flex-1 overflow-y-auto dark-scrollbar">
               <div className="prose prose-invert max-w-none">
                  <p className="text-white/70 leading-loose whitespace-pre-wrap font-light text-lg">
                    {selectedInquiry.message}
                  </p>
               </div>
            </div>
            <div className="p-8 border-t border-white/10 bg-black/40">
               <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4 focus-within:border-[#c2a27c]/50 transition-colors">
                  <Mail className="w-5 h-5 text-white/30 shrink-0 mt-1" />
                  <textarea 
                    placeholder="Draft your reply..." 
                    className="w-full bg-transparent resize-none h-32 focus:outline-none text-sm text-white font-light placeholder:text-white/30"
                  ></textarea>
               </div>
               <div className="flex justify-end mt-6">
                 <button className="relative group inline-flex items-center justify-center px-8 py-4 cursor-pointer">
                   <div className="absolute inset-0 bg-[#c2a27c] skew-x-[-15deg] transition-transform duration-500 group-hover:scale-105"></div>
                   <span className="relative z-10 text-black font-mono uppercase tracking-[0.2em] text-[10px] font-bold flex items-center gap-2">
                     <Send className="w-4 h-4" /> Send Reply
                   </span>
                 </button>
               </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/20 bg-black/10">
            <Mail className="w-16 h-16 mb-6 opacity-20" strokeWidth={1} />
            <p className="font-light font-serif text-2xl text-white/30">Select an inquiry to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
