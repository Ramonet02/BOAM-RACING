/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — Sistema de Imagenes (Modulo 6)
   Manifiesto tipado del archivo fotografico del equipo.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   REGLA DE NEGOCIO
   ----------------
   Queda PROHIBIDO el uso de fotografia generica de stock (unsplash y similares).
   Toda imagen de la web sale de este manifiesto y apunta a un fichero que el
   equipo aportara desde su propio archivo. Hasta que ese fichero exista, el
   componente <RallyImage /> pinta un placeholder tactico de calidad.

   COMO SE ANADE UNA FOTO REAL (flujo para el equipo)
   --------------------------------------------------
   1. Se copia el fichero en `public` respetando EXACTAMENTE la ruta `src`
      de la entrada. Ejemplo: la entrada `etapa-d05-erg-chebbi-amanecer` tiene
      src "/images/etapas/d05-erg-chebbi-amanecer.jpg", asi que el fichero va a
      `public/images/etapas/d05-erg-chebbi-amanecer.jpg`.
   2. En ESTE fichero se cambia `hasAsset: false` -> `hasAsset: true` en esa
      entrada. Nada mas. No hay que tocar ningun componente.
   3. Opcional: ajustar `alt`, `caption` y los metadatos de rally a lo que
      realmente muestra la foto (el alt es accesibilidad real, no relleno).

   No podemos comprobar en build si el fichero existe (el manifiesto se evalua
   tambien en cliente), de ahi el flag explicito `hasAsset`. Como red de
   seguridad, <RallyImage /> tambien cae al placeholder si la carga del <img>
   falla en runtime (fichero borrado, ruta mal escrita, 404).

   ESTRUCTURA DE CARPETAS BAJO /public/images
   ------------------------------------------
     /images/portada/    imagenes de cabecera (hero de home y subpaginas)
     /images/etapas/     ruta del rally, ordenadas por dia de etapa (d01..d09)
     /images/equipo/     retratos de tripulacion, grupo, briefings
     /images/coches/     los 4 Ford Escort, mecanica y rotulacion
     /images/solidario/  material humanitario y escuelas rurales

   UNION CON EL MODULO DE EQUIPO
   -----------------------------
   Los 8 retratos llevan `memberId`, que es exactamente el `TeamMember.id` de
   `src/lib/team.ts` ("alex-loras", "ramon-perez"...). La ficha de equipo
   resuelve su foto con `getTeamPortrait(member.id)` sin acoplar los modulos:
   aqui no se importa team.ts, solo se comparte la convencion de id.

   FORMATO RECOMENDADO
   -------------------
   JPG optimizado, lado largo 2400px para portada/etapas y 1600px para
   retratos y detalle. next/image se encarga del resto.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ────────────────────────────────────────────────────────────
   Tipos
   ──────────────────────────────────────────────────────────── */

/** Carpeta / familia a la que pertenece una imagen. */
export type RallyImageCategory =
  | "portada"
  | "etapas"
  | "equipo"
  | "coches"
  | "solidario";

/** Relacion de aspecto del hueco. El placeholder respeta siempre la que se pida. */
export type RallyImageAspect =
  | "square"
  | "portrait"
  | "landscape"
  | "wide"
  | "ultrawide";

/** Tipo de terreno del tramo, para el badge tecnico del overlay. */
export type RallyTerrain =
  | "dunas"
  | "pista-piedra"
  | "garganta"
  | "montana"
  | "pedregal"
  | "oasis"
  | "asfalto"
  | "urbano"
  | "taller"
  | "mar";

/** Coordenadas decimales WGS84. lon negativa = Oeste (todo Marruecos lo es). */
export interface GeoCoordinates {
  lat: number;
  lon: number;
}

/** Metadatos de rally. Solo aplican a imagenes tomadas sobre la ruta. */
export interface RallyImageMeta {
  /** Toponimo legible: "Erg Chebbi, Merzouga". */
  location?: string;
  /** Coordenadas del punto donde se toma / se tomara la foto. */
  coordinates?: GeoCoordinates;
  /** Dia de etapa 1..9 de la edicion de FEBRERO 2027. */
  stageDay?: number;
  /** Terreno dominante del tramo. */
  terrain?: RallyTerrain;
}

