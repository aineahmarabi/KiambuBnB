"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Image from "next/image";
import Link from "next/link";
import { X, Loader2, Sparkles, ChevronLeft, ChevronRight, Maximize2, RefreshCw, Grid, Layers, SlidersHorizontal, ArrowLeft } from "lucide-react";
import gsap from "gsap";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const FALLBACK_IMAGES = [
  { _id: "f1", url: "/images/IMG_9297.JPG.jpeg", title: "Estate Exterior" },
  { _id: "f2", url: "/images/IMG_9258.JPG.jpeg", title: "Grand Swimming Pool" },
  { _id: "f3", url: "/images/IMG_9269.JPG.jpeg", title: "Master En-Suite One" },
  { _id: "f4", url: "/images/IMG_9273.JPG.jpeg", title: "Master En-Suite View" },
  { _id: "f5", url: "/images/IMG_9270.JPG.jpeg", title: "Guest Quarters" },
  { _id: "f6", url: "/images/IMG_9264.JPG.jpeg", title: "Veranda Lounge" },
  { _id: "f7", url: "/images/IMG_9266.JPG.jpeg", title: "Bath Suite" },
  { _id: "f8", url: "/images/IMG_9274.JPG.jpeg", title: "Living Room Lounge" },
  { _id: "f9", url: "/images/IMG_9278.JPG.jpeg", title: "Poolside Oasis" },
  { _id: "f10", url: "/images/IMG_9268.JPG.jpeg", title: "Chef Kitchen" },
  { _id: "f11", url: "/images/IMG_9277.JPG.jpeg", title: "Fireplace Sitting Area" },
  { _id: "f12", url: "/images/IMG_9261.JPG.jpeg", title: "Garden Pathway" }
];

