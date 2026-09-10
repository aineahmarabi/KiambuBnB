"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import gsap from "gsap";

export function GalleryOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const images = useQuery(api.gallery?.getImages || (() => []));
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Layout variation (1 to 3) to prevent boredom
  const [layoutType, setLayoutType] = useState<number>(1);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setLayoutType(Math.floor(Math.random() * 3) + 1);
      
      // Grand launch animation
      setTimeout(() => {
        gsap.fromTo(".gallery-item", 
          { y: 100, opacity: 0, scale: 0.8, rotateX: 45 },
          { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 1.2, stagger: 0.05, ease: "power4.out" }
        );
      }, 500);
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    gsap.to(card, {
      rotateY: x * 0.05,
      rotateX: -y * 0.05,
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.7,
      ease: "power2.out"
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-[100] bg-[#0a0a0a] overflow-y-auto dark-scrollbar"
      ref={containerRef}
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22180%22 height=%22180%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')] opacity-[0.05] mix-blend-overlay pointer-events-none"></div>

      {/* Header */}
      <div className="sticky top-0 left-0 right-0 p-6 md:p-10 flex justify-between items-center z-50 bg-gradient-to-b from-[#0a0a0a] to-transparent pointer-events-none">
        <h2 className="font-serif text-3xl md:text-5xl text-[#c2a27c] tracking-tighter mix-blend-difference pointer-events-auto">The Gallery.</h2>
        <button 
          onClick={onClose}
          className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors pointer-events-auto backdrop-blur-md"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="pt-10 px-4 md:px-10 pb-32 max-w-[120rem] mx-auto min-h-screen">
        {images === undefined ? (
          <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-[#c2a27c] animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="h-[60vh] flex items-center justify-center">
            <p className="text-white/40 font-mono tracking-widest uppercase">No images found</p>
          </div>
        ) : (
          <div className={`
            grid gap-6 md:gap-8
            ${layoutType === 1 ? 'grid-cols-1 md:grid-cols-3' : ''}
            ${layoutType === 2 ? 'grid-cols-2 md:grid-cols-4' : ''}
            ${layoutType === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : ''}
          `}>
            {images.map((img: any, i: number) => {
              // Create a random-looking masonry span logic based on layoutType
              let spanClass = "";
              if (layoutType === 1) {
                if (i % 5 === 0) spanClass = "md:col-span-2 md:row-span-2";
              } else if (layoutType === 2) {
                if (i % 4 === 1) spanClass = "md:col-span-2 md:row-span-2";
                if (i % 7 === 0) spanClass = "md:col-span-2";
              } else {
                if (i % 3 === 0) spanClass = "md:row-span-2";
              }

              return (
                <div 
                  key={img._id} 
                  className={`gallery-item relative rounded-xl overflow-hidden cursor-pointer opacity-0 shadow-2xl ${spanClass} min-h-[300px] md:min-h-[400px]`}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(30);
                    setSelectedImage(img.url);
                  }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <Image 
                    src={img.url}
                    alt="Gallery Image"
                    fill
                    className="object-cover transition-transform duration-1000 hover:scale-[1.03]"
                    sizes="100vw"
                  />
                  {/* Subtle glare effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-transparent pointer-events-none mix-blend-overlay"></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cinematic Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-6xl aspect-[3/2] md:aspect-video rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10"
            >
              <Image 
                src={selectedImage}
                alt="Enlarged"
                fill
                className="object-contain bg-black"
                sizes="100vw"
                quality={100}
              />
            </motion.div>
            <button className="absolute top-8 right-8 text-white/50 hover:text-white p-2">
              <X className="w-8 h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
