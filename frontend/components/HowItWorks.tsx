"use client";
import { motion } from "framer-motion";
import { UploadCloud, CheckCircle2, FileText } from "lucide-react";

const steps = [
  {
    icon: <UploadCloud className="w-8 h-8 text-[var(--color-primary)]" />,
    title: "1. Upload Photos",
    description: "Snap and upload photos of building entrances, ramps, and facilities.",
  },
  {
    icon: <CheckCircle2 className="w-8 h-8 text-[var(--color-secondary-dark)]" />,
    title: "2. AI Analysis",
    description: "Our vision model instantly detects key accessibility features and flags barriers.",
  },
  {
    icon: <FileText className="w-8 h-8 text-[var(--color-primary-dark)]" />,
    title: "3. Get Report",
    description: "Receive a detailed compliance score and an actionable audit report.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 w-full max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--color-foreground)]">
          How It Works
        </h2>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          Three simple steps to generate a professional accessibility audit.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 relative">
        {/* Subtle connecting line for desktop */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-[var(--glass-border)] -z-10"></div>
        
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="glass-panel p-8 text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-300"
          >
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-gradient-start)] flex items-center justify-center shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),_inset_-4px_-4px_8px_var(--neu-shadow-light)] mb-6">
              {step.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-[var(--color-foreground)]">{step.title}</h3>
            <p className="text-[var(--text-secondary)]">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
