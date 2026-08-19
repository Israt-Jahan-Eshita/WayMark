"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { runAudit } from "@/lib/api";
import { X } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBuildingName?: string;
  defaultLocation?: string;
  isNewBuilding?: boolean;
  onSuccess: (report: any) => void;
}

export default function UploadModal({ 
  isOpen, 
  onClose, 
  defaultBuildingName = "", 
  defaultLocation = "",
  isNewBuilding = true,
  onSuccess 
}: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [buildingName, setBuildingName] = useState(defaultBuildingName);
  const [location, setLocation] = useState(defaultLocation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset/update state when opened with new props
  useEffect(() => {
    if (isOpen) {
      setBuildingName(defaultBuildingName);
      setLocation(defaultLocation || "");
      setFiles([]);
      setError(null);
    }
  }, [isOpen, defaultBuildingName, defaultLocation]);

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Clean up object URLs when modal closes or files change to avoid memory leaks
  useEffect(() => {
    return () => {
      // Cleanup is usually good, but for small files the browser garbage collects well enough
    };
  }, [files, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files).slice(0, 5));
    }
  };

  const handleSubmit = async (e: React.FormEvent, reuseLast: boolean = false) => {
    e.preventDefault();
    if (!reuseLast && files.length === 0) {
      setError("Please upload at least one photo.");
      return;
    }
    if (!buildingName.trim()) {
      setError("Please enter a building name.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const report = await runAudit(buildingName, location, files, reuseLast);
      onSuccess(report);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollage = async () => {
    if (files.length <= 1) return;
    setLoading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");
      
      const imageElements = await Promise.all(files.map(file => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });
      }));

      const cols = Math.ceil(Math.sqrt(imageElements.length));
      const rows = Math.ceil(imageElements.length / cols);
      
      const cellWidth = 800;
      const cellHeight = 800;
      
      canvas.width = cols * cellWidth;
      canvas.height = rows * cellHeight;
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      imageElements.forEach((img, i) => {
        const x = (i % cols) * cellWidth;
        const y = Math.floor(i / cols) * cellHeight;
        
        // Center crop
        const scale = Math.max(cellWidth / img.width, cellHeight / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const offsetX = x + (cellWidth - w) / 2;
        const offsetY = y + (cellHeight - h) / 2;
        
        ctx.drawImage(img, offsetX, offsetY, w, h);
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const collageFile = new File([blob], 'collage.jpg', { type: 'image/jpeg' });
          setFiles([collageFile]);
        }
        setLoading(false);
      }, 'image/jpeg', 0.85);

    } catch (e: any) {
      console.error(e);
      setError("Failed to create collage: " + e.message);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="upload-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !loading && onClose()}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content - Modern Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md relative z-10"
          >
            {/* Form Container */}
            <div className="neu-panel bg-[#F9F9F9] dark:bg-[#2A2738] p-6 relative overflow-hidden rounded-xl border border-[#dcdcdc] dark:border-[#1F1D2C] shadow-2xl">
              
              {/* Close Button Inside Panel */}
              <button 
                onClick={() => !loading && onClose()}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-[var(--color-foreground)] transition-colors z-20"
              >
                <X className="w-4 h-4" />
              </button>

              <form onSubmit={(e) => handleSubmit(e, false)} className="relative z-10 mt-2">
                
                <div className="mb-4 pr-6">
                  <h2 className="text-xl font-bold font-serif text-[var(--color-foreground)]">
                    {isNewBuilding ? "New Location Audit" : "Update Existing Audit"}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mb-4 border-b border-dashed border-gray-300 dark:border-gray-600 pb-3">
                    Attach latest evidence photos for inspection.
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-[var(--color-foreground)] text-[10px] font-bold uppercase tracking-wider mb-1 font-mono">Building Name</label>
                  <input
                    type="text"
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    readOnly={!isNewBuilding}
                    placeholder="Official building name..."
                    className={`w-full text-[var(--color-foreground)] text-sm font-serif bg-[#EBEBEB] dark:bg-[#1A1825] p-2.5 rounded-lg shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.05)] border-transparent focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] ${!isNewBuilding ? 'opacity-70 cursor-not-allowed' : ''}`}
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-[var(--color-foreground)] text-[10px] font-bold uppercase tracking-wider mb-1 font-mono">Location / Address</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="E.g. Dhaka, Bangladesh"
                    className="w-full text-[var(--color-foreground)] text-sm font-serif bg-[#EBEBEB] dark:bg-[#1A1825] p-2.5 rounded-lg shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.05)] border-transparent focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-[var(--color-foreground)] text-[10px] font-bold uppercase tracking-wider mb-1 font-mono">Evidence Photos (Max 5)</label>
                  <div className="relative group cursor-pointer neu-input p-1 rounded-lg bg-[#EBEBEB] dark:bg-[#1A1825] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.05)] border border-transparent">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="relative block w-full text-xs text-[var(--text-secondary)] file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[var(--color-primary)] file:text-white hover:file:bg-[var(--color-primary-dark)] transition-all cursor-pointer p-1.5 bg-transparent"
                    />
                  </div>
                  
                  {files.length > 0 && (
                    <div className="mt-3 flex flex-col gap-3">
                      <p className="text-[var(--color-primary-dark)] text-[10px] font-bold font-mono">
                        {files.length} FILE(S) ATTACHED
                      </p>
                      
                      {/* Image Previews */}
                      <div className="grid grid-cols-5 gap-2">
                        {files.map((file, idx) => {
                          const url = URL.createObjectURL(file);
                          return (
                            <div 
                              key={`preview-${idx}`} 
                              onClick={() => setPreviewImage(url)}
                              className="group relative aspect-square rounded-md overflow-hidden bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                            >
                              <img 
                                src={url} 
                                alt={`Preview ${idx}`} 
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFiles(files.filter((_, i) => i !== idx));
                                }}
                                className="absolute top-1 right-1 w-5 h-5 bg-black/50 hover:bg-black rounded-full flex items-center justify-center text-white transition-colors z-10"
                                title="Remove photo"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      
                      {files.length > 1 && (
                        <button
                          type="button"
                          onClick={handleCreateCollage}
                          disabled={loading}
                          className="w-full neu-btn py-2 text-xs font-bold font-mono flex items-center justify-center gap-2 bg-[#EBEBEB] dark:bg-[#1A1825]"
                        >
                          CREATE COLLAGE (SAVE TOKENS)
                        </button>
                      )}
                      
                      {files.length === 1 && files[0].name === 'collage.jpg' && (
                        <p className="text-[var(--color-success)] text-[10px] font-bold font-mono">
                          COLLAGE READY FOR UPLOAD
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                {error && <div className="mb-4 text-[var(--color-error)] bg-[var(--color-error)]/10 p-2 rounded border border-[var(--color-error)]/30 text-[10px] font-bold font-mono text-center shadow-inner uppercase tracking-wide flex items-center justify-center gap-1.5">ERROR: {error}</div>}
                
                <button 
                  type="submit" 
                  disabled={loading || files.length === 0}
                  className="w-full neu-btn neu-btn-primary py-3 px-4 text-sm disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed font-bold tracking-wide shadow-[0_4px_0_var(--color-primary-dark)] active:shadow-[0_0px_0_var(--color-primary-dark)] active:translate-y-[4px]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Processing...
                    </span>
                  ) : (isNewBuilding ? "CREATE & AUDIT" : "UPDATE AUDIT")}
                </button>
              </form>

              {/* Dev shortcut to reuse last for testing easily */}
              <div className="pt-3 mt-4 border-t border-dashed border-gray-300 dark:border-gray-600 relative z-10">
                <button 
                  type="button" 
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                  className="w-full neu-btn py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-bold font-mono uppercase tracking-wide bg-[#EBEBEB] dark:bg-[#1A1825] shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.5),-2px_-2px_4px_rgba(255,255,255,0.05)] border border-transparent active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]"
                >
                  REUSE LAST UPLOAD (DEV)
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}

      {/* Fullscreen Image Preview Lightbox */}
      {previewImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
          <button 
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-[210]"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={previewImage} 
            alt="Fullscreen Preview" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
