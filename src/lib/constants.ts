/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — Data Constants
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import type {
  TeamMember,
  Car,
  NavItem,
  CounterItem,
  GalleryItem,
  CommunicationCard,
} from "./types";

/* ── Navigation ── */
export const NAV_ITEMS: NavItem[] = [
  { label: "Inicio", href: "#inicio" },
  { label: "El Proyecto", href: "#proyecto" },
  { label: "El Equipo", href: "#equipo" },
  { label: "Patrocinio", href: "#patrocinio" },
  { label: "Contacto", href: "#contacto" },
];

/* ── Team (8 members: 4 pilotos + 4 copilotos) ── */
export const TEAM_MEMBERS: TeamMember[] = [
  { name: "Miembro 1", role: "Piloto",   carNumber: 1, bio: "Piloto del coche 1. Apasionado del motor y la aventura.", initials: "M1" },
  { name: "Miembro 2", role: "Copiloto", carNumber: 1, bio: "Copiloto y navegante del coche 1. Maestro de la brújula.", initials: "M2" },
  { name: "Miembro 3", role: "Piloto",   carNumber: 2, bio: "Piloto del coche 2. Experiencia en conducción off-road.", initials: "M3" },
  { name: "Miembro 4", role: "Copiloto", carNumber: 2, bio: "Copiloto del coche 2. Logística y comunicaciones.", initials: "M4" },
  { name: "Miembro 5", role: "Piloto",   carNumber: 3, bio: "Piloto del coche 3. Mecánico y piloto multidisciplinar.", initials: "M5" },
  { name: "Miembro 6", role: "Copiloto", carNumber: 3, bio: "Copiloto del coche 3. Planificación y estrategia.", initials: "M6" },
  { name: "Miembro 7", role: "Piloto",   carNumber: 4, bio: "Piloto del coche 4. Entusiasta del rally y la solidaridad.", initials: "M7" },
  { name: "Miembro 8", role: "Copiloto", carNumber: 4, bio: "Copiloto del coche 4. Gestión y redes sociales del equipo.", initials: "M8" },
];

/* ── Cars (4 Ford Escorts, 1997–1999) ── */
export const CARS: Car[] = [
  { number: 1, year: 1997, model: "Ford Escort MK6", crew: ["Miembro 1", "Miembro 2"], preparationPercent: 70, nickname: "Sahara" },
  { number: 2, year: 1998, model: "Ford Escort MK6", crew: ["Miembro 3", "Miembro 4"], preparationPercent: 55, nickname: "Atlas" },
  { number: 3, year: 1999, model: "Ford Escort MK6", crew: ["Miembro 5", "Miembro 6"], preparationPercent: 40, nickname: "Duna" },
  { number: 4, year: 1997, model: "Ford Escort MK6", crew: ["Miembro 7", "Miembro 8"], preparationPercent: 60, nickname: "Rif" },
];

/* ── Counters (El Proyecto section) ── */
export const COUNTERS: CounterItem[] = [
  { target: 9,    suffix: "",       label: "Días de rally" },
  { target: 6000, suffix: " km",    label: "Kilómetros estimados" },
  { target: 15,   suffix: "",       label: "Aldeas a visitar" },
  { target: 4,    suffix: "",       label: "Coches del equipo" },
];

/* ── Gallery placeholders ── */
export const GALLERY_ITEMS: GalleryItem[] = [
  { placeholder: "Preparación mecánica del Ford Escort #1", caption: "Revisión de motor y suspensión", aspect: "landscape" },
  { placeholder: "Equipo trabajando en el taller",          caption: "Trabajo en equipo",             aspect: "portrait" },
  { placeholder: "Test de conducción off-road",             caption: "Pruebas en terreno",            aspect: "landscape" },
  { placeholder: "Material humanitario preparado",          caption: "Carga solidaria",               aspect: "square" },
  { placeholder: "Reunión de planificación del equipo",     caption: "Estrategia de ruta",            aspect: "portrait" },
  { placeholder: "Ford Escort en paisaje desértico",        caption: "Listos para la aventura",       aspect: "landscape" },
];

/* ── Communication cards ── */
export const COMMUNICATION_CARDS: CommunicationCard[] = [
  {
    title: "Boam Racing arranca su aventura",
    excerpt: "El equipo comienza los preparativos para el UniRaid 2027. 9 días cruzando Marruecos con una misión solidaria.",
    date: "Marzo 2026",
    tag: "Inicio",
  },
  {
    title: "Primeros patrocinadores confirmados",
    excerpt: "Empresas locales se suman al proyecto. Buscamos más aliados para hacer realidad esta expedición.",
    date: "Próximamente",
    tag: "Patrocinio",
  },
  {
    title: "Los Ford Escort toman forma",
    excerpt: "Avances en la preparación mecánica de los 4 vehículos que cruzarán el desierto.",
    date: "Próximamente",
    tag: "Coches",
  },
];

/* ── Color palette tokens (for JS usage) ── */
export const COLORS = {
  oliveDark:  "#4D4617",
  olive:      "#6A611B",
  sand:       "#FECF97",
  terracotta: "#C56D46",
  earthRed:   "#6A2A11",
  cream:      "#FFF8EC",
  dark:       "#1A1408",
  white:      "#FFFFFF",
} as const;
