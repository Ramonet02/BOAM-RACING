/**
 * i18n · MEDIA — visual diary, videos, social channels and the /media page.
 *
 * Owner: i18n. Consumer: `MediaSection`, `app/media/page.tsx`.
 * Access from a component: `const t = useT(); t.media.gallery.items[0].title`
 *
 * This section used to be hardcoded in Spanish inside `MediaSection`. It
 * is now fully translated.
 *
 * IMAGES: the site ships NO stock photography. Every gallery entry
 * carries `title`, `category`, `caption` and `alt` so the enriched
 * placeholder can render real copy while the team's own archive is still
 * being shot; `t.common.placeholder.*` supplies the shared placeholder
 * chrome. Swap the placeholder for the real photo later — the copy stays.
 *
 * Handles and frequency badges are decorative call signs of the
 * "Rally Desert Tactical" HUD; the real profile URLs live in
 * `src/lib/constants.ts`, and so do the hero coordinates
 * (`PAGE_COORDS.media`).
 *
 * TOKENS: `cta.tag` uses `{edition}`; `cta.statLine` uses `{km}` and
 * `{days}`. Fill them from `t.common.edition.monthYear`,
 * `formatKm(ROUTE_SUMMARY.moroccoKm)` and `ROUTE_SUMMARY.totalDays`.
 */

import type { Lines, LocalizedSection, PageHero } from "./_shared";

export interface MediaGalleryItem {
  title: string;
  /** Must match one of the `filters` values. */
  category: string;
  caption: string;
  /** Alt text / placeholder description for the shot that goes here. */
  alt: string;
}

export interface MediaVideoItem {
  label: string;
  title: string;
  desc: string;
  duration: string;
}

export interface MediaSocialItem {
  name: string;
  handle: string;
  signal: string;
  desc: string;
}

export interface MediaSection {
  waypoint: string;
  title: Lines;
  intro: string;
  sideLabel: string;
  /** /media sub-page hero. */
  pageHero: PageHero;
  /** Gallery filter chips. */
  filters: {
    all: string;
    rally: string;
    solidarity: string;
    mechanics: string;
    team: string;
    landscape: string;
  };
  /** Visual diary. Fixed at six frames. */
  gallery: {
    tag: string;
    title: string;
    empty: string;
    countLabel: string;
    items: readonly [
      MediaGalleryItem,
      MediaGalleryItem,
      MediaGalleryItem,
      MediaGalleryItem,
      MediaGalleryItem,
      MediaGalleryItem,
    ];
  };
  /** Video transmissions. Fixed at two. */
  videos: {
    tag: string;
    title: string;
    empty: string;
    playLabel: string;
    durationLabel: string;
    items: readonly [MediaVideoItem, MediaVideoItem];
  };
  /** Social channels rendered as radio frequency bands. */
  socials: {
    tag: string;
    title: string;
    followLabel: string;
    signalLabel: string;
    items: readonly [MediaSocialItem, MediaSocialItem, MediaSocialItem];
  };
  /** Press / media kit block. */
  press: {
    tag: string;
    title: string;
    desc: string;
    kitLabel: string;
    kitButton: string;
    contactLabel: string;
  };
  /** Full-bleed dark closing block. */
  cta: {
    tag: string;
    title: Lines;
    desc: string;
    statLine: string;
  };
}

