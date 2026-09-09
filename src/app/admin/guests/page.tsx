"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Search, MoreVertical, Mail, Phone, Star, Trash2, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function GuestsPage() {
  const guests = useQuery(api.guests?.getGuests || (() => []));
  const deleteGuest = useMutation(api.guests?.deleteGuest || (() => Promise.resolve()));
  const updateGuest = useMutation(api.guests?.updateGuest || (() => Promise.resolve()));
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [editingGuest, setEditingGuest] = useState<any | null>(null);
  const dropdownRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this guest?")) {
      await deleteGuest({ id: id as any });
      setOpenDropdown(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-2">Guest Directory</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-[#c2a27c]">Client Profiles & History</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Search directory..." 
            className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#c2a27c] transition-all text-[#e8e0d4] placeholder:text-white/30"
          />
          <Search className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto dark-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/40">
                <th className="font-mono text-[10px] uppercase tracking-widest text-white/40 py-6 px-8">Guest</th>
                <th className="font-mono text-[10px] uppercase tracking-widest text-white/40 py-6 px-8">Contact</th>
                <th className="font-mono text-[10px] uppercase tracking-widest text-white/40 py-6 px-8">History</th>
                <th className="font-mono text-[10px] uppercase tracking-widest text-white/40 py-6 px-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5" ref={dropdownRef}>
              {guests?.map((guest: any) => (
                <tr key={guest._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-8">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-[#c2a27c] font-serif text-xl group-hover:border-[#c2a27c]/50 transition-colors">
                        {guest.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-serif text-xl text-[#e8e0d4] flex items-center gap-2">
                          {guest.name}
                          {guest.vip && <Star className="w-4 h-4 text-[#c2a27c] fill-[#c2a27c]" />}
                        </p>
                        <p className="font-mono text-[10px] text-white/30 mt-1 uppercase">ID: {guest._id.substring(0, 6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-white/60 font-light">
                        <Mail className="w-4 h-4 text-[#c2a27c]/70" /> {guest.email}
                      </div>
                      {guest.phone && (
                        <div className="flex items-center gap-3 text-sm text-white/60 font-light">
                          <Phone className="w-4 h-4 text-[#c2a27c]/70" /> {guest.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="space-y-2">
                      <p className="text-sm font-light text-white/80"><span className="text-white/40 font-mono text-[10px] uppercase tracking-widest mr-2">Stays</span> {guest.totalStays}</p>
                      <p className="text-sm font-light text-white/80"><span className="text-white/40 font-mono text-[10px] uppercase tracking-widest mr-2">Last</span> {guest.lastVisit ? new Date(guest.lastVisit).toLocaleDateString() : "N/A"}</p>
                    </div>
                  </td>
                  <td className="p-8 text-right relative">
                    <button 
                      onClick={() => setOpenDropdown(openDropdown === guest._id ? null : guest._id)}
                      className="p-2 hover:text-[#c2a27c] transition-colors text-white/30"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {openDropdown === guest._id && (
                      <div className="absolute right-12 top-10 w-40 bg-[#100f0d] border border-white/10 rounded-lg shadow-xl py-2 z-50">
                        <button 
                          onClick={() => {
                            setEditingGuest(guest);
                            setOpenDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-[#e8e0d4] hover:bg-white/5 transition-colors flex items-center gap-2"
                        >
                          <Star className="w-4 h-4 text-white/50" /> Edit Guest
                        </button>
                        <button 
                          onClick={() => handleDelete(guest._id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Guest
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {guests?.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-16 text-center text-white/40 font-light italic">
                    No guests found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Guest Modal */}
      {editingGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <h2 className="font-serif text-2xl text-[#e8e0d4]">Edit Guest</h2>
              <button onClick={() => setEditingGuest(null)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form 
              className="p-6 space-y-6"
              onSubmit={async (e) => {
                e.preventDefault();
                await updateGuest({
                  id: editingGuest._id,
                  name: editingGuest.name,
                  email: editingGuest.email,
                  phone: editingGuest.phone,
                  vip: editingGuest.vip
                });
                setEditingGuest(null);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Guest Name</label>
                  <input required type="text" value={editingGuest.name} onChange={e => setEditingGuest({...editingGuest, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#c2a27c]" />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Email Address</label>
                  <input required type="email" value={editingGuest.email} onChange={e => setEditingGuest({...editingGuest, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#c2a27c]" />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Phone Number</label>
                  <input type="tel" value={editingGuest.phone || ""} onChange={e => setEditingGuest({...editingGuest, phone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#c2a27c]" />
                </div>
                <div className="flex items-center gap-3 mt-6 p-4 border border-white/5 rounded-lg bg-white/[0.02]">
                  <input type="checkbox" id="vipToggle" checked={editingGuest.vip} onChange={e => setEditingGuest({...editingGuest, vip: e.target.checked})} className="w-4 h-4 accent-[#c2a27c] bg-black/40 border-white/10" />
                  <label htmlFor="vipToggle" className="font-serif text-[#e8e0d4] text-lg cursor-pointer">VIP Status</label>
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setEditingGuest(null)} className="px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-3 font-mono text-[10px] uppercase tracking-widest bg-[#c2a27c] text-black font-bold rounded-lg hover:bg-[#d4b693] transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
