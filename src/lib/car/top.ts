/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Geometría de zonas: VISTA CENITAL
   --------------------------------------------------------------------------
   FUENTE DE VERDAD DEL DIBUJO
     · public/car/top.svg   viewBox "0 0 533 1169"

   ORIENTACIÓN — dato medido: el MORRO está ABAJO (y crece de cola a morro).
   Reparto de franjas sobre el dibujo:
     y 0–200 maletero · 200–380 luneta · 380–700 techo
     y 747–850 parabrisas y retrovisores · 850–1120 capó · 1120–1169 paragolpes

   OJO CON EL ANCHO: los retrovisores llegan al borde del viewBox (x 0 → 533),
   pero la carrocería es más estrecha. Usar el ancho del viewBox para el techo
   lo sacaría del coche.

   DE DÓNDE SALEN ESTAS FORMAS
   Las trazó el equipo A MANO, vértice a vértice, sobre el line-art real del
   coche en el editor visual de /dev/zonas. NO son polígonos calculados: el
   intento anterior los derivaba de medidas del SVG sin verlos puestos sobre
   la chapa, y varios no encajaban con los paneles.

   QUÉ SE ESCRIBE Y QUÉ SE DERIVA
   Aquí SÓLO se escribe el polígono (y el chaflán, hoy 0 en todas: el trazado
   ya es la forma final). El path `d`, el ancla del tooltip, la medida del
   vinilo y el área se CALCULAN con los helpers de ./polygon.ts. Escribir esos
   números a mano fue justo lo que descuadró el sistema la primera vez.

   La única excepción es `anchor`: si una zona lo trae, es que el centroide
   caía mal (zona en forma de L o de arco) y se recolocó a mano en el editor.

   ESCALA
   El coche mide ≈425 cm de largo sobre 1169 u de alto de viewBox, así que
   1 u = 0,3636 cm. Aquí la escala va por el LARGO, no por el ancho como en
   frontal y trasera.
   ══════════════════════════════════════════════════════════════════════════ */

import type { CarView, SponsorTierId, VinylDimensions } from "../types";
import { centroid, chamfer, toPathData, toVinyl, type Vertex } from "./polygon";

/* ────────────────────────────────────────────────────────────────────────
   1. Escala
   ──────────────────────────────────────────────────────────────────────── */

/** Atributo `viewBox` de la lámina cenital. */
export const TOP_VIEW_BOX = "0 0 533 1169" as const;

/** Alto del viewBox cenital, en unidades. */
export const TOP_VIEW_HEIGHT = 1169;

/** Ancho del viewBox cenital, en unidades. */
export const TOP_VIEW_WIDTH = 533;

/** Largo real de un Ford Escort sedán, en cm. */
export const CAR_LENGTH_CM = 425;

/** Centímetros de chapa por unidad de viewBox. */
export const CM_PER_UNIT = CAR_LENGTH_CM / TOP_VIEW_HEIGHT;

/* ────────────────────────────────────────────────────────────────────────
   2. Tipos
   ──────────────────────────────────────────────────────────────────────── */

/** Punto en coordenadas del viewBox. */
export interface ZonePoint {
  readonly x: number;
  readonly y: number;
}

/** Una zona de patrocinio sobre la vista cenital. */
export interface CarZone {
  readonly id: string;
  readonly label: string;
  readonly tier: SponsorTierId;
  readonly view: CarView;
  /** Path CERRADO y RELLENO, en coordenadas del viewBox. */
  readonly d: string;
  readonly anchor: ZonePoint;
  readonly vinyl: VinylDimensions;
}

/** Lo único que se escribe a mano. */
interface ZoneSpec {
  readonly id: string;
  readonly label: string;
  readonly tier: SponsorTierId;
  readonly polygon: readonly Vertex[];
  readonly cut: number;
  readonly anchor?: ZonePoint;
}

function buildZone(spec: ZoneSpec): CarZone {
  const shape = chamfer(spec.polygon, spec.cut);
  return {
    id: spec.id,
    label: spec.label,
    tier: spec.tier,
    view: "cenital",
    d: toPathData(shape),
    anchor: spec.anchor ?? centroid(shape),
    vinyl: toVinyl(shape, CM_PER_UNIT),
  };
}

/* ────────────────────────────────────────────────────────────────────────
   3. Zonas
   ──────────────────────────────────────────────────────────────────────── */

