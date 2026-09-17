/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Geometría de zonas: FRONTAL y TRASERA
   --------------------------------------------------------------------------
   FUENTE DE VERDAD DEL DIBUJO
     · public/car/front.svg   viewBox "0 0 1512 1155"
     · public/car/rear.svg    viewBox "0 0 1499 1121"

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

   PIEZAS QUE NO SE PUEDEN TAPAR (medidas sobre el dibujo, ya en viewBox)
     FRONTAL (eje de simetría x ≈ 760)
       faro izq. x 109,7–369,7 y 610,9–717,2 · faro der. x 1150,6–1412 y 610,5–716,4
       parrilla x 377,4–1125,2 y 653,7–750 · toma de aire inf. x 308,5–1212,2 y 811,2–894,8
     TRASERA (eje de simetría x ≈ 751,5)
       MATRÍCULA x 521–984,4 y 508–618,1 · pilotos x 90,1–385,5 y x 1116,8–1413,8, y 457,2–597,8
   Taparlas es ilegal. El editor las tiene como zonas vetadas.

   ESCALA · CM POR UNIDAD DE VIEWBOX
     Un Ford Escort sedán mide ~170 cm de ancho y ése es el ancho que ocupa el
     viewBox de cada vista, así que:
         frontal  170 / 1512 = 0,112434 cm/u
         trasera  170 / 1499 = 0,113409 cm/u
     COMPROBACIÓN INDEPENDIENTE: con la escala trasera, el rect de la matrícula
     (463,37 u de ancho) sale a 52,5 cm. Una matrícula europea mide 52 cm.

   QUÉ SIGNIFICAN LAS MEDIDAS DEL VINILO
     Frontal y trasera son ALZADOS, no desarrollos de chapa. El eje horizontal
     es fiel, pero el vertical está escorzado en los paneles tumbados (capó,
     luneta, alerón): `heightCm` es la altura VISTA de frente o de atrás, que
     es la que decide cómo de grande lee el logo en una foto. Para el
     desarrollo real de un panel tumbado, ve a la lateral o a la cenital.

   IZQUIERDA / DERECHA en estas dos vistas son las del ESPECTADOR, tal y como
   se ven en el dibujo: es lo que espera quien pasa el ratón por el SVG.
   ══════════════════════════════════════════════════════════════════════════ */

import type { CarView, SponsorTierId, VinylDimensions } from "../types";
import { centroid, chamfer, toPathData, toVinyl, type Vertex } from "./polygon";

/* ────────────────────────────────────────────────────────────────────────
   1. Tipos
   ──────────────────────────────────────────────────────────────────────── */

/** Punto en coordenadas del viewBox de la vista. */
export interface CarZoneAnchor {
  readonly x: number;
  readonly y: number;
}

/** Una zona de patrocinio dibujable sobre una vista de la carrocería. */
export interface CarZone {
  /** Id estable; es el que referencia `zoneId` en src/lib/sponsors.ts. */
  readonly id: string;
  readonly label: string;
  readonly tier: SponsorTierId;
  readonly view: CarView;
  /** Path CERRADO y RELLENO, en coordenadas del viewBox de `view`. */
  readonly d: string;
  readonly anchor: CarZoneAnchor;
  readonly vinyl: VinylDimensions;
}

/** Lo único que se escribe a mano. */
interface ZoneSpec {
  readonly id: string;
  readonly label: string;
  readonly tier: SponsorTierId;
  readonly polygon: readonly Vertex[];
  readonly cut: number;
  readonly anchor?: CarZoneAnchor;
}

/* ────────────────────────────────────────────────────────────────────────
   2. Escala de cada vista
   ──────────────────────────────────────────────────────────────────────── */

/** Ancho real de un Ford Escort sedán, en cm. Origen de toda la escala. */
export const CAR_BODY_WIDTH_CM = 170;

/** viewBox de public/car/front.svg. */
export const FRONT_VIEWBOX = { width: 1512, height: 1155 } as const;

/** viewBox de public/car/rear.svg. */
export const REAR_VIEWBOX = { width: 1499, height: 1121 } as const;

/** Centímetros por unidad de viewBox en la vista frontal. */
export const FRONT_CM_PER_UNIT = CAR_BODY_WIDTH_CM / FRONT_VIEWBOX.width;

/** Centímetros por unidad de viewBox en la vista trasera. */
export const REAR_CM_PER_UNIT = CAR_BODY_WIDTH_CM / REAR_VIEWBOX.width;

