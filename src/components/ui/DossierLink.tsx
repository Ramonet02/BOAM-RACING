/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Enlace al dossier de patrocinio en PDF
   --------------------------------------------------------------------------
   Un solo componente para las cuatro o cinco veces que la web enlaza el
   documento comercial. No es ceremonia: el enlace lleva tres cosas que se
   olvidan por separado en cuanto se copian y pegan —el peso del fichero, el
   aviso de que sólo existe en castellano y el `rel` de seguridad— y aquí sólo
   hay un sitio donde corregirlas.

   DESCARGA, CON SU NOMBRE
   `download` con `DOSSIER.filename`: el fichero llega a disco como
   "Boam_Racing_Team_UNIRAID_2027.pdf" y no con el slug de la ruta. Es un
   documento para reenviar dentro de la empresa, no para hojear y cerrar.
   `target="_blank"` se queda como red: el navegador que ignore `download`
   (algunos en iOS) lo abre en su visor en otra pestaña sin sacar al
   visitante de la web. Y `target="_blank"` obliga a `rel="noopener"`.

   EL IDIOMA
   El PDF está en castellano y la web va en tres idiomas. En inglés y en
   catalán el enlace lo dice ANTES de que lo pulses (`dossierNote`); en
   castellano esa cadena está vacía y no se pinta nada.
   ══════════════════════════════════════════════════════════════════════════ */

"use client";

import { DOSSIER } from "@/lib/constants";
import { useT } from "@/i18n/LanguageProvider";
import { fill } from "@/i18n/translations";

export interface DossierLinkProps {
  /**
   * `button` para las zonas de llamada a la acción, `inline` para listas de
   * datos y pies. Es lo único que cambia entre unos sitios y otros.
   */
  variant?: "button" | "inline";
  className?: string;
}

export default function DossierLink({
  variant = "inline",
  className = "",
}: DossierLinkProps) {
  const t = useT();
  const copy = t.sponsors.contact;

  const meta = fill(copy.dossierMeta, {
    pages: DOSSIER.pages,
    size: DOSSIER.sizeMb.toLocaleString("es-ES"),
  });
  const note = copy.dossierNote;

  /* El nombre accesible lleva el formato y el peso porque un lector de
     pantalla anuncia el enlace entero de una vez: "Descargar el dossier,
     PDF, 12 páginas, 1,7 MB" dice lo mismo que ve quien mira la pantalla. */
  const label = [copy.dossierCta, meta, note].filter(Boolean).join(" · ");

  if (variant === "button") {
    return (
      <a
        href={DOSSIER.href}
        download={DOSSIER.filename}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className={`btn-tactical btn-outline ${className}`.trim()}
      >
        {copy.dossierCta}
      </a>
    );
  }

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${className}`.trim()}>
      <a
        href={DOSSIER.href}
        download={DOSSIER.filename}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="link-tactical font-mono text-text-primary text-xs tracking-[0.1em]"
      >
        {copy.dossierCta}
      </a>
      <span className="font-mono text-text-tertiary text-[10px] tracking-[0.1em]">
        {meta}
        {note ? ` · ${note}` : ""}
      </span>
    </span>
  );
}
