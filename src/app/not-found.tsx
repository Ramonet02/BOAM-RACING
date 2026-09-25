/* Página 404 propia. Antes salía la de Next, en inglés ("This page could not
   be found.") y sin ninguna salida más que el footer. Server Component: el
   copy lo pone <NotFoundView> desde el diccionario, en el idioma activo. */

import type { Metadata } from "next";

import NotFoundView from "@/components/NotFoundView";

/* Sin `robots`: Next ya añade `noindex` a toda respuesta 404. */
export const metadata: Metadata = {
  title: "Fuera de ruta",
};

export default function NotFound() {
  return (
    <main id="contenido" className="relative bg-bg-base">
      <NotFoundView />
    </main>
  );
}