/** Una entrada del archivo fotografico. */
export interface RallyImageEntry {
  /** Identificador estable. Es la clave con la que los modulos piden la imagen. */
  id: string;
  /** Ruta prevista bajo /public. Siempre empieza por "/images/". */
  src: string;
  /** Texto alternativo descriptivo en castellano. Accesibilidad real. */
  alt: string;
  /** Pie de foto editorial, se muestra en galeria y overlays. */
  caption: string;
  /** Carpeta / familia. */
  category: RallyImageCategory;
  /** Aspecto nativo sugerido. Los consumidores pueden sobreescribirlo. */
  aspect: RallyImageAspect;
  /**
   * `false` mientras el fichero real no este subido a /public.
   * El equipo lo pone a `true` segun va entregando material.
   */
  hasAsset: boolean;
  /** Entra en la galeria general del modulo Media. */
  gallery?: boolean;
  /** Pieza destacada (hero, portada de bloque, primer slot de galeria). */
  featured?: boolean;
  /** Etiquetas libres para filtros de galeria. */
  tags?: readonly string[];
  /** Metadatos de rally (localizacion, coordenadas, dia, terreno). */
  rally?: RallyImageMeta;
  /**
   * Id del miembro retratado. Coincide con `TeamMember.id` de `src/lib/team.ts`
   * ("alex-loras", "ramon-perez"...). Es la clave de union entre ambos modulos.
   */
  memberId?: string;
  /** Nombre visible del miembro retratado, tal y como lo muestra su ficha. */
  member?: string;
  /** Numero de coche (1..4) al que pertenece la imagen, si aplica. */
  carNumber?: number;
  /** Credito fotografico cuando el equipo lo aporte. */
  credit?: string;
}

/* ────────────────────────────────────────────────────────────
   Constantes de ruta y etiquetado
   ──────────────────────────────────────────────────────────── */

/** Raiz publica de todo el archivo fotografico. */
export const IMAGE_BASE_PATH = "/images" as const;

/** Carpeta por categoria. Mantener sincronizado con las rutas `src`. */
export const IMAGE_DIRECTORIES: Record<RallyImageCategory, string> = {
  portada: `${IMAGE_BASE_PATH}/portada`,
  etapas: `${IMAGE_BASE_PATH}/etapas`,
  equipo: `${IMAGE_BASE_PATH}/equipo`,
  coches: `${IMAGE_BASE_PATH}/coches`,
  solidario: `${IMAGE_BASE_PATH}/solidario`,
};

/** Etiqueta corta en castellano para el badge de categoria del placeholder. */
export const CATEGORY_LABELS: Record<RallyImageCategory, string> = {
  portada: "Portada",
  etapas: "Etapa",
  equipo: "Equipo",
  coches: "Coches",
  solidario: "Solidario",
};

/** Etiqueta legible del terreno. */
export const TERRAIN_LABELS: Record<RallyTerrain, string> = {
  dunas: "Dunas",
  "pista-piedra": "Pista de piedra",
  garganta: "Garganta",
  montana: "Montana",
  pedregal: "Pedregal",
  oasis: "Oasis",
  asfalto: "Asfalto",
  urbano: "Urbano",
  taller: "Taller",
  mar: "Travesia maritima",
};

/** Valor CSS `aspect-ratio` por aspecto. Lo consume RallyImage. */
export const ASPECT_RATIO: Record<RallyImageAspect, string> = {
  square: "1 / 1",
  portrait: "3 / 4",
  landscape: "4 / 3",
  wide: "16 / 9",
  ultrawide: "21 / 9",
};

/** `sizes` por defecto segun el aspecto, para no servir 2400px a un thumbnail. */
export const DEFAULT_SIZES: Record<RallyImageAspect, string> = {
  square: "(max-width: 768px) 50vw, 25vw",
  portrait: "(max-width: 768px) 50vw, 25vw",
  landscape: "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
  wide: "(max-width: 768px) 100vw, (max-width: 1280px) 66vw, 50vw",
  ultrawide: "100vw",
};

/* ────────────────────────────────────────────────────────────
   Manifiesto
   ──────────────────────────────────────────────────────────── */

