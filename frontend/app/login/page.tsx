"use client";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Building2, KeyRound, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      login(); // Actually bypasses it anyway for this demo
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative z-20 px-4 pt-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="neu-panel bg-[var(--bg-color)] p-8 relative overflow-hidden rounded-2xl shadow-2xl text-center">
          
          <div className="mb-8 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white shadow-lg mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold font-serif text-[var(--color-foreground)]">WayMark Auth</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-2">Sign in to access accessibility auditing tools.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <div>
              <label className="block text-[var(--color-foreground)] text-[10px] font-bold uppercase tracking-wider mb-2 font-mono">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="auditor@waymark.ai"
                className="w-full text-[var(--color-foreground)] text-sm font-serif bg-[var(--bg-gradient-start)] p-3 rounded-xl shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.05)] border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-[var(--color-foreground)] text-[10px] font-bold uppercase tracking-wider mb-2 font-mono">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-[var(--color-foreground)] text-sm font-serif bg-[var(--bg-gradient-start)] p-3 rounded-xl shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.05)] border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 neu-btn bg-[var(--bg-gradient-start)] py-3 px-4 text-sm disabled:opacity-50 font-bold tracking-wide flex items-center justify-center gap-2 text-[var(--text-secondary)] hover:text-[var(--color-foreground)]"
            >
              {loading ? "AUTHENTICATING..." : "SIGN IN"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-xs text-[var(--text-secondary)] mb-4">Or use demo access for presentation</p>
            <button 
              onClick={() => login()}
              className="w-full neu-btn neu-btn-primary py-3 px-4 text-sm font-bold tracking-wide flex items-center justify-center gap-2 shadow-[0_4px_0_var(--color-primary-dark)] active:shadow-[0_0px_0_var(--color-primary-dark)] active:translate-y-[4px]"
            >
              <KeyRound className="w-4 h-4" />
              DEMO BYPASS
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}
