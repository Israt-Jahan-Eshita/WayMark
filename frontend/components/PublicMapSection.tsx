"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MapWrapper from "./MapWrapper";
import { listBuildings } from "@/lib/api";
import { useLanguage } from "./LanguageContext";

export default function PublicMapSection() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    listBuildings()
      .then(data => {
        setBuildings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load buildings for map:", err);
        setLoading(false);
      });
  }, []);

  return (
    <section className="w-full max-w-5xl mx-auto py-16 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold font-serif mb-4">{t("browse_places_title", "Browse Accessible Places")}</h2>
        <p className="text-[var(--text-secondary)] text-sm max-w-xl mx-auto">
          {t("browse_places_desc", "Explore buildings in your area that have been audited for accessibility. Find places with ramps, elevators, and clear pathways.")}
        </p>
      </motion.div>
      
      {loading ? (
        <div className="w-full h-[400px] bg-[#EBEBEB] dark:bg-[#1A1825] animate-pulse rounded-xl shadow-inner flex items-center justify-center font-mono text-sm text-[var(--text-secondary)]">{t("loading_map", "Loading Map Data...")}</div>
      ) : (
        <MapWrapper buildings={buildings} />
      )}
    </section>
  );
}
