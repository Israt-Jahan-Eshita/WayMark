"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Building2, ImagePlus, ArrowLeft } from "lucide-react";
import { listBuildings, getBuildingHistory } from "@/lib/api";
import { useRouter } from "next/navigation";
import UploadModal from "@/components/UploadModal";
import ReportCard from "@/components/ReportCard";

export default function SearchAuditPage() {
  const router = useRouter();
  const [buildings, setBuildings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Selection states
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
  const [selectedAudit, setSelectedAudit] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewBuilding, setIsNewBuilding] = useState(true);

  // Fetch buildings on mount for autocomplete
  useEffect(() => {
    listBuildings()
      .then(data => {
        setBuildings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch buildings:", err);
        setLoading(false);
      });
  }, []);

  // Filter buildings based on search query
  const filteredBuildings = buildings.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exactMatch = buildings.find(b => b.name.toLowerCase() === searchQuery.toLowerCase().trim());

  const handleSelectBuilding = async (building: any) => {
    setSelectedBuilding(building);
    setIsNewBuilding(false); // Fix: Set to false to show the report view
    setLoadingHistory(true);
    try {
      const data = await getBuildingHistory(building.id);
      if (data && data.history && data.history.length > 0) {
        setSelectedAudit(data.history[0]); // Most recent
      }
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedBuilding({ name: searchQuery, location: "" });
    setIsNewBuilding(true);
    setIsModalOpen(true);
  };

  const handleUpdateExisting = () => {
    setIsNewBuilding(false);
    setIsModalOpen(true);
  };

  const handleReportSuccess = (report: any) => {
    if (report && report.id) {
      router.push(`/audit/${report.id}`);
    }
  };

  // Render the Existing Building View
  if (selectedBuilding && !isNewBuilding && !isModalOpen) {
    return (
      <div className="w-full max-w-5xl mx-auto py-10 px-4">
        <button 
          onClick={() => { setSelectedBuilding(null); setSelectedAudit(null); }}
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-1">Previous Audit Record</h1>
            <p className="text-[var(--text-secondary)] text-sm">Review the most recent inspection for {selectedBuilding.name}.</p>
          </div>
          
          <button 
            onClick={handleUpdateExisting}
            className="neu-btn neu-btn-primary px-4 py-2 text-sm flex items-center gap-2 shrink-0"
          >
            <ImagePlus className="w-4 h-4" />
            Update Photos & Re-Audit
          </button>
        </div>

        {loadingHistory ? (
          <div className="neu-panel p-8 text-center text-[var(--text-secondary)] text-sm font-bold animate-pulse">
            Loading official report...
          </div>
        ) : selectedAudit ? (
          <ReportCard report={selectedAudit} />
        ) : (
          <div className="neu-panel p-8 text-center text-[var(--color-error)] text-sm font-bold">
            No previous reports found for this building.
          </div>
        )}

        <UploadModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          defaultBuildingName={selectedBuilding?.name}
          defaultLocation={selectedBuilding?.location}
          isNewBuilding={false}
          onSuccess={handleReportSuccess}
        />
      </div>
    );
  }

  // Render the Search View
  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-4 relative">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-3">Search Location</h1>
        <p className="text-[var(--text-secondary)] text-sm">Search for an existing building to update its audit, or add a new one.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="neu-panel p-5">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter building name..."
              className="w-full neu-input py-3 pl-12 pr-4 text-base font-medium focus:ring-0"
              autoFocus
            />
          </div>

          {!loading && searchQuery.trim().length > 0 && (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
              {filteredBuildings.length > 0 ? (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2 px-2 sticky top-0 bg-[var(--bg-color)]/90 backdrop-blur py-1 z-10">Existing Locations</p>
                  {filteredBuildings.map(b => (
                    <button
                      key={b.id}
                      onClick={() => handleSelectBuilding(b)}
                      className="w-full text-left p-3 rounded-xl hover:bg-[var(--bg-gradient-start)] border border-transparent hover:border-[var(--color-primary)]/30 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--color-primary)] transition-colors" />
                        <div>
                          <span className="block font-semibold text-sm text-[var(--color-foreground)]">{b.name}</span>
                          {b.location && <span className="block text-[11px] text-[var(--text-secondary)]">{b.location}</span>}
                        </div>
                      </div>
                      <span className="text-[10px] text-[var(--text-secondary)] font-bold shrink-0 bg-black/5 dark:bg-white/5 px-2 py-1 rounded">SCORE: {b.latest_score || "N/A"}</span>
                    </button>
                  ))}
                </>
              ) : null}

              {!exactMatch && (
                <div className="pt-3 mt-3 border-t border-black/5 dark:border-white/5">
                  <button
                    onClick={handleCreateNew}
                    className="w-full text-left p-3 rounded-xl border border-dashed border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all flex items-center gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-white text-[var(--color-primary)] transition-colors shrink-0">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block font-semibold text-sm text-[var(--color-foreground)]">Add New Building</span>
                      <span className="block text-xs text-[var(--text-secondary)]">Create a new audit profile for "{searchQuery}"</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {loading && (
             <div className="text-center py-4 text-[var(--text-secondary)] text-sm font-bold flex justify-center items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Loading buildings...
             </div>
          )}
        </div>
      </motion.div>

      {/* Upload Modal for New Building Flow */}
      <UploadModal 
        isOpen={isModalOpen && isNewBuilding}
        onClose={() => setIsModalOpen(false)}
        defaultBuildingName={selectedBuilding?.name || ""}
        defaultLocation={selectedBuilding?.location || ""}
        isNewBuilding={true}
        onSuccess={handleReportSuccess}
      />
    </div>
  );
}