export default function GalleryPage() {
  const dbImages = useQuery(api.gallery?.getImages || (() => []));
  const images = dbImages && dbImages.length > 0 ? dbImages : FALLBACK_IMAGES;

  // 4 Distinct Layout Modes:
  // 1 = 3D Perspective Carousel
  // 2 = Bionic Dynamic Masonry
  // 3 = 3D Horizon Ribbon Stage
  // 4 = Prism Architectural Grid
  const [layoutMode, setLayoutMode] = useState<number>(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Randomize UI arrangement on every page access (mount)
  useEffect(() => {
    const randomMode = Math.floor(Math.random() * 4) + 1;
    setLayoutMode(randomMode);
    setIsLoaded(true);
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 768);
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // GSAP 3D entrance animation when layout changes
  useEffect(() => {
    if (!isLoaded) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gallery-card-3d",
        { opacity: 0, y: 80, rotateX: 25, scale: 0.85 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 1.1,
          stagger: 0.06,
          ease: "power4.out",
        }
      );
    });
    return () => ctx.revert();
  }, [layoutMode, isLoaded, images]);

  // 3D Tilt Effect on mouse movement
  const handle3DTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(card, {
      rotateY: x * 0.08,
      rotateX: -y * 0.08,
      transformPerspective: 1000,
      scale: 1.03,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleTiltReset = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      duration: 0.6,
      ease: "power2.out",
    });
  };

  const randomizeLayout = () => {
    let nextMode = (layoutMode % 4) + 1;
    setLayoutMode(nextMode);
  };

  return (
    <>
      <Navigation />
      
      {/* Background Liquid Mesh & Ambient Glow */}
      <div className="fixed inset-0 bg-[#0a0a0a] text-white overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#c2a27c]/10 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#4a3b2c]/20 rounded-full blur-[180px]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22180%22 height=%22180%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')] opacity-[0.04] mix-blend-overlay"></div>
      </div>

      <main className="relative z-10 min-h-screen pt-32 pb-24 px-4 md:px-12 flex flex-col justify-between max-w-[120rem] mx-auto">
        
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-3 text-[#c2a27c] font-mono text-xs uppercase tracking-[0.3em] mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Interactive 3D Visual Experience</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-light text-balance text-[#e8e0d4]">
              The Estate Gallery
            </h1>
            <p className="text-white/60 font-light text-base md:text-lg max-w-xl mt-3 leading-relaxed">
              Explore Ficus &amp; Figs through dynamic arrangements and 3D perspectives.
            </p>
          </div>

          {/* Floating UI Switcher Controls */}
          <div className="flex flex-wrap items-center gap-3 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-full p-2">
            <button
              onClick={() => setLayoutMode(1)}
              className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${
                layoutMode === 1 ? "bg-[#c2a27c] text-black font-bold shadow-lg" : "text-white/60 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3D Stage</span>
            </button>

            <button
              onClick={() => setLayoutMode(2)}
              className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${
                layoutMode === 2 ? "bg-[#c2a27c] text-black font-bold shadow-lg" : "text-white/60 hover:text-white"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Masonry</span>
            </button>

            <button
              onClick={() => setLayoutMode(3)}
              className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${
                layoutMode === 3 ? "bg-[#c2a27c] text-black font-bold shadow-lg" : "text-white/60 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3D Horizon</span>
            </button>

            <button
              onClick={() => setLayoutMode(4)}
              className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${
                layoutMode === 4 ? "bg-[#c2a27c] text-black font-bold shadow-lg" : "text-white/60 hover:text-white"
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lando 3D Showcase</span>
            </button>

            <button
              onClick={randomizeLayout}
              className="px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title="Shuffle UI Layout"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── MODE 1: 3D PERSPECTIVE CAROUSEL STAGE ───────────────────────────── */}
        {layoutMode === 1 && (
          <div className="relative w-full py-16 flex flex-col items-center justify-center overflow-hidden min-h-[65vh]">
            <div className="relative w-full max-w-5xl h-[500px] md:h-[600px] flex items-center justify-center perspective-[1200px]">
              {images.map((img: any, idx: number) => {
                const total = images.length;
                let offset = (idx - carouselIndex + total) % total;
                if (offset > total / 2) offset -= total;

                const isCenter = offset === 0;
                const absOffset = Math.abs(offset);

                if (absOffset > 3) return null; // Only show active cards in 3D fan

                const rotateY = offset * 25;
                const translateZ = 300 - absOffset * 150;
                const translateX = offset * (isMobile ? 110 : 220);
                const opacity = 1 - absOffset * 0.25;

                return (
                  <motion.div
                    key={img._id || idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className="gallery-card-3d absolute w-[80vw] max-w-[420px] aspect-[3/4] rounded-3xl overflow-hidden cursor-pointer shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/15 backdrop-blur-md"
                    style={{
                      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                      zIndex: 100 - absOffset,
                      opacity: opacity < 0 ? 0 : opacity,
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <Image
                      src={img.url}
                      alt={(img as any).title || "Estate Photo"}
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      sizes="(max-width: 768px) 80vw, 420px"
                      priority={isCenter}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                      <span className="font-mono text-xs text-[#c2a27c] uppercase tracking-widest mb-1">
                        {(img as any).title || `Sanctuary View 0${idx + 1}`}
                      </span>
                      <p className="font-serif text-xl text-white">Ficus &amp; Figs</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Carousel Nav Controls */}
            <div className="flex items-center gap-6 mt-12 z-20">
              <button
                onClick={() => setCarouselIndex((prev) => (prev - 1 + images.length) % images.length)}
                className="w-14 h-14 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#c2a27c] hover:border-[#c2a27c] hover:text-black transition-all cursor-pointer shadow-xl"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="font-mono text-xs text-white/50 tracking-widest">
                0{carouselIndex + 1} / 0{images.length}
              </span>
              <button
                onClick={() => setCarouselIndex((prev) => (prev + 1) % images.length)}
                className="w-14 h-14 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#c2a27c] hover:border-[#c2a27c] hover:text-black transition-all cursor-pointer shadow-xl"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* ── MODE 2: BIONIC DYNAMIC MASONRY ───────────────────────────────────── */}
        {layoutMode === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 min-h-[65vh]">
            {images.map((img: any, idx: number) => {
              let spanClass = "aspect-[3/4]";
              if (idx % 5 === 0) spanClass = "md:col-span-2 md:row-span-2 aspect-square md:aspect-[4/3]";
              else if (idx % 3 === 0) spanClass = "aspect-video";

              return (
                <div
                  key={img._id || idx}
                  onMouseMove={handle3DTilt}
                  onMouseLeave={handleTiltReset}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`gallery-card-3d relative rounded-2xl overflow-hidden cursor-pointer border border-white/10 shadow-2xl group ${spanClass}`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Image
                    src={img.url}
                    alt={(img as any).title || "Estate Photo"}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <div>
                      <span className="font-mono text-[10px] text-[#c2a27c] uppercase tracking-widest">
                        Click to Expand
                      </span>
                      <h3 className="font-serif text-lg text-white">{(img as any).title || "Sanctuary View"}</h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── MODE 3: 3D HORIZON RIBBON STAGE ─────────────────────────────────── */}
        {layoutMode === 3 && (
          <div className="w-full overflow-x-auto py-12 flex gap-8 snap-x snap-mandatory dark-scrollbar min-h-[65vh] items-center">
            {images.map((img: any, idx: number) => (
              <div
                key={img._id || idx}
                onMouseMove={handle3DTilt}
                onMouseLeave={handleTiltReset}
                onClick={() => setSelectedImageIndex(idx)}
                className="gallery-card-3d shrink-0 w-[85vw] sm:w-[50vw] md:w-[35vw] aspect-[4/5] relative rounded-3xl overflow-hidden cursor-pointer border border-white/15 shadow-2xl group snap-center"
                style={{ transformStyle: "preserve-3d" }}
              >
                <Image
                  src={img.url}
                  alt={(img as any).title || "Estate Photo"}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                  <span className="font-mono text-xs text-[#c2a27c] uppercase tracking-widest mb-1">
                    Frame 0{idx + 1}
                  </span>
                  <h3 className="font-serif text-2xl text-white">{(img as any).title || "Estate Gallery"}</h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MODE 4: LANDO NORRIS 3D SHOWCASE GRID ───────────────────────────── */}
        {layoutMode === 4 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 min-h-[65vh]">
            {images.map((img: any, idx: number) => (
              <div
                key={img._id || idx}
                onMouseMove={handle3DTilt}
                onMouseLeave={handleTiltReset}
                onClick={() => setSelectedImageIndex(idx)}
                className="gallery-card-3d relative aspect-[4/5] rounded-3xl overflow-hidden bg-[#0d0d0d] border border-white/10 hover:border-[#c2a27c] transition-all duration-500 shadow-2xl group cursor-pointer hover:shadow-[0_0_35px_rgba(194,162,124,0.35)]"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Full Unclipped Image Showcase */}
                <div className="absolute inset-0 p-4 flex items-center justify-center">
                  <Image
                    src={img.url}
                    alt={(img as any).title || "Estate Showcase"}
                    fill
                    className="object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {/* Subtle inner shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl pointer-events-none group-hover:opacity-40 transition-opacity"></div>
                </div>

                {/* Lando Norris Signature Bottom-Right Cutout Tag Badge */}
                <div className="absolute bottom-0 right-0 bg-[#0d0d0d] border-t border-l border-white/15 rounded-tl-2xl px-5 py-2.5 flex items-center gap-2 group-hover:border-[#c2a27c] transition-colors z-20">
                  <span className="font-mono text-xs uppercase tracking-widest text-white/90 font-bold group-hover:text-[#c2a27c] transition-colors">
                    {(img as any).title || `Sanctuary 0${idx + 1}`}
                  </span>
                  <span className="font-mono text-[10px] text-[#c2a27c] font-bold">2026</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating Return Button */}
        <div className="mt-16 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/20 bg-white/5 hover:bg-[#c2a27c] hover:border-[#c2a27c] hover:text-black text-white font-mono text-xs uppercase tracking-widest transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Sanctuary</span>
          </Link>
        </div>

        {/* ── 3D LIGHTBOX MODAL ────────────────────────────────────────────────── */}
        <AnimatePresence>
          {selectedImageIndex !== null && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(25px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
              onClick={() => setSelectedImageIndex(null)}
            >
              <button
                onClick={() => setSelectedImageIndex(null)}
                className="absolute top-8 right-8 text-white/50 hover:text-white p-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md cursor-pointer z-50"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Prev / Next controls in Lightbox */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : 0));
                }}
                className="absolute left-6 text-white/50 hover:text-white p-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md cursor-pointer z-50 hidden md:block"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => (prev !== null ? (prev + 1) % images.length : 0));
                }}
                className="absolute right-6 text-white/50 hover:text-white p-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md cursor-pointer z-50 hidden md:block"
              >
                <ChevronRight className="w-8 h-8" />
              </button>

              <motion.div
                key={selectedImageIndex}
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-6xl aspect-[4/3] md:aspect-video rounded-3xl overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.9)] border border-white/15 bg-black cursor-default"
              >
                <Image
                  src={images[selectedImageIndex]?.url}
                  alt="Enlarged View"
                  fill
                  className="object-contain bg-black"
                  quality={100}
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/40 to-transparent flex justify-between items-end">
                  <div>
                    <span className="font-mono text-xs text-[#c2a27c] uppercase tracking-widest">
                      Image {selectedImageIndex + 1} of {images.length}
                    </span>
                    <h3 className="font-serif text-2xl text-white">
                      {(images[selectedImageIndex] as any)?.title || "Ficus &amp; Figs Sanctuary"}
                    </h3>
                  </div>
                  <Link
                    href="/reserve"
                    className="px-6 py-3 rounded-full bg-[#c2a27c] text-black font-mono text-xs uppercase tracking-widest font-bold hover:scale-105 transition-transform"
                  >
                    Reserve Dates
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </>
  );
}
