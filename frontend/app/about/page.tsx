"use client";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 w-full max-w-4xl mx-auto mt-24">
      <div className="glass-panel p-12 text-center text-[var(--text-secondary)] font-medium">
        About WayMark - Information about the tool
      </div>
    </motion.div>
  );
}
