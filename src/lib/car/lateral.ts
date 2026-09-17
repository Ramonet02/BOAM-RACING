/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Geometría de zonas: FLANCOS IZQUIERDO y DERECHO
   --------------------------------------------------------------------------
   FUENTE DE VERDAD DEL DIBUJO
     · public/car/lateral-left.svg   viewBox "0 0 1630 535"
     · public/car/lateral-right.svg  viewBox "0 0 1630 535"

   ⚠  ORIENTACIÓN REAL DE LOS FICHEROS — dato medido, no supuesto
   En `lateral-left.svg` el MORRO ESTÁ A LA DERECHA (x≈1630) y la trasera a la
   izquierda (x≈0). `lateral-right.svg` es su espejo. Evidencias: las manetas
   caen en el canto TRASERO de cada puerta; el montante A va mucho más tumbado
   (Δx 371 / Δy 164) que el C (Δx 120 / Δy 144); y la boca de repostaje sólo
   existe en la lámina izquierda, cayendo sobre la aleta trasera.

   LOS DOS FLANCOS SE GUARDAN POR SEPARADO, NO SE REFLEJAN
   El equipo trazó cada lado por su cuenta. Al reflejar uno sobre otro las
   cajas coinciden con menos de 3,4 u de desvío (≈0,9 cm reales), pero el
   número de vértices difiere. Se conserva lo dibujado en cada flanco en vez
   de derivar uno del otro: es fiel al trazado y evita que un "arreglo"
   automático mueva chapa que alguien ya había dado por buena.

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
   Un Ford Escort sedán mide ≈425 cm y el viewBox lateral son 1630 u, así que
   1 u = 0,2607 cm. Las medidas de vinilo salen de ahí y viven SÓLO aquí:
   src/lib/sponsors.ts únicamente referencia estas zonas por `zoneId`.
   ══════════════════════════════════════════════════════════════════════════ */

import { type CarView, type SponsorTierId, type VinylDimensions } from "../types";
import {
  areaCm2 as polygonAreaCm2,
  centroid,
  chamfer,
  toPathData,
  toVinyl,
  type Vertex,
} from "./polygon";

/* ────────────────────────────────────────────────────────────────────────
   1. Escala y referencias del dibujo
   ──────────────────────────────────────────────────────────────────────── */

/** viewBox de las dos láminas laterales. */
export const LATERAL_VIEWBOX = { width: 1630, height: 535 } as const;

/** Largo real de un Ford Escort sedán, en cm. Origen de la escala. */
export const CAR_LENGTH_CM = 425;

/** Centímetros de chapa por unidad de viewBox. */
export const LATERAL_CM_PER_UNIT = CAR_LENGTH_CM / LATERAL_VIEWBOX.width;

/** Convierte unidades de viewBox a centímetros reales. */
export function lateralUnitsToCm(units: number): number {
  return units * LATERAL_CM_PER_UNIT;
}

/**
 * Pasos de rueda de la lámina izquierda, medidos sobre el dibujo.
 * Son ZONA VETADA: un vinilo no puede invadirlos. El editor los pinta como
 * círculos de exclusión y avisa si un polígono los pisa.
 */
export const LATERAL_LEFT_WHEELS = {
  rear: { cx: 393.3, cy: 416.2, tyreRadius: 118, archRadius: 152 },
  front: { cx: 1347.7, cy: 416.4, tyreRadius: 118, archRadius: 152 },
} as const;

/* ────────────────────────────────────────────────────────────────────────
   2. Tipos
   ──────────────────────────────────────────────────────────────────────── */

/** Los ocho huecos de un flanco. Unión cerrada a propósito. */
export type LateralZoneId =
  | "zone-hood-side"
  | "zone-front-wing"
  | "zone-front-door"
  | "zone-rear-door"
  | "zone-rear-quarter"
  | "zone-rear-window-side"
  | "zone-roof-side"
  | "zone-rocker";

