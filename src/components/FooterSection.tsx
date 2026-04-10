"use client";

import Link from "next/link";

export default function FooterSection() {
  return (
    <footer className="relative w-full overflow-hidden">
      {/* Dark Gradient Zone */}
      <div className="relative" style={{
        background: "linear-gradient(180deg, var(--color-bg-sand) 0%, var(--color-bg-dark) 80%, var(--color-bg-dark) 100%)"
      }}>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-40 pb-12">

          {/* Waypoint Tag */}
          <span className="font-mono text-[11px] tracking-[5px] font-semibold text-[var(--color-rust)]/50 block mb-6">
            [ 04 ]  JOIN THE EXPEDITION
          </span>

          {/* Main Title */}
          <h2 className="font-heading text-[clamp(3rem,7vw,96px)] text-[var(--color-text-light)] leading-[0.88] tracking-[3px] mb-8 max-w-[800px]">
            HELP US<br />
            REACH THE<br />
            FINISH LINE
          </h2>

          {/* Description */}
          <p className="font-body text-base text-[var(--color-text-light)]/70 leading-[1.7] max-w-[550px] mb-10">
            We&apos;re looking for sponsors, partners, and supporters who believe in adventure, perseverance, and the spirit of exploration. Your logo on our car. Your brand in the desert.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-4 flex-wrap mb-20">
            <Link
              href="/patrocinio"
              className="inline-flex items-center gap-3 px-11 py-4 bg-[var(--color-rust)] text-[var(--color-text-light)] font-body text-xs font-semibold uppercase tracking-[3px] transition-colors hover:bg-[var(--color-rust)]/80"
            >
              Become a Sponsor
              <span className="text-base">-&gt;</span>
            </Link>
            <Link
              href="mailto:hola@boamracing.com"
              className="inline-flex items-center px-11 py-4 border border-[var(--color-text-light)]/20 text-[var(--color-text-light)] font-body text-xs font-medium uppercase tracking-[3px] transition-colors hover:border-[var(--color-text-light)]/40"
            >
              Contact Us
            </Link>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col md:flex-row gap-8 mb-16">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[9px] tracking-[3px] text-[var(--color-text-light)]/40 uppercase">Email</span>
              <a href="mailto:hola@boamracing.com" className="font-body text-sm text-[var(--color-text-light)]/70 hover:text-[var(--color-text-light)] transition-colors">
                hola@boamracing.com
              </a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[9px] tracking-[3px] text-[var(--color-text-light)]/40 uppercase">Social</span>
              <div className="flex items-center gap-4">
                <a href="#" className="font-mono text-xs text-[var(--color-text-light)]/50 hover:text-[var(--color-text-light)] transition-colors tracking-wider">IG</a>
                <a href="#" className="font-mono text-xs text-[var(--color-text-light)]/50 hover:text-[var(--color-text-light)] transition-colors tracking-wider">TK</a>
                <a href="#" className="font-mono text-xs text-[var(--color-text-light)]/50 hover:text-[var(--color-text-light)] transition-colors tracking-wider">YT</a>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-5 border-t border-[var(--color-text-light)]/5">
            <span className="font-mono text-[9px] tracking-[3px] text-[var(--color-text-light)]/20">
              &copy; 2026 UNIRAID TEAM
            </span>
            <span className="font-mono text-[9px] tracking-[3px] text-[var(--color-text-light)]/20">
              43&deg;28&apos;05.2&quot;N &nbsp;1&deg;33&apos;28.1&quot;W &middot; BASECAMP
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
