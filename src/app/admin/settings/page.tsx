"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Phone, Mail, Globe, ShieldCheck, Settings2, Save, Eye, EyeOff, Lock } from "lucide-react";

export default function SettingsPage() {
  const settings = useQuery(api.settings?.getSettings || (() => null));
  const updateSettings = useMutation(api.settings?.updateSettings || (() => Promise.resolve()));

  const [showPasscode, setShowPasscode] = useState(false);
  const [formData, setFormData] = useState({
    propertyName: "",
    phone: "",
    whatsapp: "",
    email: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    adminPasscode: "",
    acceptingBookings: true,
    basePricePerNight: 100,
  });
  const [oldPasscode, setOldPasscode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        propertyName: settings.propertyName || "",
        phone: settings.phone || "",
        whatsapp: settings.whatsapp || "",
        email: settings.email || "",
        instagram: settings.instagram || "",
        facebook: settings.facebook || "",
        tiktok: settings.tiktok || "",
        adminPasscode: settings.adminPasscode || "",
        acceptingBookings: settings.acceptingBookings ?? true,
        basePricePerNight: settings.basePricePerNight ?? 100,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setPasscodeError("");
    let updatedPasscode = formData.adminPasscode;

    if (oldPasscode || newPasscode || confirmPasscode) {
      if (oldPasscode !== settings.adminPasscode) {
        setPasscodeError("Incorrect current passcode.");
        return;
      }
      if (newPasscode !== confirmPasscode) {
        setPasscodeError("New passcodes do not match.");
        return;
      }
      if (newPasscode.length < 4) {
        setPasscodeError("New passcode must be at least 4 digits.");
        return;
      }
      updatedPasscode = newPasscode;
    }

    setIsSaving(true);
    try {
      await updateSettings({ ...formData, adminPasscode: updatedPasscode, maintenanceMode: false });
      setOldPasscode("");
      setNewPasscode("");
      setConfirmPasscode("");
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (settings === undefined) {
    return <div className="p-12 text-center text-white/30 font-light italic">Loading configuration...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      <div>
        <h1 className="font-serif text-4xl md:text-5xl font-light mb-2">System Settings</h1>
        <p className="font-mono text-xs uppercase tracking-widest text-[#c2a27c]">Global Configuration</p>
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
        
        {/* Contact Information */}
        <div className="p-8 md:p-12 border-b border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#c2a27c]" />
            </div>
            <h2 className="font-serif text-3xl font-light text-[#e8e0d4]">Public Details</h2>
          </div>
          
          <div className="space-y-8 max-w-2xl">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Property Name (Used in Headers & Footers)</label>
              <div className="relative">
                <Globe className="w-5 h-5 text-white/20 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={formData.propertyName}
                  onChange={(e) => setFormData({...formData, propertyName: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-light focus:outline-none focus:border-[#c2a27c] transition-colors" 
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Official Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-white/20 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-light focus:outline-none focus:border-[#c2a27c] transition-colors" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Phone Number</label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-white/20 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-light focus:outline-none focus:border-[#c2a27c] transition-colors" 
                  />
                </div>
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">WhatsApp Number</label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-white/20 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-light focus:outline-none focus:border-[#c2a27c] transition-colors" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="p-8 md:p-12 border-b border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#c2a27c]" />
            </div>
            <h2 className="font-serif text-3xl font-light text-[#e8e0d4]">Social Media Links</h2>
          </div>
          
          <div className="space-y-8 max-w-2xl">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Instagram URL</label>
              <div className="relative">
                <Globe className="w-5 h-5 text-white/20 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={formData.instagram}
                  onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-light focus:outline-none focus:border-[#c2a27c] transition-colors" 
                />
              </div>
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Facebook URL</label>
              <div className="relative">
                <Globe className="w-5 h-5 text-white/20 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={formData.facebook}
                  onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-light focus:outline-none focus:border-[#c2a27c] transition-colors" 
                />
              </div>
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">TikTok URL</label>
              <div className="relative">
                <Globe className="w-5 h-5 text-white/20 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={formData.tiktok}
                  onChange={(e) => setFormData({...formData, tiktok: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-light focus:outline-none focus:border-[#c2a27c] transition-colors" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security & Authentication */}
        <div className="p-8 md:p-12 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="font-serif text-3xl font-light text-[#e8e0d4]">Security</h2>
            </div>
          </div>
          
          <div className="space-y-6 max-w-2xl bg-red-950/10 border border-red-500/10 p-6 md:p-8 rounded-xl">
              <div className="space-y-6">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-red-400/80 mb-3">Current Passcode</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-red-400/50 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      type={showPasscode ? "text" : "password"} 
                      value={oldPasscode}
                      onChange={(e) => setOldPasscode(e.target.value.replace(/\D/g,'').slice(0, 5))}
                      placeholder="••••"
                      className="w-full pl-12 pr-12 py-3 bg-black/60 border border-red-500/20 rounded-lg text-red-100 font-mono text-xl tracking-[0.2em] sm:tracking-[0.5em] focus:outline-none focus:border-red-400 transition-colors" 
                    />
                    <button 
                      onClick={() => setShowPasscode(!showPasscode)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                    >
                      {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-red-400/80 mb-3">New Passcode</label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-red-400/50 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input 
                        type={showPasscode ? "text" : "password"} 
                        value={newPasscode}
                        onChange={(e) => setNewPasscode(e.target.value.replace(/\D/g,'').slice(0, 5))}
                        placeholder="••••"
                        className="w-full pl-12 pr-4 py-3 bg-black/60 border border-red-500/20 rounded-lg text-red-100 font-mono text-xl tracking-[0.2em] sm:tracking-[0.5em] focus:outline-none focus:border-red-400 transition-colors" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-red-400/80 mb-3">Confirm New Passcode</label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-red-400/50 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input 
                        type={showPasscode ? "text" : "password"} 
                        value={confirmPasscode}
                        onChange={(e) => setConfirmPasscode(e.target.value.replace(/\D/g,'').slice(0, 5))}
                        placeholder="••••"
                        className="w-full pl-12 pr-4 py-3 bg-black/60 border border-red-500/20 rounded-lg text-red-100 font-mono text-xl tracking-[0.2em] sm:tracking-[0.5em] focus:outline-none focus:border-red-400 transition-colors" 
                      />
                    </div>
                  </div>
                </div>
                
                {passcodeError && (
                  <p className="text-red-400 text-sm font-light bg-red-950/50 border border-red-500/20 p-3 rounded-lg">
                    {passcodeError}
                  </p>
                )}
              </div>
              <p className="text-xs text-white/30 font-light mt-6 border-t border-red-500/10 pt-4">Change the master PIN used to bypass the lock screen. Maximum 5 digits. Do not share this code.</p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="p-8 md:p-12 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#c2a27c]" />
            </div>
            <h2 className="font-serif text-3xl font-light text-[#e8e0d4]">Property Controls</h2>
          </div>
          
          <div className="space-y-6 max-w-2xl">
            <label className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white/[0.02] border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors gap-4">
              <div>
                <p className="font-serif text-2xl text-[#e8e0d4] mb-1">Accept New Bookings</p>
                <p className="text-sm text-white/50 font-light">If disabled, the public reservation form will show as unavailable.</p>
              </div>
              <div className="relative inline-block w-14 align-middle select-none transition duration-200 ease-in ml-4">
                <input 
                  type="checkbox" 
                  name="toggle" 
                  id="bookings-toggle" 
                  checked={formData.acceptingBookings}
                  onChange={(e) => setFormData({...formData, acceptingBookings: e.target.checked})}
                  className="toggle-checkbox absolute block w-7 h-7 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  style={{ right: formData.acceptingBookings ? '0' : '1.75rem', borderColor: formData.acceptingBookings ? '#c2a27c' : '#3f3f46' }}
                />
                <label 
                  htmlFor="bookings-toggle" 
                  className={`toggle-label block overflow-hidden h-7 rounded-full cursor-pointer ${formData.acceptingBookings ? 'bg-[#c2a27c]/80' : 'bg-zinc-800'}`}
                ></label>
              </div>
            </label>

            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Base Price Per Night (USD / KES)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-mono">$</span>
                <input 
                  type="number" 
                  min="0"
                  step="1"
                  value={formData.basePricePerNight}
                  onChange={(e) => setFormData({...formData, basePricePerNight: Number(e.target.value)})}
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white font-light focus:outline-none focus:border-[#c2a27c] transition-colors" 
                />
              </div>
              <p className="text-xs text-white/40 mt-3 font-light">This is the default nightly rate used to auto-calculate guest total prices when creating a new booking. (≈ KES {(formData.basePricePerNight * 130).toLocaleString()})</p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-8 bg-black/40 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="relative group inline-flex items-center justify-center px-10 py-4 cursor-pointer disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-[#c2a27c] skew-x-[-15deg] transition-transform duration-500 group-hover:scale-105"></div>
            <span className="relative z-10 text-black font-mono uppercase tracking-[0.2em] text-[10px] font-bold flex items-center gap-2">
              {isSaving ? <Settings2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Saving..." : "Save Configuration"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
