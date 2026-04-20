"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import TopoButton from "@/components/ui/TopoButton";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Smooth scroll progress bar (0→1 across the full page)
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.3,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "El Equipo", href: "/equipo" },
    { name: "Patrocinio", href: "/patrocinio" },
    { name: "Media", href: "/media" },
  ];

  return (
    <>
      {/* Gradient scrim behind navbar — always present for hero contrast */}
      <div
        className={`fixed top-0 left-0 w-full h-32 z-40 pointer-events-none transition-opacity duration-500 ${
          isScrolled ? "opacity-0" : "opacity-100"
        }`}
        style={{
          background:
            "linear-gradient(180deg, rgba(42, 37, 34, 0.6) 0%, rgba(42, 37, 34, 0.2) 50%, transparent 100%)",
        }}
      />

      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
          isScrolled
            ? "bg-[var(--color-bg-sand)]/95 backdrop-blur-md shadow-sm py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group relative z-50">
            <motion.span
              whileHover={{ letterSpacing: "6px" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`font-heading text-xl tracking-[4px] inline-block transition-colors duration-300 ${
                isScrolled
                  ? "text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-light)]"
              }`}
            >
              UNIRAID TEAM
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <ul className="flex gap-8">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`font-body text-sm uppercase tracking-[3px] transition-colors relative group ${
                      isScrolled
                        ? "text-[var(--color-text-primary)]/70 hover:text-[var(--color-text-primary)]"
                        : "text-[var(--color-text-light)]/70 hover:text-[var(--color-text-light)]"
                    }`}
                  >
                    {link.name}
                    <span className="absolute -bottom-1 right-0 w-0 h-px bg-[var(--color-rust)] transition-all duration-300 group-hover:w-full group-hover:left-0" />
                  </Link>
                </li>
              ))}
            </ul>

            <TopoButton>
              <Link
                href="/patrocinio"
                className="block px-8 py-3 bg-[var(--color-rust)] text-[var(--color-text-light)] font-body text-xs uppercase tracking-[3px] font-semibold transition-colors hover:bg-[var(--color-bg-dark)]"
              >
                Patrocinar
              </Link>
            </TopoButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <div className="w-8 h-6 flex flex-col justify-between items-end">
              <span
                className={`h-0.5 transition-all duration-300 ${
                  isMobileMenuOpen
                    ? "w-8 rotate-45 translate-y-2.5 bg-[var(--color-text-light)]"
                    : `w-8 ${isScrolled ? "bg-[var(--color-text-primary)]" : "bg-[var(--color-text-light)]"}`
                }`}
              />
              <span
                className={`h-0.5 transition-all duration-300 ${
                  isMobileMenuOpen
                    ? "opacity-0"
                    : `w-6 ${isScrolled ? "bg-[var(--color-text-primary)]" : "bg-[var(--color-text-light)]"}`
                }`}
              />
              <span
                className={`h-0.5 transition-all duration-300 ${
                  isMobileMenuOpen
                    ? "w-8 -rotate-45 -translate-y-2.5 bg-[var(--color-text-light)]"
                    : `w-4 ${isScrolled ? "bg-[var(--color-text-primary)]" : "bg-[var(--color-text-light)]"}`
                }`}
              />
            </div>
          </button>
        </div>

        {/* Scroll progress indicator — only shows once scrolled */}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-[var(--color-rust)] origin-left"
          style={{
            scaleX: progress,
            width: "100%",
            opacity: isScrolled ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 bg-[var(--color-bg-dark)] z-40 flex flex-col items-center justify-center md:hidden"
            >
              <div className="absolute inset-0 topo-bg opacity-5 pointer-events-none" />
              <ul className="flex flex-col items-center justify-center space-y-8 z-10 w-full px-6">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{
                      delay: 0.15 + i * 0.08,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="w-full text-center"
                  >
                    <Link
                      href={link.href}
                      className="font-heading text-4xl text-[var(--color-text-light)] hover:text-[var(--color-rust)] transition-colors block tracking-wider"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
                <motion.li
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{
                    delay: 0.15 + navLinks.length * 0.08,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="pt-8 w-full flex justify-center"
                >
                  <Link
                    href="/patrocinio"
                    className="inline-block px-12 py-4 bg-[var(--color-rust)] text-[var(--color-text-light)] font-body uppercase tracking-[3px] text-sm font-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Patrocinar
                  </Link>
                </motion.li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