/** Punto en coordenadas del viewBox. */
export interface ZoneAnchor {
  readonly x: number;
  readonly y: number;
}

/** Una zona ya resuelta: forma, path, ancla y medidas. */
export interface CarZone {
  readonly id: LateralZoneId;
  readonly label: string;
  readonly tier: SponsorTierId;
  readonly view: CarView;
  /** Qué pieza de chapa es, en lenguaje de taller. */
  readonly panel: string;
  /** Path CERRADO y RELLENO, en coordenadas del viewBox. */
  readonly d: string;
  readonly anchor: ZoneAnchor;
  readonly vinyl: VinylDimensions;
  /** Superficie real del vinilo, en cm². */
  readonly areaCm2: number;
  /**
   * Vista a la que SALTA esta zona al pulsarla, si procede.
   *
   * El capó y el techo se ven de canto desde el lateral: son tiras de 5–21 cm
   * de alto que no dan idea de la superficie real que se compra. El panel de
   * verdad se vende desde la cenital, así que pulsar aquí lleva allí en vez de
   * seleccionar un hueco que no es el que el patrocinador cree estar mirando.
   */
  readonly linksTo?: CarView;
}

/** Lo único que se escribe a mano. Todo lo demás se deriva. */
interface ZoneSpec {
  readonly id: LateralZoneId;
  readonly label: string;
  readonly tier: SponsorTierId;
  readonly panel: string;
  readonly polygon: readonly Vertex[];
  readonly cut: number;
  readonly anchor?: ZoneAnchor;
  readonly linksTo?: CarView;
}

function buildZone(view: CarView) {
  return (spec: ZoneSpec): CarZone => {
    const shape = chamfer(spec.polygon, spec.cut);
    return {
      id: spec.id,
      label: spec.label,
      tier: spec.tier,
      view,
      panel: spec.panel,
      d: toPathData(shape),
      anchor: spec.anchor ?? centroid(shape),
      vinyl: toVinyl(shape, LATERAL_CM_PER_UNIT),
      areaCm2: polygonAreaCm2(shape, LATERAL_CM_PER_UNIT),
      ...(spec.linksTo ? { linksTo: spec.linksTo } : {}),
    };
  };
}

/* ────────────────────────────────────────────────────────────────────────
   3. Flanco IZQUIERDO — public/car/lateral-left.svg (morro a la derecha)
   ──────────────────────────────────────────────────────────────────────── */

