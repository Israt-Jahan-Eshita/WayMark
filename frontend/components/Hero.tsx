"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { listBuildings } from "@/lib/api";
import { useLanguage } from "./LanguageContext";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (target <= 0 || hasAnimated.current) return;
    hasAnimated.current = true;
    
    const duration = 1200;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Hero() {
  const [stats, setStats] = useState({ count: 0, avgScore: 0 });
  const { t } = useLanguage();

  useEffect(() => {
    listBuildings().then(data => {
      if (data && data.length > 0) {
        let totalScore = 0;
        let validScores = 0;
        data.forEach((b: any) => {
          if (b.latest_score) {
            const [num, den] = b.latest_score.split('/').map(Number);
            if (den > 0) {
              totalScore += (num / den);
              validScores += 1;
            }
          }
        });
        const avg = validScores > 0 ? (totalScore / validScores) * 100 : 0;
        setStats({ count: data.length, avgScore: Math.round(avg) });
      }
    }).catch(err => console.error(err));
  }, []);

  return (
    <section className="relative pt-32 pb-12 flex flex-col items-center text-center">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
      >
        <span className="text-[var(--color-foreground)]">WayMark </span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
          AI
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-2xl mx-auto font-light leading-relaxed mb-10"
      >
        {t("hero_subtitle", "Upload building photos and let our rule-based AI engine instantly audit physical accessibility with pinpoint accuracy.")}
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col items-center gap-6"
      >
        <Link href="/audit/new" className="neu-btn neu-btn-primary px-6 py-3 text-base">
          {t("start_audit", "Start an audit")}
        </Link>
        
        {stats.count > 0 && (
          <div className="flex gap-8 mt-6">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold font-mono text-[var(--color-primary)]">
                <AnimatedCounter target={stats.count} />
              </span>
              <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-bold">{t("buildings_audited", "Buildings Audited")}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold font-mono text-[var(--color-success)]">
                <AnimatedCounter target={stats.avgScore} suffix="%" />
              </span>
              <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-bold">{t("avg_accessibility", "Avg. Accessibility")}</span>
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
}
