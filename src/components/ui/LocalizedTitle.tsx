"use client";

/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — <title> en el idioma activo
   --------------------------------------------------------------------------
   Los `metadata` de Next se resuelven en el servidor y en castellano: el
   idioma lo elige el visitante en el navegador (localStorage), que el
   servidor no ve. Sin esto, con la web en ingles o catalan la pestaña, el
   historial y lo primero que anuncia un lector de pantalla al cargar seguian
   en castellano.

   En castellano el titulo que se pone es EXACTAMENTE el que ya sirve el
   servidor (SITE_META.title en la home, "<Seccion> · BOAM RACING" en las
   subpaginas, que es la plantilla del layout), asi que volver a ES deja la
   pestaña como estaba y los buscadores —que leen el HTML servido— no ven
   ningun cambio.

   Rutas que no estan en el mapa (404, /dev) no se tocan.
   ══════════════════════════════════════════════════════════════════════════ */

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useLocale } from "@/i18n/LanguageProvider";
import { fill } from "@/i18n/translations";
import { BRAND, SITE_META } from "@/lib/constants";

/** Ruta -> etiqueta de `t.nav` con la que se titula. `null` = la home. */
const PAGE_KEYS: Readonly<Record<string, "team" | "sponsorship" | "media" | null>> = {
  "/": null,
  "/equipo": "team",
  "/patrocinio": "sponsorship",
  "/media": "media",
};

export default function LocalizedTitle() {
  const pathname = usePathname();
  const { locale, t } = useLocale();

  useEffect(() => {
    if (!(pathname in PAGE_KEYS)) return;
    const key = PAGE_KEYS[pathname];

    const wanted = key
      ? `${t.nav[key]} · ${BRAND.name}`
      : locale === "es"
        ? SITE_META.title
        : fill(t.common.meta.title, { edition: t.common.edition.monthYear });

    const apply = () => {
      if (document.title !== wanted) document.title = wanted;
    };
    apply();

    /* Poner el titulo UNA vez no basta: Next resuelve los metadatos en
       streaming y vuelve a escribir su <title> (en castellano) despues de la
       hidratacion, pisando el nuestro — medido: "The Team" duraba un instante
       y volvia "El Equipo". Se vigila el <head> y se reaplica si cambia.
       `apply` solo escribe cuando difiere, asi que no hay bucle. */
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [pathname, locale, t]);

  return null;
}