const LEFT_SPECS: readonly ZoneSpec[] = [
  {
    id: "zone-hood-side",
    linksTo: "cenital",
    label: "Capó (lateral)",
    tier: "principal",
    panel:
      "Franja alta del capó, entre el canto superior de la carrocería y el corte capó/aleta.",
    polygon: [
      [1220.9, 174.7], [1264, 180], [1294.7, 185], [1315.2, 187.3],
      [1333.4, 189.3], [1353.3, 190.8], [1372, 193], [1407.6, 197.5],
      [1453.1, 204.9], [1481.5, 211.6], [1515.8, 223.5], [1561.7, 244.7],
      [1568.5, 248.8], [1580.3, 255.9], [1557.8, 254], [1549.6, 249.2],
      [1504.2, 230.8], [1447.9, 216.1], [1408.5, 210.9], [1380, 207.2],
      [1353.1, 203.6], [1332.6, 200.7], [1236.2, 186.5], [1201.9, 180.9],
      [1187.3, 175.4], [1204.3, 174.4],
    ],
    cut: 0,
  },
  {
    id: "zone-front-wing",
    label: "Aleta delantera",
    tier: "oro",
    panel:
      "Flanco de la aleta delantera: del corte del capó al paso de rueda, por delante de la puerta.",
    polygon: [
      [1182.3, 237.7], [1179.9, 208.7], [1177.1, 186.4], [1174.3, 174.7],
      [1186, 175.3], [1204.7, 182.7], [1281.4, 195.1], [1351.9, 204.5],
      [1447.1, 217.5], [1504.4, 230.8], [1544.5, 248.2], [1556.9, 255],
      [1581.1, 257.5], [1594.5, 265.6], [1518.1, 258.8], [1510.4, 269],
      [1510, 319.5], [1624.4, 320.7], [1626.6, 329.4], [1461.4, 327.1],
      [1443, 307], [1420, 291.5], [1404.2, 284.7], [1380.9, 279.8],
      [1354.9, 278.4], [1326.6, 279.6], [1308, 283.1], [1291.1, 289],
      [1271.3, 298.4], [1253.2, 311.4], [1236.9, 327.1], [1218.3, 353],
      [1210.7, 367.9], [1201.1, 392.1], [1194.9, 426], [1159.8, 426.4],
      [1174.1, 352.6], [1180.2, 296.1],
    ],
    cut: 0,
    anchor: { x: 1246.1, y: 255.6 },
  },
  {
    id: "zone-front-door",
    label: "Puerta delantera",
    tier: "principal",
    panel:
      "Chapa de la puerta delantera, de la línea de cintura al pliegue inferior.",
    polygon: [
      [787.3, 277], [780.7, 191.8], [1054.4, 199.4], [1075.3, 192.7],
      [1094.1, 192], [1117.3, 185.1], [1123.6, 182], [1174.9, 178.1],
      [1176.8, 188.8], [1179, 212.9], [1181, 238.8], [1179, 297.1],
      [1174, 349.1], [1159.2, 427], [773.3, 426.1], [784.9, 365.6],
      [785.8, 301.3],
    ],
    cut: 0,
  },
  {
    id: "zone-rear-door",
    label: "Puerta trasera",
    tier: "plata",
    panel:
      "Chapa de la puerta trasera; el canto trasero sigue el recorte del paso de rueda.",
    polygon: [
      [403.8, 181.1], [779.5, 192.4], [783.7, 236], [786, 284.8],
      [784.6, 363.3], [772.3, 426.4], [550.2, 427.3], [542.5, 400.4],
      [524.8, 350.7], [507.1, 317.2], [492.3, 301], [452.8, 280.6],
      [435.9, 267.9], [421.3, 251.6], [412.4, 230.8], [409, 222.2],
      [404.3, 192.9],
    ],
    cut: 0,
  },
  {
    id: "zone-rear-quarter",
    label: "Aleta trasera",
    tier: "oro",
    panel:
      "Aleta trasera completa, del corte del portón al paragolpes. La boca de repostaje queda dentro.",
    polygon: [
      [29.7, 266.3], [53.6, 265.9], [50.9, 241.6], [49.1, 217.6],
      [44.4, 210.6], [30.3, 201.7], [17.3, 198.3], [27.6, 171.5],
      [27.2, 161.9], [30.5, 154.5], [37.2, 149.4], [71.7, 147.6],
      [81.6, 147.2], [88.9, 143.7], [99.1, 142.5], [177.8, 139.8],
      [202.6, 138.2], [214, 136.9], [217.5, 133.5], [227.2, 137.9],
      [239.2, 141.4], [255.3, 144.3], [269.4, 145.1], [289.9, 144],
      [301.4, 141.4], [322.9, 133.2], [406.7, 168.7], [402.5, 183.9],
      [408.4, 223.7], [413.1, 237.3], [421.3, 252.8], [436.7, 270.1],
      [455, 282.7], [409, 281.9], [378, 283.5], [347, 291.2],
      [243.1, 292.5], [162.3, 293.1], [106.1, 292.6], [29.3, 292.7],
      [27.5, 282.7],
    ],
    cut: 0,
  },
  {
    id: "zone-rear-window-side",
    label: "Pilona trasera",
    tier: "principal",
    panel:
      "Luneta trasera vista de perfil, entre el montante C cercano y el lejano. Vinilo microperforado.",
    polygon: [
      [549.6, 4.3], [500.3, 56.2], [476.6, 81.3], [457.6, 102.2],
      [451.9, 109.3], [443.3, 118.2], [430.9, 131.6], [418, 150.6],
      [406.6, 168.3], [322.6, 133], [349.7, 116.7], [366.5, 101.4],
      [388.6, 83.5], [404.8, 68.9], [422.4, 52.7], [441.1, 35.9],
      [447.5, 29], [456.8, 18.2],
    ],
    cut: 0,
  },
  {
    id: "zone-roof-side",
    linksTo: "cenital",
    label: "Techo (lateral)",
    tier: "principal",
    panel:
      "Canto del techo visible de perfil: tira continua sobre las dos ventanillas.",
    polygon: [
      [550.5, 3.8], [576.5, 2], [623.1, 0.4], [668.8, 0.1],
      [696.6, -0.2], [749.3, 0.1], [799.1, 1.3], [816.7, 2.1],
      [837.7, 2.4], [848.9, 4.5], [870.8, 8], [905.4, 15],
      [913.7, 20.6], [894.5, 16.5], [870.5, 13.3], [844.5, 9.5],
      [817, 7.1], [790, 6], [773.3, 5.7], [763.1, 6.2],
      [746.1, 4.8], [710.4, 4.8], [672, 4.8], [637.8, 5.4],
      [590.4, 6.8], [548.6, 9],
    ],
    cut: 0,
    anchor: { x: 726.5, y: 1.6 },
  },
  {
    id: "zone-rocker",
    label: "Faldón / bajos",
    tier: "bronce",
    panel:
      "Faldón lateral bajo las dos puertas, del pliegue inferior al canto del bajo, entre pasos de rueda.",
    polygon: [
      [600.8, 428.2], [925.8, 427.5], [1048, 427.5], [1192.6, 427.8],
      [1191.4, 462.4], [547.7, 462.3], [545.7, 447.2], [542.6, 430.3],
    ],
    cut: 0,
    anchor: { x: 864, y: 446.9 },
  },
];

