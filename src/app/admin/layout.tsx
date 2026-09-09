"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  LayoutDashboard, 
  PanelLeftClose, 
  PanelLeftOpen,
  Settings,
  Bell,
  Search,
  LogOut,
  Menu
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    
    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (auth === "true") {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      if (pathname !== "/admin/login") {
        router.push("/admin/login");
      }
    }
  }, [pathname, router]);

  const inquiries = useQuery(api.inquiries?.getInquiries || (() => []));
  const settings = useQuery(api.settings?.getSettings || (() => null));
  const bookings = useQuery(api.bookings?.getBookings || (() => []));
  
  const unreadInquiries = inquiries?.filter((i: any) => i.status === "unread") || [];
  const upcomingBookings = bookings?.filter((b: any) => b.status === "upcoming") || [];

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Guests", href: "/admin/guests", icon: Users },
    { name: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null; // prevent flash of content before redirect
  }

  const handleSignOut = () => {
    localStorage.removeItem("adminAuth");
    router.push("/admin/login");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0a0a] text-[#e8e0d4] font-body selection:bg-[#c2a27c] selection:text-black">
      <div className="grain-overlay" aria-hidden="true" />
      
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`${isCollapsed ? "-translate-x-full md:translate-x-0 md:w-20" : "translate-x-0 w-64"} fixed md:relative inset-y-0 left-0 bg-[#0a0a0a] md:bg-black/40 backdrop-blur-md border-r border-white/10 flex flex-col transition-all duration-300 z-50`}
      >
        <div className="h-20 flex items-center border-b border-white/10 px-6">
          {!isCollapsed && (
            <Link href="/" className="font-serif font-light text-2xl tracking-tighter flex-1 truncate hover:text-[#c2a27c] transition-colors">
              {settings === undefined ? "\u00A0" : (settings?.propertyName ? settings.propertyName.toUpperCase() + "." : "THE BNB.")}
            </Link>
          )}
          {isCollapsed && (
            <div className="w-full text-center font-serif font-light text-2xl text-[#c2a27c]">
              {settings === undefined ? "\u00A0" : (settings?.propertyName ? settings.propertyName.charAt(0).toUpperCase() + "." : "B.")}
            </div>
          )}
        </div>

        <nav className="flex-1 py-8 px-4 flex flex-col gap-2 overflow-y-auto dark-scrollbar">
          <div className="flex items-center justify-between mb-4 px-3">
            <p className={`font-mono text-[10px] text-white/30 uppercase tracking-widest ${isCollapsed ? "hidden" : "block"}`}>
              Management
            </p>
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:block p-1 text-white/40 hover:text-white rounded-md transition-colors cursor-pointer"
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name}
                href={item.href} 
                className={`relative flex items-center justify-between px-4 py-3 rounded-lg transition-colors font-light ${
                  isActive 
                    ? "bg-[#c2a27c]/10 text-[#c2a27c] border border-[#c2a27c]/20" 
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
                title={isCollapsed ? item.name : ""}
              >
                <div className="flex items-center gap-4">
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#c2a27c]" : "text-white/40"}`} />
                  {!isCollapsed && <span className="text-sm">{item.name}</span>}
                </div>
                
                {/* Number Badges (Expanded) */}
                {!isCollapsed && item.name === "Inquiries" && unreadInquiries.length > 0 && (
                  <span className="bg-[#c2a27c] text-black font-mono text-[9px] px-1.5 py-0.5 rounded-sm font-bold">
                    {unreadInquiries.length}
                  </span>
                )}
                {!isCollapsed && item.name === "Bookings" && upcomingBookings.length > 0 && (
                  <span className="bg-[#c2a27c] text-black font-mono text-[9px] px-1.5 py-0.5 rounded-sm font-bold">
                    {upcomingBookings.length}
                  </span>
                )}

                {/* Dot Badges (Collapsed) */}
                {isCollapsed && item.name === "Inquiries" && unreadInquiries.length > 0 && (
                  <span className="absolute right-2.5 top-2.5 w-1.5 h-1.5 bg-[#c2a27c] rounded-full"></span>
                )}
                {isCollapsed && item.name === "Bookings" && upcomingBookings.length > 0 && (
                  <span className="absolute right-2.5 top-2.5 w-1.5 h-1.5 bg-[#c2a27c] rounded-full"></span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
           <button 
             onClick={handleSignOut}
             className="w-full flex items-center justify-center p-3 text-red-400/70 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors cursor-pointer gap-3"
           >
             <LogOut className="w-4 h-4" />
             {!isCollapsed && <span className="text-sm font-light">Sign out</span>}
           </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        
        {/* Top Header */}
        <header className="h-20 bg-black/20 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 text-white/50">
             <button 
               onClick={() => setIsCollapsed(!isCollapsed)}
               className="md:hidden p-2 hover:text-[#c2a27c] transition-colors"
             >
               <Menu className="w-5 h-5" />
             </button>
             <div className="relative hidden sm:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input 
                  type="text" 
                  placeholder="Search globally..." 
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#c2a27c] transition-all w-48 md:w-64 text-[#e8e0d4] placeholder:text-white/20"
                />
             </div>
          </div>
          <div className="flex items-center gap-6 text-white/50">
             <div className="relative" ref={notifRef}>
               <button 
                 onClick={() => setShowNotifications(!showNotifications)}
                 className="p-2 hover:text-[#c2a27c] transition-colors cursor-pointer"
               >
                  <Bell className="w-5 h-5" />
                  {unreadInquiries.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#c2a27c] rounded-full animate-pulse shadow-[0_0_8px_rgba(194,162,124,0.6)]"></span>
                  )}
               </button>

             {/* Notifications Dropdown */}
             {showNotifications && (
               <div className="absolute top-16 right-16 w-80 bg-[#100f0d] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
                 <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                   <span className="font-serif text-lg text-white">Notifications</span>
                   <span className="font-mono text-[10px] text-[#c2a27c] bg-[#c2a27c]/10 px-2 py-1 rounded-sm uppercase tracking-widest">{unreadInquiries.length} New</span>
                 </div>
                 <div className="max-h-80 overflow-y-auto dark-scrollbar">
                   {unreadInquiries.length === 0 ? (
                     <div className="p-8 text-center font-light text-white/40">You&apos;re all caught up.</div>
                   ) : (
                     unreadInquiries.slice(0, 5).map((inq: any) => (
                       <Link 
                         key={inq._id} 
                         href="/admin/inquiries"
                         onClick={() => setShowNotifications(false)}
                         className="block p-4 border-b border-white/5 hover:bg-white/5 transition-colors"
                       >
                         <p className="font-serif text-[#e8e0d4] truncate text-lg">{inq.name}</p>
                         <p className="text-xs text-white/50 truncate mt-1 font-light">{inq.subject}</p>
                       </Link>
                     ))
                   )}
                 </div>
                 <Link 
                   href="/admin/inquiries"
                   onClick={() => setShowNotifications(false)} 
                   className="block p-4 text-center font-mono text-[10px] uppercase tracking-widest text-[#c2a27c] hover:bg-white/5 transition-colors"
                 >
                   View All Messages
                 </Link>
               </div>
             )}
             </div>

             <Link href="/admin/settings" className="p-2 hover:text-[#c2a27c] transition-colors">
                <Settings className="w-5 h-5" />
             </Link>
             <button 
               onClick={handleSignOut}
               className="flex items-center gap-2 p-2 hover:text-red-400 transition-colors text-white/50"
               title="Sign Out"
             >
               <span className="hidden sm:block text-xs font-mono uppercase tracking-widest">Sign Out</span>
               <LogOut className="w-4 h-4" />
             </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto dark-scrollbar p-6 md:p-8 flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          
          {/* Admin Footer */}
          <footer className="mt-12 pt-6 border-t border-white/10 text-center">
            <p className="font-mono text-[10px] tracking-widest text-white/30 uppercase">
              &copy; {new Date().getFullYear()} Ficus & Figs. All Rights Reserved.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
