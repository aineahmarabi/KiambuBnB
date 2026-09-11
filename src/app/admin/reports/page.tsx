"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { api } from "../../../../convex/_generated/api";
import {
  Download,
  FileSpreadsheet,
  Search,
  Filter,
  Calendar,
  Users,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Eye,
  X,
  Loader2,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Star,
  Activity,
  Printer,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────
type SortDir = "asc" | "desc";
type ReportTab = "bookings" | "revenue" | "guests" | "inquiries";

interface BookingRecord {
  _id: string;
  bookingId?: string;
  guestName: string;
  email: string;
  adults: number;
  children: number;
  checkIn: number;
  checkOut: number;
  status: string;
  specialRequests?: string;
  totalPrice?: number;
  bookingType?: string;
  eventType?: string;
  eventGuests?: number;
  paymentStatus?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────
const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const formatKES = (amount: number) => `KES ${amount.toLocaleString()}`;

const nightsBetween = (checkIn: number, checkOut: number) =>
  Math.max(1, Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)));

const ROWS_PER_PAGE = 15;

const CustomSelect = ({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: {value: string; label: string}[]; placeholder?: string }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  
  return (
    <div className="relative min-w-[140px]" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-white uppercase tracking-wider flex items-center justify-between gap-2 hover:border-[#c2a27c]/50 transition-colors"
      >
        <span className="truncate">{options.find(o => o.value === value)?.label || placeholder}</span>
        <ChevronDown className={`w-3 h-3 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 w-full bg-[#111] border border-white/10 rounded-lg overflow-hidden z-50 shadow-2xl">
          {options.map((o) => (
            <div
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`px-3 py-2 text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors ${value === o.value ? 'text-[#c2a27c] bg-[#c2a27c]/10' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomDatePicker = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => { if (value) setViewDate(new Date(value)); }, [value]);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewDate)),
    end: endOfWeek(endOfMonth(viewDate))
  });

  return (
    <div className="relative min-w-[140px]" ref={ref}>
      <button
        onClick={() => { setViewDate(value ? new Date(value) : new Date()); setOpen(!open); }}
        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-white uppercase tracking-wider flex items-center gap-2 hover:border-[#c2a27c]/50 transition-colors"
      >
        <Calendar className="w-3.5 h-3.5 text-[#c2a27c]" />
        <span className="truncate">{value ? format(new Date(value), "MMM dd, yyyy") : placeholder}</span>
      </button>
      
      {open && (
        <div className="absolute top-full mt-2 left-0 w-64 bg-[#111] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl p-3">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setViewDate(subMonths(viewDate, 1))} className="p-1 text-white/50 hover:text-white rounded-md hover:bg-white/10 transition-colors"><ChevronLeft className="w-4 h-4"/></button>
            <span className="font-serif text-white">{format(viewDate, "MMMM yyyy")}</span>
            <button onClick={() => setViewDate(addMonths(viewDate, 1))} className="p-1 text-white/50 hover:text-white rounded-md hover:bg-white/10 transition-colors"><ChevronRight className="w-4 h-4"/></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-[10px] font-mono text-center text-white/30">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const isSelected = value && isSameDay(day, new Date(value));
              const isCurrentMonth = isSameMonth(day, viewDate);
              return (
                <button
                  key={i}
                  onClick={() => { onChange(format(day, "yyyy-MM-dd")); setOpen(false); }}
                  className={`h-7 w-7 flex items-center justify-center rounded-full text-xs font-mono transition-colors ${
                    isSelected ? 'bg-[#c2a27c] text-black font-bold' :
                    isCurrentMonth ? 'text-white hover:bg-white/10' : 'text-white/20 hover:text-white/50'
                  }`}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
          {value && (
            <button 
              onClick={() => { onChange(""); setOpen(false); }} 
              className="mt-3 w-full py-1.5 text-[10px] font-mono text-red-400 hover:bg-red-400/10 rounded-lg transition-colors uppercase tracking-widest"
            >
              Clear Date
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default function AdminReportsPage() {
  const bookings = useQuery(api.bookings?.getBookings || (() => []));
  const inquiries = useQuery(api.inquiries?.getInquiries || (() => []));
  const guests = useQuery(api.guests?.getGuests || (() => []));

  const isLoading = bookings === undefined || inquiries === undefined || guests === undefined;

  // ─── Tab state ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ReportTab>("bookings");

  // ─── Bookings Report State ──────────────────────────────────────
  const [bSearch, setBSearch] = useState("");
  const [bStatusFilter, setBStatusFilter] = useState<string>("all");
  const [bPaymentFilter, setBPaymentFilter] = useState<string>("all");
  const [bTypeFilter, setBTypeFilter] = useState<string>("all");
  const [bDateFrom, setBDateFrom] = useState("");
  const [bDateTo, setBDateTo] = useState("");
  const [bSortKey, setBSortKey] = useState<string>("checkIn");
  const [bSortDir, setBSortDir] = useState<SortDir>("desc");
  const [bPage, setBPage] = useState(0);
  const [bExpandedRow, setBExpandedRow] = useState<string | null>(null);

  // ─── Inquiries Report State ─────────────────────────────────────
  const [iSearch, setISearch] = useState("");
  const [iStatusFilter, setIStatusFilter] = useState<string>("all");
  const [iPage, setIPage] = useState(0);
  const [iSortKey, setISortKey] = useState<string>("createdAt");
  const [iSortDir, setISortDir] = useState<SortDir>("desc");
  const [iExpandedRow, setIExpandedRow] = useState<string | null>(null);

  // ─── Guests Report State ────────────────────────────────────────
  const [gSearch, setGSearch] = useState("");
  const [gVipFilter, setGVipFilter] = useState<string>("all");
  const [gPage, setGPage] = useState(0);
  const [gSortKey, setGSortKey] = useState<string>("totalStays");
  const [gSortDir, setGSortDir] = useState<SortDir>("desc");

  // ─── Revenue Report State ──────────────────────────────────────
  const [rGroupBy, setRGroupBy] = useState<"month" | "status" | "type">("month");

  // ─── Sort toggle helper ─────────────────────────────────────────
  const toggleSort = (
    key: string,
    currentKey: string,
    currentDir: SortDir,
    setKey: (k: string) => void,
    setDir: (d: SortDir) => void
  ) => {
    if (currentKey === key) {
      setDir(currentDir === "asc" ? "desc" : "asc");
    } else {
      setKey(key);
      setDir("desc");
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  //  BOOKINGS REPORT — filtered, sorted, paginated
  // ═══════════════════════════════════════════════════════════════════
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    let data = [...bookings] as BookingRecord[];

    // Text search
    if (bSearch.trim()) {
      const q = bSearch.toLowerCase();
      data = data.filter(
        (b) =>
          b.guestName.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q) ||
          (b.bookingId || "").toLowerCase().includes(q) ||
          (b.eventType || "").toLowerCase().includes(q)
      );
    }

    // Status filter
    if (bStatusFilter !== "all") data = data.filter((b) => b.status === bStatusFilter);

    // Payment filter
    if (bPaymentFilter !== "all") data = data.filter((b) => (b.paymentStatus || "pending") === bPaymentFilter);

    // Type filter
    if (bTypeFilter !== "all") {
      if (bTypeFilter === "event") data = data.filter((b) => b.bookingType === "event");
      else data = data.filter((b) => !b.bookingType || b.bookingType === "stay");
    }

    // Date range filter
    if (bDateFrom) {
      const from = new Date(bDateFrom).getTime();
      data = data.filter((b) => b.checkIn >= from);
    }
    if (bDateTo) {
      const to = new Date(bDateTo).getTime() + 86400000;
      data = data.filter((b) => b.checkIn <= to);
    }

    // Sort
    data.sort((a: any, b: any) => {
      let aVal = a[bSortKey];
      let bVal = b[bSortKey];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return bSortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return bSortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [bookings, bSearch, bStatusFilter, bPaymentFilter, bTypeFilter, bDateFrom, bDateTo, bSortKey, bSortDir]);

  const bTotalPages = Math.ceil(filteredBookings.length / ROWS_PER_PAGE);
  const bPageData = filteredBookings.slice(bPage * ROWS_PER_PAGE, (bPage + 1) * ROWS_PER_PAGE);

  // Bookings summary totals
  const bSummary = useMemo(() => {
    const total = filteredBookings.length;
    const totalRevenue = filteredBookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
    const totalNights = filteredBookings.reduce((s, b) => s + nightsBetween(b.checkIn, b.checkOut), 0);
    const totalGuests = filteredBookings.reduce((s, b) => s + b.adults + b.children, 0);
    const confirmed = filteredBookings.filter((b) => b.paymentStatus === "confirmed").reduce((s, b) => s + (b.totalPrice || 0), 0);
    const pending = filteredBookings.filter((b) => (b.paymentStatus || "pending") === "pending").reduce((s, b) => s + (b.totalPrice || 0), 0);
    return { total, totalRevenue, totalNights, totalGuests, confirmed, pending };
  }, [filteredBookings]);

  // ═══════════════════════════════════════════════════════════════════
  //  REVENUE REPORT — grouped breakdown
  // ═══════════════════════════════════════════════════════════════════
  const revenueData = useMemo(() => {
    if (!bookings) return [];
    const nonCancelled = (bookings as BookingRecord[]).filter((b) => b.status !== "cancelled");

    if (rGroupBy === "month") {
      const groups: Record<string, { label: string; count: number; revenue: number; nights: number; guests: number }> = {};
      nonCancelled.forEach((b) => {
        const d = new Date(b.checkIn);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        if (!groups[key]) groups[key] = { label, count: 0, revenue: 0, nights: 0, guests: 0 };
        groups[key].count += 1;
        groups[key].revenue += b.totalPrice || 0;
        groups[key].nights += nightsBetween(b.checkIn, b.checkOut);
        groups[key].guests += b.adults + b.children;
      });
      return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0])).map(([, v]) => v);
    }

    if (rGroupBy === "status") {
      const groups: Record<string, { label: string; count: number; revenue: number; nights: number; guests: number }> = {};
      (bookings as BookingRecord[]).forEach((b) => {
        const key = b.status;
        if (!groups[key]) groups[key] = { label: key.charAt(0).toUpperCase() + key.slice(1), count: 0, revenue: 0, nights: 0, guests: 0 };
        groups[key].count += 1;
        groups[key].revenue += b.totalPrice || 0;
        groups[key].nights += nightsBetween(b.checkIn, b.checkOut);
        groups[key].guests += b.adults + b.children;
      });
      return Object.values(groups).sort((a, b) => b.revenue - a.revenue);
    }

    // Group by type
    const groups: Record<string, { label: string; count: number; revenue: number; nights: number; guests: number }> = {};
    nonCancelled.forEach((b) => {
      let key = b.bookingType === "event" ? (b.eventType || "Event (Unspecified)") : "Stay";
      if (!groups[key]) groups[key] = { label: key, count: 0, revenue: 0, nights: 0, guests: 0 };
      groups[key].count += 1;
      groups[key].revenue += b.totalPrice || 0;
      groups[key].nights += nightsBetween(b.checkIn, b.checkOut);
      groups[key].guests += b.adults + b.children + (b.eventGuests || 0);
    });
    return Object.values(groups).sort((a, b) => b.revenue - a.revenue);
  }, [bookings, rGroupBy]);

  const revenueTotals = useMemo(() => {
    return revenueData.reduce(
      (acc, r) => ({
        count: acc.count + r.count,
        revenue: acc.revenue + r.revenue,
        nights: acc.nights + r.nights,
        guests: acc.guests + r.guests,
      }),
      { count: 0, revenue: 0, nights: 0, guests: 0 }
    );
  }, [revenueData]);

  // ═══════════════════════════════════════════════════════════════════
  //  INQUIRIES REPORT — filtered, sorted, paginated
  // ═══════════════════════════════════════════════════════════════════
  const filteredInquiries = useMemo(() => {
    if (!inquiries) return [];
    let data = [...inquiries] as any[];

    if (iSearch.trim()) {
      const q = iSearch.toLowerCase();
      data = data.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.subject.toLowerCase().includes(q) ||
          i.message.toLowerCase().includes(q)
      );
    }

    if (iStatusFilter !== "all") data = data.filter((i) => i.status === iStatusFilter);

    data.sort((a: any, b: any) => {
      let aVal = a[iSortKey];
      let bVal = b[iSortKey];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return iSortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return iSortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [inquiries, iSearch, iStatusFilter, iSortKey, iSortDir]);

  const iTotalPages = Math.ceil(filteredInquiries.length / ROWS_PER_PAGE);
  const iPageData = filteredInquiries.slice(iPage * ROWS_PER_PAGE, (iPage + 1) * ROWS_PER_PAGE);

  // ═══════════════════════════════════════════════════════════════════
  //  GUESTS REPORT — filtered, sorted, paginated
  // ═══════════════════════════════════════════════════════════════════
  const filteredGuests = useMemo(() => {
    if (!guests) return [];
    let data = [...guests] as any[];

    if (gSearch.trim()) {
      const q = gSearch.toLowerCase();
      data = data.filter(
        (g) => g.name.toLowerCase().includes(q) || g.email.toLowerCase().includes(q) || (g.phone || "").includes(q)
      );
    }

    if (gVipFilter !== "all") {
      if (gVipFilter === "vip") data = data.filter((g) => g.vip);
      else if (gVipFilter === "returning") data = data.filter((g) => g.totalStays > 1);
      else if (gVipFilter === "new") data = data.filter((g) => g.totalStays <= 1);
    }

    data.sort((a: any, b: any) => {
      let aVal = a[gSortKey];
      let bVal = b[gSortKey];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return gSortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return gSortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [guests, gSearch, gVipFilter, gSortKey, gSortDir]);

  const gTotalPages = Math.ceil(filteredGuests.length / ROWS_PER_PAGE);
  const gPageData = filteredGuests.slice(gPage * ROWS_PER_PAGE, (gPage + 1) * ROWS_PER_PAGE);

  // ═══════════════════════════════════════════════════════════════════
  //  EXPORT FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════
  const exportBookingsCSV = () => {
    const headers = "Booking ID,Guest Name,Email,Adults,Children,Check-In,Check-Out,Nights,Type,Event Type,Status,Payment Status,Total Price (KES)\n";
    const rows = filteredBookings
      .map((b) =>
        `"${b.bookingId || b._id}","${b.guestName}","${b.email}",${b.adults},${b.children},"${formatDate(b.checkIn)}","${formatDate(b.checkOut)}",${nightsBetween(b.checkIn, b.checkOut)},"${b.bookingType || "stay"}","${b.eventType || "—"}","${b.status}","${b.paymentStatus || "pending"}",${b.totalPrice || 0}`
      )
      .join("\n");
    downloadCSV(headers + rows, "Bookings_Report");
  };

  const exportInquiriesCSV = () => {
    const headers = "Name,Email,Subject,Message,Status,Date Received\n";
    const rows = filteredInquiries
      .map((i: any) => `"${i.name}","${i.email}","${i.subject}","${i.message.replace(/"/g, '""')}","${i.status}","${formatDate(i.createdAt)}"`)
      .join("\n");
    downloadCSV(headers + rows, "Inquiries_Report");
  };

  const exportGuestsCSV = () => {
    const headers = "Name,Email,Phone,Total Stays,Last Visit,VIP\n";
    const rows = filteredGuests
      .map((g: any) => `"${g.name}","${g.email}","${g.phone || "—"}",${g.totalStays},"${g.lastVisit ? formatDate(g.lastVisit) : "—"}",${g.vip ? "Yes" : "No"}`)
      .join("\n");
    downloadCSV(headers + rows, "Guest_Report");
  };

  const exportRevenueCSV = () => {
    const headers = `Group By: ${rGroupBy}\nPeriod/Category,Bookings,Revenue (KES),Total Nights,Total Guests\n`;
    const rows = revenueData
      .map((r) => `"${r.label}",${r.count},${r.revenue},${r.nights},${r.guests}`)
      .join("\n");
    const totals = `\n"TOTALS",${revenueTotals.count},${revenueTotals.revenue},${revenueTotals.nights},${revenueTotals.guests}`;
    downloadCSV(headers + rows + totals, "Revenue_Report");
  };

  const downloadCSV = (content: string, name: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ═══════════════════════════════════════════════════════════════════
  //  SHARED UI COMPONENTS
  // ═══════════════════════════════════════════════════════════════════
  const SortHeader = ({
    label,
    sortKey,
    currentKey,
    currentDir,
    onSort,
    className = "",
  }: {
    label: string;
    sortKey: string;
    currentKey: string;
    currentDir: SortDir;
    onSort: (key: string) => void;
    className?: string;
  }) => (
    <th
      onClick={() => onSort(sortKey)}
      className={`text-left p-3 md:p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 cursor-pointer hover:text-[#c2a27c] transition-colors select-none ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        {currentKey === sortKey ? (
          currentDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-30" />
        )}
      </div>
    </th>
  );

  const Pagination = ({
    page,
    totalPages,
    totalRecords,
    onPrev,
    onNext,
  }: {
    page: number;
    totalPages: number;
    totalRecords: number;
    onPrev: () => void;
    onNext: () => void;
  }) => (
    <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/[0.01]">
      <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
        {totalRecords} record{totalRecords !== 1 ? "s" : ""} · Page {page + 1} of {Math.max(totalPages, 1)}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={page === 0}
          className="p-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onNext}
          disabled={page >= totalPages - 1}
          className="p-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      hosting: "text-emerald-400 bg-emerald-400/10",
      upcoming: "text-blue-400 bg-blue-400/10",
      past: "text-white/40 bg-white/5",
      completed: "text-white/40 bg-white/5",
      cancelled: "text-red-400 bg-red-400/10",
      confirmed: "text-green-400 bg-green-400/10",
      pending: "text-yellow-400 bg-yellow-400/10",
      unread: "text-[#c2a27c] bg-[#c2a27c]/10",
      read: "text-white/30 bg-white/5",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold ${colors[status] || "text-white/40 bg-white/5"}`}>
        {status}
      </span>
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  //  LOADING STATE
  // ═══════════════════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#c2a27c] animate-spin" />
          <p className="font-mono text-xs text-white/40 uppercase tracking-widest">Loading report data...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-[90rem] mx-auto space-y-6">

      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-light text-white">Reports</h1>
          <p className="text-white/40 text-sm mt-1 font-light">
            Detailed logs, financial ledgers, and data tables from live records.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-full border border-white/20 hover:border-[#c2a27c] text-white text-xs font-mono uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print</span>
        </button>
      </div>

      {/* ─── Report Tabs ────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-xl p-1.5 overflow-x-auto">
        {([
          { id: "bookings" as ReportTab, label: "Bookings Ledger", icon: Calendar, count: bookings?.length || 0 },
          { id: "revenue" as ReportTab, label: "Revenue Breakdown", icon: DollarSign, count: null },
          { id: "guests" as ReportTab, label: "Guest Directory", icon: Users, count: guests?.length || 0 },
          { id: "inquiries" as ReportTab, label: "Inquiry Log", icon: MessageSquare, count: inquiries?.length || 0 },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-lg font-mono text-xs uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-[#c2a27c] text-black font-bold shadow-lg"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                activeTab === tab.id ? "bg-black/20 text-black" : "bg-white/10 text-white/40"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          BOOKINGS LEDGER TAB
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={bSearch}
                  onChange={(e) => { setBSearch(e.target.value); setBPage(0); }}
                  placeholder="Search by guest name, email, booking ID..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c2a27c]/50 transition-colors"
                />
                {bSearch && (
                  <button onClick={() => setBSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <CustomSelect
                value={bStatusFilter}
                onChange={(v) => { setBStatusFilter(v); setBPage(0); }}
                options={[{value:"all",label:"All Statuses"},{value:"hosting",label:"Hosting"},{value:"upcoming",label:"Upcoming"},{value:"past",label:"Past"},{value:"cancelled",label:"Cancelled"}]}
              />

              {/* Payment Filter */}
              <CustomSelect
                value={bPaymentFilter}
                onChange={(v) => { setBPaymentFilter(v); setBPage(0); }}
                options={[{value:"all",label:"All Payments"},{value:"confirmed",label:"Confirmed"},{value:"pending",label:"Pending"}]}
              />

              {/* Type Filter */}
              <CustomSelect
                value={bTypeFilter}
                onChange={(v) => { setBTypeFilter(v); setBPage(0); }}
                options={[{value:"all",label:"All Types"},{value:"stay",label:"Stays"},{value:"event",label:"Events"}]}
              />

              {/* Date Range */}
              <div className="flex items-center gap-2">
                <CustomDatePicker
                  value={bDateFrom}
                  onChange={(v) => { setBDateFrom(v); setBPage(0); }}
                  placeholder="Start Date"
                />
                <span className="text-white/30 text-xs">to</span>
                <CustomDatePicker
                  value={bDateTo}
                  onChange={(v) => { setBDateTo(v); setBPage(0); }}
                  placeholder="End Date"
                />
              </div>

              {/* Export */}
              <button
                onClick={exportBookingsCSV}
                className="px-4 py-2.5 rounded-lg bg-[#c2a27c] text-black text-xs font-mono uppercase tracking-widest font-bold hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer shadow-lg whitespace-nowrap"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Active Filters Summary */}
            {(bSearch || bStatusFilter !== "all" || bPaymentFilter !== "all" || bTypeFilter !== "all" || bDateFrom || bDateTo) && (
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-3.5 h-3.5 text-[#c2a27c]" />
                <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Active filters:</span>
                {bSearch && <span className="px-2 py-0.5 bg-[#c2a27c]/10 text-[#c2a27c] text-[10px] font-mono rounded-full">&quot;{bSearch}&quot;</span>}
                {bStatusFilter !== "all" && <span className="px-2 py-0.5 bg-blue-400/10 text-blue-400 text-[10px] font-mono rounded-full uppercase">{bStatusFilter}</span>}
                {bPaymentFilter !== "all" && <span className="px-2 py-0.5 bg-green-400/10 text-green-400 text-[10px] font-mono rounded-full uppercase">{bPaymentFilter}</span>}
                {bTypeFilter !== "all" && <span className="px-2 py-0.5 bg-purple-400/10 text-purple-400 text-[10px] font-mono rounded-full uppercase">{bTypeFilter}</span>}
                {(bDateFrom || bDateTo) && <span className="px-2 py-0.5 bg-white/5 text-white/50 text-[10px] font-mono rounded-full">{bDateFrom || "..."} → {bDateTo || "..."}</span>}
                <span className="font-mono text-[10px] text-white/30">· {filteredBookings.length} results</span>
                <button
                  onClick={() => { setBSearch(""); setBStatusFilter("all"); setBPaymentFilter("all"); setBTypeFilter("all"); setBDateFrom(""); setBDateTo(""); setBPage(0); }}
                  className="text-red-400/60 hover:text-red-400 text-[10px] font-mono cursor-pointer ml-2"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Summary Totals Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
              <p className="font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Records</p>
              <p className="font-serif text-2xl text-white">{bSummary.total}</p>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
              <p className="font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Total Revenue</p>
              <p className="font-serif text-2xl text-white">{formatKES(bSummary.totalRevenue)}</p>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
              <p className="font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Confirmed</p>
              <p className="font-serif text-2xl text-green-400">{formatKES(bSummary.confirmed)}</p>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
              <p className="font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Pending</p>
              <p className="font-serif text-2xl text-yellow-400">{formatKES(bSummary.pending)}</p>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
              <p className="font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Total Nights</p>
              <p className="font-serif text-2xl text-white">{bSummary.totalNights}</p>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
              <p className="font-mono text-[9px] uppercase tracking-widest text-white/40 mb-1">Total Guests</p>
              <p className="font-serif text-2xl text-white">{bSummary.totalGuests}</p>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th className="w-8 p-3"></th>
                    <SortHeader label="ID" sortKey="bookingId" currentKey={bSortKey} currentDir={bSortDir} onSort={(k) => toggleSort(k, bSortKey, bSortDir, setBSortKey, setBSortDir)} />
                    <SortHeader label="Guest" sortKey="guestName" currentKey={bSortKey} currentDir={bSortDir} onSort={(k) => toggleSort(k, bSortKey, bSortDir, setBSortKey, setBSortDir)} />
                    <SortHeader label="Check-In" sortKey="checkIn" currentKey={bSortKey} currentDir={bSortDir} onSort={(k) => toggleSort(k, bSortKey, bSortDir, setBSortKey, setBSortDir)} className="hidden md:table-cell" />
                    <SortHeader label="Check-Out" sortKey="checkOut" currentKey={bSortKey} currentDir={bSortDir} onSort={(k) => toggleSort(k, bSortKey, bSortDir, setBSortKey, setBSortDir)} className="hidden md:table-cell" />
                    <th className="text-left p-3 md:p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 hidden lg:table-cell">Nights</th>
                    <th className="text-left p-3 md:p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 hidden lg:table-cell">Pax</th>
                    <th className="text-left p-3 md:p-4 font-mono text-[10px] uppercase tracking-widest text-white/40">Status</th>
                    <th className="text-left p-3 md:p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 hidden md:table-cell">Payment</th>
                    <SortHeader label="Amount" sortKey="totalPrice" currentKey={bSortKey} currentDir={bSortDir} onSort={(k) => toggleSort(k, bSortKey, bSortDir, setBSortKey, setBSortDir)} className="text-right" />
                  </tr>
                </thead>
                <tbody>
                  {bPageData.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-12 text-center text-white/30 font-light">
                        No booking records match your filters.
                      </td>
                    </tr>
                  ) : (
                    bPageData.map((b) => (
                      <>
                        <tr
                          key={b._id}
                          onClick={() => setBExpandedRow(bExpandedRow === b._id ? null : b._id)}
                          className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                        >
                          <td className="p-3 text-white/30">
                            {bExpandedRow === b._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </td>
                          <td className="p-3 font-mono text-xs text-[#c2a27c] whitespace-nowrap">{b.bookingId || b._id.slice(-6)}</td>
                          <td className="p-3">
                            <p className="font-serif text-white text-sm">{b.guestName}</p>
                            <p className="font-mono text-[10px] text-white/30 mt-0.5">{b.email}</p>
                          </td>
                          <td className="p-3 font-mono text-xs text-white/60 hidden md:table-cell whitespace-nowrap">{formatDate(b.checkIn)}</td>
                          <td className="p-3 font-mono text-xs text-white/60 hidden md:table-cell whitespace-nowrap">{formatDate(b.checkOut)}</td>
                          <td className="p-3 font-mono text-xs text-white/60 hidden lg:table-cell">{nightsBetween(b.checkIn, b.checkOut)}</td>
                          <td className="p-3 font-mono text-xs text-white/60 hidden lg:table-cell">{b.adults + b.children}</td>
                          <td className="p-3"><StatusBadge status={b.status} /></td>
                          <td className="p-3 hidden md:table-cell"><StatusBadge status={b.paymentStatus || "pending"} /></td>
                          <td className="p-3 text-right font-mono text-sm font-bold text-white whitespace-nowrap">
                            {b.totalPrice ? formatKES(b.totalPrice) : "—"}
                          </td>
                        </tr>
                        {/* Drill-down expanded row */}
                        {bExpandedRow === b._id && (
                          <tr key={`${b._id}-detail`} className="bg-white/[0.02]">
                            <td colSpan={10} className="p-6">
                              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
                                <div>
                                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1">Booking ID</p>
                                  <p className="text-white font-mono">{b.bookingId || b._id}</p>
                                </div>
                                <div>
                                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1">Email</p>
                                  <p className="text-white">{b.email}</p>
                                </div>
                                <div>
                                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1">Adults / Children</p>
                                  <p className="text-white">{b.adults} adults, {b.children} children</p>
                                </div>
                                <div>
                                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1">Booking Type</p>
                                  <p className="text-white capitalize">{b.bookingType || "Stay"}</p>
                                </div>
                                {b.eventType && (
                                  <div>
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1">Event Type</p>
                                    <p className="text-white">{b.eventType}</p>
                                  </div>
                                )}
                                {b.eventGuests && (
                                  <div>
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1">Event Guests</p>
                                    <p className="text-white">{b.eventGuests}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1">Duration</p>
                                  <p className="text-white">{nightsBetween(b.checkIn, b.checkOut)} night{nightsBetween(b.checkIn, b.checkOut) !== 1 ? "s" : ""}</p>
                                </div>
                                <div>
                                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1">Check-In</p>
                                  <p className="text-white">{new Date(b.checkIn).toLocaleString("en-GB", { dateStyle: "full" })}</p>
                                </div>
                                <div>
                                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1">Check-Out</p>
                                  <p className="text-white">{new Date(b.checkOut).toLocaleString("en-GB", { dateStyle: "full" })}</p>
                                </div>
                                {b.specialRequests && (
                                  <div className="col-span-2 md:col-span-4 lg:col-span-6">
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1">Special Requests</p>
                                    <p className="text-white/70 italic">&ldquo;{b.specialRequests}&rdquo;</p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={bPage} totalPages={bTotalPages} totalRecords={filteredBookings.length} onPrev={() => setBPage((p) => Math.max(0, p - 1))} onNext={() => setBPage((p) => Math.min(bTotalPages - 1, p + 1))} />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          REVENUE BREAKDOWN TAB
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "revenue" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">Group by:</span>
              {(["month", "status", "type"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setRGroupBy(g)}
                  className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-widest transition-all cursor-pointer ${
                    rGroupBy === g ? "bg-[#c2a27c] text-black font-bold" : "bg-white/5 text-white/50 hover:text-white border border-white/10"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <button
              onClick={exportRevenueCSV}
              className="px-4 py-2.5 rounded-lg bg-[#c2a27c] text-black text-xs font-mono uppercase tracking-widest font-bold hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th className="text-left p-4 font-mono text-[10px] uppercase tracking-widest text-white/40">{rGroupBy === "month" ? "Period" : rGroupBy === "status" ? "Status" : "Category"}</th>
                    <th className="text-right p-4 font-mono text-[10px] uppercase tracking-widest text-white/40">Bookings</th>
                    <th className="text-right p-4 font-mono text-[10px] uppercase tracking-widest text-white/40">Revenue (KES)</th>
                    <th className="text-right p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 hidden md:table-cell">Nights</th>
                    <th className="text-right p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 hidden md:table-cell">Guests</th>
                    <th className="text-right p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 hidden lg:table-cell">Avg / Booking</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.length === 0 ? (
                    <tr><td colSpan={6} className="p-12 text-center text-white/30">No revenue data available.</td></tr>
                  ) : (
                    revenueData.map((r, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                        <td className="p-4 font-serif text-white">{r.label}</td>
                        <td className="p-4 text-right font-mono text-white/70">{r.count}</td>
                        <td className="p-4 text-right font-mono text-white font-bold">{formatKES(r.revenue)}</td>
                        <td className="p-4 text-right font-mono text-white/50 hidden md:table-cell">{r.nights}</td>
                        <td className="p-4 text-right font-mono text-white/50 hidden md:table-cell">{r.guests}</td>
                        <td className="p-4 text-right font-mono text-[#c2a27c] hidden lg:table-cell">{r.count > 0 ? formatKES(Math.round(r.revenue / r.count)) : "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {revenueData.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-[#c2a27c]/30 bg-[#c2a27c]/5">
                      <td className="p-4 font-mono text-xs uppercase tracking-widest text-[#c2a27c] font-bold">Totals</td>
                      <td className="p-4 text-right font-mono text-white font-bold">{revenueTotals.count}</td>
                      <td className="p-4 text-right font-mono text-[#c2a27c] font-bold text-base">{formatKES(revenueTotals.revenue)}</td>
                      <td className="p-4 text-right font-mono text-white font-bold hidden md:table-cell">{revenueTotals.nights}</td>
                      <td className="p-4 text-right font-mono text-white font-bold hidden md:table-cell">{revenueTotals.guests}</td>
                      <td className="p-4 text-right font-mono text-[#c2a27c] hidden lg:table-cell">{revenueTotals.count > 0 ? formatKES(Math.round(revenueTotals.revenue / revenueTotals.count)) : "—"}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          GUEST DIRECTORY TAB
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "guests" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={gSearch}
                onChange={(e) => { setGSearch(e.target.value); setGPage(0); }}
                placeholder="Search by name, email, phone..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c2a27c]/50"
              />
            </div>
            <CustomSelect
              value={gVipFilter}
              onChange={(v) => { setGVipFilter(v); setGPage(0); }}
              options={[{value:"all",label:"All Guests"},{value:"vip",label:"VIP Only"},{value:"returning",label:"Returning"},{value:"new",label:"First-Time"}]}
            />
            <button onClick={exportGuestsCSV} className="px-4 py-2.5 rounded-lg bg-[#c2a27c] text-black text-xs font-mono uppercase tracking-widest font-bold hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer">
              <FileSpreadsheet className="w-4 h-4" /><span>Export CSV</span>
            </button>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <SortHeader label="Name" sortKey="name" currentKey={gSortKey} currentDir={gSortDir} onSort={(k) => toggleSort(k, gSortKey, gSortDir, setGSortKey, setGSortDir)} />
                    <th className="text-left p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 hidden md:table-cell">Email</th>
                    <th className="text-left p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 hidden lg:table-cell">Phone</th>
                    <SortHeader label="Stays" sortKey="totalStays" currentKey={gSortKey} currentDir={gSortDir} onSort={(k) => toggleSort(k, gSortKey, gSortDir, setGSortKey, setGSortDir)} />
                    <SortHeader label="Last Visit" sortKey="lastVisit" currentKey={gSortKey} currentDir={gSortDir} onSort={(k) => toggleSort(k, gSortKey, gSortDir, setGSortKey, setGSortDir)} className="hidden md:table-cell" />
                    <th className="text-center p-4 font-mono text-[10px] uppercase tracking-widest text-white/40">VIP</th>
                  </tr>
                </thead>
                <tbody>
                  {gPageData.length === 0 ? (
                    <tr><td colSpan={6} className="p-12 text-center text-white/30">No guest records match your filters.</td></tr>
                  ) : (
                    gPageData.map((g: any) => (
                      <tr key={g._id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                        <td className="p-4 font-serif text-white">{g.name}</td>
                        <td className="p-4 font-mono text-xs text-white/50 hidden md:table-cell">{g.email}</td>
                        <td className="p-4 font-mono text-xs text-white/50 hidden lg:table-cell">{g.phone || "—"}</td>
                        <td className="p-4 font-mono text-sm text-white font-bold">{g.totalStays}</td>
                        <td className="p-4 font-mono text-xs text-white/50 hidden md:table-cell">{g.lastVisit ? formatDate(g.lastVisit) : "—"}</td>
                        <td className="p-4 text-center">{g.vip ? <Star className="w-4 h-4 text-[#c2a27c] inline fill-[#c2a27c]" /> : <span className="text-white/20">—</span>}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={gPage} totalPages={gTotalPages} totalRecords={filteredGuests.length} onPrev={() => setGPage((p) => Math.max(0, p - 1))} onNext={() => setGPage((p) => Math.min(gTotalPages - 1, p + 1))} />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          INQUIRY LOG TAB
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === "inquiries" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={iSearch}
                onChange={(e) => { setISearch(e.target.value); setIPage(0); }}
                placeholder="Search by name, email, subject, message..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c2a27c]/50"
              />
            </div>
            <CustomSelect
              value={iStatusFilter}
              onChange={(v) => { setIStatusFilter(v); setIPage(0); }}
              options={[{value:"all",label:"All Status"},{value:"unread",label:"Unread"},{value:"read",label:"Read"}]}
            />
            <button onClick={exportInquiriesCSV} className="px-4 py-2.5 rounded-lg bg-[#c2a27c] text-black text-xs font-mono uppercase tracking-widest font-bold hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer">
              <FileSpreadsheet className="w-4 h-4" /><span>Export CSV</span>
            </button>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th className="w-8 p-3"></th>
                    <SortHeader label="Name" sortKey="name" currentKey={iSortKey} currentDir={iSortDir} onSort={(k) => toggleSort(k, iSortKey, iSortDir, setISortKey, setISortDir)} />
                    <th className="text-left p-4 font-mono text-[10px] uppercase tracking-widest text-white/40 hidden md:table-cell">Email</th>
                    <SortHeader label="Subject" sortKey="subject" currentKey={iSortKey} currentDir={iSortDir} onSort={(k) => toggleSort(k, iSortKey, iSortDir, setISortKey, setISortDir)} />
                    <th className="text-left p-4 font-mono text-[10px] uppercase tracking-widest text-white/40">Status</th>
                    <SortHeader label="Received" sortKey="createdAt" currentKey={iSortKey} currentDir={iSortDir} onSort={(k) => toggleSort(k, iSortKey, iSortDir, setISortKey, setISortDir)} />
                  </tr>
                </thead>
                <tbody>
                  {iPageData.length === 0 ? (
                    <tr><td colSpan={6} className="p-12 text-center text-white/30">No inquiry records match your filters.</td></tr>
                  ) : (
                    iPageData.map((i: any) => (
                      <>
                        <tr
                          key={i._id}
                          onClick={() => setIExpandedRow(iExpandedRow === i._id ? null : i._id)}
                          className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer ${i.status === "unread" ? "bg-[#c2a27c]/[0.03]" : ""}`}
                        >
                          <td className="p-3 text-white/30">
                            {iExpandedRow === i._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </td>
                          <td className="p-4 font-serif text-white">
                            <div className="flex items-center gap-2">
                              {i.status === "unread" && <div className="w-2 h-2 rounded-full bg-[#c2a27c] animate-pulse" />}
                              <span>{i.name}</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-xs text-white/50 hidden md:table-cell">{i.email}</td>
                          <td className="p-4 text-white/70 text-sm max-w-[200px] truncate">{i.subject}</td>
                          <td className="p-4"><StatusBadge status={i.status} /></td>
                          <td className="p-4 font-mono text-xs text-white/50 whitespace-nowrap">{formatDate(i.createdAt)}</td>
                        </tr>
                        {iExpandedRow === i._id && (
                          <tr key={`${i._id}-detail`} className="bg-white/[0.02]">
                            <td colSpan={6} className="p-6">
                              <div className="space-y-3">
                                <div>
                                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1">From</p>
                                  <p className="text-white text-sm">{i.name} &lt;{i.email}&gt;</p>
                                </div>
                                <div>
                                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1">Subject</p>
                                  <p className="text-white text-sm font-medium">{i.subject}</p>
                                </div>
                                <div>
                                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1">Full Message</p>
                                  <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap bg-white/[0.02] border border-white/5 rounded-lg p-4">{i.message}</p>
                                </div>
                                <div>
                                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1">Received</p>
                                  <p className="text-white/50 text-xs">{new Date(i.createdAt).toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={iPage} totalPages={iTotalPages} totalRecords={filteredInquiries.length} onPrev={() => setIPage((p) => Math.max(0, p - 1))} onNext={() => setIPage((p) => Math.min(iTotalPages - 1, p + 1))} />
          </div>
        </div>
      )}

    </div>
  );
}
