"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted/declined cookies
    const consent = localStorage.getItem("kiambubnb_cookie_consent");
    if (!consent) {
      // Show banner after a short delay so it doesn't interrupt the initial hero animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("kiambubnb_cookie_consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("kiambubnb_cookie_consent", "declined");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 left-6 md:bottom-10 md:left-10 z-[70] w-[calc(100%-48px)] md:w-96 backdrop-blur-xl bg-[#0a0a0a]/80 border border-white/10 p-6 rounded-2xl shadow-2xl"
        >
          <div className="flex flex-col space-y-4">
            <div>
              <h4 className="font-serif text-xl text-[#e8e0d4] mb-2">Respecting Your Privacy</h4>
              <p className="text-white/60 text-xs font-light leading-relaxed">
                We use cookies to elevate your browsing experience and analyze site traffic. Your data remains strictly confidential.
              </p>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button 
                onClick={handleAccept}
                className="flex-1 bg-[#c2a27c] text-black font-mono text-[10px] uppercase tracking-widest py-3 px-4 hover:bg-white transition-colors text-center"
              >
                Accept All
              </button>
              <button 
                onClick={handleDecline}
                className="flex-1 border border-white/20 text-white/70 hover:text-white hover:border-white/50 font-mono text-[10px] uppercase tracking-widest py-3 px-4 transition-colors text-center"
              >
                Decline
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
