# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).


Aquí tienes la propuesta técnica completa:

---

## 1. Stack Tecnológico Recomendado (Alternativo a React)

### Recomendación principal: **Astro 6 + Svelte/Threlte + Cloudflare Pages**

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| **Meta-framework** | **Astro 6** | Envía **0 KB de JS** en páginas estáticas. Solo hidrata "islas" interactivas. Cloudflare adquirió Astro en enero 2026, garantizando soporte a largo plazo. |
| **Isla interactiva** | **Svelte 5 + Threlte** | Svelte compila a JS vanilla (sin virtual DOM), runtime de ~3 KB. Threlte es Three.js declarativo para Svelte con excelente rendimiento. |
| **3D Engine** | **Three.js** (vía Threlte) | Ecosistema más grande, soporte completo para DecalGeometry y CanvasTexture. |
| **Estilos** | **Tailwind CSS v4** | Utility-first, integración nativa con Astro, tree-shaking agresivo. |
| **Componentes UI** | **shadcn-svelte** | Componentes accesibles copy-paste con Tailwind + Svelte 5 (7500+ estrellas). |
| **Despliegue** | **Cloudflare Pages** | TTFB ~50ms, 330+ PoPs, bandwidth ilimitado (gratis), R2 para assets 3D. |
| **CMS (opcional)** | **Astro Content Collections** o **Keystatic** | Content Collections: tipo seguro, basado en archivos. Keystatic: CMS visual sin backend. |

### Por qué NO React / Next.js
- Astro envía 0 JS en landing, equipo, galería, contacto. Next.js envía mínimo ~80 KB.
- Svelte compila a ~3 KB vs React runtime ~45 KB.
- SvelteKit maneja 1,200 RPS vs Next.js 850 RPS en benchmarks recientes.
- La web es mayoritariamente contenido estático con **una sola sección interactiva**.

### Por qué NO Qwik, Solid, Vue
- **Qwik**: Todavía en beta (v2.0-beta), ecosistema muy pequeño, curva de aprendizaje alta. No recomendado para producción.
- **SolidStart**: Meta-framework aún en alpha. Ecosistema inmaduro. Sería excelente como isla dentro de Astro, pero Svelte/Threlte tiene mejor integración 3D.
- **Vue/Nuxt**: Opción viable (alternativa segura), pero bundle más grande y no aporta ventaja sobre Svelte para este caso. TresJS es más joven que Threlte.

---

## 2. Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────┐
│                    CLOUDFLARE PAGES                   │
│                  (Edge CDN, 330+ PoPs)                │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────────┐    ┌──────────────────────┐    │
│  │  PÁGINAS ESTÁTICAS │    │   ISLA INTERACTIVA    │    │
│  │  (Astro SSG, 0 JS) │    │   (Svelte + Threlte)  │    │
│  │                    │    │                        │    │
│  │  - Landing         │    │  Configurador 3D      │    │
│  │  - Nosotros        │    │  del coche             │    │
│  │  - Galería vídeos  │    │  (client:visible)      │    │
│  │  - Redes sociales  │    │                        │    │
│  │  - Contacto        │    │  Three.js + glTF       │    │
│  └──────────────────┘    │  + CanvasTexture        │    │
│                           └──────────────────────┘    │
│                                                       │
│  ┌──────────────────────────────────────────────┐    │
│  │              SERVICIOS CLOUDFLARE              │    │
│  │  R2: Modelos 3D, texturas, assets             │    │
│  │  KV: Estado del configurador, cache            │    │
│  │  Workers: API contacto, envío formularios      │    │
│  └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Estructura de carpetas propuesta

```
boamracing/
├── src/
│   ├── pages/              # Rutas Astro (SSG)
│   │   ├── index.astro     # Landing
│   │   ├── nosotros.astro
│   │   ├── galeria.astro
│   │   ├── patrocinio.astro # Página del configurador
│   │   └── contacto.astro
│   ├── components/
│   │   ├── astro/          # Componentes estáticos (.astro)
│   │   └── svelte/         # Componentes interactivos (.svelte)
│   │       └── configurator/
│   │           ├── CarViewer.svelte        # Escena 3D principal
│   │           ├── ZoneSelector.svelte     # Selección de zonas
│   │           ├── LogoUploader.svelte     # Upload + preview
│   │           └── SponsorCTA.svelte       # Call-to-action
│   ├── content/            # Content Collections (Astro)
│   │   ├── team/           # Miembros del equipo
│   │   └── sponsors/       # Sponsors actuales
│   ├── layouts/
│   └── styles/
├── public/
│   ├── models/             # glTF/GLB del coche
│   └── textures/           # Texturas base
└── astro.config.mjs
```

---

## 3. Sección Interactiva del Coche: Ideas Innovadoras

### Enfoque técnico recomendado: **CanvasTexture Compositing** (inspirado en iRacing + Gran Turismo)

Este es el approach más probado en la industria del gaming para configuradores de livery:

**Flujo de usuario:**
1. El usuario ve el coche 3D girando suavemente (auto-rotate).
2. Hace clic en una zona (puerta, capó, lateral...) -> se resalta con efecto glow.
3. Sube su logo (PNG con transparencia o SVG).
4. Arrastra, escala y rota el logo sobre la zona seleccionada en tiempo real.
5. Ve el resultado final en 3D -> botón de contacto/propuesta de patrocinio.

