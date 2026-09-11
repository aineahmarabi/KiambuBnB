"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export function CustomSelect({ value, onChange, options, placeholder, className }: { value: string; onChange: (v: string) => void; options: {value: string; label: string}[]; placeholder?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { 
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); 
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  
  return (
    <div className="relative min-w-[140px]" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full px-3 py-2.5 border border-white/10 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center justify-between gap-2 hover:border-[#c2a27c]/50 transition-colors ${className || "bg-black/40 text-[#c2a27c]"}`}
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
}
