"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Upload, X, Loader2, Image as ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";

export default function AdminGallery() {
  const images = useQuery(api.gallery?.getImages || (() => []));
  const generateUploadUrl = useMutation(api.gallery?.generateUploadUrl || (() => Promise.resolve("")));
  const saveImage = useMutation(api.gallery?.saveImage || (() => Promise.resolve()));
  const deleteImage = useMutation(api.gallery?.deleteImage || (() => Promise.resolve()));

  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 1. Get a short-lived upload URL
        const postUrl = await generateUploadUrl();
        
        // 2. POST the file to the URL
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        
        const { storageId } = await result.json();
        
        // 3. Save the storage ID and generate a URL
        await saveImage({ storageId });
      }
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: any, storageId: any) => {
    if (!confirm("Are you sure you want to delete this image? It will be permanently removed from the public gallery.")) return;
    
    setDeletingId(id);
    try {
      await deleteImage({ id, storageId });
    } catch (e) {
      console.error("Failed to delete", e);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-light text-[#c2a27c]">Gallery Manager</h1>
        <p className="text-white/50 text-sm mt-2 font-light">
          Upload and manage photos that will be displayed in the spectacular public gallery.
        </p>
      </div>

      {/* Upload Zone */}
      <div 
        className="relative overflow-hidden border border-dashed border-white/20 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-12 text-center flex flex-col items-center justify-center cursor-pointer group"
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleUpload}
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-4 text-[#c2a27c]">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="font-mono text-xs uppercase tracking-widest">Uploading Images...</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-[#c2a27c]/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#c2a27c]/20 transition-all">
              <Upload className="w-6 h-6 text-[#c2a27c]" />
            </div>
            <h3 className="font-serif text-xl text-white mb-2">Click to Upload Images</h3>
            <p className="text-sm text-white/40 font-light max-w-md">
              Select one or multiple high-quality images. They will be automatically resized and optimized.
            </p>
          </>
        )}
      </div>

      {/* Image Grid */}
      <div className="space-y-4">
        <h2 className="font-mono text-xs uppercase tracking-widest text-white/40">Published Images ({images?.length || 0})</h2>
        
        {images === undefined ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 text-[#c2a27c] animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="p-12 text-center border border-white/10 rounded-xl bg-black/40">
            <ImageIcon className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm font-light">No images uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((img: any) => (
              <div key={img._id} className="group relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 shadow-lg">
                <Image 
                  src={img.url} 
                  alt="Gallery Image" 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                
                {/* Always-visible Quick Delete Button (top right) */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(img._id, img.storageId);
                  }}
                  disabled={deletingId === img._id}
                  className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg hover:bg-red-500 hover:scale-110 active:scale-95 transition-all cursor-pointer border border-red-400/30"
                  title="Delete Image"
                >
                  {deletingId === img._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>

                {/* Hover overlay with Delete confirmation label */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(img._id, img.storageId);
                    }}
                    disabled={deletingId === img._id}
                    className="px-4 py-2 bg-red-600/90 hover:bg-red-500 text-white rounded-full text-xs font-mono uppercase tracking-widest flex items-center gap-2 shadow-xl cursor-pointer transition-all hover:scale-105"
                  >
                    {deletingId === img._id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
