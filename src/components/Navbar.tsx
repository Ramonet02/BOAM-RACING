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
          ? "bg-[var(--color-bg-sand)]/95 backdrop-blur-md shadow-sm py-4"
          : "bg-[var(--color-bg-dark)]/55 backdrop-blur-sm py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group relative z-50">
          <span className="font-heading text-xl tracking-[4px] text-[var(--color-text-light)]"
            style={{ transition: "color 0.3s" }}
          >
            <span className={isScrolled ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-light)]"}>UNIRAID TEAM</span>
          </span>
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
                  <span className="absolute -bottom-1 right-0 w-0 h-px bg-[var(--color-rust)] transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
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
            <span className={`h-0.5 transition-all duration-300 ${isMobileMenuOpen ? "w-8 rotate-45 translate-y-2.5 bg-[var(--color-text-light)]" : `w-8 ${isScrolled ? "bg-[var(--color-text-primary)]" : "bg-[var(--color-text-light)]"}`}`}></span>
            <span className={`h-0.5 transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : `w-6 ${isScrolled ? "bg-[var(--color-text-primary)]" : "bg-[var(--color-text-light)]"}`}`}></span>
            <span className={`h-0.5 transition-all duration-300 ${isMobileMenuOpen ? "w-8 -rotate-45 -translate-y-2.5 bg-[var(--color-text-light)]" : `w-4 ${isScrolled ? "bg-[var(--color-text-primary)]" : "bg-[var(--color-text-light)]"}`}`}></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-[var(--color-bg-dark)] z-40 flex flex-col items-center justify-center transition-all duration-500 ease-in-out md:hidden ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 topo-bg opacity-5 pointer-events-none"></div>
        <ul className="flex flex-col items-center justify-center space-y-8 z-10 w-full px-6">
          {navLinks.map((link) => (
            <li key={link.name} className="w-full text-center">
              <Link
                href={link.href}
                className="font-heading text-4xl text-[var(--color-text-light)] hover:text-[var(--color-rust)] transition-colors block tracking-wider"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            </li>
          ))}
          <li className="pt-8 w-full flex justify-center">
            <Link
              href="/patrocinio"
              className="inline-block px-12 py-4 bg-[var(--color-rust)] text-[var(--color-text-light)] font-body uppercase tracking-[3px] text-sm font-semibold"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Patrocinar
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
