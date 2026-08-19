"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { listBuildings } from "@/lib/api";
import Link from "next/link";
import { Building2, Calendar, ChevronRight, Search, MapPin } from "lucide-react";

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    listBuildings()
      .then(data => {
        setBuildings(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredBuildings = buildings.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (b.location && b.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto pt-32 pb-16 px-6 flex justify-center">
        <span className="flex items-center justify-center gap-3 text-[var(--color-primary)] font-semibold text-lg">
          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Loading Buildings...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto pt-32 pb-16 px-6 text-center">
        <p className="text-[var(--color-error)] font-medium text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto pt-28 pb-16 px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-2">Audited Locations</h1>
        <p className="text-[var(--text-secondary)] text-sm mb-6">View accessibility history for all scanned locations.</p>
        
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by building name or location..."
            className="w-full neu-input py-3 pl-12 pr-4 text-sm font-medium focus:ring-0"
          />
        </div>
      </motion.div>

      <div className="grid gap-4">
        {filteredBuildings.length === 0 ? (
          <div className="neu-panel p-8 text-center text-[var(--text-secondary)] font-medium text-sm">
            {buildings.length === 0 ? "No buildings have been audited yet." : "No buildings match your search."}
          </div>
        ) : (
          filteredBuildings.map((building, idx) => (
            <motion.div 
              key={building.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link href={`/buildings/${building.id}`}>
                <div className="neu-panel p-4 flex flex-col md:flex-row justify-between items-start md:items-center group hover:border-[var(--color-primary)]/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] group-hover:scale-110 transition-transform shadow-inner shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                        {building.name}
                      </h2>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                        {building.location && <span className="flex items-center gap-1 line-clamp-1"><MapPin className="w-3 h-3" /> {building.location}</span>}
                        <span className="flex items-center gap-1 shrink-0"><Calendar className="w-3 h-3" /> {new Date(building.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 md:mt-0 flex items-center gap-4 w-full md:w-auto justify-between shrink-0 pl-14 md:pl-0">
                    <div className="flex flex-col items-start md:items-end">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">Latest Score</span>
                      <span className="text-xl font-black text-[var(--color-primary)]">
                        {building.latest_score || "N/A"}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