export const IMAGE_MANIFEST = [
  /* ── PORTADAS ────────────────────────────────────────────── */
  {
    id: "portada-home-duna-amanecer",
    src: "/images/portada/home-duna-amanecer.jpg",
    alt: "Ford Escort del equipo BOAM RACING recortado contra una duna del Sahara al amanecer",
    caption: "Amanecer sobre el Erg. Punto de partida del dia mas largo.",
    category: "portada",
    aspect: "ultrawide",
    hasAsset: false,
    featured: true,
    tags: ["hero", "dunas", "coche"],
    rally: {
      location: "Erg Chebbi, Merzouga",
      coordinates: { lat: 31.0996, lon: -4.0128 },
      stageDay: 5,
      terrain: "dunas",
    },
  },
  {
    id: "portada-equipo",
    src: "/images/portada/equipo-formacion.jpg",
    alt: "Los ocho miembros de BOAM RACING posando delante de los cuatro Ford Escort",
    caption: "Ocho universitarios, cuatro coches, una travesia.",
    category: "portada",
    aspect: "ultrawide",
    hasAsset: false,
    tags: ["hero", "equipo"],
  },
  {
    id: "portada-media",
    src: "/images/portada/media-diario-visual.jpg",
    alt: "Pista de tierra atravesando el Atlas marroqui con el convoy del equipo a lo lejos",
    caption: "Diario visual de la expedicion.",
    category: "portada",
    aspect: "ultrawide",
    hasAsset: false,
    tags: ["hero", "pista"],
    rally: {
      location: "Alto Atlas, Tizi n'Tichka",
      coordinates: { lat: 31.29, lon: -7.37 },
      stageDay: 9,
      terrain: "montana",
    },
  },
  {
    id: "portada-patrocinio",
    src: "/images/portada/patrocinio-rotulacion.jpg",
    alt: "Detalle de la carroceria de un Ford Escort con los espacios de patrocinio rotulados",
    caption: "Tu marca, toda la travesia de Marruecos.",
    category: "portada",
    aspect: "ultrawide",
    hasAsset: false,
    tags: ["hero", "patrocinio", "coche"],
  },

  /* ── ETAPAS (ruta de la edicion de febrero 2027) ──────────── */
  {
    id: "etapa-d01-embarque-algeciras",
    src: "/images/etapas/d01-embarque-algeciras.jpg",
    alt: "Los coches de BOAM RACING en la cola de embarque del ferry en el puerto de Algeciras",
    caption: "Dia 1. Embarque en Algeciras rumbo a Tanger Med.",
    category: "etapas",
    aspect: "landscape",
    hasAsset: false,
    gallery: true,
    tags: ["salida", "puerto", "convoy"],
    rally: {
      location: "Puerto de Algeciras, Espana",
      coordinates: { lat: 36.1256, lon: -5.45 },
      stageDay: 1,
      terrain: "mar",
    },
  },
  {
    id: "etapa-d02-salida-tanger",
    src: "/images/etapas/d02-salida-tanger.jpg",
    alt: "Convoy del equipo saliendo de Tanger Med por la carretera costera del norte de Marruecos",
    caption: "Dia 2. Primeros kilometros en suelo marroqui.",
    category: "etapas",
    aspect: "wide",
    hasAsset: false,
    gallery: true,
    tags: ["convoy", "carretera"],
    rally: {
      location: "Tanger Med, Marruecos",
      coordinates: { lat: 35.888, lon: -5.51 },
      stageDay: 2,
      terrain: "asfalto",
    },
  },
  {
    id: "etapa-d03-cedros-azrou",
    src: "/images/etapas/d03-cedros-azrou.jpg",
    alt: "Pista forestal entre cedros centenarios en el Atlas Medio, cerca de Azrou",
    caption: "Dia 3. Cedros del Atlas Medio antes de bajar al sur.",
    category: "etapas",
    aspect: "landscape",
    hasAsset: false,
    gallery: true,
    tags: ["bosque", "pista"],
    rally: {
      location: "Cedral de Azrou, Atlas Medio",
      coordinates: { lat: 33.436, lon: -5.22 },
      stageDay: 3,
      terrain: "montana",
    },
  },
  {
    id: "etapa-d04-pistas-midelt",
    src: "/images/etapas/d04-pistas-midelt.jpg",
    alt: "Pista de piedra suelta en la meseta de Midelt con el coche levantando polvo",
    caption: "Dia 4. Pista de piedra: donde se rompen las suspensiones.",
    category: "etapas",
    aspect: "wide",
    hasAsset: false,
    gallery: true,
    featured: true,
    tags: ["pista", "polvo"],
    rally: {
      location: "Meseta de Midelt, Alto Atlas",
      coordinates: { lat: 32.6852, lon: -4.735 },
      stageDay: 4,
      terrain: "pista-piedra",
    },
  },
  {
    id: "etapa-d05-erg-chebbi-amanecer",
    src: "/images/etapas/d05-erg-chebbi-amanecer.jpg",
    alt: "Dunas del Erg Chebbi al amanecer con las huellas del convoy marcadas en la arena",
    caption: "Dia 5. Erg Chebbi. Las dunas grandes del roadbook.",
    category: "etapas",
    aspect: "wide",
    hasAsset: false,
    gallery: true,
    featured: true,
    tags: ["dunas", "amanecer", "sahara"],
    rally: {
      location: "Erg Chebbi, Merzouga",
      coordinates: { lat: 31.0996, lon: -4.0128 },
      stageDay: 5,
      terrain: "dunas",
    },
  },
  {
    id: "etapa-d05-erg-chebbi-travesia",
    src: "/images/etapas/d05-erg-chebbi-travesia.jpg",
    alt: "Ford Escort atravesando un cordon de dunas de arena naranja en el Erg Chebbi",
    caption: "Dia 5. Travesia del cordon de dunas con los neumaticos deshinchados.",
    category: "etapas",
    aspect: "landscape",
    hasAsset: false,
    gallery: true,
    tags: ["dunas", "coche", "sahara"],
    rally: {
      location: "Erg Chebbi sur, Merzouga",
      coordinates: { lat: 31.0722, lon: -3.9769 },
      stageDay: 5,
      terrain: "dunas",
    },
  },
  {
    id: "etapa-d06-gargantas-todra",
    src: "/images/etapas/d06-gargantas-todra.jpg",
    alt: "Paredes verticales de las Gargantas del Todra con la pista estrecha en el fondo del canon",
    caption: "Dia 6. Gargantas del Todra: 300 metros de pared a cada lado.",
    category: "etapas",
    aspect: "portrait",
    hasAsset: false,
    gallery: true,
    tags: ["garganta", "canon"],
    rally: {
      location: "Gargantas del Todra, Tinghir",
      coordinates: { lat: 31.59, lon: -5.596 },
      stageDay: 6,
      terrain: "garganta",
    },
  },
  {
    id: "etapa-d06-valle-dades",
    src: "/images/etapas/d06-valle-dades.jpg",
    alt: "Curvas en zigzag de la carretera del valle del Dades vistas desde lo alto",
    caption: "Dia 6. Las lazadas del Dades, prueba de frenos y de estomago.",
    category: "etapas",
    aspect: "landscape",
    hasAsset: false,
    gallery: true,
    tags: ["valle", "carretera"],
    rally: {
      location: "Valle del Dades, Boumalne",
      coordinates: { lat: 31.37, lon: -5.97 },
      stageDay: 6,
      terrain: "montana",
    },
  },
  {
    id: "etapa-d07-oasis-draa",
    src: "/images/etapas/d07-oasis-draa.jpg",
    alt: "Palmeral del valle del Draa con kasbahs de adobe entre las palmeras",
    caption: "Dia 7. Palmeral del Draa, el ultimo verde antes del desierto.",
    category: "etapas",
    aspect: "landscape",
    hasAsset: false,
    gallery: true,
    tags: ["oasis", "palmeral"],
    rally: {
      location: "Valle del Draa, Agdz",
      coordinates: { lat: 30.696, lon: -6.447 },
      stageDay: 7,
      terrain: "oasis",
    },
  },
  {
    id: "etapa-d07-erg-chigaga",
    src: "/images/etapas/d07-erg-chigaga.jpg",
    alt: "Extension infinita de arena del Erg Chigaga al sur de Mhamid",
    caption: "Dia 7. Erg Chigaga. Navegacion pura a rumbo y brujula.",
    category: "etapas",
    aspect: "wide",
    hasAsset: false,
    gallery: true,
    tags: ["dunas", "navegacion", "sahara"],
    rally: {
      location: "Erg Chigaga, Mhamid El Ghizlane",
      coordinates: { lat: 29.8261, lon: -5.7186 },
      stageDay: 7,
      terrain: "dunas",
    },
  },
  {
    id: "etapa-d08-pedregal-ouarzazate",
    src: "/images/etapas/d08-pedregal-ouarzazate.jpg",
    alt: "Llanura pedregosa cerca de Ouarzazate con el coche cruzando un lecho seco",
    caption: "Dia 8. Reg pedregoso camino de Ouarzazate.",
    category: "etapas",
    aspect: "wide",
    hasAsset: false,
    gallery: true,
    tags: ["pedregal", "coche"],
    rally: {
      location: "Ouarzazate",
      coordinates: { lat: 30.9189, lon: -6.8934 },
      stageDay: 8,
      terrain: "pedregal",
    },
  },
  {
    id: "etapa-d09-tizi-n-tichka",
    src: "/images/etapas/d09-tizi-n-tichka.jpg",
    alt: "Puerto de montana del Tizi n'Tichka con la carretera serpenteando entre las cumbres nevadas",
    caption: "Dia 9. Tizi n'Tichka, 2.260 m. Ultimo puerto antes de Marrakech.",
    category: "etapas",
    aspect: "landscape",
    hasAsset: false,
    gallery: true,
    tags: ["puerto", "montana"],
    rally: {
      location: "Tizi n'Tichka, Alto Atlas",
      coordinates: { lat: 31.29, lon: -7.37 },
      stageDay: 9,
      terrain: "montana",
    },
  },
  {
    id: "etapa-d09-llegada-marrakech",
    src: "/images/etapas/d09-llegada-marrakech.jpg",
    alt: "Llegada del equipo a Marrakech con los coches cubiertos de polvo del desierto",
    caption: "Meta en Marrakech. Cuatro coches enteros.",
    category: "etapas",
    aspect: "landscape",
    hasAsset: false,
    gallery: true,
    tags: ["meta", "equipo"],
    rally: {
      location: "Marrakech",
      coordinates: { lat: 31.6295, lon: -7.9811 },
      stageDay: 9,
      terrain: "urbano",
    },
  },

  /* ── EQUIPO ──────────────────────────────────────────────── */
  {
    id: "equipo-grupo-completo",
    src: "/images/equipo/grupo-completo.jpg",
    alt: "Los ocho integrantes de BOAM RACING con sus monos de competicion junto a los coches",
    caption: "La tripulacion al completo: cuatro pilotos y cuatro copilotos.",
    category: "equipo",
    aspect: "wide",
    hasAsset: false,
    gallery: true,
    featured: true,
    tags: ["equipo", "grupo"],
  },
  {
    id: "equipo-briefing-roadbook",
    src: "/images/equipo/briefing-roadbook.jpg",
    alt: "Dos miembros del equipo estudiando el roadbook sobre el capo de un Ford Escort",
    caption: "Briefing de navegacion. El roadbook manda.",
    category: "equipo",
    aspect: "landscape",
    hasAsset: false,
    gallery: true,
    tags: ["navegacion", "roadbook"],
  },
  {
    id: "equipo-taller-nocturno",
    src: "/images/equipo/taller-nocturno.jpg",
    alt: "El equipo trabajando de noche en el taller bajo focos, con las herramientas en el suelo",
    caption: "Preparacion nocturna. La carrera empieza mucho antes de la salida.",
    category: "equipo",
    aspect: "landscape",
    hasAsset: false,
    gallery: true,
    tags: ["taller", "mecanica"],
    rally: { terrain: "taller" },
  },
  {
    id: "equipo-retrato-01",
    src: "/images/equipo/retrato-01.jpg",
    alt: "Retrato de Alex Loras, piloto del coche 1 de BOAM RACING, con el casco bajo el brazo",
    caption: "Alex Loras · Piloto · Coche 1 «Sahara»",
    category: "equipo",
    aspect: "portrait",
    hasAsset: false,
    memberId: "alex-loras",
    member: "Alex Loras",
    carNumber: 1,
    tags: ["retrato", "piloto"],
  },
  {
    id: "equipo-retrato-02",
    src: "/images/equipo/retrato-02.jpg",
    alt: "Retrato de Huse, copiloto del coche 1 de BOAM RACING, con el roadbook en la mano",
    caption: "Huse · Copiloto · Coche 1 «Sahara»",
    category: "equipo",
    aspect: "portrait",
    hasAsset: false,
    memberId: "huse",
    member: "Huse",
    carNumber: 1,
    tags: ["retrato", "copiloto"],
  },
  {
    id: "equipo-retrato-03",
    src: "/images/equipo/retrato-03.jpg",
    alt: "Retrato de Marc Sans, piloto del coche 2 de BOAM RACING, junto a la puerta del vehiculo",
    caption: "Marc Sans · Piloto · Coche 2 «Atlas»",
    category: "equipo",
    aspect: "portrait",
    hasAsset: false,
    memberId: "marc-sans",
    member: "Marc Sans",
    carNumber: 2,
    tags: ["retrato", "piloto"],
  },
  {
    id: "equipo-retrato-04",
    src: "/images/equipo/retrato-04.jpg",
    alt: "Retrato de Sergi Sans, copiloto del coche 2 de BOAM RACING, revisando la documentacion de ruta",
    caption: "Sergi Sans · Copiloto · Coche 2 «Atlas»",
    category: "equipo",
    aspect: "portrait",
    hasAsset: false,
    memberId: "sergi-sans",
    member: "Sergi Sans",
    carNumber: 2,
    tags: ["retrato", "copiloto"],
  },
  {
    id: "equipo-retrato-05",
    src: "/images/equipo/retrato-05.jpg",
    alt: "Retrato de Bernat Segura, piloto del coche 3 de BOAM RACING, con el mono de competicion",
    caption: "Bernat Segura · Piloto · Coche 3 «Duna»",
    category: "equipo",
    aspect: "portrait",
    hasAsset: false,
    memberId: "bernat-segura",
    member: "Bernat Segura",
    carNumber: 3,
    tags: ["retrato", "piloto"],
  },
  {
    id: "equipo-retrato-06",
    src: "/images/equipo/retrato-06.jpg",
    alt: "Retrato de Ramón Pérez, copiloto del coche 3 de BOAM RACING, con la brujula de navegacion",
    caption: "Ramón Pérez · Copiloto · Coche 3 «Duna»",
    category: "equipo",
    aspect: "portrait",
    hasAsset: false,
    memberId: "ramon-perez",
    member: "Ramón Pérez",
    carNumber: 3,
    tags: ["retrato", "copiloto"],
  },
  {
    id: "equipo-retrato-07",
    src: "/images/equipo/retrato-07.jpg",
    alt: "Retrato de Max, piloto del coche 4 de BOAM RACING, apoyado en el paragolpes delantero",
    caption: "Max · Piloto · Coche 4 «Rif»",
    category: "equipo",
    aspect: "portrait",
    hasAsset: false,
    memberId: "max",
    member: "Max",
    carNumber: 4,
    tags: ["retrato", "piloto"],
  },
  {
    id: "equipo-retrato-08",
    src: "/images/equipo/retrato-08.jpg",
    alt: "Retrato de Cell, copiloto del coche 4 de BOAM RACING, con la camara de documentacion del equipo",
    caption: "Cell · Copiloto · Coche 4 «Rif»",
    category: "equipo",
    aspect: "portrait",
    hasAsset: false,
    memberId: "cell",
    member: "Cell",
    carNumber: 4,
    tags: ["retrato", "copiloto"],
  },

  /* ── COCHES ──────────────────────────────────────────────── */
  {
    id: "coche-01-sahara",
    src: "/images/coches/coche-01-sahara.jpg",
    alt: "Ford Escort numero 1 apodado Sahara del equipo BOAM RACING, vista lateral completa",
    caption: "Coche 1 · Sahara · Ford Escort de raid",
    category: "coches",
    aspect: "landscape",
    hasAsset: false,
    gallery: true,
    carNumber: 1,
    tags: ["coche", "ford-escort"],
  },
  {
    id: "coche-02-atlas",
    src: "/images/coches/coche-02-atlas.jpg",
    alt: "Ford Escort numero 2 apodado Atlas del equipo BOAM RACING, vista lateral completa",
    caption: "Coche 2 · Atlas · Ford Escort de raid",
    category: "coches",
    aspect: "landscape",
    hasAsset: false,
    gallery: true,
    carNumber: 2,
    tags: ["coche", "ford-escort"],
  },
  {
    id: "coche-03-duna",
    src: "/images/coches/coche-03-duna.jpg",
    alt: "Ford Escort numero 3 apodado Duna del equipo BOAM RACING, vista lateral completa",
    caption: "Coche 3 · Duna · Ford Escort de raid",
    category: "coches",
    aspect: "landscape",
    hasAsset: false,
    gallery: true,
    carNumber: 3,
    tags: ["coche", "ford-escort"],
  },
  {
    id: "coche-04-rif",
    src: "/images/coches/coche-04-rif.jpg",
    alt: "Ford Escort numero 4 apodado Rif del equipo BOAM RACING, vista lateral completa",
    caption: "Coche 4 · Rif · Ford Escort de raid",
    category: "coches",
    aspect: "landscape",
    hasAsset: false,
    gallery: true,
    carNumber: 4,
    tags: ["coche", "ford-escort"],
  },
  {
    id: "coches-formacion",
    src: "/images/coches/formacion-completa.jpg",
    alt: "Los cuatro Ford Escort del equipo alineados en formacion antes de la salida",
    caption: "Los cuatro clasicos de raid, listos para la travesia.",
    category: "coches",
    aspect: "wide",
    hasAsset: false,
    gallery: true,
    featured: true,
    tags: ["coche", "formacion"],
  },
  {
    id: "coche-mecanica-suspension",
    src: "/images/coches/mecanica-suspension.jpg",
    alt: "Detalle de la suspension reforzada de un Ford Escort con el coche sobre caballetes",
    caption: "Suspension reforzada y proteccion de bajos: el 70% del exito.",
    category: "coches",
    aspect: "square",
    hasAsset: false,
    gallery: true,
    tags: ["mecanica", "detalle"],
    rally: { terrain: "taller" },
  },
  {
    id: "coche-detalle-rotulacion",
    src: "/images/coches/detalle-rotulacion.jpg",
    alt: "Detalle de la rotulacion de patrocinadores sobre la aleta de un Ford Escort",
    caption: "Vinilo de patrocinio sobre chapa y polvo del Sahara.",
    category: "coches",
    aspect: "square",
    hasAsset: false,
    gallery: true,
    tags: ["patrocinio", "detalle"],
  },

  /* ── SOLIDARIO ───────────────────────────────────────────── */
  {
    id: "solidario-carga-material",
    src: "/images/solidario/carga-material.jpg",
    alt: "Cajas de material escolar y deportivo cargadas en el maletero de un coche del equipo",
    caption: "Carga solidaria: 50 kg de material por coche.",
    category: "solidario",
    aspect: "landscape",
    hasAsset: false,
    gallery: true,
    tags: ["material", "carga"],
  },
  {
    id: "solidario-entrega-escuela-rissani",
    src: "/images/solidario/entrega-escuela-rissani.jpg",
    alt: "Entrega de material escolar a los maestros de una escuela rural cerca de Rissani",
    caption: "Entrega de material en una escuela rural del Tafilalet.",
    category: "solidario",
    aspect: "landscape",
    hasAsset: false,
    gallery: true,
    featured: true,
    tags: ["escuela", "entrega"],
    rally: {
      location: "Rissani, Tafilalet",
      coordinates: { lat: 31.2806, lon: -4.2639 },
      stageDay: 5,
      terrain: "pedregal",
    },
  },
  {
    id: "solidario-aula-rural",
    src: "/images/solidario/aula-rural.jpg",
    alt: "Ninos de un aula rural marroqui estrenando el material escolar entregado por el equipo",
    caption: "El destino real del proyecto: un aula con material nuevo.",
    category: "solidario",
    aspect: "landscape",
    hasAsset: false,
    gallery: true,
    tags: ["escuela", "infancia"],
    rally: {
      location: "Aldea del valle del Draa",
      coordinates: { lat: 30.4231, lon: -5.8372 },
      stageDay: 7,
      terrain: "oasis",
    },
  },
  {
    id: "solidario-material-deportivo",
    src: "/images/solidario/material-deportivo.jpg",
    alt: "Reparto de balones y material deportivo en el patio de tierra de una escuela rural",
    caption: "Material deportivo para el patio de tierra.",
    category: "solidario",
    aspect: "square",
    hasAsset: false,
    gallery: true,
    tags: ["deporte", "entrega"],
  },
  {
    id: "solidario-comunidad-local",
    src: "/images/solidario/comunidad-local.jpg",
    alt: "Encuentro del equipo con vecinos de una aldea bereber del sur de Marruecos",
    caption: "Sin la gente de las aldeas esto seria solo una carrera.",
    category: "solidario",
    aspect: "portrait",
    hasAsset: false,
    gallery: true,
    tags: ["comunidad", "retrato"],
    rally: {
      location: "Aldea bereber, Alto Atlas",
      coordinates: { lat: 31.4522, lon: -6.1214 },
      stageDay: 6,
      terrain: "montana",
    },
  },
] as const satisfies readonly RallyImageEntry[];

