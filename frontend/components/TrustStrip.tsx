"use client";
import { motion } from "framer-motion";

export default function TrustStrip() {
  return (
    <div className="w-full border-y border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md py-8 my-16">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 opacity-70">
        <p className="text-sm font-semibold tracking-widest uppercase text-[var(--text-secondary)]">Trusted by Accessibility Advocates</p>
        <div className="flex gap-12 text-[var(--color-primary-dark)] font-bold text-xl">
          <motion.span whileHover={{ scale: 1.05 }}>Acme Architects</motion.span>
          <motion.span whileHover={{ scale: 1.05 }}>BuildSafe City</motion.span>
          <motion.span whileHover={{ scale: 1.05 }}>Global Access Org</motion.span>
        </div>
      </div>
    </div>
  );
}
