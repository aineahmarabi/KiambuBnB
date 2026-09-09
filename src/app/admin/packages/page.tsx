"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Plus, Edit2, Trash2, X, Check, EyeOff, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PackagesPage() {
  const packages = useQuery(api.packages?.getPackages || (() => []));
  const createPackage = useMutation(api.packages?.createPackage || (() => Promise.resolve()));
  const updatePackage = useMutation(api.packages?.updatePackage || (() => Promise.resolve()));
  const deletePackage = useMutation(api.packages?.deletePackage || (() => Promise.resolve()));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    category: "Event Venue Rental",
    description: "",
    priceKES: 0,
    isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updatePackage({ id: editingId as any, ...formData });
    } else {
      await createPackage(formData);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: "", category: "Event Venue Rental", description: "", priceKES: 0, isActive: true });
  };

  const handleEdit = (pkg: any) => {
    setEditingId(pkg._id);
    setFormData({
      title: pkg.title,
      category: pkg.category,
      description: pkg.description,
      priceKES: pkg.priceKES,
      isActive: pkg.isActive
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (pkg: any) => {
    await updatePackage({
      id: pkg._id,
      title: pkg.title,
      category: pkg.category,
      description: pkg.description,
      priceKES: pkg.priceKES,
      isActive: !pkg.isActive
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      await deletePackage({ id: id as any });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-light mb-2">Packages</h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Manage Event & Bridal Packages</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-[#c2a27c] text-black px-6 py-3 rounded-lg font-mono text-[10px] uppercase tracking-widest hover:bg-[#a68864] transition-colors flex items-center gap-2 font-bold"
        >
          <Plus className="w-4 h-4" />
          <span>Add Package</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {["Event Venue Rental", "Bridal Pick-Up Home"].map(category => (
          <div key={category} className="bg-black/20 border border-white/10 rounded-xl p-6">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[#c2a27c] mb-6 pb-2 border-b border-[#c2a27c]/20">{category}</h2>
            <div className="space-y-4">
              {packages?.filter((p: any) => p.category === category).length === 0 && (
                <p className="text-white/30 font-light text-sm italic">No packages in this category.</p>
              )}
              {packages?.filter((p: any) => p.category === category).map((pkg: any) => (
                <div key={pkg._id} className={`p-4 border rounded-lg transition-colors flex justify-between items-start ${pkg.isActive ? "border-white/10 bg-white/5" : "border-white/5 bg-black/40 opacity-50"}`}>
                  <div>
                    <h3 className="font-serif text-xl">{pkg.title}</h3>
                    <p className="text-sm font-light text-white/50 mb-2">{pkg.description}</p>
                    <p className="font-mono text-xs text-[#c2a27c]">KES {pkg.priceKES.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleActive(pkg)} className="p-2 text-white/30 hover:text-white transition-colors" title={pkg.isActive ? "Hide Package" : "Show Package"}>
                      {pkg.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleEdit(pkg)} className="p-2 text-white/30 hover:text-blue-400 transition-colors" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(pkg._id)} className="p-2 text-white/30 hover:text-red-400 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#100f0d] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                <h3 className="font-serif text-2xl font-light">{editingId ? "Edit Package" : "New Package"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#c2a27c] appearance-none"
                    required
                  >
                    <option value="Event Venue Rental">Event Venue Rental</option>
                    <option value="Bridal Pick-Up Home">Bridal Pick-Up Home</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Package Title (e.g. "Micro" or "Ruracio")</label>
                  <input 
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#c2a27c]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Description (e.g. "0-10 Pax")</label>
                  <input 
                    type="text"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#c2a27c]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">Price (KES)</label>
                  <input 
                    type="number"
                    min="0"
                    value={formData.priceKES || ""}
                    onChange={e => setFormData({...formData, priceKES: parseInt(e.target.value) || 0})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#c2a27c]"
                    required
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    className="w-4 h-4 accent-[#c2a27c]"
                  />
                  <label htmlFor="isActive" className="text-sm font-light text-white/70">Package is visible to public</label>
                </div>
                <div className="pt-6">
                  <button type="submit" className="w-full bg-[#c2a27c] text-black py-4 rounded-lg font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-[#a68864] transition-colors">
                    {editingId ? "Save Changes" : "Create Package"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
