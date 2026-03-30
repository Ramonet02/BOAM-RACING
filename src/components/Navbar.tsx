"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TopoButton from "@/components/ui/TopoButton";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "El Equipo", href: "/equipo" },
    { name: "Patrocinio", href: "/patrocinio" },
    { name: "Media", href: "/media" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? "bg-[var(--color-dark)]/95 backdrop-blur-md shadow-lg py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group relative z-50">
          <span className="font-display font-bold text-2xl tracking-wider text-[var(--color-cream)]">
            BOAM<span className="text-[var(--color-terracotta)] ml-1">RACING</span>
          </span>
          {/* Decorative underline */}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--color-sand)] transition-all duration-300 group-hover:w-full"></span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <ul className="flex space-x-8">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="font-body text-lg uppercase tracking-widest text-[var(--color-cream)]/80 hover:text-[var(--color-cream)] transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-[var(--color-terracotta)] transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                </Link>
              </li>
            ))}
          </ul>
          
          <TopoButton>
            <Link
              href="/patrocinio"
              className="block px-6 py-2.5 bg-[var(--color-terracotta)] hover:bg-[var(--color-earth-red)] text-white font-body uppercase tracking-wider text-sm transition-colors"
              style={{ clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0% 100%)" }}
            >
              Patrocinar
            </Link>
          </TopoButton>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden relative z-50 text-[var(--color-cream)]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          <div className="w-8 h-6 flex flex-col justify-between items-end">
            <span className={`h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? "w-8 rotate-45 translate-y-2.5" : "w-8"}`}></span>
            <span className={`h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : "w-6"}`}></span>
            <span className={`h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? "w-8 -rotate-45 -translate-y-2.5" : "w-4"}`}></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-[var(--color-dark)] z-40 flex flex-col items-center justify-center transition-all duration-500 ease-in-out md:hidden ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 topo-bg opacity-10 pointer-events-none"></div>
        <ul className="flex flex-col items-center justify-center space-y-8 z-10 w-full px-6">
          {navLinks.map((link) => (
            <li key={link.name} className="w-full text-center">
              <Link
                href={link.href}
                className="font-display text-4xl text-[var(--color-cream)] hover:text-[var(--color-terracotta)] transition-colors block"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            </li>
          ))}
          <li className="pt-8 w-full">
            <Link
              href="/patrocinio"
              className="block w-full text-center py-4 bg-[var(--color-terracotta)] text-white font-body uppercase tracking-wider text-xl"
              style={{ clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0% 100%)" }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Conviértete en patrocinador
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