export const LATERAL_LEFT_ZONES: readonly CarZone[] =
  LEFT_SPECS.map(buildZone("lateral-izq"));

/* ────────────────────────────────────────────────────────────────────────
   4. Flanco DERECHO — public/car/lateral-right.svg (morro a la izquierda)
   ──────────────────────────────────────────────────────────────────────── */

const RIGHT_SPECS: readonly ZoneSpec[] = [
  {
    id: "zone-hood-side",
    linksTo: "cenital",
    label: "Capó (lateral)",
    tier: "principal",
    panel:
      "Franja alta del capó, entre el canto superior de la carrocería y el corte capó/aleta.",
    polygon: [
      [442.9, 175.4], [434.5, 180.3], [426.4, 183.1], [365.5, 191.6],
      [306.3, 200], [260.2, 207.1], [233.4, 210.9], [182.4, 217.6],
      [127.4, 231.3], [97.1, 243.7], [72.1, 255.6], [48.5, 256],
      [89, 235.2], [115.1, 223.2], [150.7, 210.9], [185.9, 202.5],
      [238.7, 195.8], [270.4, 191.6], [298.6, 188.4], [315.8, 187.7],
      [327.8, 186.3], [362.3, 181.3], [404.5, 174.7],
    ],
    cut: 0,
    anchor: { x: 234.8, y: 203.2 },
  },
  {
    id: "zone-front-wing",
    label: "Aleta delantera",
    tier: "oro",
    panel:
      "Flanco de la aleta delantera: del corte del capó al paso de rueda, por delante de la puerta.",
    polygon: [
      [455.3, 174.7], [444.8, 175], [437.2, 179.5], [427, 183.5],
      [413.5, 185], [405.2, 186.7], [396.9, 187.7], [375.2, 191.1],
      [341.8, 195.2], [314.3, 199.4], [267.8, 206.6], [224.1, 212.1],
      [183.5, 218.3], [128.8, 231.3], [94.4, 245.6], [74.3, 255.6],
      [61.2, 263.7], [112.4, 260.4], [118.6, 265.8], [119.9, 271.7],
      [119.3, 321.5], [5.9, 322.5], [4, 330.3], [166.5, 329.3],
      [178.3, 315.7], [196.9, 300.6], [215, 289.8], [237.2, 282.8],
      [261.8, 279.6], [284.2, 279.6], [309.5, 281.1], [329.8, 285.9],
      [356.5, 297.3], [380.1, 314.3], [392, 326.7], [403.3, 341.5],
      [419.1, 365.7], [429.5, 393], [435.5, 426.9], [470, 426.8],
      [454.2, 339.8], [451, 294], [447.9, 239.4], [454.5, 177.5],
    ],
    cut: 0,
    anchor: { x: 348.5, y: 241.1 },
  },
  {
    id: "zone-front-door",
    label: "Puerta delantera",
    tier: "principal",
    panel:
      "Chapa de la puerta delantera, de la línea de cintura al pliegue inferior.",
    polygon: [
      [845.7, 223.7], [849.3, 191.8], [575.3, 201.5], [554.7, 192.7],
      [535.9, 192], [512.7, 185.1], [506.4, 182], [455.1, 178.1],
      [453.2, 188.8], [451, 212.9], [449, 238.8], [451, 297.1],
      [456, 349.1], [470.8, 427], [856.7, 426.1], [846.3, 363.2],
      [842.9, 319.7], [842, 282.3], [843.2, 270.6], [844.2, 245.5],
    ],
    cut: 0,
  },
  {
    id: "zone-rear-door",
    label: "Puerta trasera",
    tier: "plata",
    panel:
      "Chapa de la puerta trasera; el canto trasero sigue el recorte del paso de rueda.",
    polygon: [
      [1059.7, 186.1], [850.2, 192.2], [847.1, 222.3], [845.4, 245.3],
      [843.1, 282], [843.9, 319.2], [847.7, 363.1], [857.7, 426.4],
      [1080.4, 427.9], [1089.6, 393], [1105.1, 349], [1114.8, 331.1],
      [1122.4, 319], [1128.3, 311.6], [1138.2, 301.7], [1151.3, 293.5],
      [1178.8, 280.8], [1193.4, 270.1], [1208.9, 253.2], [1216.5, 238.2],
      [1218.4, 231.4], [1221.9, 224.2], [1225.9, 194], [1225.9, 181.4],
    ],
    cut: 0,
  },
  {
    id: "zone-rear-quarter",
    label: "Aleta trasera",
    tier: "oro",
    panel:
      "Aleta trasera completa, del corte del portón al paragolpes. La boca de repostaje queda dentro.",
    polygon: [
      [1551.3, 148.3], [1543.2, 144.1], [1533.6, 142.8], [1452.9, 140.3],
      [1416.7, 137.3], [1412, 134], [1404.4, 137.8], [1392.6, 141.1],
      [1374.6, 145.1], [1361, 145.4], [1341.9, 144.6], [1329.5, 141.9],
      [1308.4, 133.7], [1221, 166], [1223.9, 168.7], [1226.2, 179.8],
      [1227, 191.4], [1222.1, 224.1], [1218.7, 231.3], [1217.7, 236.3],
      [1209.8, 252.7], [1195.2, 268.9], [1178.1, 282.3], [1182.3, 291],
      [1206.3, 284.5], [1237, 283], [1258.9, 285.5], [1288.3, 294],
      [1379.2, 293.6], [1428.6, 293.8], [1533.9, 293.6], [1601.6, 294.1],
      [1602.9, 285], [1601.3, 273], [1603, 266.3], [1583.6, 266.2],
      [1576.2, 265.3], [1578.9, 251.2], [1580.5, 224.9], [1581.3, 218.4],
      [1585, 212.4], [1597.4, 203.9], [1613.2, 199.7], [1603.7, 173.1],
      [1603.2, 165], [1601.3, 156.8], [1597, 151.6], [1591.2, 149.4],
      [1582.9, 149.3], [1564.9, 148.3],
    ],
    cut: 0,
  },
  {
    id: "zone-rear-window-side",
    label: "Pilona trasera",
    tier: "principal",
    panel:
      "Luneta trasera vista de perfil, entre el montante C cercano y el lejano. Vinilo microperforado.",
    polygon: [
      [1175.8, 20.5], [1181.9, 29.3], [1190.3, 37.3], [1202.3, 47.5],
      [1229.3, 73], [1242.2, 83.7], [1264.5, 102.3], [1281.8, 118.1],
      [1293.2, 124.9], [1307, 133.7], [1221.4, 164.9], [1217.7, 159.5],
      [1213.1, 152.6], [1199.3, 132.3], [1183.4, 114.9], [1159.9, 88.1],
      [1125, 51.5], [1093.2, 20], [1078.5, 5], [1132.8, 13.3],
    ],
    cut: 0,
  },
  {
    id: "zone-roof-side",
    linksTo: "cenital",
    label: "Techo (lateral)",
    tier: "principal",
    panel:
      "Canto del techo visible de perfil: tira continua sobre las dos ventanillas.",
    polygon: [
      [1082, 10.4], [1047.8, 7.7], [1012.2, 7.1], [984, 6.2],
      [955.9, 5.9], [925.6, 5.9], [896.5, 5.9], [876.8, 6.5],
      [845, 7.4], [816.5, 7.7], [792.6, 9.2], [736.3, 16.7],
      [715.9, 20.9], [725.5, 14.9], [792.3, 2.6], [881, 0.2],
      [906.7, -0.1], [927.1, 0.5], [941.5, 0.2], [958.6, 0.2],
      [972, 0.8], [993.3, 1.4], [1015.5, 1.7], [1037.6, 2],
      [1058, 3.8], [1078.4, 5.3],
    ],
    cut: 0,
  },
  {
    id: "zone-rocker",
    label: "Faldón / bajos",
    tier: "bronce",
    panel:
      "Faldón lateral bajo las dos puertas, del pliegue inferior al canto del bajo, entre pasos de rueda.",
    polygon: [
      [1029.2, 428.2], [704.2, 427.5], [582, 427.5], [435.9, 427.5],
      [437.8, 447.6], [437.6, 462.7], [1082.3, 462.3], [1084.3, 447.2],
      [1087.4, 430.3],
    ],
    cut: 0,
    anchor: { x: 766, y: 446.9 },
  },
];

