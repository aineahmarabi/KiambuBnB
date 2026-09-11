"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Upload, X, Loader2, Image as ImageIcon, Trash2, CheckCircle2, Plus, Sparkles } from "lucide-react";
import Image from "next/image";

interface StagedFile {
  id: string;
  file: File;
  previewUrl: string;
}

export default function AdminGallery() {
  const images = useQuery(api.gallery?.getImages || (() => []));
  const generateUploadUrl = useMutation(api.gallery?.generateUploadUrl || (() => Promise.resolve("")));
  const saveImage = useMutation(api.gallery?.saveImage || (() => Promise.resolve()));
  const deleteImage = useMutation(api.gallery?.deleteImage || (() => Promise.resolve()));

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection from input or drag-and-drop
  const addFilesToStage = (fileList: FileList | File[]) => {
    const newStaged: StagedFile[] = [];
    Array.from(fileList).forEach((file) => {
      if (file.type.startsWith("image/")) {
        newStaged.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }
    });
    setStagedFiles((prev) => [...prev, ...newStaged]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToStage(e.target.files);
    }
  };

  // Drag & Drop event handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToStage(e.dataTransfer.files);
    }
  };

  const removeStagedFile = (id: string) => {
    setStagedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const clearStagedFiles = () => {
    stagedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setStagedFiles([]);
  };

  // Publish all staged files to Convex database & cloud storage
  const handlePublishStaged = async () => {
    if (stagedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ current: 0, total: stagedFiles.length });

    try {
      for (let i = 0; i < stagedFiles.length; i++) {
        const staged = stagedFiles[i];
        setUploadProgress({ current: i + 1, total: stagedFiles.length });

        // 1. Generate short-lived upload URL
        const postUrl = await generateUploadUrl();

        // 2. Upload binary file to Convex storage
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": staged.file.type },
          body: staged.file,
        });

        const { storageId } = await result.json();

        // 3. Save storage metadata into gallery database
        await saveImage({ storageId });
      }

      // Success: clear staged state
      clearStagedFiles();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to publish some images. Please check your network and try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
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
          Drag &amp; drop multiple photos, preview your uploads, and publish them to the live public gallery.
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        disabled={isUploading}
      />

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${
          isDraggingOver
            ? "border-[#c2a27c] bg-[#c2a27c]/10 scale-[1.01] shadow-[0_0_40px_rgba(194,162,124,0.2)]"
            : "border-white/20 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/40"
        }`}
      >
        <div className="w-16 h-16 bg-[#c2a27c]/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#c2a27c]/20 transition-all">
          <Upload className="w-6 h-6 text-[#c2a27c]" />
        </div>

        <h3 className="font-serif text-xl text-white mb-2">
          {isDraggingOver ? "Drop Images Here" : "Drag & Drop or Click to Select Images"}
        </h3>
        <p className="text-sm text-white/40 font-light max-w-md">
          Select one or multiple high-resolution photos at once. Preview them below before publishing.
        </p>
      </div>

      {/* STAGED PREVIEW & PUBLISH PROMPT MODAL / PANEL */}
      {stagedFiles.length > 0 && (
        <div className="bg-[#141311] border border-[#c2a27c]/40 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 text-[#c2a27c] font-mono text-xs uppercase tracking-widest mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Ready for Review</span>
              </div>
              <h2 className="font-serif text-2xl text-white">
                {stagedFiles.length} {stagedFiles.length === 1 ? "Image" : "Images"} Staged for Publishing
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 rounded-full border border-white/20 hover:border-white text-white text-xs font-mono uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add More</span>
              </button>

              <button
                onClick={clearStagedFiles}
                disabled={isUploading}
                className="px-4 py-2 rounded-full text-white/40 hover:text-red-400 text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Staged Thumbnails Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[350px] overflow-y-auto pr-2 dark-scrollbar">
            {stagedFiles.map((staged) => (
              <div key={staged.id} className="relative aspect-square rounded-xl overflow-hidden bg-black/60 border border-white/15 group">
                <Image
                  src={staged.previewUrl}
                  alt="Staged Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  onClick={() => removeStagedFile(staged.id)}
                  disabled={isUploading}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/80 text-white flex items-center justify-center opacity-80 group-hover:opacity-100 hover:bg-red-600 transition-all cursor-pointer"
                  title="Remove from batch"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Action Prompt Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
            <p className="text-white/40 font-light text-xs">
              Review your selection above. Clicking publish will save all photos to the live gallery.
            </p>

            <button
              onClick={handlePublishStaged}
              disabled={isUploading}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#c2a27c] text-black font-mono text-xs uppercase tracking-widest font-bold hover:scale-105 transition-transform flex items-center justify-center gap-3 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    Publishing ({uploadProgress?.current} of {uploadProgress?.total})...
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish All ({stagedFiles.length}) Images to Gallery</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Published Live Gallery Section */}
      <div className="space-y-4 pt-4">
        <h2 className="font-mono text-xs uppercase tracking-widest text-white/40">
          Published Live Gallery ({images?.length || 0})
        </h2>

        {images === undefined ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 text-[#c2a27c] animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="p-12 text-center border border-white/10 rounded-xl bg-black/40">
            <ImageIcon className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm font-light">No images published yet.</p>
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
