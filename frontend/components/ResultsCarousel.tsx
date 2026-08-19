"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { listBuildings } from "@/lib/api";
import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";

export default function ResultsCarousel() {
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listBuildings()
      .then(data => {
        // Take top 5 recent buildings
        setRecentAudits(data.slice(0, 5));
        setLoading(false);
      })
      .catch(() => {
        // Fallback to empty if fails
        setRecentAudits([]);
        setLoading(false);
      });
  }, []);

  if (loading || recentAudits.length === 0) return null;

  return (
    <section className="py-8 w-full max-w-5xl mx-auto px-4 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--color-foreground)]">Recent Locations</h2>
        <Link href="/buildings" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">View All</Link>
      </div>
      
      <div className="flex flex-nowrap gap-4 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar">
        {recentAudits.map((result, i) => {
          
          // Determine status loosely based on score (e.g. 5/7)
          let status = "Moderate";
          let statusColor = "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20";
          
          if (result.latest_score) {
            const [num, den] = result.latest_score.split('/').map(Number);
            const ratio = num / (den || 1);
            if (ratio >= 0.8) {
              status = "Excellent";
              statusColor = "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20";
            } else if (ratio < 0.5) {
              status = "Poor";
              statusColor = "bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20";
            }
          }

          return (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="neu-panel w-56 flex-shrink-0 p-4 snap-center group hover:border-[var(--color-primary)]/50 transition-all cursor-pointer relative"
            >
              <Link href={`/buildings/${result.id}`} className="absolute inset-0 z-10" />
              
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-sm text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">{result.name}</h3>
              </div>
              
              {result.location && (
                <p className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 mb-3 line-clamp-1">
                  <MapPin className="w-3 h-3" /> {result.location}
                </p>
              )}
              
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--text-secondary)]">Score</span>
                  <span className="text-[var(--color-foreground)] font-bold">{result.latest_score || "N/A"}</span>
                </div>
                <div className={`text-[9px] px-2 py-1 rounded font-bold uppercase tracking-wide border text-center ${statusColor}`}>
                  {status}
                </div>
              </div>
              
              <div className="pt-3 border-t border-black/5 dark:border-white/5 text-[10px] font-bold text-[var(--text-secondary)] flex items-center justify-between">
                <span>{new Date(result.created_at).toLocaleDateString()}</span>
                <ChevronRight className="w-3 h-3 group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
