"use client";
import { motion } from "framer-motion";
import { Eye, ShieldCheck, Zap } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export default function WhyWayMark() {
  const { t } = useLanguage();

  const reasons = [
    {
      icon: <Eye className="w-7 h-7" />,
      title: t("why_1_title", "Evidence-Based"),
      description: t("why_1_desc", "No guesswork. The AI extracts only what is visibly present in uploaded photos — ramps, doorways, signage — nothing assumed."),
      stat: "1B+",
      statLabel: t("why_1_stat", "People with disabilities worldwide (WHO)"),
    },
    {
      icon: <ShieldCheck className="w-7 h-7" />,
      title: t("why_2_title", "Transparent & Auditable"),
      description: t("why_2_desc", "AI sees, the checklist decides. Every result maps to a versioned standard — not a black box opinion."),
      stat: "7",
      statLabel: t("why_2_stat", "Core accessibility criteria checked"),
    },
    {
      icon: <Zap className="w-7 h-7" />,
      title: t("why_3_title", "Instant & Scalable"),
      description: t("why_3_desc", "No site visits required. Upload a photo and get a structured compliance report in under 30 seconds."),
      stat: "<30s",
      statLabel: t("why_3_stat", "Average audit completion time"),
    },
  ];

  return (
    <section className="py-20 w-full max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--color-foreground)]">
          {t("why_waymark_title", "Why WayMark?")}
        </h2>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          {t("why_waymark_desc", "Public spaces claim accessibility — but claims are not evidence. WayMark bridges the gap.")}
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {reasons.map((reason, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.12 }}
            className="neu-panel p-6 flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
          >
            {/* Accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] opacity-60 group-hover:opacity-100 transition-opacity" />
            
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] mb-4">
              {reason.icon}
            </div>
            
            <h3 className="text-lg font-bold mb-2 text-[var(--color-foreground)]">{reason.title}</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed flex-grow">{reason.description}</p>
            
            {/* Stat highlight */}
            <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/5">
              <span className="text-2xl font-bold font-mono text-[var(--color-primary)]">{reason.stat}</span>
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-bold mt-1">{reason.statLabel}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