/** Union literal de todos los ids del manifiesto: autocompletado y error en build. */
export type RallyImageId = (typeof IMAGE_MANIFEST)[number]["id"];

/* ────────────────────────────────────────────────────────────
   Indice y acceso
   ──────────────────────────────────────────────────────────── */

const ALL: readonly RallyImageEntry[] = IMAGE_MANIFEST;

const INDEX: Record<string, RallyImageEntry> = Object.fromEntries(
  ALL.map((entry) => [entry.id, entry]),
);

/**
 * Devuelve la entrada de un id conocido del manifiesto.
 * El id esta tipado, asi que un id inexistente es un error de compilacion.
 */
export function getImage(id: RallyImageId): RallyImageEntry {
  return INDEX[id];
}

/** Busqueda tolerante para ids dinamicos (params de ruta, datos externos...). */
export function findImage(id: string): RallyImageEntry | undefined {
  return INDEX[id];
}

/** `true` si el fichero real ya esta subido y marcado en el manifiesto. */
export function isAssetReady(entry: RallyImageEntry): boolean {
  return entry.hasAsset === true;
}

/* ────────────────────────────────────────────────────────────
   Consultas para los modulos consumidores
   ──────────────────────────────────────────────────────────── */

/** Todas las entradas del archivo, en orden de manifiesto. */
export function getAllImages(): RallyImageEntry[] {
  return [...ALL];
}