export const media: LocalizedSection<MediaSection> = {
  es: {
    waypoint: "[ 07 ]  MEDIA · FILM",
    title: ["DIARIO", "VISUAL"],
    intro:
      "Un registro honesto de la expedición: del primer tornillo del taller al último grano de arena del Sahara. Todo lo que publicamos lo grabamos nosotros.",
    sideLabel: "07 — MEDIA",
    pageHero: {
      title: "MEDIA HUB",
      subtitle: "Crónicas desde las dunas",
      location: "Erg Chebbi",
    },
    filters: {
      all: "Todo",
      rally: "Rally",
      solidarity: "Solidario",
      mechanics: "Mecánica",
      team: "Equipo",
      landscape: "Paisaje",
    },
    gallery: {
      tag: "GALERÍA",
      title: "Lo que llevamos visto",
      empty: "Todavía no hay imágenes en esta categoría.",
      countLabel: "imágenes",
      items: [
        {
          title: "Cruce del Atlas",
          category: "Rally",
          caption: "Puerto arriba, con el motor pidiendo aire",
          alt: "Coche del equipo subiendo un puerto de montaña del Atlas entre la niebla",
        },
        {
          title: "Entrega de material",
          category: "Solidario",
          caption: "El maletero se vacía en una escuela del desierto",
          alt: "Miembros del equipo descargando cajas de material escolar ante una escuela rural",
        },
        {
          title: "Tormenta de arena",
          category: "Rally",
          caption: "Media hora parados, esperando a que pase",
          alt: "Coche detenido en una pista con el horizonte borrado por la arena en suspensión",
        },
        {
          title: "Taller de Barcelona",
          category: "Mecánica",
          caption: "Sábados de grasa, soldadura y radio encendida",
          alt: "Dos miembros del equipo trabajando bajo un Ford Escort elevado en el taller",
        },
        {
          title: "Las cuatro tripulaciones",
          category: "Equipo",
          caption: "Antes de salir, cuando todo está limpio",
          alt: "Los ocho integrantes de BOAM RACING delante de los cuatro coches alineados",
        },
        {
          title: "Dunas del Erg Chebbi",
          category: "Paisaje",
          caption: "El último tramo antes de la meta",
          alt: "Dunas anaranjadas del Erg Chebbi al atardecer con las sombras muy largas",
        },
      ],
    },
    videos: {
      tag: "TRANSMISIONES DESDE EL DESIERTO",
      title: "Vídeo",
      empty: "Las primeras piezas llegan durante la preparación.",
      playLabel: "Reproducir",
      durationLabel: "Duración",
      items: [
        {
          label: "VÍDEO 01",
          title: "Tráiler oficial",
          desc: "Dos minutos para entender por qué cuatro coches viejos salen hacia Marruecos.",
          duration: "02:45",
        },
        {
          label: "VÍDEO 02",
          title: "Preparación técnica",
          desc: "Del desguace al roadbook: cómo se convierte un Escort de calle en un coche de raid.",
          duration: "08:20",
        },
      ],
    },
    socials: {
      tag: "REDES SOCIALES",
      title: "Sigue la expedición",
      followLabel: "Seguir",
      signalLabel: "Frecuencia",
      items: [
        {
          name: "Instagram",
          handle: "@boamracingteam",
          signal: "443.8 MHz",
          desc: "El día a día del taller y, en {editionMonth}, las fotos desde la pista.",
        },
        {
          name: "TikTok",
          handle: "@boamracingteam",
          signal: "612.0 MHz",
          desc: "Lo que sale mal, contado rápido y sin filtro.",
        },
        {
          name: "YouTube",
          handle: "BOAM RACING",
          signal: "807.2 MHz",
          desc: "Los vídeos largos: preparación, etapas y crónica final.",
        },
      ],
    },
    press: {
      tag: "PRENSA",
      title: "¿Escribes sobre el proyecto?",
      desc: "Tenemos logos, fotos en alta resolución y una nota de prensa lista. Pídela y te la mandamos el mismo día.",
      kitLabel: "Kit de prensa",
      kitButton: "Solicitar el kit",
      contactLabel: "Contacto de prensa",
    },
    cta: {
      tag: "SALIDA · {edition}",
      title: ["¿LISTO PARA", "EL DESIERTO?"],
      desc: "Nos quedan meses de taller y un viaje entero por contar. Súbete ahora y sal en todo lo que grabemos.",
      statLine: "{km} · {days} días · Marruecos",
    },
  },

  en: {
    waypoint: "[ 07 ]  MEDIA · FILM",
    title: ["VISUAL", "DIARY"],
    intro:
      "An honest record of the expedition: from the first bolt in the workshop to the last grain of Saharan sand. Everything we publish, we shot ourselves.",
    sideLabel: "07 — MEDIA",
    pageHero: {
      title: "MEDIA HUB",
      subtitle: "Dispatches from the dunes",
      location: "Erg Chebbi",
    },
    filters: {
      all: "All",
      rally: "Rally",
      solidarity: "Aid",
      mechanics: "Mechanics",
      team: "Team",
      landscape: "Landscape",
    },
    gallery: {
      tag: "GALLERY",
      title: "What we've seen so far",
      empty: "No images in this category yet.",
      countLabel: "images",
      items: [
        {
          title: "Crossing the Atlas",
          category: "Rally",
          caption: "Up the pass, engine gasping for air",
          alt: "The team's car climbing an Atlas mountain pass through the fog",
        },
        {
          title: "Handing over supplies",
          category: "Aid",
          caption: "The boot empties out at a desert school",
          alt: "Team members unloading boxes of school supplies outside a rural school",
        },
        {
          title: "Sandstorm",
          category: "Rally",
          caption: "Half an hour parked, waiting it out",
          alt: "Car stopped on a track with the horizon erased by blowing sand",
        },
        {
          title: "The Barcelona workshop",
          category: "Mechanics",
          caption: "Saturdays of grease, welding and the radio on",
          alt: "Two team members working under a Ford Escort up on the ramp",
        },
        {
          title: "The four crews",
          category: "Team",
          caption: "Before the start, while everything is still clean",
          alt: "All eight BOAM RACING members in front of the four cars lined up",
        },
        {
          title: "Erg Chebbi dunes",
          category: "Landscape",
          caption: "The last leg before the finish",
          alt: "Orange Erg Chebbi dunes at dusk with long shadows across the sand",
        },
      ],
    },
    videos: {
      tag: "TRANSMISSIONS FROM THE DESERT",
      title: "Video",
      empty: "The first pieces land during the build.",
      playLabel: "Play",
      durationLabel: "Duration",
      items: [
        {
          label: "VIDEO 01",
          title: "Official trailer",
          desc: "Two minutes on why four old cars are heading for Morocco.",
          duration: "02:45",
        },
        {
          label: "VIDEO 02",
          title: "Technical build",
          desc: "From scrapyard to roadbook: turning a road Escort into a raid car.",
          duration: "08:20",
        },
      ],
    },
    socials: {
      tag: "SOCIAL CHANNELS",
      title: "Follow the expedition",
      followLabel: "Follow",
      signalLabel: "Frequency",
      items: [
        {
          name: "Instagram",
          handle: "@boamracingteam",
          signal: "443.8 MHz",
          desc: "Day-to-day from the workshop and, come {editionMonth}, shots from the track.",
        },
        {
          name: "TikTok",
          handle: "@boamracingteam",
          signal: "612.0 MHz",
          desc: "Everything that goes wrong, told fast and unfiltered.",
        },
        {
          name: "YouTube",
          handle: "BOAM RACING",
          signal: "807.2 MHz",
          desc: "The long cuts: the build, the stages and the final report.",
        },
      ],
    },
    press: {
      tag: "PRESS",
      title: "Writing about the project?",
      desc: "We have logos, high-resolution photos and a press release ready to go. Ask and we'll send it the same day.",
      kitLabel: "Press kit",
      kitButton: "Request the kit",
      contactLabel: "Press contact",
    },
    cta: {
      tag: "DEPARTURE · {edition}",
      title: ["READY FOR", "THE DESERT?"],
      desc: "We still have months of workshop ahead and a whole trip to tell. Get on board now and appear in everything we film.",
      statLine: "{km} · {days} days · Morocco",
    },
  },

  ca: {
    waypoint: "[ 07 ]  MEDIA · FILM",
    title: ["DIARI", "VISUAL"],
    intro:
      "Un registre honest de l'expedició: del primer cargol del taller fins a l'últim gra de sorra del Sàhara. Tot el que publiquem ho gravem nosaltres.",
    sideLabel: "07 — MEDIA",
    pageHero: {
      title: "MEDIA HUB",
      subtitle: "Cròniques des de les dunes",
      location: "Erg Chebbi",
    },
    filters: {
      all: "Tot",
      rally: "Rally",
      solidarity: "Solidari",
      mechanics: "Mecànica",
      team: "Equip",
      landscape: "Paisatge",
    },
    gallery: {
      tag: "GALERIA",
      title: "El que portem vist",
      empty: "Encara no hi ha imatges en aquesta categoria.",
      countLabel: "imatges",
      items: [
        {
          title: "Travessa de l'Atles",
          category: "Rally",
          caption: "Port amunt, amb el motor demanant aire",
          alt: "Cotxe de l'equip pujant un port de muntanya de l'Atles enmig de la boira",
        },
        {
          title: "Entrega de material",
          category: "Solidari",
          caption: "El maleter es buida en una escola del desert",
          alt: "Membres de l'equip descarregant caixes de material escolar davant d'una escola rural",
        },
        {
          title: "Tempesta de sorra",
          category: "Rally",
          caption: "Mitja hora aturats, esperant que passi",
          alt: "Cotxe aturat en una pista amb l'horitzó esborrat per la sorra en suspensió",
        },
        {
          title: "Taller de Barcelona",
          category: "Mecànica",
          caption: "Dissabtes de greix, soldadura i ràdio encesa",
          alt: "Dos membres de l'equip treballant sota un Ford Escort elevat al taller",
        },
        {
          title: "Les quatre tripulacions",
          category: "Equip",
          caption: "Abans de sortir, quan tot encara és net",
          alt: "Els vuit integrants de BOAM RACING davant dels quatre cotxes alineats",
        },
        {
          title: "Dunes de l'Erg Chebbi",
          category: "Paisatge",
          caption: "L'últim tram abans de la meta",
          alt: "Dunes ataronjades de l'Erg Chebbi al capvespre amb les ombres molt llargues",
        },
      ],
    },
    videos: {
      tag: "TRANSMISSIONS DES DEL DESERT",
      title: "Vídeo",
      empty: "Les primeres peces arriben durant la preparació.",
      playLabel: "Reprodueix",
      durationLabel: "Durada",
      items: [
        {
          label: "VÍDEO 01",
          title: "Tràiler oficial",
          desc: "Dos minuts per entendre per què quatre cotxes vells surten cap al Marroc.",
          duration: "02:45",
        },
        {
          label: "VÍDEO 02",
          title: "Preparació tècnica",
          desc: "Del desballestament al roadbook: com es converteix un Escort de carrer en un cotxe de raid.",
          duration: "08:20",
        },
      ],
    },
    socials: {
      tag: "XARXES SOCIALS",
      title: "Segueix l'expedició",
      followLabel: "Seguir",
      signalLabel: "Freqüència",
      items: [
        {
          name: "Instagram",
          handle: "@boamracingteam",
          signal: "443.8 MHz",
          desc: "El dia a dia del taller i, al {editionMonth}, les fotos des de la pista.",
        },
        {
          name: "TikTok",
          handle: "@boamracingteam",
          signal: "612.0 MHz",
          desc: "El que surt malament, explicat de pressa i sense filtre.",
        },
        {
          name: "YouTube",
          handle: "BOAM RACING",
          signal: "807.2 MHz",
          desc: "Els vídeos llargs: preparació, etapes i crònica final.",
        },
      ],
    },
    press: {
      tag: "PREMSA",
      title: "Escrius sobre el projecte?",
      desc: "Tenim logos, fotos en alta resolució i una nota de premsa a punt. Demana-la i te l'enviem el mateix dia.",
      kitLabel: "Kit de premsa",
      kitButton: "Sol·licitar el kit",
      contactLabel: "Contacte de premsa",
    },
    cta: {
      tag: "SORTIDA · {edition}",
      title: ["A PUNT PER", "AL DESERT?"],
      desc: "Ens queden mesos de taller i un viatge sencer per explicar. Puja-hi ara i surt a tot el que gravem.",
      statLine: "{km} · {days} dies · Marroc",
    },
  },
};
