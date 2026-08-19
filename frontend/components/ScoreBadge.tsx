"use client";
import { motion } from "framer-motion";
import { useLanguage } from "./LanguageContext";

export default function ScoreBadge({ score }: { score: string }) {
  const { t } = useLanguage();
  if (!score || !score.includes('/')) return null;
  const [num, den] = score.split('/').map(Number);
  const percentage = den > 0 ? (num / den) * 100 : 0;
  
  let color = "var(--color-success)"; // green
  if (percentage < 50) color = "var(--color-error)"; // red
  else if (percentage < 80) color = "var(--color-warning)"; // yellow
  
  return (
    <div className="flex flex-col items-center gap-1.5" title={`${Math.round(percentage)}% Accessible`}>
      <div className="relative w-16 h-16 flex items-center justify-center rounded-full shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.05)] bg-[#EBEBEB] dark:bg-[#1A1825]">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="rgba(0,0,0,0.05)"
            strokeWidth="3"
            className="dark:stroke-white/10"
          />
          <motion.path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${percentage}, 100`}
            initial={{ strokeDasharray: "0, 100" }}
            animate={{ strokeDasharray: `${percentage}, 100` }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-[13px] text-[var(--color-foreground)]">
          {score}
        </div>
      </div>
      <div className="text-[9px] font-bold tracking-wider uppercase text-[var(--text-secondary)]">{t("score", "Score")}</div>
    </div>
  );
}
