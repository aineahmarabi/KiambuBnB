"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function WhatsAppCTA() {
  const settings = useQuery(api.settings?.getSettings || (() => null));
  const whatsappNumber = settings?.whatsapp || "+254708443090"; // Fallback to provided number

  // Remove non-numeric characters for the link
  const formattedNumber = whatsappNumber.replace(/\D/g, "");

  return (
    <a
      href={`https://wa.me/${formattedNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[100] group flex items-center justify-center w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl hover:border-[#25D366]/50 hover:bg-[#25D366]/10 hover:scale-105 active:scale-95 transition-all duration-300"
      aria-label="Chat with us on WhatsApp"
    >
      <div className="absolute inset-0 rounded-full bg-[#25D366]/20 blur-md group-hover:bg-[#25D366]/40 transition-colors duration-300" />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative w-7 h-7 text-white group-hover:text-[#25D366] transition-colors duration-300"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    </a>
  );
}
