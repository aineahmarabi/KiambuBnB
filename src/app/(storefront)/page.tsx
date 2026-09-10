"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { Trees, BedDouble, Bath, Wine, Coffee, MapPin, Navigation2 } from "lucide-react";
import { Footer } from "@/components/Footer";
import { GalleryOverlay } from "@/components/GalleryOverlay";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const HERO_IMAGES = [
  "/images/IMG_9297.JPG.jpeg",
  "/images/IMG_9299.JPG.jpeg",
  "/images/IMG_9302.JPG.jpeg",
  "/images/IMG_9305.JPG.jpeg",
  "/images/IMG_9303.JPG.jpeg"
];

const FAN_IMAGES = [
  "/images/IMG_9264.JPG.jpeg",
  "/images/IMG_9258.JPG.jpeg",
  "/images/IMG_9266.JPG.jpeg",
  "/images/IMG_9273.JPG.jpeg",
  "/images/IMG_9280.JPG.jpeg"
];

const HEADLINES = [
  { line1: "A Rustic", line2: "8-Bedroom Home" },
  { line1: "An Exclusive", line2: "Event Venue" },
  { line1: "The Ultimate", line2: "Bridal Pick-Up" },
  { line1: "A Sanctuary For", line2: "Family Getaways" },
  { line1: "An Inspiring", line2: "Corporate Retreat" },
  { line1: "Sun-Drenched Days", line2: "By The Pool" },
  { line1: "Lush Gardens For", line2: "Timeless Memories" }
];

