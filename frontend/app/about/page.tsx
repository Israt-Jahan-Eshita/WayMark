"use client";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 w-full max-w-4xl mx-auto mt-24">
      <div className="glass-panel p-8 md:p-12 text-[var(--color-foreground)]">
        <h1 className="text-4xl font-extrabold mb-8 text-[var(--color-primary)] font-serif text-center">About WayMark AI</h1>
        
        <div className="space-y-8 font-sans">
          <section>
            <h2 className="text-2xl font-bold mb-4 font-mono">The Problem</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Public spaces claim to be "accessible" — but there's no reliable way to verify it. 
              Information is inconsistent, based on claims rather than evidence, and manual auditing 
              is too slow to scale.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-mono">How It Works</h2>
            <ol className="list-decimal list-inside text-[var(--text-secondary)] leading-relaxed space-y-2">
              <li>A photo of a building or facility is submitted.</li>
              <li>AI (vision model) extracts only what's visibly present — no assumptions, no guessing.</li>
              <li>Extracted features are checked against a curated accessibility checklist.</li>
              <li>Result: a structured audit — verified, flagged, or marked "cannot verify from this photo".</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-mono">Our Standard</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              The checklist used is based on <span className="font-semibold">WHO & National Accessibility Guidelines</span>, 
              covering core criteria: ramp access, step-free entrance, doorway width, tactile guidance, 
              accessible restroom, etc. Checklist version: <span className="font-mono">Aug 2026</span> — updated as standards evolve, with past 
              audits tied to the version active at the time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-mono">What the AI Does — and Doesn't — Decide</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              The AI only extracts what it sees in the photo. It does not set the standard. 
              The checklist and verification logic are built and maintained separately, so results 
              are consistent and auditable — not just "an AI's opinion."
            </p>
          </section>

          <section className="bg-[var(--color-primary)]/10 border-l-4 border-[var(--color-primary)] p-4 rounded-r-xl mt-8">
            <h2 className="text-xl font-bold mb-2 font-mono text-[var(--color-primary-dark)]">Limitations</h2>
            <p className="text-[var(--color-foreground)] leading-relaxed text-sm">
              This is not a certified accessibility inspection. A single photo can't capture 
              everything (surface texture, precise measurements, functioning condition). Treat 
              results as a starting reference point, not a final verdict.
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