function buildZone(view: CarView, cmPerUnit: number) {
  return (spec: ZoneSpec): CarZone => {
    const shape = chamfer(spec.polygon, spec.cut);
    return {
      id: spec.id,
      label: spec.label,
      tier: spec.tier,
      view,
      d: toPathData(shape),
      anchor: spec.anchor ?? centroid(shape),
      vinyl: toVinyl(shape, cmPerUnit),
    };
  };
}

/* ────────────────────────────────────────────────────────────────────────
   3. Zonas FRONTALES
   ──────────────────────────────────────────────────────────────────────── */

const FRONT_SPECS: readonly ZoneSpec[] = [
  {
    id: "zone-hood-front",
    label: "Capó",
    tier: "principal",
    polygon: [
      [195, 428.7], [735.2, 415.9], [1328.3, 427.3], [1321.7, 600.8],
      [1247.5, 602.5], [1224.3, 604], [1203.1, 609.5], [1184.3, 618.2],
      [1166.2, 630.7], [1152.9, 645.6], [1141.9, 667.6], [1141.9, 691.9],
      [1125.1, 700.5], [1121.2, 692.7], [1100.8, 683.3], [1002.2, 665.2],
      [866.5, 656.6], [722.2, 653.5], [533.1, 663.7], [433.1, 680.5],
      [417.9, 686.4], [404.1, 692.6], [395.7, 703.2], [377.3, 692.9],
      [379.2, 672], [372.7, 656.1], [358.3, 636.5], [343.9, 623.5],
      [316.7, 610.1], [271.2, 603.2], [202.9, 602.2],
    ],
    cut: 0,
  },
  {
    id: "zone-windshield-top",
    label: "Banda del parabrisas",
    tier: "principal",
    polygon: [
      [322.5, 61.6], [567.1, 44.8], [714.1, 41.5], [835.6, 40.5],
      [973.2, 45.6], [1200.4, 65], [1229.9, 123.1], [293.6, 121.2],
    ],
    cut: 0,
    anchor: { x: 749.9, y: 80.3 },
  },
  {
    id: "zone-grille",
    label: "Paragolpes delantero",
    tier: "oro",
    polygon: [
      [146.2, 721.8], [213.7, 725.7], [314.9, 724.1], [369, 706.9],
      [376.1, 695.9], [394.9, 704.5], [408.7, 718.9], [497.7, 739.9],
      [695, 751.8], [903.7, 748.2], [1033.7, 735], [1097, 722.3],
      [1119.6, 714.7], [1125.7, 702.1], [1142.9, 693.8], [1154, 707.9],
      [1185.2, 719.4], [1241, 727.4], [1289.1, 725.4], [1430.2, 713.5],
      [1443.9, 729.6], [1440.8, 756.7], [1429.9, 840.9], [1392.4, 964.1],
      [1366.7, 1018.2], [1341.2, 1027.4], [765.7, 1026], [171.9, 1027.9],
      [156.2, 1019.1], [140.7, 996.3], [104.6, 899.1], [85.8, 812.8],
      [80.3, 770.4], [80.3, 724.1], [88.1, 713.1],
    ],
    cut: 0,
    anchor: { x: 775.7, y: 858.2 },
  },
];

export const FRONT_ZONES: readonly CarZone[] = FRONT_SPECS.map(
  buildZone("frontal", FRONT_CM_PER_UNIT),
);

/* ────────────────────────────────────────────────────────────────────────
   4. Zonas TRASERAS
   ──────────────────────────────────────────────────────────────────────── */

