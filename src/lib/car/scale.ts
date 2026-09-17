/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Escala de cada lámina
   --------------------------------------------------------------------------
   Centímetros de chapa real por unidad de viewBox, vista a vista.

   Cada módulo de geometría deriva el suyo de una medida FÍSICA distinta: el
   largo del coche en las laterales y en la cenital, el ancho en la frontal y
   la trasera. No hay un factor único, y aplicar el de una vista a otra
   falsearía las medidas de vinilo en un 60 %.

   Vivía dentro de `CarViewer`. Salió aquí cuando el estudio de rotulación
   necesitó el mismo dato para decirle al cliente cuántos centímetros mide su
   logo de verdad: importar una constante desde un componente cliente arrastra
   el componente entero.
   ══════════════════════════════════════════════════════════════════════════ */

import { FRONT_CM_PER_UNIT, REAR_CM_PER_UNIT } from "./frontRear";
import { LATERAL_CM_PER_UNIT } from "./lateral";
import { CM_PER_UNIT as TOP_CM_PER_UNIT } from "./top";
import type { CarView } from "../types";

export const CM_PER_UNIT_BY_VIEW: Readonly<Record<CarView, number>> = {
  "lateral-izq": LATERAL_CM_PER_UNIT,
  "lateral-der": LATERAL_CM_PER_UNIT,
  frontal: FRONT_CM_PER_UNIT,
  trasera: REAR_CM_PER_UNIT,
  cenital: TOP_CM_PER_UNIT,
};
