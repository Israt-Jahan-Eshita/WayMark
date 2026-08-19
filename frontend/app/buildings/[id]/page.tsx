"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getBuildingHistory } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Building2, Calendar, FileText, MapPin, X, ExternalLink } from "lucide-react";
import { useParams } from "next/navigation";
import ReportCard from "@/components/ReportCard";

export default function BuildingDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    
    getBuildingHistory(id)
      .then(res => {
        if (res && res.history) {
          res.history.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto pt-32 pb-16 px-6 flex justify-center">
        <span className="flex items-center justify-center gap-3 text-[var(--color-primary)] font-semibold text-lg">
          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Loading Building History...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-4xl mx-auto pt-32 pb-12 px-6 text-center">
        <p className="text-[var(--color-error)] font-medium text-xl mb-6">{error || "Building not found"}</p>
        <Link href="/buildings" className="neu-btn px-6 py-3 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to buildings
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto pt-28 pb-16 px-4">
      <Link href="/buildings" className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors mb-6 text-sm font-medium">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to buildings
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 neu-panel p-5 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shadow-inner">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-1">{data.building.name}</h1>
            <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] font-medium">
              {data.building.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {data.building.location}</span>}
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Added: {new Date(data.building.created_at).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {data.history.length} Audits</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 bg-[var(--bg-gradient-start)] px-4 py-3 rounded-xl shadow-inner border border-white/10 flex flex-col items-end">
          <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold mb-0.5">Latest Score</div>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-secondary-dark)]">
            {data.building.latest_score || "N/A"}
          </div>
        </div>
      </motion.div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-[var(--color-primary)]/30 before:to-transparent">
        {data.history.map((audit: any, idx: number) => (
          <motion.div 
            key={audit.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
          >
            {/* Timeline dot */}
            <div className="absolute left-6 md:left-1/2 flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full bg-[var(--color-primary)] ring-[3px] ring-[var(--glass-bg)] group-hover:scale-125 transition-transform shadow-md z-10"></div>
            
            <div className="ml-14 md:ml-0 md:w-[calc(50%-2rem)] md:odd:pl-8 md:even:pr-8 w-full">
              <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/5 px-2 py-1 rounded">
                <Calendar className="w-3 h-3" />
                {new Date(audit.created_at).toLocaleString()}
              </div>
              
              <button 
                onClick={() => setSelectedAudit(audit)}
                className="w-full text-left neu-panel p-4 hover:border-[var(--color-primary)]/50 transition-colors flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold text-sm text-[var(--color-foreground)]">Official Inspection Report</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Score: {audit.score}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[var(--bg-color)] flex items-center justify-center text-[var(--color-primary)] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </button>

            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedAudit && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAudit(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl max-h-[95vh] overflow-y-auto relative z-10 rounded-xl shadow-2xl"
            >
              <div className="relative">
                <button 
                  onClick={() => setSelectedAudit(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-gray-900 transition-colors z-[9999]"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <ReportCard report={selectedAudit} isModal={true} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