const ZONE_SPECS: readonly ZoneSpec[] = [
  {
    id: "zone-roof",
    label: "Techo",
    tier: "principal",
    polygon: [
      [126.5, 330.7], [186.7, 325.8], [217, 323.3], [251.5, 322.1],
      [286.7, 322.1], [337.5, 325], [381.4, 329.5], [403.9, 333.6],
      [405.9, 343.8], [403.1, 368], [402.7, 454], [404.3, 527],
      [406.8, 618.8], [410, 671.6], [369.5, 679.4], [303.1, 687.6],
      [254.3, 687.6], [217, 686.4], [168.7, 681.9], [121.2, 673.3],
      [124, 644.2], [128.1, 562.6], [131, 481.1], [130.2, 368],
    ],
    cut: 0,
  },
  {
    id: "zone-hood-top",
    label: "Capó (cenital)",
    tier: "principal",
    polygon: [
      [55.5, 893.8], [55.5, 847.7], [60.8, 843.7], [65.4, 842.7],
      [80.7, 853.8], [95.9, 862.5], [124.3, 873.3], [154.8, 881.6],
      [206.2, 889.1], [286.9, 890.6], [342.8, 886.8], [379.6, 879.3],
      [407.3, 872.2], [435.1, 860.9], [464, 841.7], [471.5, 845.4],
      [472.5, 891.4], [463.6, 1108.2], [454.6, 1116], [433.4, 1122.1],
      [406.8, 1130.8], [372.1, 1147], [339.9, 1151.5], [309, 1153.7],
      [278.6, 1153.7], [233.1, 1153.7], [200.3, 1153.1], [177.2, 1151.2],
      [151.1, 1145.8], [136.3, 1138.2], [109.6, 1126], [86.8, 1120.3],
      [74.3, 1116.3], [65.5, 1107.5], [62.2, 1070.8], [59.2, 1042],
      [56.7, 984.3], [54, 923.3],
    ],
    cut: 0,
  },
  {
    id: "zone-windshield-band",
    label: "Banda del parabrisas",
    tier: "principal",
    polygon: [
      [116.7, 706.1], [118.7, 693.7], [172.8, 704], [233, 709.3],
      [275.2, 709.7], [318.7, 708.1], [371.1, 701.9], [409.4, 692.8],
      [413.2, 706.1], [415.7, 717.8], [376.8, 724.3], [326.1, 731.3],
      [282.5, 734.1], [226.4, 734.1], [167.2, 727.7], [113.5, 718.5],
    ],
    cut: 0,
    anchor: { x: 260.1, y: 723.3 },
  },
  {
    id: "zone-rear-window-top",
    label: "Luneta (cenital)",
    tier: "principal",
    polygon: [
      [129.4, 174.3], [157.4, 162], [178.4, 155], [201.2, 149.5],
      [220.6, 146.4], [253.8, 143.5], [294.9, 144.4], [330.7, 149.1],
      [364.2, 159.2], [387.8, 169.6], [408.5, 181], [425.8, 195.9],
      [435.9, 210.1], [437.5, 218.4], [439.3, 228.3], [438.9, 242.9],
      [435.3, 261.5], [428.1, 282], [420.4, 299.1], [411.2, 313.9],
      [402.9, 327.2], [388.5, 325.9], [335.9, 320.2], [288.4, 318],
      [239.9, 317.3], [185.8, 320.5], [126.5, 327.8], [112.5, 306.4],
      [102.4, 286], [94.6, 264.8], [91.5, 252.4], [89.4, 234.9],
      [90.3, 219.1], [98.4, 200.5], [106.2, 190.4],
    ],
    cut: 0,
  },
  {
    id: "zone-bootlid-top",
    label: "Portón (cenital)",
    tier: "oro",
    polygon: [
      [96.3, 30.2], [162.4, 21], [267.6, 15.1], [329.3, 17.7],
      [402.7, 26.2], [432, 30.6], [436.2, 60.2], [438.9, 82.6],
      [442.7, 158.6], [440.4, 183.1], [437.1, 201.6], [424.6, 187.3],
      [407.3, 176.1], [368.3, 156], [346.1, 149], [322.3, 143.8],
      [280.8, 138.7], [267.3, 137.9], [221.5, 141.5], [166.8, 153.6],
      [138.9, 166.3], [120.5, 175.9], [106.8, 185.9], [92.3, 200.5],
      [89.4, 190.2], [87.1, 171.1], [86.6, 146.5], [88.5, 110.3],
    ],
    cut: 0,
  },
];

export const TOP_ZONES: readonly CarZone[] = ZONE_SPECS.map(buildZone);

/** Ids de la vista cenital, para `assertSlotZonesExist()`. */
export const TOP_ZONE_IDS: readonly string[] = TOP_ZONES.map((zone) => zone.id);

/** Busca una zona cenital por id. */
export function getTopZone(id: string): CarZone | undefined {
  return TOP_ZONES.find((zone) => zone.id === id);
}