export const LATERAL_RIGHT_ZONES: readonly CarZone[] =
  RIGHT_SPECS.map(buildZone("lateral-der"));

/* ────────────────────────────────────────────────────────────────────────
   5. Índices
   ──────────────────────────────────────────────────────────────────────── */

/** Las dos vistas laterales. */
export type LateralView = Extract<CarView, "lateral-izq" | "lateral-der">;

/** Qué lámina dibuja cada flanco. */
export const LATERAL_SVG: Readonly<Record<LateralView, string>> = {
  "lateral-izq": "/car/lateral-left.svg",
  "lateral-der": "/car/lateral-right.svg",
};

/** Zonas de cada flanco. */
export const LATERAL_ZONES_BY_VIEW: Readonly<Record<LateralView, readonly CarZone[]>> = {
  "lateral-izq": LATERAL_LEFT_ZONES,
  "lateral-der": LATERAL_RIGHT_ZONES,
};

/** Los ocho ids de zona lateral. */
export const LATERAL_ZONE_IDS: readonly LateralZoneId[] = LATERAL_LEFT_ZONES.map(
  (zone) => zone.id,
);

/**
 * Ids laterales para `assertSlotZonesExist()`.
 *
 * Ojo: los dos flancos COMPARTEN ids. La clave única de una zona es el par
 * (view, id), nunca el id suelto.
 */
export function lateralZoneIds(): readonly string[] {
  return LATERAL_ZONE_IDS;
}
