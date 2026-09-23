"use client";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — <Navbar />
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   MARCA. El rotulo es BOAM RACING, que es el EQUIPO. Antes decia
   "UNIRAID TEAM": UniRaid es solo el nombre del rally, nunca la marca.
   El nombre sale de `BRAND` (src/lib/constants.ts), no escrito a mano.

   SE CONSERVA lo que ya funcionaba: el selector de idioma y la barra de
   progreso de scroll (`useScroll` + `useSpring`, sin re-render por frame).

   AJUSTES DE USUARIO. El <ThemeToggle /> (desert ⇄ tactical) va emparejado
   con el LanguageSwitcher: mismo tratamiento en escritorio y su propia fila
   en el panel movil. Ninguno de los dos cierra el menu al usarse.

   MENU MOVIL ACCESIBLE — lo que aporta esta version:
   · El boton lleva `aria-expanded` + `aria-controls` y apunta al panel.
   · El panel es `role="dialog" aria-modal="true"` con nombre accesible.
   · Foco ATRAPADO: Tab y Shift+Tab ciclan dentro del panel.
   · Escape cierra; al cerrar, el foco vuelve al boton que lo abrio.
   · Se bloquea el scroll del documento mientras esta abierto.
   · No hace falta neutralizar el resto de la pagina: la fila de enlaces de
     escritorio es `hidden xl:flex`, o sea `display:none` a ese ancho, y eso
     ya la saca del arbol de accesibilidad y del orden de tabulacion.
     Todo lo demas queda detras del panel, que es opaco y a pantalla
     completa, y el ciclo de foco no deja salir de el.

   Ademas hay un enlace "saltar al contenido" que solo aparece al tabular:
   apunta a `#contenido`, el id que llevan los <main> de las cuatro paginas.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";

import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import ThemeToggle, { useThemeCopy } from "@/components/ui/ThemeToggle";
import { useT } from "@/i18n/LanguageProvider";
import { BRAND } from "@/lib/constants";

