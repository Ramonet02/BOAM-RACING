import Link from "next/link";

export default function FooterSection() {
  return (
    <footer className="relative w-full bg-[#110f03] pt-24 pb-12 overflow-hidden border-t border-[var(--color-olive-dark)]">
      {/* Background Topographic Pattern */}
      <div className="absolute inset-0 topo-bg opacity-5 mix-blend-overlay pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Tagline */}
          <div className="col-span-1 lg:col-span-2">
            <Link href="/" className="inline-block group mb-6 relative">
              <span className="font-display font-bold text-4xl tracking-wider text-[var(--color-cream)]">
                BOAM<span className="text-[var(--color-terracotta)] ml-1">RACING</span>
              </span>
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-[var(--color-sand)] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <p className="font-body text-[var(--color-cream)]/70 text-lg max-w-md leading-relaxed pr-8">
              Escudería universitaria participando en UniRaid 2027. 9 días cruzando Marruecos de norte a sur transportando material humanitario a aldeas aisladas.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-2xl text-[var(--color-sand)] mb-6 tracking-wide">
              Navegación
            </h4>
            <ul className="space-y-4 font-body text-[var(--color-cream)]/70">
              <li>
                <Link href="#proyecto" className="hover:text-[var(--color-terracotta)] transition-colors uppercase tracking-widest text-sm">
                  El Proyecto
                </Link>
              </li>
              <li>
                <Link href="#equipo" className="hover:text-[var(--color-terracotta)] transition-colors uppercase tracking-widest text-sm">
                  El Equipo
                </Link>
              </li>
              <li>
                <Link href="#patrocinio" className="hover:text-[var(--color-terracotta)] transition-colors uppercase tracking-widest text-sm">
                  Patrocinio
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-display text-2xl text-[var(--color-sand)] mb-6 tracking-wide">
              Contacto
            </h4>
            <div className="font-body text-[var(--color-cream)]/70 space-y-4">
              <a href="mailto:hola@boamracing.com" className="block hover:text-[var(--color-terracotta)] transition-colors font-medium">
                hola@boamracing.com
              </a>
              <div className="pt-4 flex items-center space-x-6">
                <a href="#" className="text-[var(--color-cream)]/50 hover:text-[var(--color-terracotta)] transition-colors" aria-label="Instagram">
                  <span className="uppercase font-body tracking-wider text-sm border border-[var(--color-cream)]/20 px-3 py-1 bg-[var(--color-dark)]/50">IG</span>
                </a>
                <a href="#" className="text-[var(--color-cream)]/50 hover:text-[var(--color-terracotta)] transition-colors" aria-label="TikTok">
                  <span className="uppercase font-body tracking-wider text-sm border border-[var(--color-cream)]/20 px-3 py-1 bg-[var(--color-dark)]/50">TK</span>
                </a>
                <a href="#" className="text-[var(--color-cream)]/50 hover:text-[var(--color-terracotta)] transition-colors" aria-label="YouTube">
                  <span className="uppercase font-body tracking-wider text-sm border border-[var(--color-cream)]/20 px-3 py-1 bg-[var(--color-dark)]/50">YT</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-olive-dark)] to-transparent my-8 opacity-50"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between font-body text-xs md:text-sm tracking-wider text-[var(--color-cream)]/40 uppercase gap-4">
          <p>© {new Date().getFullYear()} Boam Racing. Todos los derechos reservados.</p>
          <div className="flex space-x-6">
            <Link href="#" className="hover:text-[var(--color-cream)] transition-colors">Aviso Legal</Link>
            <Link href="#" className="hover:text-[var(--color-cream)] transition-colors">Política de Privacidad</Link>
            <Link href="#" className="hover:text-[var(--color-cream)] transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