/** Todas las imagenes de una categoria, en el orden del manifiesto. */
export function getImagesByCategory(
  category: RallyImageCategory,
): RallyImageEntry[] {
  return ALL.filter((entry) => entry.category === category);
}

/** Imagenes marcadas para la galeria general, ordenadas por dia de etapa. */
export function getGalleryImages(): RallyImageEntry[] {
  return ALL.filter((entry) => entry.gallery === true).sort((a, b) => {
    const dayA = a.rally?.stageDay ?? 99;
    const dayB = b.rally?.stageDay ?? 99;
    return dayA - dayB;
  });
}

/** Imagenes destacadas (heroes, primer slot de bloque). */
export function getFeaturedImages(): RallyImageEntry[] {
  return ALL.filter((entry) => entry.featured === true);
}

/** Imagenes de etapa. Si se pasa `day`, solo las de ese dia. */
export function getStageImages(day?: number): RallyImageEntry[] {
  const stages = ALL.filter((entry) => entry.category === "etapas");
  const filtered =
    day === undefined
      ? stages
      : stages.filter((entry) => entry.rally?.stageDay === day);
  return filtered.sort(
    (a, b) => (a.rally?.stageDay ?? 0) - (b.rally?.stageDay ?? 0),
  );
}

/** Normaliza para comparar nombres sin depender de tildes ni mayusculas. */
function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Retrato de un miembro de la tripulacion.
 *
 * Acepta indistintamente el `TeamMember.id` de `src/lib/team.ts`
 * ("ramon-perez") o el nombre visible ("Ramon Perez" / "Ramón Pérez").
 * La comparacion por nombre ignora tildes y mayusculas, asi que la ficha de
 * equipo puede pasar `member.id` o `member.name` sin preocuparse.
 *
 *   const portrait = getTeamPortrait(member.id) ?? getTeamPortrait(member.name);
 */
