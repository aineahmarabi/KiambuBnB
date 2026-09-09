"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const [passcode, setPasscode] = useState("");
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  
  const verifyPasscode = useMutation(api.settings?.verifyPasscode || (() => Promise.resolve(false)));

  useEffect(() => {
    // If they type 4 or 5 digits, we auto-submit after a tiny delay
    // Actually, since they can choose 4 or 5, if they stop typing at 4, we might want a submit button,
    // or just auto-submit at 5, and if it's 4 they press enter.
    // Let's auto-submit at 5, or if they press a submit button.
    if (passcode.length === 5) {
      handleLogin();
    }
  }, [passcode]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passcode.length < 4) return;
    
    setStatus("verifying");
    setErrorMessage("");
    try {
      const res = await verifyPasscode({ passcode });
      if (res.success) {
        setStatus("success");
        localStorage.setItem("adminAuth", "true");
        setTimeout(() => {
          router.push("/admin");
        }, 1000);
      } else {
        setStatus("error");
        setErrorMessage(res.message || "Incorrect passcode");
        setTimeout(() => {
          setPasscode("");
          setStatus("idle");
        }, 1500); // Wait longer so they can read the message
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("Connection error");
      setTimeout(() => {
        setPasscode("");
        setStatus("idle");
      }, 1500);
    }
  };

  const handleKeypad = (num: string) => {
    if (passcode.length < 5 && status === "idle") {
      setPasscode(prev => prev + num);
    }
  };
  
  const handleDelete = () => {
    if (status === "idle") {
      setPasscode(prev => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== "idle") return;
      
      if (e.key >= "0" && e.key <= "9") {
        handleKeypad(e.key);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleDelete();
      } else if (e.key === "Enter" && passcode.length >= 4) {
        handleLogin();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [passcode, status]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      <div className="grain-overlay" aria-hidden="true" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10 px-6"
      >
        <div className="text-center mb-10 h-32">
          <div className="w-12 h-12 mx-auto border border-white/10 rounded-full flex items-center justify-center bg-white/5 mb-6">
            <Lock className="w-5 h-5 text-[#c2a27c]" />
          </div>
          <h1 className="font-serif text-3xl text-[#e8e0d4] tracking-tighter mb-2">Restricted Access</h1>
          
          {errorMessage ? (
            <p className="font-mono text-xs text-red-400 uppercase tracking-widest">{errorMessage}</p>
          ) : (
            <p className="font-mono text-xs text-white/40 uppercase tracking-widest">Enter Passcode to continue</p>
          )}
        </div>

        <motion.div 
          animate={
            status === "error" ? { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } } : 
            status === "success" ? { scale: [1, 1.05, 1], transition: { duration: 0.5 } } : 
            {}
          }
          className="bg-white/[0.02] border border-white/10 p-8 rounded-2xl backdrop-blur-xl"
        >
          {/* Display Dots */}
          <div className="flex justify-center gap-4 mb-10">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  i < passcode.length 
                    ? status === "success" ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" :
                      status === "error" ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" :
                      "bg-[#c2a27c] shadow-[0_0_8px_rgba(194,162,124,0.5)]" 
                    : "bg-white/10"
                }`}
              />
            ))}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleKeypad(num.toString())}
                disabled={status !== "idle"}
                className="h-14 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors font-serif text-2xl text-white/80 active:bg-[#c2a27c]/20"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleDelete}
              disabled={status !== "idle" || passcode.length === 0}
              className="h-14 rounded-lg bg-transparent hover:bg-white/5 transition-colors font-mono text-xs uppercase tracking-widest text-white/40"
            >
              Del
            </button>
            <button
              onClick={() => handleKeypad("0")}
              disabled={status !== "idle"}
              className="h-14 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors font-serif text-2xl text-white/80 active:bg-[#c2a27c]/20"
            >
              0
            </button>
            <button
              onClick={() => handleLogin()}
              disabled={status !== "idle" || passcode.length < 4}
              className="h-14 rounded-lg bg-transparent hover:bg-white/5 transition-colors font-mono text-xs uppercase tracking-widest text-[#c2a27c] disabled:opacity-30 disabled:hover:bg-transparent"
            >
              Enter
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
