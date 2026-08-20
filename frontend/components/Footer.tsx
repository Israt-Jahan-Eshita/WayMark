import Link from "next/link";
import { Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-[var(--bg-color)] mt-20 relative z-10">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group inline-flex">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white font-bold text-xl shadow-md">
                W
              </div>
              <span className="font-extrabold text-xl tracking-tight text-[var(--color-foreground)]">
                WayMark
              </span>
            </Link>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6 max-w-md">
              WayMark AI is an automated physical accessibility auditing platform. We help civil engineers, city planners, and accessibility advocates quickly verify building compliance using AI vision models.
            </p>
            <div className="flex items-center gap-4 text-[var(--text-secondary)]">
              <a href="#" className="hover:text-[var(--color-primary)] transition-colors"><Github className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-[var(--color-foreground)] mb-4 font-mono uppercase tracking-wider text-sm">Product</h3>
            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
              <li><Link href="/audit/new" className="hover:text-[var(--color-primary)] transition-colors">Start an Audit</Link></li>
              <li><Link href="/buildings" className="hover:text-[var(--color-primary)] transition-colors">Browse Places</Link></li>
              <li><Link href="/about" className="hover:text-[var(--color-primary)] transition-colors">How it Works</Link></li>
              <li><Link href="/about" className="hover:text-[var(--color-primary)] transition-colors">Our Guidelines</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[var(--color-foreground)] mb-4 font-mono uppercase tracking-wider text-sm">Legal</h3>
            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Accessibility Statement</a></li>
            </ul>
          </div>
          
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[var(--text-secondary)]">
          <p>© {new Date().getFullYear()} WayMark AI. Built for the Hackathon.</p>
          <p>Designed for universal accessibility.</p>
        </div>
      </div>
    </footer>
  );
}
