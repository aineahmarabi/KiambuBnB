"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { Trees, BedDouble, Bath, Wine, Coffee, MapPin, Navigation2 } from "lucide-react";
import { Footer } from "@/components/Footer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const HERO_IMAGES = [
  "/images/IMG_9255.JPG.jpeg",
  "/images/IMG_9257.JPG.jpeg",
  "/images/IMG_9259.JPG.jpeg"
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

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

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
      gsap.utils.toArray<HTMLElement>('.reveal-item').forEach((item) => {
        gsap.fromTo(item, 
          { y: 60, opacity: 0 }, 
          { 
            y: 0, 
            opacity: 1, 
            duration: 1.2, 
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
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
    
    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="bg-[#100f0d] text-[#e8e0d4] min-h-screen selection:bg-[#c2a27c] selection:text-black">
      
      {/* ACT I: The Arrival (Rich Hero) */}
      <section id="hero" className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 w-full h-full">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentHeroIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.7, scale: 1 }}
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#100f0d] via-transparent to-transparent z-10" />
        </div>
        
        {/* Glassmorphism Hero Panel */}
        <div className="relative z-20 mt-20 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="mb-6 h-[140px] md:h-[220px] flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.h1 
                  key={currentHeadlineIndex}
                  initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="text-5xl md:text-8xl font-serif tracking-tight uppercase font-light text-center text-balance leading-tight m-0"
                >
                  {HEADLINES[currentHeadlineIndex].line1}<br/>{HEADLINES[currentHeadlineIndex].line2}
                </motion.h1>
              </AnimatePresence>
            </div>
            <div className="w-16 h-[1px] bg-[#c2a27c] mb-6"></div>
            <p className="font-mono tracking-[0.2em] text-[#c2a27c] text-sm uppercase mb-8">Welcome to Ficus & Figs</p>
            <Link 
              href="/reserve"
              className="group relative inline-flex items-center justify-center px-10 py-4"
            >
              <div className="absolute inset-0 border border-[#c2a27c] bg-[#c2a27c]/10 skew-x-[-15deg] overflow-hidden transition-colors duration-500">
                <div className="absolute inset-0 bg-[#c2a27c] -translate-x-[105%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
              </div>
              <span className="relative z-10 font-mono text-xs uppercase tracking-[0.2em] text-[#c2a27c] group-hover:text-black transition-colors duration-700 font-bold">Reserve Your Space</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ACT II: The Grounds & Pool (Rich Bento) */}
      <section id="grounds" className="py-24 md:py-40 px-6 md:px-12 max-w-[100rem] mx-auto">
        <div className="text-center mb-20 reveal-item">
          <Trees className="w-8 h-8 mx-auto text-[#c2a27c] mb-6" strokeWidth={1} />
          <h2 className="text-4xl md:text-6xl font-serif font-light mb-4">Space to Breathe</h2>
          <p className="text-white/60 max-w-2xl mx-auto font-light">Surrounded by nature, our grounds offer a sanctuary of absolute silence. Featuring a beautiful pool, lush garden, and dedicated staff quarters.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Pool Image */}
          <div className="md:col-span-8 aspect-[16/10] relative overflow-hidden rounded-xl border border-white/5 reveal-item group">
            <Image src="/images/IMG_9258.JPG.jpeg" alt="The Pool" fill className="object-cover parallax-image transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
              <span className="font-mono text-sm tracking-widest uppercase text-white/90 drop-shadow-md">The Grand Pool</span>
            </div>
          </div>
          
          <div className="md:col-span-4 flex flex-col gap-6">
             <div className="flex-1 relative overflow-hidden rounded-xl border border-white/5 reveal-item group aspect-square md:aspect-auto">
               <Image src="/images/IMG_9260.JPG.jpeg" alt="Lush Gardens" fill className="object-cover parallax-image transition-transform duration-700 group-hover:scale-105" />
             </div>
             <div className="flex-1 relative overflow-hidden rounded-xl border border-white/5 reveal-item group aspect-square md:aspect-auto">
               <Image src="/images/IMG_9261.JPG.jpeg" alt="Garden Path" fill className="object-cover parallax-image transition-transform duration-700 group-hover:scale-105" />
             </div>
          </div>
        </div>

        <div className="w-full aspect-[21/9] relative overflow-hidden rounded-xl border border-white/5 mt-6 reveal-item group">
          <Image src="/images/IMG_9278.JPG.jpeg" alt="Pool Jets" fill className="object-cover parallax-image transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-sm bg-black/30">
             <p className="font-serif text-3xl italic text-white drop-shadow-lg">Immerse Yourself</p>
          </div>
        </div>
      </section>

      {/* ACT III: The Suites (Master & Guest) */}
      <section id="suites" className="py-24 md:py-40 bg-gradient-to-b from-[#100f0d] to-[#1a1815]">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12">
          
          <div className="text-center mb-24 reveal-item">
            <BedDouble className="w-8 h-8 mx-auto text-[#c2a27c] mb-6" strokeWidth={1} />
            <h2 className="text-4xl md:text-6xl font-serif font-light mb-4">Eight Sanctuaries</h2>
            <p className="font-mono tracking-widest text-[#c2a27c] text-xs uppercase">Uncompromising Comfort</p>
          </div>

          {/* Master Suites Bento */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-24">
             <div className="md:col-span-4 backdrop-blur-md bg-white/5 border border-white/10 p-10 rounded-xl flex flex-col justify-center reveal-item">
               <h3 className="text-3xl font-serif mb-4 text-[#e8e0d4]">The Master Ensuites</h3>
               <p className="text-white/60 text-sm leading-relaxed mb-8">Vaulted ceilings, intricate parquet flooring, and private access to the terrace. Two masterful suites designed for pure rejuvenation.</p>
               <div className="w-12 h-[1px] bg-[#c2a27c]"></div>
             </div>
             <div className="md:col-span-8 aspect-[16/10] relative overflow-hidden rounded-xl border border-white/5 reveal-item group">
                <Image src="/images/IMG_9269.JPG.jpeg" alt="Master Suite One" fill className="object-cover parallax-image" />
             </div>
             <div className="md:col-span-12 aspect-[21/9] relative overflow-hidden rounded-xl border border-white/5 reveal-item group mt-2">
                <Image src="/images/IMG_9273.JPG.jpeg" alt="Master Suite Two" fill className="object-cover parallax-image" />
             </div>
          </div>

          {/* Guest Suites Bento */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-24">
             <div className="md:col-span-8 grid grid-cols-2 gap-6">
                <div className="aspect-[4/5] relative overflow-hidden rounded-xl border border-white/5 reveal-item group">
                   <Image src="/images/IMG_9270.JPG.jpeg" alt="Twin Guest Suite" fill className="object-cover parallax-image" />
                </div>
                <div className="aspect-[4/5] relative overflow-hidden rounded-xl border border-white/5 reveal-item group mt-12">
                   <Image src="/images/IMG_9262.JPG.jpeg" alt="Guest Suite Yellow" fill className="object-cover parallax-image" />
                </div>
             </div>
             <div className="md:col-span-4 flex flex-col justify-between">
                <div className="backdrop-blur-md bg-white/5 border border-white/10 p-10 rounded-xl reveal-item mb-6">
                   <h3 className="text-3xl font-serif mb-4 text-[#e8e0d4]">Guest Quarters</h3>
                   <p className="text-white/60 text-sm leading-relaxed">Six additional exquisitely appointed bedrooms providing a serene escape. In total, the property sleeps 16 guests comfortably—perfect for a big family.</p>
                </div>
                <div className="grid grid-cols-2 gap-6 h-full">
                   <div className="relative overflow-hidden rounded-xl border border-white/5 reveal-item group min-h-[150px]">
                     <Image src="/images/IMG_9256.JPG.jpeg" alt="Guest Detail" fill className="object-cover parallax-image" />
                   </div>
                   <div className="relative overflow-hidden rounded-xl border border-white/5 reveal-item group min-h-[150px]">
                     <Image src="/images/IMG_9279.JPG.jpeg" alt="Guest Detail" fill className="object-cover parallax-image" />
                   </div>
                </div>
             </div>
          </div>

          {/* Bathrooms Grid */}
          <div className="text-center mb-12 mt-32 reveal-item">
            <Bath className="w-8 h-8 mx-auto text-[#c2a27c] mb-6" strokeWidth={1} />
            <h3 className="text-3xl font-serif font-light">Modern Elegance</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 reveal-item">
             <div className="md:col-span-2 aspect-[3/4] relative overflow-hidden rounded-xl border border-white/5"><Image src="/images/IMG_9265.JPG.jpeg" alt="Bath 1" fill className="object-cover parallax-image" /></div>
             <div className="md:col-span-2 aspect-[3/4] relative overflow-hidden rounded-xl border border-white/5 md:mt-12"><Image src="/images/IMG_9266.JPG.jpeg" alt="Bath 2" fill className="object-cover parallax-image" /></div>
             <div className="md:col-span-2 aspect-[3/4] relative overflow-hidden rounded-xl border border-white/5"><Image src="/images/IMG_9267.JPG.jpeg" alt="Bath 3" fill className="object-cover parallax-image" /></div>
             
             <div className="md:col-span-3 aspect-[16/10] relative overflow-hidden rounded-xl border border-white/5 mt-4"><Image src="/images/IMG_9280.JPG.jpeg" alt="Bath 4" fill className="object-cover parallax-image" /></div>
             <div className="md:col-span-3 grid grid-cols-2 gap-4 mt-4">
                <div className="relative overflow-hidden rounded-xl border border-white/5"><Image src="/images/IMG_9271.JPG.jpeg" alt="Bath 5" fill className="object-cover parallax-image" /></div>
                <div className="relative overflow-hidden rounded-xl border border-white/5"><Image src="/images/IMG_9272.JPG.jpeg" alt="Bath 6" fill className="object-cover parallax-image" /></div>
             </div>
          </div>
        </div>
      </section>

      {/* ACT IV: Living Spaces & Kitchen */}
      <section id="living" className="py-24 md:py-40 px-6 md:px-12 max-w-[100rem] mx-auto">
        <div className="w-full text-center space-y-8 mb-24 reveal-item">
          <Wine className="w-8 h-8 mx-auto text-[#c2a27c]" strokeWidth={1} />
          <h2 className="text-4xl md:text-6xl font-serif font-light mb-4">Gatherings & Events</h2>
          <p className="font-mono tracking-widest text-[#c2a27c] text-xs uppercase">Weddings • Parties • Picnics</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-24">
          <div className="md:col-span-7 aspect-[16/10] relative overflow-hidden rounded-xl border border-white/5 reveal-item group">
            <Image src="/images/IMG_9274.JPG.jpeg" alt="Grand Living Room" fill className="object-cover parallax-image" />
          </div>
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="backdrop-blur-md bg-white/5 border border-white/10 p-8 rounded-xl reveal-item">
               <p className="text-white/70 font-light leading-relaxed">Whether you are planning a grand family reunion or an unforgettable celebration, Ficus & Figs is the perfect canvas. Our expansive grounds and grand living areas are perfectly equipped to host spectacular weddings, private parties, and elegant picnics under the sun.</p>
            </div>
            <div className="flex-1 relative overflow-hidden rounded-xl border border-white/5 reveal-item group min-h-[250px]">
              <Image src="/images/IMG_9275.JPG.jpeg" alt="Living Room View" fill className="object-cover parallax-image" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 order-2 md:order-1 flex flex-col gap-6">
             <div className="aspect-[4/3] relative overflow-hidden rounded-xl border border-white/5 reveal-item group">
               <Image src="/images/IMG_9277.JPG.jpeg" alt="Fireplace Lounge" fill className="object-cover parallax-image" />
             </div>
             <div className="aspect-video relative overflow-hidden rounded-xl border border-white/5 reveal-item group">
               <Image src="/images/IMG_9276.JPG.jpeg" alt="Living Detail" fill className="object-cover parallax-image" />
             </div>
          </div>
          <div className="md:col-span-7 order-1 md:order-2 flex flex-col gap-6">
            <div className="text-center md:text-left reveal-item">
              <Coffee className="w-8 h-8 text-[#c2a27c] mb-4 mx-auto md:mx-0" strokeWidth={1} />
              <h3 className="text-3xl font-serif font-light mb-4">Culinary Comfort</h3>
            </div>
            <div className="aspect-[4/5] relative overflow-hidden rounded-xl border border-white/5 reveal-item group w-full">
              <Image src="/images/IMG_9268.JPG.jpeg" alt="Modern Kitchen" fill className="object-cover parallax-image" />
            </div>
          </div>
        </div>
      </section>

      {/* ACT V: The Courtyard (Gallery Finale) */}
      <section id="gallery" className="py-24 bg-gradient-to-t from-black to-[#100f0d]">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 flex flex-col items-center">
          <div className="w-full md:w-[80vw] aspect-video relative overflow-hidden rounded-xl border border-white/5 reveal-item mb-24 group">
            <Image src="/images/IMG_9264.JPG.jpeg" alt="Courtyard Entrance" fill className="object-cover parallax-image transition-transform duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700">
               <span className="font-serif text-3xl md:text-5xl italic text-white/90">The Courtyard Entrance</span>
            </div>
          </div>
        </div>
      </section>

      {/* ACT VI: Location & Navigation */}
      <section id="location" className="py-24 md:py-40 px-6 md:px-12 max-w-[100rem] mx-auto">
        <div className="w-full text-center space-y-8 mb-16 reveal-item">
          <MapPin className="w-8 h-8 mx-auto text-[#c2a27c]" strokeWidth={1} />
          <h2 className="text-4xl md:text-6xl font-serif font-light">Find Your Way</h2>
          <p className="text-white/60 font-light max-w-xl mx-auto">Nestled in the serene landscapes of Kiambu. Our gates are always open for you.</p>
        </div>

        <div className="w-full aspect-square md:aspect-[21/9] relative overflow-hidden rounded-xl border border-white/10 reveal-item group">
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
          
          <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row items-center justify-between gap-6 z-10 pointer-events-auto">
            <div className="text-center md:text-left">
              <h3 className="font-serif text-2xl mb-1">Kiambu, Kenya</h3>
            </div>
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=Kiambu,Kenya" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-[#c2a27c] backdrop-blur-md border border-white/20 transition-colors duration-500 rounded-full group/btn cursor-pointer"
            >
              <Navigation2 className="w-5 h-5 text-white group-hover/btn:text-black transition-colors" strokeWidth={1.5} />
              <span className="font-mono text-xs tracking-widest uppercase text-white group-hover/btn:text-black font-bold transition-colors">Navigate Here</span>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <Footer />
    </main>
  );
}