export function getTeamPortrait(
  memberIdOrName: string,
): RallyImageEntry | undefined {
  const needle = normalizeName(memberIdOrName);
  return ALL.find(
    (entry) =>
      entry.category === "equipo" &&
      (entry.memberId === memberIdOrName ||
        (entry.member !== undefined && normalizeName(entry.member) === needle)),
  );
}

/** Los ocho retratos de tripulacion, en orden de manifiesto (piloto/copiloto). */
export function getTeamPortraits(): RallyImageEntry[] {
  return ALL.filter(
    (entry) => entry.category === "equipo" && entry.memberId !== undefined,
  );
}

/** Imagenes de coches. Si se pasa `carNumber`, solo las de ese coche. */
export function getCarImages(carNumber?: number): RallyImageEntry[] {
  const cars = ALL.filter((entry) => entry.category === "coches");
  return carNumber === undefined
    ? cars
    : cars.filter((entry) => entry.carNumber === carNumber);
}

/** Imagenes del bloque solidario. */
export function getSolidarityImages(): RallyImageEntry[] {
  return getImagesByCategory("solidario");
}

/** Filtro por etiqueta libre (para los filtros de la galeria). */
export function getImagesByTag(tag: string): RallyImageEntry[] {
  return ALL.filter((entry) => entry.tags?.includes(tag));
}

