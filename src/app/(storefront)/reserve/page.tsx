"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Plus, Minus, Loader2, ChevronDown, ChevronLeft, ChevronRight, Copy, Check } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, differenceInDays } from "date-fns";
import { useMutation, useQuery, useConvex } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const PRIVACY_CONTENT = `
PRIVACY POLICY

Effective Date: September 2026

The Ficus and Figs ("we," "us," or "our") is deeply committed to protecting your privacy and ensuring the security of your personal data. This Privacy Policy outlines our practices regarding the collection, use, processing, and disclosure of information when you interact with our website or utilize our hospitality services.

1. INFORMATION WE COLLECT
1.1 Personally Identifiable Information (PII): When you make a reservation, inquire about our services, or subscribe to our communications, we collect personal details including, but not limited to, your full name, email address, physical address, phone number, and passport/identification details (required by local law for lodging).
1.2 Financial Data: Payment details, such as credit card numbers and billing addresses, are collected exclusively for transaction processing. We do not store full credit card numbers on our servers; these are handled directly by our PCI-DSS compliant third-party payment gateways.
1.3 Automated Data Collection: We automatically collect technical information about your visit to our website, including your IP address, browser type, operating system, pages viewed, and the timestamp of your visit, to optimize our digital experience.

2. HOW WE USE YOUR INFORMATION
2.1 Service Provision: To process reservations, manage check-ins/check-outs, and provide personalized hospitality services during your stay.
2.2 Communication: To send you booking confirmations, pre-arrival questionnaires, administrative notices, and, provided you have explicitly opted-in, exclusive promotional offers regarding Ficus and Figs.
2.3 Compliance and Security: To comply with local regulatory requirements for guest registration and to detect, prevent, and address fraud, security breaches, or technical issues.

3. DATA SHARING AND DISCLOSURE
We do not sell, rent, or trade your personal data to third parties. Your information may only be shared with:
3.1 Trusted Service Providers: Third-party vendors who perform services on our behalf (e.g., payment processing, email delivery, legal counsel), strictly under confidentiality agreements.
3.2 Legal Authorities: When compelled by law, subpoena, or court order to disclose information to governmental or law enforcement authorities.

4. DATA RETENTION AND SECURITY
We retain your personal information only for as long as is necessary for the purposes set out in this policy and to satisfy any legal, accounting, or reporting requirements. We implement robust, industry-standard physical, electronic, and managerial procedures to safeguard your data against unauthorized access, alteration, or disclosure.

5. COOKIES AND TRACKING TECHNOLOGIES
Our website utilizes cookies and similar tracking technologies to enhance user experience, analyze site traffic, and understand user behavior. You have the right to accept or decline cookies via your browser settings or our integrated Cookie Consent manager.

6. YOUR RIGHTS
Depending on your jurisdiction (including compliance with GDPR for European citizens), you may have the right to request access to, correction of, or deletion of your personal data held by us. To exercise these rights, please contact our Data Protection Officer at privacy@ficusandfigs.com.
`;

const slides = [
  { src: "/images/IMG_9255.JPG.jpeg", subtitle: "The Estate", title: "A Modern\nOasis." },
  { src: "/images/IMG_9258.JPG.jpeg", subtitle: "The Pool", title: "Immerse in\nTranquility." },
  { src: "/images/IMG_9260.JPG.jpeg", subtitle: "Lush Gardens", title: "Botanical\nBeauty." },
  { src: "/images/IMG_9269.JPG.jpeg", subtitle: "Master Suite", title: "Uncompromising\nComfort." },
  { src: "/images/IMG_9273.JPG.jpeg", subtitle: "The Terrace", title: "Sunset\nVistas." },
];

