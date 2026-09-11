import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-7xl md:text-9xl font-serif text-[#c2a27c] font-light mb-4">404</h1>
      <h2 className="text-2xl md:text-4xl font-serif font-light mb-4">Sanctuary Page Not Found</h2>
      <p className="text-white/50 text-sm max-w-md mb-8 font-light leading-relaxed">
        The page or resource you are looking for has been moved or does not exist. Return to the main estate page.
      </p>
      <Link 
        href="/"
        className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#c2a27c] text-black font-mono text-xs uppercase tracking-widest font-bold hover:scale-105 transition-transform"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return Home</span>
      </Link>
    </div>
  );
}