**Implementación técnica:**

```
Usuario hace clic en el coche
        │
        ▼
Raycaster detecta mesh intersectado
(door_left, hood, side_right, etc.)
        │
        ▼
Se resalta la zona seleccionada
(emissive color o outline shader)
        │
        ▼
Usuario sube logo (PNG/SVG)
        │
        ▼
SVG se rasteriza a Canvas 2D
        │
        ▼
Canvas 2D actúa como textura (CanvasTexture)
  - Se dibuja color base
  - Se dibuja logo en coordenadas UV
  - texture.needsUpdate = true
        │
        ▼
El modelo 3D se actualiza en tiempo real
```

### Ideas innovadoras adicionales

**a) Catálogo de zonas con pricing visual**
Cada zona del coche tiene un "tier" de visibilidad (premium, estándar, básico). Al hacer hover sobre una zona, se muestra un tooltip con el tamaño, visibilidad estimada en carrera, y rango de precio orientativo.

**b) Modo "antes/después"**
Slider interactivo que muestra el coche sin branding vs. con el logo del sponsor aplicado. Muy efectivo para ventas.

**c) Vista AR (futuro, con model-viewer)**
Exportar el coche configurado como glTF y usar `<model-viewer>` con AR para que el sponsor vea el coche con su logo en su espacio físico desde el móvil.

**d) Generación de mockup PDF**
Tras configurar el coche, generar automáticamente un PDF con renders del coche desde múltiples ángulos con el logo aplicado. Esto se envía como propuesta formal al sponsor.

**e) Approach progresivo (MVP -> 3D completo)**

| Fase | Implementación | Timeline |
|------|---------------|----------|
| **MVP** | 3-4 vistas pre-renderizadas + SVG zones + Fabric.js para logo placement | 2-4 semanas |
| **v2** | Modelo 3D completo con Three.js/Threlte + CanvasTexture | 6-10 semanas |
| **v3** | AR preview con model-viewer + PDF generation | Futuro |

El MVP 2D es funcional y atractivo, y el upgrade a 3D es incremental.

### Preparación del modelo 3D (Blender)

1. Separar el coche en meshes individuales nombrados: `door_left`, `door_right`, `hood`, `roof`, `side_left`, `side_right`, `rear`, `front_bumper`
2. UV unwrap correcto de cada pieza (esto es crítico para el CanvasTexture)
3. Exportar como glTF/GLB con Draco compression (reduce tamaño 80-90%)
4. Target: ~50-100K polígonos para móvil, ~200K para desktop

### Referencia open-source clave
El proyecto [syncopika/livery](https://github.com/syncopika/livery) es el más cercano a lo que necesitáis: Three.js + canvas texture painting con drag/resize/rotate de imágenes sobre un modelo 3D.

---

## 4. Escalabilidad y Mantenimiento

### Rendimiento (Core Web Vitals)
- **LCP < 1.5s**: Astro genera HTML estático pre-renderizado. Zero JS en páginas de contenido.
- **FID/INP < 100ms**: El configurador se hidrata solo cuando es visible (`client:visible`).
- **CLS ~ 0**: Layout definido en HTML estático antes de que cargue cualquier JS.
- **Lighthouse 99+**: Benchmarks reales de Astro en producción.

### SEO
- Astro genera HTML estático completo -> indexable al 100%.
- Metadatos Open Graph por página para compartir en redes.
- Sitemap XML automático con `@astrojs/sitemap`.
- Structured data (JSON-LD) para el equipo y eventos.

### Mantenimiento
- **Content Collections**: Los datos del equipo, sponsors y eventos se gestionan como archivos Markdown/MDX con schema TypeScript validado.
- **Astro islands**: El configurador 3D es un componente Svelte autocontenido. Puede actualizarse sin tocar el resto del sitio.
- **Cloudflare**: Zero-config deploys desde GitHub. Preview deploys automáticos por PR.

### Escalabilidad futura
- **Internacionalización**: Astro soporta i18n nativo. Añadir francés/inglés/árabe para la audiencia de UniRaid.
- **Blog/noticias**: Content Collections + MDX para updates de carrera.
- **Tienda de merchandising**: Integrar Stripe o Shopify Lite como isla adicional.
- **Multi-vehículo**: El configurador puede parametrizarse para cargar diferentes modelos glTF.
- **Analytics**: Cloudflare Web Analytics (privacy-first, sin cookies) integrado.

---

### Resumen ejecutivo

| Decisión | Elección | Motivo clave |
|----------|---------|-------------|
| Meta-framework | **Astro 6** | 0 JS por defecto, islas, adquirido por Cloudflare |
| Framework interactivo | **Svelte 5** | Compilador, ~3KB, mejor DX |
| 3D | **Threlte** (Three.js) | Declarativo, CanvasTexture, DecalGeometry |
| Deploy | **Cloudflare Pages** | TTFB 50ms, 330+ PoPs, gratis, integración nativa |
| CSS | **Tailwind v4** | Utility-first, rendimiento, ecosistema |
| CMS | **Content Collections** | Sin backend, type-safe, Git-based |

¿Quieres que profundice en alguna sección específica, que empiece a crear la estructura del proyecto, o que prepare un prototipo del configurador?