/** Selector de todo lo que puede recibir foco dentro del panel movil. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function Navbar() {
  const t = useT();
  /* Copy del selector de tema — vive en <ThemeToggle /> para que el control
     sea autocontenido; aqui solo se reutiliza para rotular la fila del
     menu movil con exactamente las mismas palabras. */
  const themeCopy = useThemeCopy();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /* Progreso de scroll suavizado (0→1 sobre la pagina entera). */
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.3,
  });

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    toggleRef.current?.focus();
  }, []);

  /* Escape + foco atrapado + bloqueo del scroll de fondo. */
  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Foco inicial dentro del panel.
    const raf = requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab") return;

      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen, closeMenu]);

  /**
   * Enlaces. Las etiquetas vienen del diccionario; los `href` son la unica
   * parte que vive aqui porque son estructura de rutas, no copy.
   */
  const navLinks = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.project, href: "/#proyecto" },
    { label: t.nav.route, href: "/#ruta" },
    { label: t.nav.team, href: "/equipo" },
    { label: t.nav.sponsorship, href: "/patrocinio" },
    { label: t.nav.media, href: "/media" },
  ];

  return (
    <>
      {/* Saltar al contenido — visible solo con el teclado. */}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2 focus:bg-amber-solid focus:text-text-inverse focus:font-mono focus:text-xs focus:tracking-[2px] focus:uppercase"
      >
        {t.nav.skipToContent}
      </a>

      {/* Scrim superior — contraste del rotulo sobre la foto del hero. */}
      <div
        aria-hidden
        className={`fixed top-0 left-0 w-full h-32 z-40 pointer-events-none transition-opacity duration-500 ${
          isScrolled ? "opacity-0" : "opacity-100"
        }`}
        style={{
          background:
            "linear-gradient(180deg, rgb(var(--base-rgb) / 0.85) 0%, rgb(var(--base-rgb) / 0.35) 55%, transparent 100%)",
        }}
      />

      {/* `transition-all` NO: esta barra es fija y ocupa todo el ancho, y el
          catch-all metía en la transición el `backdrop-blur` — interpolar un
          desenfoque durante 300 ms es de lo más caro que se le puede pedir al
          navegador, y el perfil de Ramón lo marcaba como no compuesto. Se
          nombran las propiedades: colores y padding se siguen animando igual,
          y el desenfoque entra de golpe, que a 300 ms no se distingue. */}
      <nav
        aria-label={t.nav.menu.label}
        className={`fixed top-0 left-0 w-full z-50 transition-[background-color,border-color,padding-top,padding-bottom] duration-300 ease-tactical ${
          isScrolled
            ? "bg-bg-base/92 backdrop-blur-md border-b border-slate py-3"
            : "bg-transparent border-b border-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between gap-4">
          {/* ── Marca ────────────────────────────────────────────────── */}
          <Link href="/" className="group relative z-50 flex items-center gap-3 min-w-0">
            <span
              aria-hidden
              className="hidden sm:block w-2.5 h-2.5 shrink-0 bg-amber"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)" }}
            />
            <span className="flex flex-col min-w-0">
              <motion.span
                whileHover={{ letterSpacing: "5px" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="font-heading text-lg md:text-xl tracking-[4px] text-text-primary leading-none truncate"
              >
                {BRAND.name}
              </motion.span>
              <span className="hidden md:block font-mono text-[0.5rem] tracking-[3px] text-text-tertiary uppercase mt-1 truncate">
                {t.nav.statusLine}
              </span>
            </span>
          </Link>

          {/* ── Navegacion de escritorio ───────────────────────────────
              Aparece en `xl` (1280 px), no en `lg` (1024 px). Medido con los
              rotulos en INGLES, que son los mas largos ("THE PROJECT",
              "SPONSORSHIP"): la fila completa —marca + seis enlaces + idioma
              + tema + boton— pide ~1080 px ya apretada, y con el espaciado
              ancho se iba por encima de 1200. En `lg` no cabia y los rotulos
              se partian en dos lineas ("THE / PROJECT").

              Entre 1024 y 1280 manda el menu hamburguesa, que ya existe y
              esta bien resuelto. Del espaciado: apretado por defecto y
              holgado a partir de `2xl`, donde sobra sitio.

              `whitespace-nowrap` es el cinturon de seguridad: pase lo que
              pase con la traduccion o la fuente, un rotulo NUNCA se parte
              por la mitad. Como mucho se sale, que se ve y se arregla;
              partirse en dos lineas se coló hasta produccion. */}
          <div className="hidden xl:flex items-center gap-4 2xl:gap-7">
            <ul className="flex gap-4 2xl:gap-7">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="link-tactical font-mono whitespace-nowrap text-[0.6875rem] uppercase tracking-[1.5px] 2xl:tracking-[2.5px]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <span aria-hidden className="w-px h-5 bg-slate" />

            {/* Idioma y tema: mismo tratamiento visual y emparejados con un
                hueco corto, para que se lean como un solo bloque de ajustes
                dentro de la fila (que va a gap-7). */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            <Link href="/patrocinio" className="btn-tactical btn-amber text-[0.6875rem]">
              {t.nav.sponsorCta}
            </Link>
          </div>

          {/* ── Boton del menu movil ─────────────────────────────────── */}
          <button
            ref={toggleRef}
            type="button"
            className="xl:hidden relative z-50 p-2 -mr-2"
            onClick={() => (isMenuOpen ? closeMenu() : setIsMenuOpen(true))}
            aria-expanded={isMenuOpen}
            aria-controls="menu-movil"
            aria-label={isMenuOpen ? t.nav.menu.close : t.nav.menu.open}
          >
            <span className="sr-only">{isMenuOpen ? t.nav.menu.close : t.nav.menu.open}</span>
            <span aria-hidden className="w-7 h-5 flex flex-col justify-between items-end">
              <span
                className={`h-[2px] bg-text-primary transition-all duration-300 ${
                  isMenuOpen ? "w-7 rotate-45 translate-y-[9px]" : "w-7"
                }`}
              />
              <span
                className={`h-[2px] bg-amber transition-all duration-300 ${
                  isMenuOpen ? "w-0 opacity-0" : "w-5"
                }`}
              />
              <span
                className={`h-[2px] bg-text-primary transition-all duration-300 ${
                  isMenuOpen ? "w-7 -rotate-45 -translate-y-[9px]" : "w-3.5"
                }`}
              />
            </span>
          </button>
        </div>

        {/* Progreso de scroll. */}
        <motion.div
          aria-hidden
          className="absolute bottom-0 left-0 h-[2px] w-full bg-amber origin-left"
          style={{
            scaleX: progress,
            opacity: isScrolled ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />
      </nav>

      {/* ── Panel movil ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="menu-movil"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.menu.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="fixed inset-0 z-[45] bg-bg-base xl:hidden flex flex-col"
          >
            <div aria-hidden className="absolute inset-0 grid-blueprint opacity-50 pointer-events-none" />
            <div aria-hidden className="absolute inset-0 dust-overlay pointer-events-none" />

            <div className="relative z-10 flex-1 flex flex-col justify-center px-8 pt-24 pb-10 overflow-y-auto">
              <span className="telemetry-label telemetry-label-amber mb-8">
                {t.common.edition.monthYearShort} · {t.common.brand.name}
              </span>

              <ul className="flex flex-col gap-5">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: 0.06 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      className="font-heading text-3xl sm:text-4xl uppercase tracking-[2px] text-text-primary hover:text-amber transition-colors inline-flex items-baseline gap-3"
                    >
                      {/* Sin numerar: la serie "[ 01 ]…[ 08 ]" es la de las
                          SECCIONES, y numerar tambien el menu creaba dos
                          series distintas compitiendo en la misma pantalla. */}
                      <span aria-hidden className="w-4 h-px bg-slate shrink-0" />
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="divider-tech my-8" />

              <Link href="/patrocinio" onClick={closeMenu} className="btn-tactical btn-amber w-full justify-center">
                {t.nav.sponsorCta}
              </Link>

              <div className="mt-8 flex items-center justify-between gap-4">
                <span className="font-mono text-[0.5625rem] tracking-[3px] text-text-tertiary uppercase">
                  {t.nav.languageLabel}
                </span>
                <LanguageSwitcher />
              </div>

              {/* Tema — misma fila-tipo que el idioma. Es un <button>, asi que
                  entra solo en el ciclo de foco atrapado del panel (FOCUSABLE
                  ya cubre button) y no cierra el menu al pulsarlo. */}
              <div className="mt-4 flex items-center justify-between gap-4">
                <span className="font-mono text-[0.5625rem] tracking-[3px] text-text-tertiary uppercase">
                  {themeCopy.label}
                </span>
                <ThemeToggle showLabel />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
