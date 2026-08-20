"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Home, PlusCircle, Building2, Info, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "./LanguageContext";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();

  // Hidden strictly on landing page
  const isLandingPage = pathname === "/";

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    // Hide if scrolling down past 50px, show if scrolling up or at top
    if (latest > previous && latest > 50) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const navLinks = [
    { key: "home", defaultName: "Home", href: "/", icon: <Home className="w-4 h-4" /> },
    { key: "start_audit", defaultName: "Search & Add", href: "/audit/new", icon: <PlusCircle className="w-4 h-4" /> },
    { key: "browse", defaultName: "Buildings", href: "/buildings", icon: <Building2 className="w-4 h-4" /> },
    { key: "about", defaultName: "About", href: "/about", icon: <Info className="w-4 h-4" /> },
  ];

  // Navbar is no longer hidden on the landing page so the language toggle is accessible everywhere.

  return (
    <>
      {/* Invisible trigger area at the top of the screen */}
      <div 
        className="fixed top-0 left-0 right-0 h-6 z-[60]"
        onMouseEnter={() => setHidden(false)}
      />
      <motion.header 
        variants={{
          visible: { y: 0 },
          hidden: { y: "-150%" }
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 print:hidden"
        onMouseEnter={() => { setHidden(false); setIsHovered(true); }}
        onMouseLeave={() => setIsHovered(false)}
      >
      <div className={`max-w-5xl mx-auto px-6 py-3 rounded-2xl flex items-center justify-between transition-all duration-300 ${isHovered ? 'glass-panel shadow-lg' : 'bg-transparent border border-transparent'}`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
            W
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[var(--color-foreground)]">
            WayMark
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4">
          <nav className="flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              const displayName = t(link.key, link.defaultName);
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                    isActive 
                      ? "text-[var(--color-primary-dark)] bg-[var(--color-primary)]/10" 
                      : "text-[var(--text-secondary)] hover:text-[var(--color-foreground)] hover:bg-[var(--glass-bg)]"
                  }`}
                >
                  {link.icon}
                  {displayName}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 rounded-xl border border-[var(--color-primary)]/30"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1"></div>
          
          <button 
            onClick={toggleLanguage}
            className="neu-btn px-3 py-1.5 text-xs font-bold rounded-lg uppercase"
          >
            {language === 'en' ? 'বাংলা' : 'EN'}
          </button>
        </div>

        {/* Mobile Menu Toggle & Lang */}
        <div className="md:hidden flex items-center gap-3">
          <button 
            onClick={toggleLanguage}
            className="neu-btn px-3 py-1.5 text-xs font-bold rounded-lg uppercase"
          >
            {language === 'en' ? 'বাংলা' : 'EN'}
          </button>
          <button 
            className="p-2 text-[var(--text-secondary)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-20 left-6 right-6 glass-panel p-4 flex flex-col gap-2 rounded-2xl shadow-xl"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            const displayName = t(link.key, link.defaultName);
            return (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-base font-bold flex items-center gap-3 transition-all ${
                  isActive 
                    ? "text-[var(--color-primary-dark)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30" 
                    : "text-[var(--text-secondary)]"
                }`}
              >
                {link.icon}
                {displayName}
              </Link>
            );
          })}
        </motion.div>
      )}
    </motion.header>
    </>
  );
}
