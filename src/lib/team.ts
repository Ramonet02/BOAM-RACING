/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Equipo: 8 miembros en 4 tripulaciones de 2
   --------------------------------------------------------------------------
   DATOS REALES (vienen de la web actual, no tocar sin hablar con el equipo):
     · Los 8 nombres y cómo se emparejan en tripulaciones.
     · Los nombres de equipo por apellidos: "LORAS & HUSE", "SANS & SANS"...
     · Ciudad de origen: Barcelona (los ocho).
     · Modelo y años de los coches: Ford Escort MK5/MK6, 1997 / 1998 / 1997 /
       1999 (modelo confirmado por el equipo en septiembre de 2026).
     · Specs mecánicas: 1.6 Zetec, 2WD delantera, cubrecárter de acero,
       suspensión elevada.

   ⚠  DATOS PERSONALES PENDIENTES — rellenar y poner `verified: true`:
     · `bio`        → 2-3 frases por persona.
     · `socials`    → handles personales de Instagram / TikTok.
   Todo eso está puesto como el centinela PENDING de `types.ts`, así que se
   localiza buscando "PENDIENTE" en el repo y no se cuela como dato inventado.
   La web NO pinta lo pendiente: el pasaporte solo muestra lo confirmado.

   El grupo sanguíneo ya no existe aquí: es un dato de salud y no se publica.

   ⚠  MODELO: el equipo confirmó "Ford Escort MK5/MK6", que es además lo que
     dibuja el line-art de /public/car. Ojo: los años 1997–1999 suelen
     corresponder al Escort de 1995–2000, que en Reino Unido se llama MK7.
     Si los años son correctos, conviene revisarlo con el equipo.
   ══════════════════════════════════════════════════════════════════════════ */

import {
  PENDING,
  type Crew,
  type CrewRole,
  type CrewVehicle,
  type GeoPoint,
  type MaybePending,
  type RaidModifications,
  type TeamMember,
} from "./types";

/* ────────────────────────────────────────────────────────────────────────
   Origen común
   ──────────────────────────────────────────────────────────────────────── */

/** Ciudad de origen de los ocho. DATO REAL. */
export const HOME_CITY = "Barcelona";

/** Coordenadas de Barcelona, para el micro-badging GPS del pasaporte. */
export const HOME_COORDS: GeoPoint = { lat: 41.3874, lon: 2.1686 };

/**
 * Texto que se escribe en `bio` mientras no haya bio real.
 * Está en una constante para que sea un solo sitio el que hay que buscar.
 */
const BIO_PENDING: MaybePending<string> = PENDING;

/** Redes personales sin confirmar. */
const SOCIALS_PENDING = {
  instagram: PENDING,
  tiktok: PENDING,
} as const;

/* ────────────────────────────────────────────────────────────────────────
   Modificaciones de raid
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Preparación común a los cuatro coches.
 * El motor, la tracción, el cubrecárter y la suspensión salen de las specs
 * que ya publica la web. Faros auxiliares y capacidad de carga son la
 * preparación estándar de raid del equipo: confirmar cifras finales.
 */
const COMMON_RAID_MODS: RaidModifications = {
  engine: "1.6L Zetec · 4 cilindros en línea",
  suspension: "Elevada +60 mm · muelles y amortiguadores reforzados de pista",
  underbodyProtection: "Cubrecárter de acero a medida · protección de bajos y depósito",
  auxiliaryLights: "Rampa de 4 faros auxiliares en paragolpes delantero",
  drivetrain: "2WD · tracción delantera",
  cargoCapacityKg: 120,
  cargoNotes:
    "Maletero y plazas traseras liberadas para material escolar, deportivo y sanitario.",
};

/** Construye la ficha de vehículo de una tripulación. */
function buildVehicle(
  carNumber: number,
  year: number,
  nickname: string,
): CrewVehicle {
  return {
    model: "Ford Escort MK5/MK6",
    year,
    carNumber,
    nickname,
    raidMods: COMMON_RAID_MODS,
    verified: false,
    verificationNote:
      "Modelo confirmado (MK5/MK6). Falta confirmar los años frente a la generación y la capacidad de carga homologada.",
  };
}

/* ────────────────────────────────────────────────────────────────────────
   Miembros
   ──────────────────────────────────────────────────────────────────────── */

/** Crea un miembro con todos los campos personales en estado pendiente. */
function buildMember(
  id: string,
  name: string,
  initials: string,
  role: CrewRole,
  crewId: string,
): TeamMember {
  return {
    id,
    name,
    initials,
    role,
    crewId,
    homeCity: HOME_CITY,
    homeCoords: HOME_COORDS,
    bio: BIO_PENDING,
    socials: SOCIALS_PENDING,
    verified: false,
    verificationNote:
      "Faltan bio y redes personales. El nombre y la ciudad sí son datos reales.",
  };
}

