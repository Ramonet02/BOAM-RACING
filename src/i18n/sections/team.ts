/**
 * i18n · TEAM — the crew dossiers (section 05) and the /equipo page hero.
 *
 * Owner: i18n. Consumer: `TeamSection`, `app/equipo/page.tsx`.
 * Access from a component: `const t = useT(); t.team.dossier.bloodLabel`
 *
 * People's names, crew names, car years and the hero coordinates are
 * DATA (`src/lib/team.ts`, `PAGE_COORDS` in `src/lib/constants.ts`) —
 * only the labels around them are translated. `dossier` feeds the
 * tactical micro-badging (callsign, blood type, licence…).
 *
 *     {t.common.labels.coords} · {PAGE_COORDS.equipo}
 */

import type { Lines, LocalizedSection, PageHero } from "./_shared";

export interface TeamSection {
  waypoint: string;
  title: Lines;
  intro: string;
  sideLabel: string;
  /* Role labels used inside every crew card */
  pilot: string;
  copilot: string;
  unitPrefix: string;
  crewDossier: string;
  rallyUnit: string;
  estLabel: string;
  fromLabel: string;
  city: string;
  preparationLabel: string;
  preparationStatus: string;
  /* Technical dossier micro-badges */
  dossier: {
    callsignLabel: string;
    roleLabel: string;
    licenseLabel: string;
    specialtyLabel: string;
    sinceLabel: string;
  };
  /* Enriched portrait placeholder (no stock photography on this site) */
  photoPlaceholder: { badge: string; hint: string };
  /* Closing call to action */
  ctaTag: string;
  ctaTitle: Lines;
  ctaDescription: string;
  ctaButton: string;
  /* /equipo sub-page hero */
  pageHero: PageHero;
}

export const team: LocalizedSection<TeamSection> = {
  es: {
    waypoint: "[ 05 ]  EL EQUIPO",
    title: ["OCHO AMIGOS.", "CUATRO", "TRIPULACIONES."],
    intro:
      "{crew} estudiantes de Barcelona repartidos en {cars} coches. Ninguno es piloto profesional; todos sabemos cambiar una rueda a cuarenta grados y discutir sobre el mapa sin perder la calma.",
    sideLabel: "05 — EL EQUIPO",
    pilot: "Piloto",
    copilot: "Copiloto",
    unitPrefix: "EQUIPO",
    crewDossier: "Tripulación",
    rallyUnit: "Coche",
    estLabel: "Año",
    fromLabel: "Desde",
    city: "Barcelona",
    preparationLabel: "Preparación",
    preparationStatus: "En preparación",
    dossier: {
      callsignLabel: "Indicativo",
      roleLabel: "Puesto",
      licenseLabel: "Licencia",
      specialtyLabel: "Especialidad",
      sinceLabel: "Desde",
    },
    photoPlaceholder: {
      badge: "RETRATO PENDIENTE",
      hint: "Foto del archivo del equipo",
    },
    ctaTag: "[ ÚNETE ]",
    ctaTitle: ["AYÚDANOS", "A LLEGAR", "A MARRAKECH"],
    ctaDescription:
      "Si quieres seguir el proyecto de cerca, apoyarlo o simplemente preguntar cómo se cruza un desierto con un coche de los noventa, escríbenos. Contestamos siempre.",
    ctaButton: "Habla con el equipo",
    pageHero: {
      title: "EL EQUIPO",
      subtitle: "Cruzando el corazón del Atlas",
      location: "Paso de Tizi n'Tichka",
    },
  },

  en: {
    waypoint: "[ 05 ]  THE TEAM",
    title: ["EIGHT FRIENDS.", "FOUR", "CREWS."],
    intro:
      "{crew} students from Barcelona spread across {cars} cars. None of us is a professional driver; all of us can change a wheel at forty degrees and argue over a map without losing our temper.",
    sideLabel: "05 — THE TEAM",
    pilot: "Driver",
    copilot: "Co-driver",
    unitPrefix: "CREW",
    crewDossier: "Crew",
    rallyUnit: "Car",
    estLabel: "Year",
    fromLabel: "From",
    city: "Barcelona",
    preparationLabel: "Preparation",
    preparationStatus: "In preparation",
    dossier: {
      callsignLabel: "Callsign",
      roleLabel: "Role",
      licenseLabel: "Licence",
      specialtyLabel: "Speciality",
      sinceLabel: "Since",
    },
    photoPlaceholder: {
      badge: "PORTRAIT PENDING",
      hint: "Photo from the team archive",
    },
    ctaTag: "[ JOIN US ]",
    ctaTitle: ["HELP US", "MAKE IT", "TO MARRAKECH"],
    ctaDescription:
      "If you want to follow the project, back it, or just ask how anyone crosses a desert in a nineties car, drop us a line. We always reply.",
    ctaButton: "Talk to the team",
    pageHero: {
      title: "THE TEAM",
      subtitle: "Through the heart of the Atlas",
      location: "Tizi n'Tichka Pass",
    },
  },

  ca: {
    waypoint: "[ 05 ]  L'EQUIP",
    title: ["VUIT AMICS.", "QUATRE", "TRIPULACIONS."],
    intro:
      "{crew} estudiants de Barcelona repartits en {cars} cotxes. Cap de nosaltres és pilot professional; tots sabem canviar una roda a quaranta graus i discutir sobre el mapa sense perdre la calma.",
    sideLabel: "05 — L'EQUIP",
    pilot: "Pilot",
    copilot: "Copilot",
    unitPrefix: "EQUIP",
    crewDossier: "Tripulació",
    rallyUnit: "Cotxe",
    estLabel: "Any",
    fromLabel: "Des de",
    city: "Barcelona",
    preparationLabel: "Preparació",
    preparationStatus: "En preparació",
    dossier: {
      callsignLabel: "Indicatiu",
      roleLabel: "Lloc",
      licenseLabel: "Llicència",
      specialtyLabel: "Especialitat",
      sinceLabel: "Des de",
    },
    photoPlaceholder: {
      badge: "RETRAT PENDENT",
      hint: "Foto de l'arxiu de l'equip",
    },
    ctaTag: "[ UNEIX-T'HI ]",
    ctaTitle: ["AJUDA'NS", "A ARRIBAR", "A MARRÀQUEIX"],
    ctaDescription:
      "Si vols seguir el projecte de prop, donar-hi suport o simplement preguntar com es creua un desert amb un cotxe dels noranta, escriu-nos. Sempre responem.",
    ctaButton: "Parla amb l'equip",
    pageHero: {
      title: "L'EQUIP",
      subtitle: "Travessant el cor de l'Atles",
      location: "Coll de Tizi n'Tichka",
    },
  },
};