/** Etiquetas unicas presentes en el manifiesto, ordenadas alfabeticamente. */
export function getAllTags(): string[] {
  const set = new Set<string>();
  for (const entry of ALL) {
    for (const tag of entry.tags ?? []) set.add(tag);
  }
  return [...set].sort();
}

/**
 * Estado del archivo fotografico: cuantas fotos reales hay ya frente al total.
 * Util para un badge tipo HUD ("ARCHIVO 0/40") mientras llega el material.
 */
export function getArchiveProgress(): {
  total: number;
  ready: number;
  pending: number;
  percent: number;
} {
  const total = ALL.length;
  const ready = ALL.filter(isAssetReady).length;
  return {
    total,
    ready,
    pending: total - ready,
    percent: total === 0 ? 0 : Math.round((ready / total) * 100),
  };
}

/* ────────────────────────────────────────────────────────────
   Formateo (badges tecnicos y overlays)
   ──────────────────────────────────────────────────────────── */

/**
 * Coordenadas en texto para los badges tecnicos.
 * decimal -> `31.0996° N  4.0128° O`
 * dms     -> `31°05'59" N  4°00'46" O`
 */
export function formatCoordinates(
  coords: GeoCoordinates,
  style: "decimal" | "dms" = "decimal",
): string {
  const ns = coords.lat >= 0 ? "N" : "S";
  const ew = coords.lon >= 0 ? "E" : "O";
  const lat = Math.abs(coords.lat);
  const lon = Math.abs(coords.lon);

  if (style === "dms") {
    return `${toDms(lat)} ${ns}  ${toDms(lon)} ${ew}`;
  }
  return `${lat.toFixed(4)}° ${ns}  ${lon.toFixed(4)}° ${ew}`;
}