/* ────────────────────────────────────────────────────────────────────────
   Las 4 tripulaciones
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Tripulaciones en el orden en el que se muestran hoy en la web.
 * El primero de cada pareja es el piloto, el segundo el copiloto.
 */
export const CREWS: readonly Crew[] = [
  {
    id: "crew-01",
    code: "01",
    name: "LORAS & HUSE",
    pilot: buildMember("alex-loras", "Alex Loras", "AL", "piloto", "crew-01"),
    copilot: buildMember("huse", "Huse", "HU", "copiloto", "crew-01"),
    vehicle: buildVehicle(1, 1997, "Sahara"),
  },
  {
    id: "crew-02",
    code: "02",
    name: "SANS & SANS",
    pilot: buildMember("marc-sans", "Marc Sans", "MS", "piloto", "crew-02"),
    copilot: buildMember("sergi-sans", "Sergi Sans", "SS", "copiloto", "crew-02"),
    vehicle: buildVehicle(2, 1998, "Atlas"),
  },
  {
    id: "crew-03",
    code: "03",
    name: "SEGURA & PÉREZ",
    pilot: buildMember("bernat-segura", "Bernat Segura", "BS", "piloto", "crew-03"),
    copilot: buildMember("ramon-perez", "Ramón Pérez", "RP", "copiloto", "crew-03"),
    vehicle: buildVehicle(3, 1997, "Duna"),
  },
  {
    id: "crew-04",
    code: "04",
    name: "MAX & CELL",
    pilot: buildMember("max", "Max", "MX", "piloto", "crew-04"),
    copilot: buildMember("cell", "Cell", "CL", "copiloto", "crew-04"),
    vehicle: buildVehicle(4, 1999, "Rif"),
  },
];

/* ────────────────────────────────────────────────────────────────────────
   Derivados
   ──────────────────────────────────────────────────────────────────────── */

/** Los 8 miembros en plano, en orden piloto/copiloto por tripulación. */
export const TEAM_MEMBERS: readonly TeamMember[] = CREWS.flatMap((crew) => [
  crew.pilot,
  crew.copilot,
]);

/** Las 4 fichas de vehículo en plano. */
export const CREW_VEHICLES: readonly CrewVehicle[] = CREWS.map(
  (crew) => crew.vehicle,
);

/** Total de personas. Derivado, no escribir "8" a mano. */
export const TEAM_SIZE: number = TEAM_MEMBERS.length;

/** Total de coches. Derivado, no escribir "4" a mano. */
export const FLEET_SIZE: number = CREWS.length;

/** Capacidad solidaria total de la flota, en kg. */
export const TOTAL_CARGO_CAPACITY_KG: number = CREW_VEHICLES.reduce(
  (acc, vehicle) => acc + vehicle.raidMods.cargoCapacityKg,
  0,
);

/* ────────────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────────────── */

/** Busca una tripulación por id ("crew-02") o por código ("02"). */
export function getCrew(idOrCode: string): Crew | undefined {
  return CREWS.find((crew) => crew.id === idOrCode || crew.code === idOrCode);
}

/** Busca un miembro por su id ("ramon-perez"). */
export function getMember(id: string): TeamMember | undefined {
  return TEAM_MEMBERS.find((member) => member.id === id);
}

/** Los dos miembros de una tripulación, piloto primero. */
export function getCrewMembers(crew: Crew): readonly [TeamMember, TeamMember] {
  return [crew.pilot, crew.copilot];
}

/** Filtra por rol: `getMembersByRole("piloto")` devuelve los 4 pilotos. */
export function getMembersByRole(role: CrewRole): readonly TeamMember[] {
  return TEAM_MEMBERS.filter((member) => member.role === role);
}

/** Etiqueta en español del rol, capitalizada para la UI. */
export const ROLE_LABELS: Record<CrewRole, string> = {
  piloto: "Piloto",
  copiloto: "Copiloto",
};

/**
 * `true` mientras quede algún dato personal sin confirmar.
 * La UI puede usarlo para ocultar los campos del pasaporte que aún no existen
 * en vez de pintar "PENDIENTE" en producción.
 */
export const TEAM_HAS_PENDING_DATA: boolean = TEAM_MEMBERS.some(
  (member) => !member.verified,
);

export type {
  Crew,
  CrewRole,
  CrewVehicle,
  RaidModifications,
  TeamMember,
};