export default function Storefront() {
  const containerRef = useRef<HTMLElement>(null);
  const fanContainerRef = useRef<HTMLDivElement>(null);
  const diagonalContainerRef = useRef<HTMLElement>(null);
  const diagonalContentRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Load initial cycle count from session storage on mount
  useEffect(() => {
    const savedCount = sessionStorage.getItem("heroCycleCount");
    if (savedCount) {
      setCycleCount(parseInt(savedCount, 10));
    }
  }, []);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (cycleCount >= 2) return; // Stop cycling after 2 complete phases

    const delay = currentHeadlineIndex === 0 ? 12000 : 5000;
    const headlineTimer = setTimeout(() => {
      setCurrentHeadlineIndex((prev) => {
        const nextIndex = (prev + 1) % HEADLINES.length;
        if (nextIndex === 0) {
          setCycleCount(c => {
            const newCount = c + 1;
            sessionStorage.setItem("heroCycleCount", newCount.toString());
            return newCount;
          });
        }
        return nextIndex;
      });
    }, delay);
    
    return () => clearTimeout(headlineTimer);
  }, [currentHeadlineIndex, cycleCount]);

  useEffect(() => {
    let ctx = gsap.context(() => {

      // ─── Lando Norris hero recession effect ─────────────────────────────────
      if (heroRef.current) {
        gsap.to(heroRef.current, {
          scale: 0.85,
          borderRadius: "28px",
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current.parentElement,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
      // ─────────────────────────────────────────────────────────────────────────

      // ─── Statement Word Stagger ──────────────────────────────────────────────
      gsap.utils.toArray<HTMLElement>('.stagger-sentence').forEach((sentence) => {
        const words = sentence.querySelectorAll('.stagger-word');
        gsap.fromTo(words,
          { x: 30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.05,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sentence,
              start: "top 85%",
            }
          }
        );
      });
      // ─────────────────────────────────────────────────────────────────────────

      // ─── Diagonal Horizontal Scroll (The Suites) ──────────────────────────────
      if (diagonalContainerRef.current && diagonalContentRef.current) {
        gsap.to(diagonalContentRef.current, {
          x: () => -(diagonalContentRef.current!.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: diagonalContainerRef.current,
            start: "top top",
            end: () => "+=" + (diagonalContentRef.current!.scrollWidth - window.innerWidth),
            pin: true,
            scrub: 1.5,
            invalidateOnRefresh: true,
          }
        });
      }
      // ─────────────────────────────────────────────────────────────────────────

      // ─── Card Fan-Out Effect ───────────────────────────────────────────────
      if (fanContainerRef.current) {
        const cards = gsap.utils.toArray('.fan-card');
        const isMobile = window.innerWidth < 768;
        
        gsap.to(cards, {
          rotate: (i: number) => (i - 2) * (isMobile ? 6 : 11), // More dramatic tilt
          xPercent: (i: number) => (i - 2) * (isMobile ? 20 : 34), // Wider spread
          yPercent: (i: number) => Math.abs(i - 2) * (isMobile ? 3 : 6),
          scale: (i: number) => 1 - Math.abs(i - 2) * 0.02,
          duration: 3, // Very gradual animation
          ease: "power4.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: fanContainerRef.current,
            start: "top 70%",
            once: true,
          },
        });
      }
      // ─────────────────────────────────────────────────────────────────────────

      gsap.utils.toArray<HTMLElement>('.slide-in').forEach((item, i) => {
        gsap.fromTo(item,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: "power3.out",
            delay: (i % 3) * 0.08,
            scrollTrigger: {
              trigger: item,
              start: "top 88%",
            }
          }
        );
      });

      gsap.utils.toArray<HTMLElement>('.slide-in-left').forEach((item) => {
        gsap.fromTo(item,
          { x: -80, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 88%",
            }
          }
        );
      });

      gsap.utils.toArray<HTMLElement>('.parallax-image').forEach((img) => {
        gsap.fromTo(img, 
          { scale: 1.1, y: -20 }, 
          { 
            scale: 1, 
            y: 20,
            ease: "none",
            scrollTrigger: {
              trigger: img.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          }
        );
      });
    }, containerRef);
    
    // Refresh after paint so pinned sections don't break scroll positions
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    
    return () => { ctx.revert(); clearTimeout(t); };
  }, []);

  return (
    <>
      <GalleryOverlay isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
      
      {/* SVG Filters for Liquid Displacement */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="liquid">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise">
            <animate attributeName="baseFrequency" values="0.02;0.03;0.02" dur="8s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <main ref={containerRef} className="bg-[#100f0d] text-[#e8e0d4] selection:bg-[#c2a27c] selection:text-black overflow-x-hidden">
      
      {/* ACT I: The Arrival (Rich Hero) */}
      {/* Sticky wrapper holds position; inner div is what gets scaled */}
      <section
        id="hero"
        className="relative h-screen w-full overflow-hidden bg-black"
        style={{ position: "sticky", top: 0, zIndex: 1 }}
      >
        <div
          ref={heroRef}
          className="absolute inset-0 w-full h-full will-change-transform"
          style={{ transformOrigin: "center center" }}
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentHeroIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image 
                src={HERO_IMAGES[currentHeroIndex]} 
                alt="The BnB Exterior" 
                fill 
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

          {/* Hero text sits inside the scaled div so it moves with it */}
          <div className="absolute inset-0 z-20 flex items-center justify-center mt-20">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
              className="flex flex-col items-center w-full px-4"
            >
              <div className="mb-6 h-[180px] md:h-[220px] w-full flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.h1 
                    key={currentHeadlineIndex}
                    initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight uppercase font-light text-center text-balance leading-tight m-0 w-full"
                  >
                    {HEADLINES[currentHeadlineIndex].line1}<br/>{HEADLINES[currentHeadlineIndex].line2}
                  </motion.h1>
                </AnimatePresence>
              </div>
              <div className="w-16 h-[1px] bg-[#c2a27c] mb-6"></div>
              <p className="font-mono tracking-[0.2em] text-[#c2a27c] text-sm uppercase mb-8">Welcome to Ficus &amp; Figs</p>
              <Link 
                href="/reserve"
                className="group relative inline-flex items-center justify-center px-10 py-4 mb-10"
              >
                <div className="absolute inset-0 border border-[#c2a27c] bg-[#c2a27c]/10 skew-x-[-15deg] overflow-hidden transition-colors duration-500">
                  <div className="absolute inset-0 bg-[#c2a27c] -translate-x-[105%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                </div>
                <span className="relative z-10 font-mono text-xs uppercase tracking-[0.2em] text-[#c2a27c] group-hover:text-black transition-colors duration-700 font-bold">Reserve Your Space</span>
              </Link>
              {/* Hero Bullets */}
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-4 py-1.5">
                  <BedDouble className="w-3.5 h-3.5 text-[#c2a27c]" strokeWidth={1.5} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/70">8 Bedrooms</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-4 py-1.5">
                  <svg className="w-3.5 h-3.5 text-[#c2a27c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M2 12c0 5.523 4.477 10 10 10s10-4.477 10-10M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10M12 2v4M12 18v4"/></svg>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/70">Private Pool</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-4 py-1.5">
                  <Trees className="w-3.5 h-3.5 text-[#c2a27c]" strokeWidth={1.5} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/70">Lush Gardens</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-4 py-1.5">
                  <Wine className="w-3.5 h-3.5 text-[#c2a27c]" strokeWidth={1.5} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/70">Event Venue</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-4 py-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#c2a27c]" strokeWidth={1.5} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/70">Kiambu, Kenya</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Rest of page scrolls OVER the shrinking hero */}
      <div className="relative z-10 bg-[#100f0d]">

      {/* STATEMENT: Big bold line right after hero */}
      <section className="py-20 md:py-28 px-6 overflow-hidden border-b border-white/5">
        <p className="stagger-sentence font-serif text-3xl md:text-5xl lg:text-6xl font-light text-white/90 max-w-5xl mx-auto leading-snug">
          <span className="stagger-word inline-block">Book</span>{" "}
          <span className="stagger-word inline-block">a</span>{" "}
          <span className="stagger-word inline-block">session</span>{" "}
          <span className="stagger-word inline-block">with</span>{" "}
          <span className="stagger-word inline-block">nature</span>{" "}
          <span className="stagger-word inline-block">and</span>{" "}
          <span className="stagger-word inline-block">escape</span>{" "}
          <span className="stagger-word inline-block">the</span>{" "}
          <span className="stagger-word inline-block">busy</span>{" "}
          <span className="stagger-word inline-block">city</span>{" "}
          <span className="stagger-word inline-block">life</span>{" "}
          <span className="stagger-word inline-block">&mdash;</span>{" "}
          <em className="text-[#c2a27c] not-italic stagger-word inline-block">plan</em>{" "}
          <em className="text-[#c2a27c] not-italic stagger-word inline-block">your</em>{" "}
          <em className="text-[#c2a27c] not-italic stagger-word inline-block">picnic</em>{" "}
          <em className="text-[#c2a27c] not-italic stagger-word inline-block">or</em>{" "}
          <em className="text-[#c2a27c] not-italic stagger-word inline-block">bridal</em>{" "}
          <em className="text-[#c2a27c] not-italic stagger-word inline-block">pickup</em>{" "}
          <em className="text-[#c2a27c] not-italic stagger-word inline-block">in</em>{" "}
          <em className="text-[#c2a27c] not-italic stagger-word inline-block">peace.</em>
        </p>
      </section>

      {/* ACT II: The Grounds & Pool (Rich Bento) */}
      <section id="grounds" className="py-24 md:py-40 px-6 md:px-12 max-w-[100rem] mx-auto">
        <div className="text-center mb-20 slide-in">
          <Trees className="w-8 h-8 mx-auto text-[#c2a27c] mb-6" strokeWidth={1} />
          <h2 className="text-4xl md:text-6xl font-serif font-light mb-4">Space to Breathe</h2>
          <p className="text-white/60 max-w-2xl mx-auto font-light">Surrounded by nature, our grounds offer a sanctuary of absolute silence. Featuring a beautiful pool, lush garden, and dedicated staff quarters.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Pool Image */}
          <div className="md:col-span-8 aspect-[16/10] relative overflow-hidden rounded-xl border border-white/5 slide-in group">
            <Image src="/images/IMG_9258.JPG.jpeg" alt="The Pool" fill className="object-cover parallax-image transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
              <span className="font-mono text-sm tracking-widest uppercase text-white/90 drop-shadow-md">The Grand Pool</span>
            </div>
          </div>
          
          <div className="md:col-span-4 flex flex-col gap-6">
             <div className="flex-1 relative overflow-hidden rounded-xl border border-white/5 slide-in group aspect-square md:aspect-auto">
               <Image src="/images/IMG_9260.JPG.jpeg" alt="Lush Gardens" fill className="object-cover parallax-image transition-transform duration-700 group-hover:scale-105" />
             </div>
             <div className="flex-1 relative overflow-hidden rounded-xl border border-white/5 slide-in group aspect-square md:aspect-auto">
               <Image src="/images/IMG_9261.JPG.jpeg" alt="Garden Path" fill className="object-cover parallax-image transition-transform duration-700 group-hover:scale-105" />
             </div>
          </div>
        </div>

        <div className="w-full aspect-[21/9] relative overflow-hidden rounded-xl border border-white/5 mt-6 slide-in group">
          <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110 group-hover:[filter:url(#liquid)]">
            <Image src="/images/IMG_9278.JPG.jpeg" alt="Pool" fill className="object-cover parallax-image" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-sm bg-black/20">
             <p className="font-serif text-4xl md:text-6xl italic text-white drop-shadow-lg">Immerse Yourself</p>
          </div>
        </div>
      </section>

      <section id="suites" ref={diagonalContainerRef} className="h-screen w-full bg-[#100f0d] flex flex-col justify-center relative border-y border-white/5 overflow-hidden">
        <div className="absolute top-10 md:top-20 left-6 md:left-12 z-50 slide-in">
          <BedDouble className="w-8 h-8 text-[#c2a27c] mb-6" strokeWidth={1} />
          <h2 className="text-4xl md:text-6xl font-serif font-light mb-4">Eight Sanctuaries</h2>
          <p className="font-mono tracking-widest text-[#c2a27c] text-xs uppercase mb-4">Uncompromising Comfort</p>
          <div className="w-12 h-[1px] bg-[#c2a27c]"></div>
        </div>

        {/* Clean horizontal scroll track — no rotations */}
        <div 
          ref={diagonalContentRef} 
          className="flex flex-row w-max items-center h-[70vh] px-[20vw] gap-12 md:gap-20 mt-32"
        >
          {/* Card 1: Text + Master Image */}
          <div className="flex gap-8 items-center w-[85vw] md:w-[50vw]">
            <div className="w-1/3 shrink-0">
              <h3 className="text-2xl md:text-3xl font-serif mb-4 text-[#e8e0d4]">The Master Ensuites</h3>
              <p className="text-white/60 text-sm leading-relaxed">Vaulted ceilings, intricate parquet flooring. Two masterful suites designed for pure rejuvenation.</p>
            </div>
            <div className="w-2/3 h-full aspect-[4/5] relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <Image src="/images/IMG_9269.JPG.jpeg" alt="Master Suite One" fill className="object-cover" />
            </div>
          </div>

          {/* Card 2: Master Two — wide landscape */}
          <div className="w-[75vw] md:w-[45vw] aspect-[16/9] shrink-0 relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <Image src="/images/IMG_9273.JPG.jpeg" alt="Master Suite Two" fill className="object-cover" />
          </div>

          {/* Card 3: Guest Quarters — image + text */}
          <div className="flex gap-8 items-center w-[85vw] md:w-[50vw]">
            <div className="w-2/3 aspect-[4/5] shrink-0 relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <Image src="/images/IMG_9270.JPG.jpeg" alt="Twin Guest Suite" fill className="object-cover" />
            </div>
            <div className="w-1/3 shrink-0">
              <h3 className="text-2xl md:text-3xl font-serif mb-4 text-[#e8e0d4]">Guest Quarters</h3>
              <p className="text-white/60 text-sm leading-relaxed">Six exquisitely appointed bedrooms providing a serene escape. Perfect for family.</p>
            </div>
          </div>

          {/* Card 4: Portrait card */}
          <div className="w-[55vw] md:w-[28vw] aspect-[3/4] shrink-0 relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <Image src="/images/IMG_9262.JPG.jpeg" alt="Guest Suite Yellow" fill className="object-cover" />
          </div>

          {/* Card 5: Two stacked video cards */}
          <div className="flex flex-col gap-6 w-[75vw] md:w-[38vw] shrink-0">
            <div className="aspect-video relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <Image src="/images/IMG_9256.JPG.jpeg" alt="Guest Detail" fill className="object-cover" />
            </div>
            <div className="aspect-video relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <Image src="/images/IMG_9279.JPG.jpeg" alt="Guest Detail 2" fill className="object-cover" />
            </div>
          </div>

          {/* Card 6: Bathrooms */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center w-[85vw] md:w-[55vw] shrink-0">
            <div className="w-full md:w-1/4 shrink-0 text-center md:text-left">
              <Bath className="w-8 h-8 text-[#c2a27c] mb-4 md:mb-6 mx-auto md:mx-0" strokeWidth={1} />
              <h3 className="text-2xl md:text-3xl font-serif mb-4 text-[#e8e0d4]">Modern Elegance</h3>
              <p className="text-white/60 text-sm leading-relaxed">Premium finishes and abundant natural light.</p>
            </div>
            <div className="w-full md:w-3/4 grid grid-cols-3 gap-3 shrink-0">
              <div className="aspect-[3/4] relative overflow-hidden rounded-2xl border border-white/10"><Image src="/images/IMG_9265.JPG.jpeg" alt="Bath 1" fill className="object-cover" /></div>
              <div className="aspect-[3/4] relative overflow-hidden rounded-2xl border border-white/10"><Image src="/images/IMG_9266.JPG.jpeg" alt="Bath 2" fill className="object-cover" /></div>
              <div className="aspect-[3/4] relative overflow-hidden rounded-2xl border border-white/10"><Image src="/images/IMG_9267.JPG.jpeg" alt="Bath 3" fill className="object-cover" /></div>
            </div>
          </div>
        </div>
      </section>

      <section id="living" className="py-24 md:py-40 px-6 md:px-12 max-w-[100rem] mx-auto">
        <div className="w-full text-center space-y-8 mb-24 slide-in">
          <Wine className="w-8 h-8 mx-auto text-[#c2a27c]" strokeWidth={1} />
          <h2 className="text-4xl md:text-6xl font-serif font-light mb-4">Gatherings &amp; Events</h2>
          <p className="font-mono tracking-widest text-[#c2a27c] text-xs uppercase">Weddings • Parties • Picnics</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-24">
          <div className="md:col-span-7 aspect-[16/10] relative overflow-hidden rounded-xl border border-white/5 slide-in group">
            <Image src="/images/IMG_9274.JPG.jpeg" alt="Grand Living Room" fill className="object-cover parallax-image" />
          </div>
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="backdrop-blur-md bg-white/5 border border-white/10 p-8 rounded-xl slide-in-left">
               <p className="text-white/70 font-light leading-relaxed">Whether you are planning a grand family reunion or an unforgettable celebration, Ficus &amp; Figs is the perfect canvas. Our expansive grounds and grand living areas are perfectly equipped to host spectacular weddings, private parties, and elegant picnics under the sun.</p>
            </div>
            <div className="flex-1 relative overflow-hidden rounded-xl border border-white/5 slide-in group min-h-[250px]">
              <Image src="/images/IMG_9275.JPG.jpeg" alt="Living Room View" fill className="object-cover parallax-image" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 order-2 md:order-1 flex flex-col gap-6">
             <div className="aspect-[4/3] relative overflow-hidden rounded-xl border border-white/5 slide-in group">
               <Image src="/images/IMG_9277.JPG.jpeg" alt="Fireplace Lounge" fill className="object-cover parallax-image" />
             </div>
             <div className="aspect-video relative overflow-hidden rounded-xl border border-white/5 slide-in group">
               <Image src="/images/IMG_9276.JPG.jpeg" alt="Living Detail" fill className="object-cover parallax-image" />
             </div>
          </div>
          <div className="md:col-span-7 order-1 md:order-2 flex flex-col gap-6">
            <div className="text-center md:text-left slide-in-left">
              <Coffee className="w-8 h-8 text-[#c2a27c] mb-4 mx-auto md:mx-0" strokeWidth={1} />
              <h3 className="text-3xl font-serif font-light mb-4">Culinary Comfort</h3>
            </div>
            <div className="aspect-[4/5] relative overflow-hidden rounded-xl border border-white/5 slide-in group w-full">
              <Image src="/images/IMG_9268.JPG.jpeg" alt="Modern Kitchen" fill className="object-cover parallax-image" />
            </div>
          </div>
        </div>
      </section>

      {/* ACT V: The Courtyard (Gallery Finale - Fan Out Effect) */}
      <section id="gallery" className="pt-12 pb-16 md:py-24 bg-[#100f0d]">
        <div ref={fanContainerRef} className="w-full flex flex-col items-center justify-center relative gap-8 md:gap-16">
          <div className="text-center z-50">
            <h2 className="text-4xl md:text-6xl font-serif font-light mb-0">The Gallery</h2>
          </div>
          
          <div className="relative w-[55vw] md:w-[25vw] aspect-[3/4] cursor-pointer group z-10"
               onClick={() => {
                 if (navigator.vibrate) navigator.vibrate(50);
                 setIsGalleryOpen(true);
               }}>
            {FAN_IMAGES.map((src, idx) => (
              <div 
                key={idx} 
                className="fan-card absolute inset-0 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                style={{ 
                  zIndex: idx === 2 ? 50 : 40 - Math.abs(idx - 2),
                  transformOrigin: "bottom center"
                }}
              >
                <Image src={src} alt="Gallery Card" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500"></div>
              </div>
            ))}
            <div className="absolute inset-0 z-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
               <span className="font-mono text-[10px] uppercase tracking-widest text-black bg-[#c2a27c] px-6 py-3 rounded-full shadow-[0_0_20px_rgba(194,162,124,0.5)]">Enter Dimensions</span>
            </div>
          </div>
        </div>
      </section>

      <section id="location" className="pt-12 pb-24 md:py-40 px-6 md:px-12 max-w-[100rem] mx-auto">
        <div className="w-full text-center space-y-8 mb-16 slide-in">
          <MapPin className="w-8 h-8 mx-auto text-[#c2a27c]" strokeWidth={1} />
          <h2 className="text-4xl md:text-6xl font-serif font-light">Find Your Way</h2>
          <p className="text-white/60 font-light max-w-xl mx-auto">Nestled in the serene landscapes of Kiambu. Our gates are always open for you.</p>
        </div>

        <div className="w-full aspect-square md:aspect-[21/9] relative overflow-hidden rounded-xl border border-white/10 slide-in group">
          {/* Placeholder Map iframe */}
          <iframe 
            src="https://maps.google.com/maps?q=Kiambu,Kenya&t=&z=13&ie=UTF8&iwloc=&output=embed" 
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(85%)' }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 grayscale opacity-70 group-hover:opacity-100 transition-all duration-700"
          ></iframe>
          
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          
        </div>
      </section>

      </div>
      
      {/* FOOTER CTA */}
      <Footer />
    </main>
    </>
  );
}