function toDms(value: number): string {
  const degrees = Math.floor(value);
  const minutesFloat = (value - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - minutes) * 60);
  return `${degrees}°${String(minutes).padStart(2, "0")}'${String(seconds).padStart(2, "0")}"`;
}

/** Etiqueta corta de etapa: "ETAPA 05". Cadena vacia si la imagen no es de ruta. */
export function formatStageLabel(entry: RallyImageEntry): string {
  const day = entry.rally?.stageDay;
  return day === undefined ? "" : `ETAPA ${String(day).padStart(2, "0")}`;
}

/** Posicion 1..n de cada entrada dentro de su categoria. Para el codigo del HUD. */
const CATEGORY_SEQUENCE: Record<string, number> = (() => {
  const counters: Partial<Record<RallyImageCategory, number>> = {};
  const seq: Record<string, number> = {};
  for (const entry of IMAGE_MANIFEST) {
    const next = (counters[entry.category] ?? 0) + 1;
    counters[entry.category] = next;
    seq[entry.id] = next;
  }
  return seq;
})();

/**
 * Codigo tecnico de la imagen para el HUD del placeholder: "IMG·ETA·D05".
 * Decorativo, pero identifica la entrada del manifiesto de un vistazo.
 *
 * El sufijo es, por orden de preferencia:
 *   · `D05` dia de etapa, si la imagen es de ruta;
 *   · `C03` numero de coche, si la imagen es de un vehiculo concreto;
 *   · `N07` posicion dentro de su categoria, para el resto.
 * Nunca se recorta el id a pelo: daba colas sin sentido ("...rotulacION").
 */
export function formatAssetCode(entry: RallyImageEntry): string {
  const cat = entry.category.slice(0, 3).toUpperCase();
  const day = entry.rally?.stageDay;
  const tail =
    day !== undefined
      ? `D${String(day).padStart(2, "0")}`
      : entry.carNumber !== undefined
        ? `C${String(entry.carNumber).padStart(2, "0")}`
        : `N${String(CATEGORY_SEQUENCE[entry.id] ?? 0).padStart(2, "0")}`;
  return `IMG·${cat}·${tail}`;
}

/** `sizes` por defecto para un aspecto dado. */
export function defaultSizesFor(aspect: RallyImageAspect): string {
  return DEFAULT_SIZES[aspect];
}