const REAR_SPECS: readonly ZoneSpec[] = [
  {
    id: "zone-rear-window",
    label: "Luneta · vinilo trasero",
    tier: "principal",
    polygon: [
      [308.6, 101.8], [315, 90.7], [337.6, 77.2], [350.3, 73.6],
      [372, 69.6], [530.5, 56], [570.3, 54.9], [706.7, 51.3],
      [884, 53.1], [1109.1, 67.6], [1168.1, 79.2], [1189.3, 91.8],
      [1217.4, 153.6], [1242.8, 229.7], [1259.9, 298.6], [1262, 313.4],
      [1252.1, 323.8], [1207.5, 329.1], [943.1, 320.9], [503.6, 320.9],
      [358.3, 327.6], [285.2, 329.1], [264.1, 326.5], [252.7, 323.5],
      [246, 318.9], [241.6, 312.9], [240.3, 307.5], [254.9, 245],
      [283.1, 152.4],
    ],
    cut: 0,
  },
  {
    id: "zone-spoiler",
    label: "Alerón",
    tier: "plata",
    polygon: [
      [330, 372.5], [390.2, 368.4], [450.4, 365.2], [510.6, 361.6],
      [570.9, 358.5], [631.1, 356.9], [691.3, 355.8], [751.5, 355.4],
      [871.9, 355.4], [932.1, 358.2], [1052.6, 365], [1112.8, 366.9],
      [1173, 371.6], [1173, 401.6], [1112.8, 396.9], [1052.6, 395],
      [932.1, 388.2], [871.9, 385.4], [751.5, 385.4], [691.3, 385.8],
      [631.1, 386.9], [570.9, 388.5], [510.6, 391.6], [450.4, 395.2],
      [390.2, 398.4], [330, 402.5],
    ],
    cut: 0,
  },
  {
    id: "zone-bootlid",
    label: "Portón",
    tier: "oro",
    polygon: [
      [247, 386.1], [222.4, 332.2], [244.3, 329.5], [259.9, 338.5],
      [274.6, 341.9], [314.6, 340.1], [489.7, 332.6], [742.2, 330.2],
      [747.3, 350.6], [667.7, 351.2], [557.7, 352.9], [328, 371],
      [328.8, 404.3], [547.5, 390.3], [618.1, 389.6], [681.8, 387.5],
      [748.3, 384.7], [821.7, 386.1], [886.1, 387.5], [953.9, 389.6],
      [1114.2, 397.8], [1174.4, 402.6], [1174.7, 367.7], [916, 353.5],
      [819.5, 351.8], [749.1, 351.2], [742.9, 330.1], [1149.4, 336.4],
      [1229.3, 340.4], [1258, 329.2], [1267.2, 320.2], [1282.2, 322.7],
      [1277.8, 335.1], [1257.7, 376.9], [1257.7, 443.4], [1261.3, 458.1],
      [1169.2, 456.4], [1148.8, 468.9], [1143.1, 488.8], [1127.7, 545.7],
      [1116.9, 587.7], [1125.5, 598], [1265.9, 599.1], [1267.6, 655.7],
      [258.5, 655.7], [257.6, 597.1], [382.5, 596.7], [388.4, 584.5],
      [357.5, 478.1], [350, 464.1], [337.7, 457.1], [247, 453.6],
    ],
    cut: 0,
  },
  {
    id: "zone-rear-bumper",
    label: "Paragolpes trasero",
    tier: "bronce",
    polygon: [
      [908.9, 668.8], [1349.2, 666.7], [1402.8, 671.8], [1416.7, 674.8],
      [1430.1, 677.4], [1429.8, 690.5], [1433.5, 692], [1439.4, 711.6],
      [1439.4, 753.9], [1431.1, 789], [1403.7, 863.4], [1384.7, 898.5],
      [1361.9, 916.1], [605.1, 911.3], [147.9, 914], [124.5, 907.9],
      [99.3, 856.7], [76.8, 805.6], [66.4, 772.7], [61.6, 734.3],
      [64, 709.3], [71.3, 688.6], [72.5, 676.1], [159.6, 667],
    ],
    cut: 0,
  },
];

export const REAR_ZONES: readonly CarZone[] = REAR_SPECS.map(
  buildZone("trasera", REAR_CM_PER_UNIT),
);

/* ────────────────────────────────────────────────────────────────────────
   5. Índices
   ──────────────────────────────────────────────────────────────────────── */

/** Frontal y trasera juntas. */
export const FRONT_REAR_ZONES: readonly CarZone[] = [...FRONT_ZONES, ...REAR_ZONES];

/** Ids de las dos vistas, para `assertSlotZonesExist()`. */
export const FRONT_REAR_ZONE_IDS: readonly string[] = FRONT_REAR_ZONES.map(
  (zone) => zone.id,
);

/** Busca una zona por id. */
export function getFrontRearZone(id: string): CarZone | undefined {
  return FRONT_REAR_ZONES.find((zone) => zone.id === id);
}

/** Zonas de una de las dos vistas. */
export function zonesForFrontRearView(view: CarView): readonly CarZone[] {
  if (view === "frontal") return FRONT_ZONES;
  if (view === "trasera") return REAR_ZONES;
  return [];
}

/** Atributo `viewBox` listo para el SVG. */
export function viewBoxFor(view: "frontal" | "trasera"): string {
  const box = view === "frontal" ? FRONT_VIEWBOX : REAR_VIEWBOX;
  return `0 0 ${box.width} ${box.height}`;
}