export default function ReservePage() {
  const desktopDrawerRef = useRef<HTMLDivElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const packages = useQuery(api.packages?.getPackages || (() => []));

  const [dateError, setDateError] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [bookingType, setBookingType] = useState<"stay" | "event">("stay");
  const [eventType, setEventType] = useState("Venue Rental");
  const [eventGuests, setEventGuests] = useState(50);

  const convex = useConvex();
  const createBooking = useMutation(api.bookings?.createBooking || (() => Promise.resolve()));
  
  const [arrivalDate, setArrivalDate] = useState<Date | null>(new Date());
  const [departureDate, setDepartureDate] = useState<Date | null>(new Date(new Date().getTime() + 24 * 60 * 60 * 1000));

  const [step, setStep] = useState<"select" | "checking" | "conflict" | "finalize" | "payment" | "success">("select");
  const [suggestedDates, setSuggestedDates] = useState<{arrival: Date, departure: Date} | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isEventTypeOpen, setIsEventTypeOpen] = useState(false);
  const [isRatesOpen, setIsRatesOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [mounted, setMounted] = useState(false);
  const [copiedMpesa, setCopiedMpesa] = useState(false);
  const [copiedEquity, setCopiedEquity] = useState(false);

  const handleCopy = (text: string, type: "mpesa" | "equity") => {
    navigator.clipboard.writeText(text);
    if (type === "mpesa") {
      setCopiedMpesa(true);
      setTimeout(() => setCopiedMpesa(false), 2000);
    } else {
      setCopiedEquity(true);
      setTimeout(() => setCopiedEquity(false), 2000);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const isOutsideDesktop = desktopDrawerRef.current && !desktopDrawerRef.current.contains(event.target as Node);
      const isOutsideMobile = mobileDrawerRef.current && !mobileDrawerRef.current.contains(event.target as Node);
      
      if (isOutsideDesktop && isOutsideMobile) {
        setIsRatesOpen(false);
      }
    }
    if (isRatesOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isRatesOpen]);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const settings = useQuery(api.settings?.getSettings || (() => null));
  
  const KES_RATE = 130;
  const nights = Math.max(1, differenceInDays(departureDate || new Date(), arrivalDate || new Date()));
  
  const getSeasonRate = (date: Date) => {
    const month = date.getMonth(); 
    const day = date.getDate();
    if ((month === 11 && day >= 20) || (month === 0 && day <= 5)) return 80000;
    if ((month >= 6 && month <= 9) || (month === 0 && day > 5) || month === 1 || month === 2) return 65000;
    return 56000;
  };

  let calculatedPriceKES = 0;
  if (bookingType === "stay") {
    let currentDate = new Date(arrivalDate || new Date());
    for (let i = 0; i < nights; i++) {
      calculatedPriceKES += getSeasonRate(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else {
    if (eventType.includes("Separate Day")) {
      calculatedPriceKES = 150000;
    } else {
      const selectedPkg = packages?.find((p: any) => p.title === eventType);
      if (selectedPkg) {
        calculatedPriceKES = selectedPkg.priceKES;
      }
    }
  }

  const totalPriceKES = calculatedPriceKES;
  const totalPriceUSD = Math.round(totalPriceKES / KES_RATE);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckAvailability = async () => {
    if (arrivalDate && departureDate && arrivalDate >= departureDate) {
      alert("Please select a Check Out date and time that is after your Book In date.");
      return;
    }
    
    setStep("checking");
    
    try {
      const result = await convex.query(api.bookings.checkAvailability, {
        checkIn: (arrivalDate || new Date()).getTime(),
        checkOut: (departureDate || new Date()).getTime(),
      });
      
      // Artificial delay just to show the checking animation for premium feel
      setTimeout(() => {
        if (result.available) {
          setStep("finalize");
        } else {
          if (result.suggestedArrival && result.suggestedDeparture) {
            setSuggestedDates({
              arrival: new Date(result.suggestedArrival),
              departure: new Date(result.suggestedDeparture)
            });
          }
          setStep("conflict");
        }
      }, 1000);
      
    } catch (e) {
      console.error(e);
      setStep("conflict");
    }
  };

  const acceptSuggestion = () => {
    if (suggestedDates) {
      setArrivalDate(suggestedDates.arrival);
      setDepartureDate(suggestedDates.departure);
      setStep("finalize");
    }
  };

  const variants = {
    initial: { x: 30, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -30, opacity: 0 }
  };

  return (
    <div className="min-h-[100dvh] w-full flex text-[#e8e0d4] bg-[#0a0a0a] overflow-hidden fixed inset-0">
      <div className="w-full h-[100dvh] flex flex-col md:flex-row relative">
        {/* Close Button / Back to Home */}
        <Link 
          href="/"
          className="absolute top-4 right-4 md:top-8 md:right-8 p-2 md:p-4 text-white hover:text-[#c2a27c] transition-colors z-[110] mix-blend-difference group cursor-pointer"
        >
          <X className="w-8 h-8 transition-transform duration-500 group-hover:rotate-90" strokeWidth={1} />
        </Link>
        
        {/* Left: Cinematic Image */}
        <div className="hidden md:block w-1/2 h-full relative overflow-hidden bg-[#050505] z-10">
          <AnimatePresence mode="wait">
            <motion.div
               key={currentSlide}
               initial={{ opacity: 0, scale: 1.05 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 1.5, ease: "easeInOut" }}
               className="absolute inset-0 w-full h-full"
            >
              <Image 
                src={slides[currentSlide].src} 
                alt={slides[currentSlide].subtitle} 
                fill 
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>
          
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a] opacity-80 z-10" />
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={`text-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-20 left-20 z-20"
            >
               <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#c2a27c] mb-4">{slides[currentSlide].subtitle}</p>
               <h2 className="text-5xl font-serif font-light whitespace-pre-line">{slides[currentSlide].title}</h2>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: The Elite Booking Interface */}
        <div data-lenis-prevent="true" className="dark-scrollbar w-full md:w-1/2 h-full pt-24 pb-6 px-6 md:pt-28 md:pb-8 md:px-12 lg:px-24 overscroll-contain relative z-20 bg-[#0a0a0a] flex flex-col overflow-y-auto">
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: SELECT DATES */}
            {step === "select" && (
              <motion.div key="select" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="w-full">
                <div className="mb-6">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light mb-4">Your Reservation</h2>
                  <div className="w-16 h-[1px] bg-[#c2a27c]"></div>
                </div>

                <div className="flex gap-4 border-b border-white/10 pb-6 mb-8 mt-2">
                  <button 
                    type="button" 
                    onClick={() => setBookingType("stay")}
                    className={`flex-1 py-4 text-xs md:text-sm font-mono tracking-widest uppercase transition-all duration-300 ${bookingType === "stay" ? "bg-white/10 text-[#c2a27c] border border-white/20" : "bg-black/40 text-white/40 hover:text-white border border-transparent"}`}
                  >
                    Book your stay
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setBookingType("event")}
                    className={`flex-1 py-4 text-xs md:text-sm font-mono tracking-widest uppercase transition-all duration-300 ${bookingType === "event" ? "bg-white/10 text-[#c2a27c] border border-white/20" : "bg-black/40 text-white/40 hover:text-white border border-transparent"}`}
                  >
                    Host an Event
                  </button>
                </div>

                <div className="space-y-6">
                  <p className="text-center font-mono text-[10px] tracking-[0.2em] uppercase text-white/50 w-full mb-2">Please select your date and time</p>
                  <div className="flex flex-row justify-between items-center border-b border-white/10 pb-6 gap-2 sm:gap-4 date-picker-wrapper relative z-[100]">
                    <div className="group cursor-pointer flex-1">
                      <p className="font-mono text-[10px] tracking-widest text-[#c2a27c] uppercase mb-2">Book In</p>
                      <DatePicker 
                        selected={arrivalDate} 
                        onChange={(date: Date | null) => {
                          setArrivalDate(date);
                          if (date && departureDate && date >= departureDate) {
                            const nextDay = new Date(date);
                            nextDay.setDate(nextDay.getDate() + 1);
                            setDepartureDate(nextDay);
                          }
                        }} 
                        selectsStart
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={30}
                        timeCaption="Time"
                        dateFormat="MMMM d, yyyy h:mm aa"
                        startDate={arrivalDate}
                        endDate={departureDate}
                        minDate={new Date()}
                        customInput={
                          <div className="flex items-baseline gap-1 sm:gap-2">
                            <span className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light transition-colors group-hover:text-white">
                              {arrivalDate ? format(arrivalDate, "dd") : "24"}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-light text-white/90 uppercase tracking-[0.2em] group-hover:text-white transition-colors leading-tight">
                              {arrivalDate ? format(arrivalDate, "MMM") : "Sep"}<br/>
                              {arrivalDate ? format(arrivalDate, "yyyy") : "2026"}<br/>
                              <span className="text-[#c2a27c] mt-1 block whitespace-nowrap">{mounted && arrivalDate ? format(arrivalDate, "h:mm a") : "2:00 PM"}</span>
                            </span>
                          </div>
                        }
                      />
                    </div>
                    <ArrowRight className="w-5 h-5 sm:w-8 sm:h-8 text-white/20 font-light flex-shrink-0" strokeWidth={0.5} />
                    <div className="group cursor-pointer text-right flex-1">
                      <p className="font-mono text-[10px] tracking-widest text-[#c2a27c] uppercase mb-2">Check Out</p>
                      <DatePicker 
                        selected={departureDate} 
                        onChange={(date: Date | null) => setDepartureDate(date)} 
                        selectsEnd
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={30}
                        timeCaption="Time"
                        dateFormat="MMMM d, yyyy h:mm aa"
                        startDate={arrivalDate}
                        endDate={departureDate}
                        minDate={arrivalDate || new Date()}
                        customInput={
                          <div className="flex items-baseline gap-1 sm:gap-2 justify-end">
                            <span className="text-[9px] sm:text-[10px] font-light text-white/90 uppercase tracking-[0.2em] text-right group-hover:text-white transition-colors leading-tight">
                              {departureDate ? format(departureDate, "MMM") : "Sep"}<br/>
                              {departureDate ? format(departureDate, "yyyy") : "2026"}<br/>
                              <span className="text-[#c2a27c] mt-1 block whitespace-nowrap">{mounted && departureDate ? format(departureDate, "h:mm a") : "11:00 AM"}</span>
                            </span>
                            <span className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light transition-colors group-hover:text-white">
                              {departureDate ? format(departureDate, "dd") : "28"}
                            </span>
                          </div>
                        }
                      />
                    </div>
                  </div>

                  {bookingType === "stay" ? (
                    <div className="flex flex-col gap-4 relative z-10">
                      <div className="flex justify-between items-center pb-4 border-b border-white/5">
                        <span className="font-serif text-2xl font-light">Adults</span>
                        <div className="flex items-center gap-6">
                          <button onClick={() => setAdults(Math.max(1, adults - 1))} className="p-2 text-white/50 hover:text-white transition-colors cursor-pointer"><Minus className="w-4 h-4" strokeWidth={1} /></button>
                          <input 
                            type="number" 
                            min="1" 
                            max={16 - children}
                            value={adults} 
                            onChange={(e) => {
                               let val = parseInt(e.target.value) || 1;
                               setAdults(Math.max(1, Math.min(16 - children, val)));
                            }}
                            className="font-mono text-xl w-12 text-center bg-transparent text-white focus:outline-none border border-transparent focus:border-white/20 rounded-md py-1" 
                          />
                          <button onClick={() => setAdults(adults + children < 16 ? adults + 1 : adults)} className="p-2 text-white/50 hover:text-white transition-colors cursor-pointer"><Plus className="w-4 h-4" strokeWidth={1} /></button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pb-4 border-b border-white/5">
                        <span className="font-serif text-2xl font-light">Children</span>
                        <div className="flex items-center gap-6">
                          <button onClick={() => setChildren(Math.max(0, children - 1))} className="p-2 text-white/50 hover:text-white transition-colors cursor-pointer"><Minus className="w-4 h-4" strokeWidth={1} /></button>
                          <input 
                            type="number" 
                            min="0" 
                            max={16 - adults}
                            value={children} 
                            onChange={(e) => {
                               let val = parseInt(e.target.value) || 0;
                               setChildren(Math.max(0, Math.min(16 - adults, val)));
                            }}
                            className="font-mono text-xl w-12 text-center bg-transparent text-white focus:outline-none border border-transparent focus:border-white/20 rounded-md py-1" 
                          />
                          <button onClick={() => setChildren(adults + children < 16 ? children + 1 : children)} className="p-2 text-white/50 hover:text-white transition-colors cursor-pointer"><Plus className="w-4 h-4" strokeWidth={1} /></button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-8 relative z-50">
                      <div>
                        <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-[#c2a27c] mb-4">Bridal Pick-Up Home</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {packages?.filter((p: any) => p.category === "Bridal Pick-Up Home" && p.isActive).map((pkg: any) => (
                            <button
                              key={pkg._id}
                              type="button"
                              onClick={() => setEventType(pkg.title)}
                              className={`p-4 text-left border rounded-xl transition-all duration-300 ${eventType === pkg.title ? "border-[#c2a27c] bg-[#c2a27c]/10" : "border-white/10 hover:border-white/30 bg-black/20"}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <p className={`font-serif text-xl ${eventType === pkg.title ? "text-[#c2a27c]" : "text-white"}`}>{pkg.title}</p>
                              </div>
                              <p className="text-sm font-light text-white/50 mb-2">{pkg.description}</p>
                              <p className="font-mono text-xs text-white">KES {pkg.priceKES.toLocaleString()}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-[#c2a27c] mb-4">Event Venue Rental</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {packages?.filter((p: any) => p.category === "Event Venue Rental" && p.isActive).map((pkg: any) => (
                            <button
                              key={pkg._id}
                              type="button"
                              onClick={() => setEventType(pkg.title)}
                              className={`p-4 text-left border rounded-xl transition-all duration-300 ${eventType === pkg.title ? "border-[#c2a27c] bg-[#c2a27c]/10" : "border-white/10 hover:border-white/30 bg-black/20"}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <p className={`font-serif text-lg ${eventType === pkg.title ? "text-[#c2a27c]" : "text-white"}`}>{pkg.title}</p>
                              </div>
                              <p className="text-sm font-light text-white/50 mb-2">{pkg.description}</p>
                              <p className="font-mono text-xs text-white">KES {pkg.priceKES.toLocaleString()}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 relative z-10">
                     <button onClick={handleCheckAvailability} className="relative group w-full flex items-center justify-between p-6 border border-white/10 hover:border-[#c2a27c] transition-colors cursor-pointer overflow-hidden">
                       <div className="absolute inset-0 bg-[#c2a27c] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-700 ease-[0.16,1,0.3,1]"></div>
                       <span className="relative z-10 font-serif text-2xl font-light group-hover:text-black transition-colors duration-700">Check Availability</span>
                       <ArrowRight className="relative z-10 w-6 h-6 group-hover:text-black transition-colors duration-700" strokeWidth={1} />
                     </button>
                     <div className="flex flex-col items-center gap-2 mt-4">
                       <p className="text-center font-mono text-[10px] tracking-widest text-white/30 uppercase">Secure Your Dates</p>
                       <button 
                         onClick={() => setIsPrivacyOpen(true)}
                         className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/20 hover:text-[#c2a27c] transition-colors cursor-pointer"
                       >
                         Privacy & Data Protection Policy
                       </button>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: CHECKING LOADER */}
            {step === "checking" && (
              <motion.div key="checking" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="w-full flex flex-col items-center justify-center h-full">
                 <div className="relative w-24 h-24 mb-12 flex items-center justify-center">
                   <motion.div 
                     className="absolute w-12 h-12 rounded-full bg-[#c2a27c] blur-[15px]"
                     animate={{ 
                       scale: [1, 1.8, 1],
                       opacity: [0.3, 0.7, 0.3]
                     }}
                     transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                   />
                   <motion.div 
                     className="relative w-6 h-6 rounded-full bg-[#c2a27c]"
                     animate={{ 
                       scale: [1, 1.2, 1],
                     }}
                     transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                   />
                 </div>
                 <h2 className="text-4xl font-serif font-light mb-4">Verifying Dates</h2>
                 <p className="font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase">Please wait a moment...</p>
              </motion.div>
            )}

            {/* STEP 3: CONFLICT RESOLUTION */}
            {step === "conflict" && (
              <motion.div key="conflict" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="w-full">
                 <div className="mb-12">
                   <p className="font-mono text-[10px] tracking-[0.2em] text-red-400 uppercase mb-4">Dates Unavailable</p>
                   <h2 className="text-4xl md:text-5xl font-serif font-light mb-4 leading-tight">Those dates are<br/>already reserved.</h2>
                   <div className="w-16 h-[1px] bg-red-400/50"></div>
                 </div>
                 
                 <p className="text-white/70 font-light mb-12">We cannot accommodate your exact request. However, our system has identified the next closest available window for your stay.</p>
                 
                 <div className="p-8 border border-[#c2a27c]/30 bg-[#c2a27c]/5 mb-12">
                    <p className="font-mono text-[10px] tracking-widest text-[#c2a27c] uppercase mb-6">Suggested Availability</p>
                    <div className="flex justify-between items-center">
                        <div>
                          <p className="font-serif text-3xl font-light">{suggestedDates && format(suggestedDates.arrival, "dd MMM")}</p>
                          <p className="text-white/50 text-sm font-light mt-1">Book In</p>
                          <p className="font-mono text-[10px] text-[#c2a27c]/70 mt-2">{suggestedDates && format(suggestedDates.arrival, "h:mm a")}</p>
                        </div>
                       <ArrowRight className="w-6 h-6 text-white/20 font-light" strokeWidth={1} />
                        <div className="text-right">
                          <p className="font-serif text-3xl font-light">{suggestedDates && format(suggestedDates.departure, "dd MMM")}</p>
                          <p className="text-white/50 text-sm font-light mt-1">Check Out</p>
                          <p className="font-mono text-[10px] text-[#c2a27c]/70 mt-2">{suggestedDates && format(suggestedDates.departure, "h:mm a")}</p>
                        </div>
                    </div>
                 </div>

                 <div className="flex flex-col gap-4">
                    <button onClick={acceptSuggestion} className="w-full bg-[#c2a27c] text-black font-serif text-xl font-light p-6 hover:bg-white transition-colors cursor-pointer">
                      Accept Suggested Dates
                    </button>
                    <button onClick={() => setStep("select")} className="w-full border border-white/10 text-white font-serif text-xl font-light p-6 hover:border-white/30 transition-colors cursor-pointer">
                      Choose Different Dates
                    </button>
                 </div>
              </motion.div>
            )}

            {/* STEP 4: FINALIZE */}
            {step === "finalize" && (
              <motion.div key="finalize" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="w-full">
                 <div className="mb-12">
                   <div className="flex items-center gap-4 mb-4">
                     <p className="font-mono text-[10px] tracking-[0.2em] text-[#c2a27c] uppercase">Dates Secured</p>
                     <div className="h-[1px] flex-1 bg-[#c2a27c]/30"></div>
                   </div>
                   <h2 className="text-4xl md:text-5xl font-serif font-light mb-4">Final Details</h2>
                 </div>

                 <form className="space-y-8" onSubmit={async (e) => { 
                   e.preventDefault(); 
                   try {
                     await createBooking({
                       guestName: fullName.trim(),
                       email,
                       adults: bookingType === "stay" ? adults : 0,
                       children: bookingType === "stay" ? children : 0,
                       checkIn: (arrivalDate || new Date()).getTime(),
                       checkOut: (departureDate || new Date()).getTime(),
                       specialRequests: specialRequests || undefined,
                       totalPrice: totalPriceUSD,
                       bookingType,
                       eventType: bookingType === "event" ? eventType : undefined,
                       eventGuests: bookingType === "event" ? eventGuests : undefined,
                     });
                     setStep("payment");
                   } catch (error) {
                     console.error("Booking failed:", error);
                     setStep("conflict");
                     // Generate a valid suggestion if none exists
                     if (!suggestedDates) {
                       const nextArrival = new Date(arrivalDate || new Date());
                       nextArrival.setDate(nextArrival.getDate() + 3);
                       const nextDeparture = new Date(departureDate || new Date());
                       nextDeparture.setDate(nextDeparture.getDate() + 3);
                       setSuggestedDates({ arrival: nextArrival, departure: nextDeparture });
                     }
                   }
                 }}>
                    <div className="grid grid-cols-1 gap-8">
                      <input required type="text" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Full Name" className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-sm focus:outline-none focus:border-[#c2a27c] transition-colors text-white placeholder-white/40" />
                    </div>
                    <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email Address" className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-sm focus:outline-none focus:border-[#c2a27c] transition-colors text-white placeholder-white/40" />
                    <textarea value={specialRequests} onChange={e=>setSpecialRequests(e.target.value)} placeholder="Special Requests (Optional)" rows={3} className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-sm focus:outline-none focus:border-[#c2a27c] transition-colors text-white placeholder-white/40 resize-none"></textarea>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/[0.02] border border-white/10 rounded-xl mt-8">
                      <div>
                        <p className="font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase mb-1">{bookingType === "stay" ? `Total Stay (${nights} Nights)` : `Event Pricing (${eventGuests} Guests)`}</p>
                        <p className="text-2xl font-serif text-white">KES {totalPriceKES.toLocaleString()}</p>
                      </div>
                      <div className="text-left md:text-right mt-4 md:mt-0">
                        <p className="font-mono text-[10px] tracking-[0.2em] text-[#c2a27c] uppercase mb-1">Equivalent</p>
                        <p className="text-sm font-mono text-[#c2a27c]">~ ${totalPriceUSD.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="pt-8">
                       <button type="submit" className="relative group w-full flex items-center justify-between p-8 border border-[#c2a27c] bg-[#c2a27c]/10 hover:bg-[#c2a27c] transition-colors duration-700 cursor-pointer overflow-hidden">
                         <span className="relative z-10 font-serif text-2xl font-light text-[#c2a27c] group-hover:text-black transition-colors duration-700">Confirm Reservation</span>
                         <ArrowRight className="relative z-10 w-6 h-6 text-[#c2a27c] group-hover:text-black transition-colors duration-700" strokeWidth={1} />
                       </button>
                    </div>
                    <div className="flex justify-center mt-4">
                       <button 
                         type="button"
                         onClick={() => setIsPrivacyOpen(true)}
                         className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/20 hover:text-[#c2a27c] transition-colors cursor-pointer"
                       >
                         Privacy & Data Protection Policy
                       </button>
                    </div>
                 </form>
                 <button onClick={() => setStep("select")} className="mt-8 font-mono text-[10px] tracking-[0.2em] text-white/30 uppercase hover:text-white transition-colors cursor-pointer text-center w-full block">
                    ← Edit Dates
                 </button>
              </motion.div>
            )}

            {/* STEP 5: PAYMENT INSTRUCTIONS */}
            {step === "payment" && (
              <motion.div key="payment" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="w-full flex flex-col h-full max-w-xl mx-auto">
                 <div className="text-center mb-8">
                   <div className="inline-flex items-center gap-4 mb-4">
                     <p className="font-mono text-[10px] tracking-[0.2em] text-[#c2a27c] uppercase">Secure Your Booking</p>
                   </div>
                   <h2 className="text-4xl md:text-5xl font-serif font-light mb-4">Payment Details</h2>
                   <p className="text-white/70 font-light text-sm">Please complete your payment using one of the methods below to secure your dates. A confirmation email has been sent.</p>
                 </div>

                 <div className="space-y-6 mb-12 flex-1">
                   {/* Mpesa Option */}
                   <div className="border border-white/10 rounded-xl p-6 bg-white/[0.02]">
                     <h3 className="font-serif text-2xl mb-4 text-[#c2a27c]">M-PESA Send Money</h3>
                     <div className="space-y-2 font-light">
                       <div className="flex justify-between items-center border-b border-white/5 pb-2">
                         <span className="text-white/50 text-sm">Phone Number</span>
                         <button onClick={() => handleCopy("0708443090", "mpesa")} className="flex items-center gap-2 hover:text-[#c2a27c] transition-colors cursor-pointer group/copy">
                           <span className="font-mono text-sm tracking-wider">0708443090</span>
                           {copiedMpesa ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-white/20 group-hover/copy:text-[#c2a27c]" />}
                         </button>
                       </div>
                       <div className="flex justify-between items-center pt-2">
                         <span className="text-white/50 text-sm">Account Name</span>
                         <span className="text-sm">Patricia Ngugi</span>
                       </div>
                     </div>
                   </div>

                   {/* Equity Bank Option */}
                   <div className="border border-white/10 rounded-xl p-6 bg-white/[0.02]">
                     <h3 className="font-serif text-2xl mb-4 text-[#c2a27c]">Equity Bank</h3>
                     <div className="space-y-2 font-light">
                       <div className="flex justify-between items-center border-b border-white/5 pb-2">
                         <span className="text-white/50 text-sm">Account Number</span>
                         <button onClick={() => handleCopy("0590163474798", "equity")} className="flex items-center gap-2 hover:text-[#c2a27c] transition-colors cursor-pointer group/copy">
                           <span className="font-mono text-sm tracking-wider">0590163474798</span>
                           {copiedEquity ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-white/20 group-hover/copy:text-[#c2a27c]" />}
                         </button>
                       </div>
                       <div className="flex justify-between items-center pt-2">
                         <span className="text-white/50 text-sm">Account Name</span>
                         <span className="text-sm">Patricia Wangui ngugi</span>
                       </div>
                     </div>
                   </div>
                 </div>

                 <button onClick={() => setStep("success")} className="w-full h-16 bg-[#c2a27c] text-black hover:bg-white transition-colors duration-300 font-mono text-[10px] tracking-[0.2em] uppercase cursor-pointer shrink-0 mt-4 mb-8">
                    Payment Completed
                 </button>
              </motion.div>
            )}

            {/* STEP 6: SUCCESS */}
            {step === "success" && (
              <motion.div key="success" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="w-full flex flex-col items-center justify-center text-center h-full">
                 <div className="w-20 h-20 rounded-full border border-[#c2a27c] flex items-center justify-center mb-8">
                    <ArrowRight className="w-8 h-8 text-[#c2a27c] -rotate-45" strokeWidth={1} />
                 </div>
                 <h2 className="text-4xl md:text-5xl font-serif font-light mb-6 whitespace-pre-line">{bookingType === "stay" ? "Your Retreat\nAwaits Verification." : "Your Event\nIs Requested."}</h2>
                 <p className="text-white/70 font-light max-w-sm mx-auto mb-12">Your booking is currently pending. Once our team validates your payment, you will receive a final confirmation email securing your reservation.</p>
                 <Link href="/" className="font-mono text-xs uppercase tracking-widest text-[#c2a27c] hover:text-white transition-colors">
                   Return to Main Site
                 </Link>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

      {/* Rates Booklet Drawer - Desktop (Hidden behind right panel, slides to the left) */}
      <div ref={desktopDrawerRef} className={`hidden md:flex fixed top-0 left-1/2 h-full w-[400px] bg-[#050505] border-l border-[#c2a27c]/20 shadow-2xl transition-transform duration-500 ease-[0.16,1,0.3,1] z-[15] pointer-events-auto transform ${isRatesOpen ? '-translate-x-full' : 'translate-x-0'} flex-col`}>
        
        {/* Toggle Button attached to the left edge */}
        <button 
          onClick={() => setIsRatesOpen(!isRatesOpen)}
          className="absolute top-1/2 -left-[2.5rem] -translate-y-1/2 w-10 bg-[#c2a27c] text-black py-6 flex flex-col items-center justify-center gap-3 hover:bg-white transition-colors cursor-pointer border border-[#c2a27c]/50 rounded-l-md shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        >
          {isRatesOpen ? <ChevronRight className="w-4 h-4" strokeWidth={1.5} /> : <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />}
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>Rates</span>
        </button>

        <div className="p-8 pt-24 border-b border-white/10 flex-shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#c2a27c] blur-[100px] opacity-10 rounded-full" />
          <h2 className="font-serif text-3xl font-light text-[#c2a27c] relative z-10">Rate Card</h2>
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/50 mt-2 relative z-10">Ficus & Figs Pricing</p>
        </div>
        <div data-lenis-prevent="true" className="p-8 flex-1 overflow-y-auto space-y-10 dark-scrollbar relative overscroll-contain">
           <div>
             <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#c2a27c] mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
               <span>Stays (Per Night)</span>
             </h3>
             <ul className="space-y-6">
               <li className="flex justify-between items-end group">
                 <div>
                   <p className="font-serif text-xl text-white group-hover:text-[#c2a27c] transition-colors">Low Season</p>
                   <p className="font-mono text-[9px] uppercase tracking-wider text-white/40 mt-1">Apr-Jun, Nov-Dec 19</p>
                 </div>
                 <p className="font-mono text-sm text-white">KES 56,000</p>
               </li>
               <li className="flex justify-between items-end group">
                 <div>
                   <p className="font-serif text-xl text-white group-hover:text-[#c2a27c] transition-colors">High Season</p>
                   <p className="font-mono text-[9px] uppercase tracking-wider text-white/40 mt-1">Jul-Oct, Jan 6-Mar 31</p>
                 </div>
                 <p className="font-mono text-sm text-white">KES 65,000</p>
               </li>
               <li className="flex justify-between items-end group">
                 <div>
                   <p className="font-serif text-xl text-white group-hover:text-[#c2a27c] transition-colors">Festive Season</p>
                   <p className="font-mono text-[9px] uppercase tracking-wider text-white/40 mt-1">Dec 20 - Jan 5</p>
                 </div>
                 <p className="font-mono text-sm text-white">KES 80,000</p>
               </li>
             </ul>
           </div>
           <div>
             <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#c2a27c] mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
               <span>Bridal Pick-Up Home</span>
             </h3>
             <ul className="space-y-6">
               {packages?.filter((p: any) => p.category === "Bridal Pick-Up Home" && p.isActive).map((pkg: any) => (
                 <li key={pkg._id} className="flex justify-between items-end group">
                   <div>
                     <p className="font-serif text-lg text-white group-hover:text-[#c2a27c] transition-colors">{pkg.title}</p>
                     <p className="font-mono text-[9px] uppercase tracking-wider text-white/40 mt-1">{pkg.description}</p>
                   </div>
                   <p className="font-mono text-sm text-white">KES {pkg.priceKES.toLocaleString()}</p>
                 </li>
               ))}
             </ul>
           </div>
           
           <div>
             <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#c2a27c] mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
               <span>Event Venue Rental</span>
             </h3>
             <ul className="space-y-6">
               {packages?.filter((p: any) => p.category === "Event Venue Rental" && p.isActive).map((pkg: any) => (
                 <li key={pkg._id} className="flex justify-between items-end group">
                   <div>
                     <p className="font-serif text-lg text-white group-hover:text-[#c2a27c] transition-colors">{pkg.title}</p>
                     <p className="font-mono text-[9px] uppercase tracking-wider text-white/40 mt-1">{pkg.description}</p>
                   </div>
                   <p className="font-mono text-sm text-white">KES {pkg.priceKES.toLocaleString()}</p>
                 </li>
               ))}
             </ul>
           </div>
        </div>
      </div>

      {/* Rates Booklet Drawer - Mobile (Slides from right edge) */}
      <div ref={mobileDrawerRef} className={`md:hidden fixed top-0 right-0 h-[100dvh] w-[85vw] max-w-[400px] bg-[#050505] border-l border-[#c2a27c]/20 z-[120] shadow-2xl transition-transform duration-500 ease-[0.16,1,0.3,1] transform ${isRatesOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <button 
          onClick={() => setIsRatesOpen(!isRatesOpen)}
          className="absolute bottom-32 -left-[2.5rem] w-10 bg-[#c2a27c] text-black py-6 flex flex-col items-center justify-center gap-3 hover:bg-white transition-colors rounded-l-md shadow-[0_0_20px_rgba(0,0,0,0.5)] cursor-pointer border border-[#c2a27c]/50"
        >
          {isRatesOpen ? <ChevronRight className="w-4 h-4" strokeWidth={1.5} /> : <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />}
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>Rates</span>
        </button>
        <div className="p-8 pt-24 border-b border-white/10 flex-shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#c2a27c] blur-[100px] opacity-10 rounded-full" />
          <h2 className="font-serif text-3xl font-light text-[#c2a27c] relative z-10">Rate Card</h2>
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/50 mt-2 relative z-10">Pricing</p>
        </div>
        <div data-lenis-prevent="true" className="p-8 flex-1 overflow-y-auto space-y-10 dark-scrollbar relative overscroll-contain">
           <div>
             <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#c2a27c] mb-6 border-b border-white/10 pb-4">Stays (Per Night)</h3>
             <ul className="space-y-6">
               <li className="flex justify-between items-end">
                 <div><p className="font-serif text-xl text-white">Low</p></div>
                 <p className="font-mono text-sm text-white">KES 56,000</p>
               </li>
               <li className="flex justify-between items-end">
                 <div><p className="font-serif text-xl text-white">High</p></div>
                 <p className="font-mono text-sm text-white">KES 65,000</p>
               </li>
               <li className="flex justify-between items-end">
                 <div><p className="font-serif text-xl text-white">Festive</p></div>
                 <p className="font-mono text-sm text-white">KES 80,000</p>
               </li>
             </ul>
           </div>
           <div>
             <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#c2a27c] mb-6 border-b border-white/10 pb-4">Weddings & Events</h3>
             <ul className="space-y-6">
               <li className="flex justify-between items-end">
                 <div><p className="font-serif text-xl text-white">Intimate</p></div>
                 <p className="font-mono text-sm text-white">KES 50,000</p>
               </li>
               <li className="flex justify-between items-end">
                 <div><p className="font-serif text-xl text-white">Standard</p></div>
                 <p className="font-mono text-sm text-white">KES 70,000</p>
               </li>
               <li className="flex justify-between items-end">
                 <div><p className="font-serif text-xl text-white">Grand</p></div>
                 <p className="font-mono text-sm text-white">KES 100,000</p>
               </li>
             </ul>
           </div>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isRatesOpen && (
        <div className="fixed md:hidden inset-0 bg-black/60 backdrop-blur-sm z-[110]" onClick={() => setIsRatesOpen(false)} />
      )}

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {isPrivacyOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsPrivacyOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
            />
            
            <motion.div 
              data-lenis-prevent="true"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-[#100f0d] border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl overscroll-contain"
            >
              <button 
                onClick={() => setIsPrivacyOpen(false)}
                className="absolute top-6 right-6 font-mono text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors"
              >
                Close
              </button>
              
              <h2 className="text-3xl font-serif mb-8 text-[#c2a27c]">Privacy Policy</h2>
              <div className="text-white/70 font-light leading-relaxed space-y-6 text-sm whitespace-pre-wrap font-sans">
                {PRIVACY_CONTENT}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
