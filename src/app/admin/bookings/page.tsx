"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { format } from "date-fns";
import { Clock, MapPin, Plus, X, MoreVertical, Trash2, XCircle, LogOut, CheckCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function BookingsPage() {
  const bookings = useQuery(api.bookings?.getBookings || (() => []));
  const settings = useQuery(api.settings?.getSettings || (() => null));
  
  // Dynamically classify active bookings based on current time
  const now = Date.now();
  const activeBookings = bookings?.filter((b: any) => b.status !== "cancelled" && b.status !== "past") || [];
  
  const hosting = activeBookings.filter((b: any) => b.status === "hosting");
  const upcoming = activeBookings.filter((b: any) => b.status === "upcoming");

  const createBooking = useMutation(api.bookings?.createBooking || (() => Promise.resolve()));
  const confirmPayment = useMutation(api.bookings?.confirmPayment || (() => Promise.resolve()));
  const deleteBooking = useMutation(api.bookings?.deleteBooking || (() => Promise.resolve()));
  const updateBookingStatus = useMutation(api.bookings?.updateBookingStatus || (() => Promise.resolve()));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    guestName: "",
    email: "",
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    specialRequests: "",
    totalPrice: 0,
    bookingType: "stay", // "stay" or "event"
    eventType: "Wedding",
    eventGuests: 50,
  });
  
  // Auto-calculate price when dates change
  useEffect(() => {
    if (formData.checkIn && formData.checkOut && settings?.basePricePerNight) {
      const inTime = new Date(formData.checkIn).getTime();
      const outTime = new Date(formData.checkOut).getTime();
      if (outTime > inTime) {
        const nights = Math.round((outTime - inTime) / (1000 * 60 * 60 * 24));
        setFormData(prev => ({ ...prev, totalPrice: nights * settings.basePricePerNight }));
      }
    }
  }, [formData.checkIn, formData.checkOut, settings?.basePricePerNight]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-24 relative">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-2">Bookings Ledger</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-[#c2a27c]">Chronological Management</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="relative group inline-flex items-center justify-center px-6 py-3 cursor-pointer self-start"
        >
          <div className="absolute inset-0 bg-[#c2a27c] skew-x-[-15deg] transition-transform duration-500 group-hover:scale-105"></div>
          <span className="relative z-10 text-black font-mono uppercase tracking-widest text-[10px] font-bold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Booking
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {/* Currently Hosting Section */}
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <h2 className="font-serif text-2xl font-light">Currently Hosting</h2>
          </div>
          <div className="space-y-4">
            {hosting.map((booking: any) => (
              <BookingCard 
                key={booking._id} 
                booking={booking} 
                onDelete={(id) => deleteBooking({ id: id as any })} 
                onUpdateStatus={(id, status, checkOut) => updateBookingStatus({ id: id as any, status, checkOut })}
                onConfirmPayment={(id) => confirmPayment({ id: id as any })}
              />
            ))}
            {hosting.length === 0 && (
              <p className="text-white/40 italic font-light">No guests currently staying.</p>
            )}
          </div>
        </section>

        {/* Upcoming Arrivals Section */}
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <Clock className="w-5 h-5 text-[#c2a27c]" />
            <h2 className="font-serif text-2xl font-light">Upcoming Arrivals</h2>
          </div>
          <div className="space-y-4">
            {upcoming.map((booking: any) => (
              <BookingCard 
                key={booking._id} 
                booking={booking} 
                onDelete={(id) => deleteBooking({ id: id as any })} 
                onUpdateStatus={(id, status, checkOut) => updateBookingStatus({ id: id as any, status, checkOut })}
                onConfirmPayment={(id) => confirmPayment({ id: id as any })}
              />
            ))}
            {upcoming.length === 0 && (
              <p className="text-white/40 italic font-light">No upcoming arrivals.</p>
            )}
          </div>
        </section>
      </div>

      {/* Add Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <h2 className="font-serif text-2xl text-[#e8e0d4]">Manual Entry</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form 
              className="p-6 space-y-6 max-h-[70vh] overflow-y-auto dark-scrollbar"
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                try {
                  await createBooking({
                    guestName: formData.guestName,
                    email: formData.email,
                    checkIn: new Date(formData.checkIn).getTime(),
                    checkOut: new Date(formData.checkOut).getTime(),
                    adults: formData.bookingType === "stay" ? formData.adults : 0,
                    children: formData.bookingType === "stay" ? formData.children : 0,
                    specialRequests: formData.specialRequests || undefined,
                    totalPrice: formData.totalPrice || undefined,
                    bookingType: formData.bookingType,
                    eventType: formData.bookingType === "event" ? formData.eventType : undefined,
                    eventGuests: formData.bookingType === "event" ? formData.eventGuests : undefined,
                  });
                  setIsModalOpen(false);
                  setFormData({ guestName: "", email: "", checkIn: "", checkOut: "", adults: 1, children: 0, specialRequests: "", totalPrice: 0, bookingType: "stay", eventType: "Wedding", eventGuests: 50 });
                } catch (err) {
                  console.error(err);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <div className="flex gap-4 border-b border-white/10 pb-6 mb-6">
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, bookingType: "stay"})}
                  className={`flex-1 py-3 text-sm font-mono tracking-widest uppercase transition-colors ${formData.bookingType === "stay" ? "bg-white/10 text-[#c2a27c]" : "bg-black/40 text-white/40 hover:text-white"}`}
                >
                  Book your stay
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, bookingType: "event"})}
                  className={`flex-1 py-3 text-sm font-mono tracking-widest uppercase transition-colors ${formData.bookingType === "event" ? "bg-white/10 text-[#c2a27c]" : "bg-black/40 text-white/40 hover:text-white"}`}
                >
                  Host an Event
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Guest Name</label>
                  <input required type="text" value={formData.guestName} onChange={e => setFormData({...formData, guestName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#c2a27c]" />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Guest Email (or Phone)</label>
                  <input required type="text" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#c2a27c]" />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Check In Date</label>
                  <input required type="date" value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#c2a27c]" />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Check Out Date</label>
                  <input required type="date" value={formData.checkOut} onChange={e => setFormData({...formData, checkOut: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#c2a27c]" />
                </div>
                {formData.bookingType === "stay" ? (
                  <>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Adults</label>
                      <input required type="number" min="1" value={formData.adults || ""} onChange={e => setFormData({...formData, adults: parseInt(e.target.value) || 1})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#c2a27c]" />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Children</label>
                      <input required type="number" min="0" value={formData.children ?? ""} onChange={e => setFormData({...formData, children: parseInt(e.target.value) || 0})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#c2a27c]" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-[#c2a27c] mb-2">Event Type</label>
                      <select value={formData.eventType} onChange={e => setFormData({...formData, eventType: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-[#c2a27c] focus:outline-none focus:border-[#c2a27c] appearance-none">
                        <option value="Wedding">Wedding</option>
                        <option value="Party">Private Party</option>
                        <option value="Corporate">Corporate Retreat</option>
                        <option value="Picnic">Picnic / Gathering</option>
                        <option value="Other">Other Event</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Estimated Guests</label>
                      <input required type="number" min="1" value={formData.eventGuests} onChange={e => setFormData({...formData, eventGuests: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#c2a27c]" />
                    </div>
                  </>
                )}
                <div className="md:col-span-2">
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-[#c2a27c] mb-2">Total Price (USD / KES)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c2a27c] font-mono">$</span>
                    <input type="number" required value={formData.totalPrice} onChange={e=>setFormData({...formData, totalPrice: Number(e.target.value)})} className="w-full pl-8 pr-4 py-3 bg-black/60 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#c2a27c]" />
                  </div>
                  <p className="text-[10px] text-white/30 mt-2 font-light">Auto-calculated based on <span className="text-white/60">${settings?.basePricePerNight}/night</span> (≈ KES {((settings?.basePricePerNight || 0) * 130).toLocaleString()}), but you can override this value. Total ≈ KES {(formData.totalPrice * 130).toLocaleString()}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Notes / Special Requests (Optional)</label>
                  <textarea value={formData.specialRequests} onChange={e => setFormData({...formData, specialRequests: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#c2a27c] h-24 resize-none"></textarea>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="bg-[#c2a27c] hover:bg-[#d4b48f] text-black font-mono text-xs uppercase tracking-widest font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Save Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking, onDelete, onUpdateStatus, onConfirmPayment }: { booking: any, onDelete: (id: string) => void, onUpdateStatus: (id: string, status: string, checkOut?: number) => void, onConfirmPayment: (id: string) => void }) {
  const duration = Math.round((booking.checkOut - booking.checkIn) / (1000 * 60 * 60 * 24));
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 lg:p-8 flex flex-col lg:flex-row xl:flex-col 2xl:flex-row justify-between gap-8 hover:border-[#c2a27c]/50 transition-colors group relative">
      
      {/* Date Block */}
      <div className="flex items-center gap-6 lg:min-w-[280px] xl:min-w-0 2xl:min-w-[280px]">
        <div className="text-center bg-black/40 px-6 py-4 rounded-lg border border-white/5">
          <p className="font-mono text-[10px] text-[#c2a27c] uppercase tracking-widest mb-1">Check In</p>
          <p className="font-serif text-3xl">{format(new Date(booking.checkIn), "dd")}</p>
          <p className="text-xs text-white/50">{format(new Date(booking.checkIn), "MMM yyyy")}</p>
          <p className="font-mono text-[10px] text-[#c2a27c]/70 mt-1">{format(new Date(booking.checkIn), "h:mm a")}</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="h-[1px] w-8 bg-white/20"></div>
          <span className="text-[10px] text-white/40 mt-2 font-mono">{duration} Nights</span>
        </div>
        <div className="text-center bg-black/40 px-6 py-4 rounded-lg border border-white/5 opacity-70 group-hover:opacity-100 transition-opacity">
          <p className="font-mono text-[10px] text-[#c2a27c] uppercase tracking-widest mb-1">Check Out</p>
          <p className="font-serif text-3xl">{format(new Date(booking.checkOut), "dd")}</p>
          <p className="text-xs text-white/50">{format(new Date(booking.checkOut), "MMM yyyy")}</p>
          <p className="font-mono text-[10px] text-[#c2a27c]/70 mt-1">{format(new Date(booking.checkOut), "h:mm a")}</p>
        </div>
      </div>

      {/* Details Block */}
      <div className="flex-1 flex flex-col justify-center border-t lg:border-t-0 xl:border-t xl:border-l-0 2xl:border-t-0 lg:border-l 2xl:border-l border-white/10 pt-6 lg:pt-0 xl:pt-6 2xl:pt-0 lg:pl-8 xl:pl-0 2xl:pl-8 pr-12 min-w-0">
        <div className="flex justify-between items-start mb-2 gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-serif text-[#e8e0d4] truncate">{booking.guestName || "Unknown Guest"}</h3>
            {booking.bookingType === "event" && (
              <span className="bg-[#c2a27c] text-black font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-bold">Event</span>
            )}
            {booking.paymentStatus === "pending" ? (
              <span className="bg-amber-500/20 text-amber-500 border border-amber-500/30 font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-bold animate-pulse whitespace-nowrap">Pending Payment</span>
            ) : booking.paymentStatus === "confirmed" ? (
              <span className="bg-green-500/20 text-green-500 border border-green-500/30 font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-bold whitespace-nowrap">Paid</span>
            ) : null}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="font-mono text-[10px] text-white/30 uppercase">ID: {booking.bookingId || booking._id.substring(0,6)}</span>
            {booking.totalPrice !== undefined && (
              <span className="font-mono text-xs text-[#c2a27c] bg-[#c2a27c]/10 px-2 py-0.5 rounded-sm">${booking.totalPrice} / KES {(booking.totalPrice * 130).toLocaleString()}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 text-sm text-white/60 mb-4 font-light flex-wrap sm:flex-nowrap">
          {booking.bookingType === "event" ? (
             <span className="shrink-0 text-[#c2a27c] font-medium">{booking.eventType} • {booking.eventGuests} Guests</span>
          ) : (
             <span className="shrink-0">{booking.adults} Adults, {booking.children} Children</span>
          )}
          {booking.email && (
            <>
              <span className="hidden sm:inline">•</span>
              <span className="truncate w-full sm:w-auto">{booking.email}</span>
            </>
          )}
        </div>
        {booking.specialRequests && (
          <div className="bg-[#c2a27c]/10 text-[#c2a27c] p-4 rounded-lg text-sm font-light border border-[#c2a27c]/20 flex items-start gap-3">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{booking.specialRequests}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="absolute top-6 right-6 lg:top-8 lg:right-8" ref={dropdownRef}>
        <button 
          onClick={() => setOpenDropdown(!openDropdown)}
          className="p-2 hover:text-[#c2a27c] transition-colors text-white/30"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
        
        {openDropdown && (
          <div className="absolute right-0 top-10 w-48 bg-[#100f0d] border border-white/10 rounded-lg shadow-xl py-2 z-50">
            {booking.status === "upcoming" && (
              <button 
                onClick={() => {
                  if (confirm("Are you sure you want to revoke this booking? This will cancel the reservation.")) {
                    onUpdateStatus(booking._id, "cancelled");
                    setOpenDropdown(false);
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm text-[#e8e0d4] hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4 text-white/50" /> Revoke Booking
              </button>
            )}
            
            {booking.status === "upcoming" && booking.paymentStatus === "pending" && (
              <button 
                onClick={() => {
                  if (confirm("Confirm that payment has been received? This will secure the booking and send a confirmation email.")) {
                    onConfirmPayment(booking._id);
                    setOpenDropdown(false);
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm text-[#c2a27c] hover:bg-white/5 transition-colors flex items-center gap-2 font-medium"
              >
                <CheckCircle className="w-4 h-4 text-[#c2a27c]" /> Confirm Payment
              </button>
            )}
            
            {booking.status === "hosting" && (
              <button 
                onClick={() => {
                  if (confirm("Are you sure you want to process an early exit? This will end the reservation immediately.")) {
                    onUpdateStatus(booking._id, "past", Date.now());
                    setOpenDropdown(false);
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm text-[#e8e0d4] hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4 text-white/50" /> Early Exit
              </button>
            )}
            
            <button 
              onClick={() => {
                if (confirm("Are you sure you want to delete this booking entirely from the system?")) {
                  onDelete(booking._id);
                  setOpenDropdown(false);
                }
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete Record
            </button>
          </div>
        )}
      </div>
      
    </div>
  );
}
