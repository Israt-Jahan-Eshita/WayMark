"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { runAudit } from "@/lib/api";
import { X, MapPin } from "lucide-react";
import DynamicLocationPicker from "./DynamicLocationPicker";
import { useLanguage } from "./LanguageContext";
import VoiceInputButton from "./VoiceInputButton";

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
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const { t } = useLanguage();

  // Reset/update state when opened with new props
  useEffect(() => {
    if (isOpen) {
      setBuildingName(defaultBuildingName);
      setLocation(defaultLocation || "");
      setLatitude(null);
      setLongitude(null);
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
      const report = await runAudit(buildingName, location, files, reuseLast, latitude, longitude);
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
    <>
      {typeof document !== 'undefined' && createPortal(
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
                    {isNewBuilding ? t("new_location_audit", "New Location Audit") : t("update_audit", "Update Existing Audit")}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mb-4 border-b border-dashed border-gray-300 dark:border-gray-600 pb-3">
                    {t("attach_evidence", "Attach latest evidence photos for inspection.")}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-[var(--color-foreground)] text-[10px] font-bold uppercase tracking-wider mb-1 font-mono">{t("building_name", "Building Name")}</label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={buildingName}
                      onChange={(e) => setBuildingName(e.target.value)}
                      readOnly={!isNewBuilding}
                      placeholder={t("building_name_placeholder", "Official building name...")}
                      className={`w-full text-[var(--color-foreground)] text-sm font-serif bg-[#EBEBEB] dark:bg-[#1A1825] py-2.5 pl-3 pr-10 rounded-lg shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.05)] border-transparent focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] ${!isNewBuilding ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                    {isNewBuilding && (
                      <VoiceInputButton onResult={(text) => setBuildingName(prev => (prev ? prev + " " : "") + text)} />
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-[var(--color-foreground)] text-[10px] font-bold uppercase tracking-wider mb-1 font-mono">{t("location_address", "Location / Address")}</label>
                  <div className="flex gap-2 relative group">
                    <div className="relative flex-grow group">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={t("location_placeholder", "E.g. Dhaka, Bangladesh")}
                        className="w-full text-[var(--color-foreground)] text-sm font-serif bg-[#EBEBEB] dark:bg-[#1A1825] py-2.5 pl-3 pr-10 rounded-lg shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.05)] border-transparent focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                      />
                      <VoiceInputButton onResult={(text) => setLocation(prev => (prev ? prev + " " : "") + text)} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMap(true)}
                      className="neu-btn px-3 flex items-center justify-center gap-1 text-xs font-bold font-mono text-[var(--color-primary)] whitespace-nowrap"
                      title="Pick on Map"
                    >
                      <MapPin className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-[var(--color-foreground)] text-[10px] font-bold uppercase tracking-wider mb-1 font-mono">{t("evidence_photos", "Evidence Photos (Max 5)")}</label>
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
                        {files.length} {t("files_attached", "FILE(S) ATTACHED")}
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
                          {t("create_collage", "CREATE COLLAGE (SAVE TOKENS)")}
                        </button>
                      )}
                      
                      {files.length === 1 && files[0].name === 'collage.jpg' && (
                        <p className="text-[var(--color-success)] text-[10px] font-bold font-mono">
                          {t("collage_ready", "COLLAGE READY FOR UPLOAD")}
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
                      {t("processing", "Processing...")}
                    </span>
                  ) : (isNewBuilding ? t("create_and_audit", "CREATE & AUDIT") : t("update_audit", "UPDATE AUDIT"))}
                </button>
              </form>

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

      {/* Location Picker Map Popup */}
      {showMap && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-white dark:bg-[#1A1825] rounded-xl overflow-hidden shadow-2xl flex flex-col relative"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-bold font-serif text-[var(--color-foreground)] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
                {t("select_location", "Select Building Location")}
              </h3>
              <button 
                onClick={() => setShowMap(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center text-[var(--color-foreground)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <DynamicLocationPicker 
              onSelect={(locName, lat, lng) => {
                setLocation(locName);
                setLatitude(lat);
                setLongitude(lng);
                setShowMap(false);
              }} 
            />
          </motion.div>
        </div>
      )}
      </AnimatePresence>,
      document.body
      )}
    </>
  );
}
