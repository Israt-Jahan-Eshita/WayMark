"use client";
import { useState } from "react";
import { runAudit } from "@/lib/api";

export default function UploadForm({ onReportReceived }: { onReportReceived: (report: any) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [buildingName, setBuildingName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files).slice(0, 5));
    }
  };

  const handleSubmit = async (e: React.FormEvent, reuseLast: boolean = false) => {
    e.preventDefault();
    if (!reuseLast && files.length === 0) return;
    if (!buildingName.trim()) {
      setError("Please enter a building name.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const report = await runAudit(buildingName, "", files, reuseLast);
      onReportReceived(report);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto relative mt-8">
      {/* Skeuomorphic Clipboard Top Clip */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-8 bg-gradient-to-b from-[#e0e0e0] to-[#c0c0c0] rounded-t-xl border border-[#a0a0a0] shadow-[0_4px_8px_rgba(0,0,0,0.3)] z-20 flex items-center justify-center before:content-[''] before:w-16 before:h-2 before:bg-gradient-to-b before:from-[#c0c0c0] before:to-[#a0a0a0] before:rounded-full before:shadow-inner"></div>
      
      {/* Skeuomorphic Paper/Board */}
      <div className="neu-panel bg-[#F9F9F9] dark:bg-[#2A2738] p-6 relative overflow-hidden rounded-b-xl rounded-t-sm shadow-[10px_15px_30px_rgba(0,0,0,0.15)] border-t-[12px] border-[#dcdcdc] dark:border-[#1F1D2C]">
        
        {/* Binder holes */}
        <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-[var(--bg-color)] shadow-inner border border-black/10"></div>
        <div className="absolute top-1/2 left-4 w-4 h-4 rounded-full bg-[var(--bg-color)] shadow-inner border border-black/10"></div>
        <div className="absolute bottom-16 left-4 w-4 h-4 rounded-full bg-[var(--bg-color)] shadow-inner border border-black/10"></div>
        
        <form onSubmit={(e) => handleSubmit(e, false)} className="ml-8 mt-4 relative z-10">
          <div className="mb-6 border-b-2 border-dashed border-gray-300 dark:border-gray-600 pb-2">
            <label className="block text-[var(--color-foreground)] text-sm font-bold uppercase tracking-wider mb-2 font-mono">Building Identification</label>
            <input
              type="text"
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
              placeholder="Enter official building name..."
              className="w-full bg-transparent text-[var(--color-foreground)] text-lg placeholder-[var(--text-secondary)] focus:outline-none focus:ring-0 border-none px-0 font-serif"
            />
          </div>

          <div className="mb-8">
            <label className="block text-[var(--color-foreground)] text-sm font-bold uppercase tracking-wider mb-3 font-mono">Evidence Photos (Max 5)</label>
            <div className="relative group cursor-pointer neu-input p-1 rounded-xl bg-[#EBEBEB] dark:bg-[#1A1825] shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1),inset_-3px_-3px_6px_rgba(255,255,255,0.7)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5),inset_-3px_-3px_6px_rgba(255,255,255,0.05)] border border-transparent">
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleFileChange}
                className="relative block w-full text-sm text-[var(--text-secondary)] file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[var(--color-primary)] file:text-white hover:file:bg-[var(--color-primary-dark)] transition-all cursor-pointer p-2 bg-transparent"
              />
            </div>
            {files.length > 0 && <p className="text-[var(--color-primary-dark)] mt-2 text-xs font-bold font-mono">📎 {files.length} FILE(S) ATTACHED</p>}
          </div>
          
          {error && <div className="mb-6 text-[var(--color-error)] bg-[var(--color-error)]/10 p-3 rounded-lg border border-[var(--color-error)]/30 text-sm font-bold font-mono text-center shadow-inner uppercase tracking-wide flex items-center justify-center gap-2">⚠️ {error}</div>}
          
          <button 
            type="submit" 
            disabled={loading || (files.length === 0 && false)}
            className="w-full neu-btn neu-btn-primary py-4 px-6 text-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed font-bold tracking-wide shadow-[0_6px_0_var(--color-primary-dark)] active:shadow-[0_0px_0_var(--color-primary-dark)] active:translate-y-[6px]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing Audit...
              </span>
            ) : "SUBMIT REPORT"}
          </button>
        </form>

        <div className="ml-8 pt-4 mt-6 border-t-2 border-dashed border-gray-300 dark:border-gray-600 relative z-10">
          <button 
            type="button" 
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="w-full neu-btn py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold font-mono uppercase tracking-wide bg-[#EBEBEB] dark:bg-[#1A1825] shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.7)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.5),-4px_-4px_8px_rgba(255,255,255,0.05)] border border-transparent active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]"
          >
            ↻ REUSE LAST ATTACHMENT
          </button>
        </div>
      </div>
    </div>
  );
}
