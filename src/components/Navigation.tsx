"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const settings = useQuery(api.settings?.getSettings || (() => null));

  const sections = [
    { name: "The Arrival", id: "hero" },
    { name: "The Grounds", id: "grounds" },
    { name: "The Suites", id: "suites" },
    { name: "Living Spaces", id: "living" },
    { name: "The Gallery", id: "gallery" },
  ];

  const scrollTo = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Floating Elements (No Top Bar) */}
      <div className="fixed top-0 left-0 w-full z-50 pointer-events-none p-6 md:p-10 flex justify-between items-start mix-blend-difference text-[#e8e0d4]">
        
        {/* Hamburger */}
        <button 
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto flex flex-col gap-[6px] w-8 hover:opacity-70 transition-opacity cursor-pointer"
        >
          <div className="h-[1px] w-full bg-current"></div>
          <div className="h-[1px] w-full bg-current"></div>
        </button>

        {/* Centered Title */}
        <div className="absolute left-1/2 -translate-x-1/2 top-6 md:top-10 pointer-events-auto">
          <button onClick={() => scrollTo('hero')} className="hover:opacity-70 transition-opacity">
            <h1 className="font-serif text-xl md:text-3xl tracking-widest uppercase font-light cursor-pointer">
              {settings?.propertyName || "THE BNB"}
            </h1>
          </button>
        </div>

        {/* CTA (Desktop) */}
        {pathname !== "/reserve" && (
          <div className="hidden md:block pointer-events-auto mt-2">
            <Link href="/reserve" className="relative group inline-flex items-center justify-center px-8 py-2 cursor-pointer">
              <div className="absolute inset-0 bg-[#c2a27c] skew-x-[-15deg] transition-transform duration-500 group-hover:scale-105"></div>
              <span className="relative z-10 text-black font-mono text-xs uppercase tracking-[0.2em] font-bold">Reserve</span>
            </Link>
          </div>
        )}
      </div>

      {/* Fullscreen Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 w-full h-screen bg-black/40 backdrop-blur-sm z-[50] cursor-pointer"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 bottom-0 w-full md:w-[40vw] min-w-[300px] h-screen bg-[#0a0a0a] z-[60] flex flex-col justify-center px-12 md:px-24 border-r border-white/10"
            >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 md:top-12 md:right-12 flex items-center justify-center w-14 h-14 rounded-full bg-white/5 border border-white/10 text-white hover:bg-[#c2a27c] hover:border-[#c2a27c] hover:text-black transition-all duration-300 group shadow-lg"
            >
              <X className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" strokeWidth={1} />
            </button>
            
            <nav className="flex flex-col gap-8">
              {sections.map((section, i) => (
                <motion.button
                  key={section.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  onClick={() => scrollTo(section.id)}
                  className="text-left font-serif text-4xl md:text-6xl text-white/80 hover:text-white hover:translate-x-4 transition-all duration-500 font-light"
                >
                  {section.name}
                </motion.button>
              ))}
            </nav>
            <div className="mt-8">
              <Link onClick={() => setIsOpen(false)} href="/reserve" className="relative group inline-flex items-center justify-center px-10 py-4 w-full md:w-auto cursor-pointer border border-[#c2a27c]/30 hover:bg-[#c2a27c] transition-colors duration-500">
                <span className="text-[#c2a27c] group-hover:text-black font-mono text-sm uppercase tracking-[0.2em] font-bold transition-colors duration-500">Reserve Now</span>
              </Link>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
