<script lang="ts">
  import { onMount } from 'svelte';

  interface Zone {
    id: string;
    label: string;
    tier: 'premium' | 'standard' | 'basic';
    description: string;
    size: string;
    path: string;
    pin: { x: number; y: number };
    labelAnchor: { x: number; y: number };
    labelAlign: 'left' | 'right';
  }

  const zones: Zone[] = [
    {
      id: 'hood',
      label: 'Capó',
      tier: 'premium',
      description: 'Máxima visibilidad frontal. Zona protagonista en fotos y vídeos del raid.',
      size: '60×40 cm',
      path: 'M 158 270 L 228 260 L 298 256 L 298 282 L 158 286 Z',
      pin: { x: 225, y: 268 },
      labelAnchor: { x: 48, y: 215 },
      labelAlign: 'left'
    },
    {
      id: 'door-front',
      label: 'Puerta delantera',
      tier: 'premium',
      description: 'Área lateral grande con excelente visibilidad durante la conducción.',
      size: '50×35 cm',
      path: 'M 304 264 L 394 260 L 392 340 L 302 342 Z',
      pin: { x: 348, y: 298 },
      labelAnchor: { x: 48, y: 360 },
      labelAlign: 'left'
    },
    {
      id: 'door-rear',
      label: 'Puerta trasera',
      tier: 'standard',
      description: 'Zona lateral trasera, muy visible en fotos de seguimiento.',
      size: '45×35 cm',
      path: 'M 400 260 L 494 258 L 494 340 L 398 340 Z',
      pin: { x: 446, y: 296 },
      labelAnchor: { x: 350, y: 420 },
      labelAlign: 'left'
    },
    {
      id: 'rear-quarter',
      label: 'Aleta trasera',
      tier: 'standard',
      description: 'Panel lateral trasero, visible en posiciones de seguimiento.',
      size: '30×25 cm',
      path: 'M 500 258 L 588 268 L 614 310 L 618 340 L 498 340 Z',
      pin: { x: 558, y: 296 },
      labelAnchor: { x: 700, y: 268 },
      labelAlign: 'left'
    },
    {
      id: 'roof',
      label: 'Techo',
      tier: 'basic',
      description: 'Visible desde arriba, ideal para fotos aéreas y drones del raid.',
      size: '80×40 cm',
      path: 'M 350 210 L 536 208 L 540 226 L 348 228 Z',
      pin: { x: 442, y: 216 },
      labelAnchor: { x: 700, y: 165 },
      labelAlign: 'left'
    },
    {
      id: 'rear',
      label: 'Portón trasero',
      tier: 'standard',
      description: 'Zona trasera, visible durante caravanas y paradas.',
      size: '40×30 cm',
      path: 'M 620 278 L 636 286 L 636 346 L 622 348 Z',
      pin: { x: 628, y: 312 },
      labelAnchor: { x: 700, y: 370 },
      labelAlign: 'left'
    }
  ];

  let selectedZone = $state<string | null>(null);
  let hoveredZone = $state<string | null>(null);
  let uploadedLogo = $state<string | null>(null);
  let logoScale = $state(1);
  let showUploader = $state(false);
  let fileInput = $state<HTMLInputElement | null>(null);
  let mounted = $state(false);

  const tierConfig = {
    premium: { color: '#f59e0b', label: 'PREMIUM', glow: 'rgba(245,158,11,0.4)' },
    standard: { color: '#3a7fc4', label: 'STANDARD', glow: 'rgba(58,127,196,0.4)' },
    basic: { color: '#727070', label: 'BASIC', glow: 'rgba(114,112,112,0.4)' },
  };

  onMount(() => {
    mounted = true;
  });

  function selectZone(id: string) {
    selectedZone = selectedZone === id ? null : id;
    showUploader = selectedZone !== null;
  }

  function handleFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      uploadedLogo = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function resetLogo() {
    uploadedLogo = null;
    logoScale = 1;
    if (fileInput) fileInput.value = '';
  }

  $effect(() => {
    if (!selectedZone) {
      showUploader = false;
    }
  });

  function getZoneById(id: string): Zone | undefined {
    return zones.find(z => z.id === id);
  }

  function isZoneActive(zone: Zone): boolean {
    return selectedZone === zone.id || hoveredZone === zone.id;
  }

  function getZoneFill(zone: Zone): string {
    const cfg = tierConfig[zone.tier];
    if (selectedZone === zone.id) return cfg.glow;
    if (hoveredZone === zone.id) return `${cfg.color}15`;
    return 'transparent';
  }

  function getZoneStroke(zone: Zone): string {
    const cfg = tierConfig[zone.tier];
    if (selectedZone === zone.id) return cfg.color;
    if (hoveredZone === zone.id) return `${cfg.color}80`;
    return 'transparent';
  }

  function getZoneStrokeWidth(zone: Zone): string {
    if (selectedZone === zone.id) return '2';
    if (hoveredZone === zone.id) return '1.5';
    return '0';
  }
</script>

<section id="car" class="relative py-24 lg:py-32 overflow-hidden">
  <!-- Background layers -->
  <div class="absolute inset-0 bg-gradient-to-b from-[#050a12] via-[#080d18] to-[#050a12]"></div>
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(40,98,155,0.08),transparent_70%)]"></div>

  <div class="mx-auto max-w-7xl px-6 relative z-10">
    <!-- Section header -->
    <div class="mb-12 lg:mb-16 animate-reveal">
      <span class="text-boam-blue text-xs font-medium tracking-[0.35em] uppercase">Configurador interactivo</span>
      <h2 class="font-heading text-[clamp(2.5rem,6vw,4.5rem)] tracking-wider mt-3 leading-[0.95]">
        TU LOGO EN<br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-boam-blue via-boam-blue-light to-boam-blue">NUESTRO COCHE</span>
      </h2>
      <p class="text-boam-gray mt-4 max-w-lg text-sm leading-relaxed">
        Selecciona una zona del vehículo para ver cómo quedaría tu marca.
        Cada ubicación ofrece diferente visibilidad durante el raid.
      </p>
    </div>

    <div class="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
      <!-- Car visualization panel -->
      <div class="lg:col-span-8 scroll-scale">
        <div class="car-panel relative rounded-lg overflow-hidden">
          <!-- Panel header bar -->
          <div class="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] bg-white/[0.02]">
            <div class="flex items-center gap-2.5">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-boam-blue opacity-60"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-boam-blue"></span>
              </span>
              <span class="text-[11px] text-white/40 tracking-[0.2em] uppercase font-medium">Vista lateral</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-[10px] text-white/20 tracking-wider uppercase">Ford Escort RS Cosworth</span>
            </div>
          </div>

          <!-- SVG car area -->
          <div class="relative p-4 sm:p-6 lg:p-8">
            <!-- Subtle floor gradient -->
            <div class="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-boam-blue/[0.03] to-transparent pointer-events-none"></div>

            <svg
              viewBox="0 0 800 430"
              class="w-full h-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <!-- Gradients -->
                <linearGradient id="bodyPaint" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#f5f5f5"/>
                  <stop offset="35%" stop-color="#ececec"/>
                  <stop offset="70%" stop-color="#e0e0e0"/>
                  <stop offset="100%" stop-color="#d4d4d4"/>
                </linearGradient>
                <linearGradient id="blueTeam" x1="0" y1="0" x2="1" y2="0.3">
                  <stop offset="0%" stop-color="#1a4570"/>
                  <stop offset="50%" stop-color="#28629B"/>
                  <stop offset="100%" stop-color="#1d4d7a"/>
                </linearGradient>
                <linearGradient id="blueLower" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#2a6ca8"/>
                  <stop offset="100%" stop-color="#163d6b"/>
                </linearGradient>
                <linearGradient id="glassGrad" x1="0" y1="0" x2="0.3" y2="1">
                  <stop offset="0%" stop-color="#1a2a3e"/>
                  <stop offset="100%" stop-color="#0d1520"/>
                </linearGradient>
                <linearGradient id="glassShine" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="rgba(255,255,255,0.12)"/>
                  <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
                </linearGradient>
                <linearGradient id="tireGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#2a2a2a"/>
                  <stop offset="50%" stop-color="#1a1a1a"/>
                  <stop offset="100%" stop-color="#111"/>
                </linearGradient>
                <linearGradient id="rimFace" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#999"/>
                  <stop offset="40%" stop-color="#bbb"/>
                  <stop offset="100%" stop-color="#888"/>
                </linearGradient>
                <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgba(40,98,155,0.05)"/>
                  <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
                </linearGradient>
                <radialGradient id="headlightBeam" cx="0.3" cy="0.5" r="0.7">
                  <stop offset="0%" stop-color="#fffbe6" stop-opacity="0.5"/>
                  <stop offset="100%" stop-color="#fffbe6" stop-opacity="0"/>
                </radialGradient>

                <!-- Blueprint grid -->
                <pattern id="bpGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(40,98,155,0.04)" stroke-width="0.5"/>
                </pattern>
                <pattern id="bpGridSmall" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(40,98,155,0.02)" stroke-width="0.3"/>
                </pattern>

                <!-- Filters -->
                <filter id="shadowMain" x="-5%" y="-5%" width="110%" height="120%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="blur"/>
                  <feOffset dx="0" dy="8" result="offset"/>
                  <feComponentTransfer result="shadow">
                    <feFuncA type="linear" slope="0.2"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode in="shadow"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="glowZone" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="pinGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <!-- Background grid -->
              <rect width="800" height="440" fill="url(#bpGridSmall)"/>
              <rect width="800" height="440" fill="url(#bpGrid)"/>

              <!-- Ground line -->
              <line x1="60" y1="392" x2="740" y2="392" stroke="rgba(40,98,155,0.10)" stroke-width="0.5"/>
              <rect x="100" y="392" width="600" height="38" fill="url(#floorGrad)" opacity="0.5"/>

              <!-- Car shadow on ground -->
              <ellipse cx="400" cy="394" rx="260" ry="6" fill="rgba(0,0,0,0.22)"/>

              <!-- ============ CAR BODY - Sporty Hatchback Profile ============ -->
              <!-- Proportions: 3:1 L/H ratio, 40% DLO, long hood, sporty low stance -->
              <!-- Ground=392, Wheels: cx=238/558 cy=362 r=30, Sill=342, Belt=268, Roof=206 -->
              <g filter="url(#shadowMain)">

                <!-- === MAIN BODY SILHOUETTE === -->
                <path
                  d="M 120 342
                     L 118 308
                     C 120 292 126 280 140 272
                     L 164 262
                     C 195 256 240 252 290 250
                     L 300 248
                     L 348 210
                     C 354 204 364 200 380 198
                     L 460 196
                     C 498 196 524 198 540 204
                     C 550 210 556 218 562 228
                     L 585 260
                     C 592 274 600 292 608 310
                     L 618 334
                     C 620 340 622 344 622 348
                     L 622 358
                     C 622 362 620 364 616 366
                     L 594 367
                     C 590 383 576 394 558 394
                     C 540 394 526 383 522 367
                     L 278 367
                     C 274 383 260 394 242 394
                     C 224 394 210 383 206 367
                     L 128 366
                     C 123 364 120 360 118 354
                     Z"
                  fill="rgba(18,28,42,0.7)"
                  stroke="rgba(40,98,155,0.55)"
                  stroke-width="1.2"
                  stroke-linejoin="round"
                />

                <!-- Upper body subtle fill (above beltline) -->
                <path
                  d="M 140 272 L 164 262
                     C 195 256 240 252 290 250
                     L 300 248 L 348 210
                     C 354 204 364 200 380 198 L 460 196
                     C 498 196 524 198 540 204
                     C 550 210 556 218 562 228
                     L 585 260 L 140 272 Z"
                  fill="rgba(150,180,210,0.06)"
                />

                <!-- Lower body fill (team blue tint) -->
                <path
                  d="M 120 300 L 618 334
                     C 620 340 622 344 622 348 L 622 358
                     C 622 362 620 364 616 366
                     L 594 367 C 590 383 576 394 558 394 C 540 394 526 383 522 367
                     L 278 367 C 274 383 260 394 242 394 C 224 394 210 383 206 367
                     L 128 366 C 123 364 120 360 118 354 L 118 308
                     C 120 304 120 302 120 300 Z"
                  fill="rgba(40,98,155,0.10)"
                />

                <!-- Beltline / character line -->
                <path d="M 164 268 C 220 262 340 256 450 254 C 540 252 590 258 610 270"
                  fill="none" stroke="rgba(40,98,155,0.22)" stroke-width="0.6"/>

                <!-- Upper body shoulder line -->
                <path d="M 150 275 C 220 270 380 265 520 263 C 580 262 615 270 625 280"
                  fill="none" stroke="rgba(40,98,155,0.12)" stroke-width="0.4"/>

                <!-- === DOOR LINES === -->
                <line x1="396" y1="242" x2="394" y2="340" stroke="rgba(40,98,155,0.28)" stroke-width="0.7"/>
                <line x1="496" y1="240" x2="494" y2="340" stroke="rgba(40,98,155,0.28)" stroke-width="0.7"/>

                <!-- B-pillar -->
                <rect x="394" y="238" width="4" height="46" fill="rgba(40,98,155,0.10)" rx="1"/>

                <!-- === WINDOWS (proper DLO ratio ~40%) === -->
                <!-- Windshield (properly raked) -->
                <path d="M 302 254 L 350 212 C 354 206 360 202 370 200 L 374 244 Z"
                  fill="rgba(12,22,35,0.75)" stroke="rgba(40,98,155,0.42)" stroke-width="0.7"/>
                <!-- Windshield reflection -->
                <path d="M 308 250 L 352 214 C 355 210 360 206 366 204 L 368 242 Z"
                  fill="rgba(60,120,180,0.04)"/>

                <!-- Front side window -->
                <path d="M 378 199 L 394 198 L 394 244 L 376 246 Z"
                  fill="rgba(12,22,35,0.75)" stroke="rgba(40,98,155,0.42)" stroke-width="0.7"/>

                <!-- Rear side window -->
                <path d="M 400 198 L 490 196 L 492 242 L 398 244 Z"
                  fill="rgba(12,22,35,0.75)" stroke="rgba(40,98,155,0.42)" stroke-width="0.7"/>

                <!-- Rear quarter window (small, hatchback) -->
                <path d="M 496 196 L 532 200 C 538 204 542 210 546 218 L 548 240 L 494 242 Z"
                  fill="rgba(12,22,35,0.75)" stroke="rgba(40,98,155,0.38)" stroke-width="0.6"/>

                <!-- Roof rail -->
                <path d="M 348 210 C 354 204 364 200 380 198 L 460 196
                   C 498 196 524 198 540 204 C 550 210 556 218 562 228"
                  fill="none" stroke="rgba(40,98,155,0.50)" stroke-width="1.8" stroke-linecap="round"/>

                <!-- A-pillar -->
                <line x1="302" y1="254" x2="350" y2="210" stroke="rgba(40,98,155,0.45)" stroke-width="2.5" stroke-linecap="round"/>
                <!-- B-pillar upper -->
                <line x1="396" y1="244" x2="396" y2="198" stroke="rgba(40,98,155,0.38)" stroke-width="2" stroke-linecap="round"/>
                <!-- C-pillar -->
                <line x1="548" y1="240" x2="558" y2="222" stroke="rgba(40,98,155,0.38)" stroke-width="2.5" stroke-linecap="round"/>

                <!-- === HEADLIGHTS === -->
                <path d="M 140 276 L 165 268 L 190 264 L 190 282 L 140 290 Z"
                  fill="rgba(255,250,220,0.08)" stroke="rgba(40,98,155,0.32)" stroke-width="0.6" stroke-linejoin="round"/>
                <ellipse cx="168" cy="274" rx="8" ry="5" fill="rgba(255,250,220,0.12)" stroke="rgba(255,250,220,0.1)" stroke-width="0.3"/>
                <circle cx="165" cy="274" r="15" fill="url(#headlightBeam)" opacity="0.12"/>

                <!-- Front indicator -->
                <rect x="136" y="290" width="12" height="4" rx="1.5" fill="rgba(255,170,50,0.2)" stroke="rgba(255,170,50,0.2)" stroke-width="0.3"/>

                <!-- === TAIL LIGHTS === -->
                <path d="M 620 280 L 630 276 L 632 316 L 624 320 Z"
                  fill="rgba(200,20,20,0.25)" stroke="rgba(200,20,20,0.42)" stroke-width="0.5"/>
                <rect x="622" y="280" width="5" height="10" rx="1" fill="rgba(255,50,50,0.18)"/>
                <rect x="622" y="308" width="5" height="6" rx="1" fill="rgba(255,136,0,0.15)" stroke="rgba(255,136,0,0.2)" stroke-width="0.3"/>

                <!-- === FRONT BUMPER === -->
                <path d="M 122 300 L 140 286 L 192 278 L 194 300 Z"
                  fill="rgba(10,18,28,0.5)" stroke="rgba(40,98,155,0.22)" stroke-width="0.5"/>
                <!-- Grille -->
                <rect x="148" y="290" width="30" height="8" rx="1" fill="rgba(8,14,22,0.6)" stroke="rgba(40,98,155,0.15)" stroke-width="0.3"/>
                <!-- Front lip -->
                <path d="M 118 314 C 120 306 122 302 126 298 L 196 290 C 198 294 199 298 199 302 L 118 318 Z"
                  fill="rgba(8,14,22,0.35)" stroke="rgba(40,98,155,0.12)" stroke-width="0.3"/>

                <!-- === REAR BUMPER === -->
                <path d="M 620 322 L 634 316 L 636 348 L 622 350 Z"
                  fill="rgba(10,18,28,0.4)" stroke="rgba(40,98,155,0.18)" stroke-width="0.4"/>

                <!-- === SPOILER (subtle lip) === -->
                <path d="M 555 220 L 578 214 L 580 218 L 557 224 Z"
                  fill="rgba(18,28,42,0.5)" stroke="rgba(40,98,155,0.35)" stroke-width="0.6"/>

                <!-- === SIDE MIRROR === -->
                <path d="M 296 252 L 286 250 L 284 256 L 290 258 L 298 255 Z"
                  fill="rgba(18,28,42,0.6)" stroke="rgba(40,98,155,0.38)" stroke-width="0.5"/>

                <!-- === DOOR HANDLES === -->
                <rect x="362" y="274" width="12" height="3" rx="1.5" fill="none" stroke="rgba(40,98,155,0.28)" stroke-width="0.5"/>
                <rect x="462" y="272" width="12" height="3" rx="1.5" fill="none" stroke="rgba(40,98,155,0.28)" stroke-width="0.5"/>

                <!-- === WHEEL ARCHES === -->
                <path d="M 200 342 C 200 318 216 298 238 298 C 260 298 276 318 276 342"
                  fill="rgba(6,10,18,0.8)" stroke="rgba(40,98,155,0.32)" stroke-width="0.8"/>
                <path d="M 522 342 C 522 318 538 298 558 298 C 578 298 594 318 594 342"
                  fill="rgba(6,10,18,0.8)" stroke="rgba(40,98,155,0.32)" stroke-width="0.8"/>

                <!-- === FRONT WHEEL === -->
                <g>
                  <circle cx="238" cy="362" r="30" fill="rgba(12,18,26,0.9)" stroke="rgba(40,98,155,0.28)" stroke-width="0.8"/>
                  <circle cx="238" cy="362" r="26" fill="rgba(8,14,22,0.95)"/>
                  <circle cx="238" cy="362" r="18" fill="rgba(25,38,55,0.65)" stroke="rgba(40,98,155,0.42)" stroke-width="0.7"/>
                  {#each [0, 72, 144, 216, 288] as angle}
                    <line
                      x1={238 + 6 * Math.cos((angle - 90) * Math.PI / 180)}
                      y1={362 + 6 * Math.sin((angle - 90) * Math.PI / 180)}
                      x2={238 + 15 * Math.cos((angle - 90) * Math.PI / 180)}
                      y2={362 + 15 * Math.sin((angle - 90) * Math.PI / 180)}
                      stroke="rgba(40,98,155,0.48)" stroke-width="2.5" stroke-linecap="round"
                    />
                  {/each}
                  <circle cx="238" cy="362" r="5" fill="rgba(25,38,55,0.65)" stroke="rgba(40,98,155,0.48)" stroke-width="0.6"/>
                  <circle cx="238" cy="362" r="2" fill="rgba(40,98,155,0.38)"/>
                </g>

                <!-- === REAR WHEEL === -->
                <g>
                  <circle cx="558" cy="362" r="30" fill="rgba(12,18,26,0.9)" stroke="rgba(40,98,155,0.28)" stroke-width="0.8"/>
                  <circle cx="558" cy="362" r="26" fill="rgba(8,14,22,0.95)"/>
                  <circle cx="558" cy="362" r="18" fill="rgba(25,38,55,0.65)" stroke="rgba(40,98,155,0.42)" stroke-width="0.7"/>
                  {#each [0, 72, 144, 216, 288] as angle}
                    <line
                      x1={558 + 6 * Math.cos((angle - 90) * Math.PI / 180)}
                      y1={362 + 6 * Math.sin((angle - 90) * Math.PI / 180)}
                      x2={558 + 15 * Math.cos((angle - 90) * Math.PI / 180)}
                      y2={362 + 15 * Math.sin((angle - 90) * Math.PI / 180)}
                      stroke="rgba(40,98,155,0.48)" stroke-width="2.5" stroke-linecap="round"
                    />
                  {/each}
                  <circle cx="558" cy="362" r="5" fill="rgba(25,38,55,0.65)" stroke="rgba(40,98,155,0.48)" stroke-width="0.6"/>
                  <circle cx="558" cy="362" r="2" fill="rgba(40,98,155,0.38)"/>
                </g>

                <!-- === LIVERY === -->
                <text x="340" y="314" font-family="'Bebas Neue', Impact, sans-serif" font-size="14" fill="rgba(40,98,155,0.40)" letter-spacing="5" font-weight="bold">BOAM RACING</text>
                <text x="195" y="285" font-family="'Bebas Neue', Impact, sans-serif" font-size="8" fill="rgba(40,98,155,0.22)" letter-spacing="2">UNIRAID 2026</text>
                <text x="436" y="306" font-family="'Bebas Neue', Impact, sans-serif" font-size="30" fill="rgba(40,98,155,0.12)" font-weight="bold">6</text>

                <!-- Dimension lines (technical drawing detail) -->
                <line x1="115" y1="416" x2="640" y2="416" stroke="rgba(40,98,155,0.07)" stroke-width="0.3" stroke-dasharray="3 3"/>
                <line x1="115" y1="412" x2="115" y2="420" stroke="rgba(40,98,155,0.08)" stroke-width="0.3"/>
                <line x1="640" y1="412" x2="640" y2="420" stroke="rgba(40,98,155,0.08)" stroke-width="0.3"/>
                <text x="377" y="424" text-anchor="middle" font-family="'Inter', system-ui, sans-serif" font-size="7" fill="rgba(40,98,155,0.10)">4.05m</text>
              </g>

              <!-- ===== INTERACTIVE ZONE OVERLAYS ===== -->
              {#each zones as zone}
                <path
                  d={zone.path}
                  fill={getZoneFill(zone)}
                  stroke={getZoneStroke(zone)}
                  stroke-width={getZoneStrokeWidth(zone)}
                  class="cursor-pointer zone-overlay"
                  role="button"
                  tabindex="0"
                  aria-label="Seleccionar zona: {zone.label}"
                  onmouseenter={() => hoveredZone = zone.id}
                  onmouseleave={() => hoveredZone = null}
                  onclick={() => selectZone(zone.id)}
                  onkeydown={(e) => { if (e.key === 'Enter') selectZone(zone.id); }}
                  filter={selectedZone === zone.id ? 'url(#glowZone)' : 'none'}
                />
              {/each}

              <!-- ===== ZONE PINS & CONNECTOR LINES ===== -->
              {#each zones as zone}
                {@const active = isZoneActive(zone)}
                {@const cfg = tierConfig[zone.tier]}
                {@const selected = selectedZone === zone.id}

                <!-- Connector line (pin to label) -->
                <line
                  x1={zone.pin.x}
                  y1={zone.pin.y}
                  x2={zone.labelAnchor.x}
                  y2={zone.labelAnchor.y}
                  stroke={active ? cfg.color : 'rgba(255,255,255,0.06)'}
                  stroke-width={active ? '1' : '0.5'}
                  stroke-dasharray={active ? 'none' : '3 3'}
                  class="connector-line"
                  style="transition: all 0.4s ease"
                />

                <!-- Pin on car -->
                <g filter={active ? 'url(#pinGlow)' : 'none'} class="cursor-pointer"
                  role="button"
                  tabindex="0"
                  aria-label="Seleccionar zona: {zone.label}"
                  onmouseenter={() => hoveredZone = zone.id}
                  onmouseleave={() => hoveredZone = null}
                  onclick={() => selectZone(zone.id)}
                  onkeydown={(e) => { if (e.key === 'Enter') selectZone(zone.id); }}
                >
                  <!-- Pulse ring (always visible, animates on active) -->
                  <circle
                    cx={zone.pin.x}
                    cy={zone.pin.y}
                    r={active ? 10 : 6}
                    fill="none"
                    stroke={cfg.color}
                    stroke-width="1"
                    opacity={active ? 0.5 : 0.15}
                    class={active ? 'pin-pulse' : ''}
                    style="transition: all 0.3s ease"
                  />
                  <!-- Pin dot -->
                  <circle
                    cx={zone.pin.x}
                    cy={zone.pin.y}
                    r={active ? 4.5 : 3}
                    fill={active ? cfg.color : 'rgba(255,255,255,0.25)'}
                    stroke={active ? 'white' : 'rgba(255,255,255,0.15)'}
                    stroke-width={active ? 1.5 : 0.5}
                    style="transition: all 0.3s ease"
                  />
                </g>

                <!-- Floating label at anchor point -->
                <g class="pointer-events-none" style="transition: opacity 0.3s ease" opacity={active ? 1 : 0.35}>
                  <!-- Label background -->
                  <rect
                    x={zone.labelAlign === 'left' ? zone.labelAnchor.x : zone.labelAnchor.x - 88}
                    y={zone.labelAnchor.y - 11}
                    width="88"
                    height="22"
                    rx="3"
                    fill={active ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.4)'}
                    stroke={active ? cfg.color : 'rgba(255,255,255,0.05)'}
                    stroke-width={active ? 1 : 0.5}
                    style="transition: all 0.3s ease"
                  />
                  <!-- Tier dot -->
                  <circle
                    cx={zone.labelAlign === 'left' ? zone.labelAnchor.x + 10 : zone.labelAnchor.x - 78}
                    cy={zone.labelAnchor.y}
                    r="2.5"
                    fill={cfg.color}
                    opacity={active ? 1 : 0.5}
                    style="transition: opacity 0.3s ease"
                  />
                  <!-- Label text -->
                  <text
                    x={zone.labelAlign === 'left' ? zone.labelAnchor.x + 20 : zone.labelAnchor.x - 68}
                    y={zone.labelAnchor.y + 3.5}
                    text-anchor="start"
                    fill={active ? 'white' : 'rgba(255,255,255,0.5)'}
                    font-size="9"
                    font-weight="600"
                    font-family="'Inter', system-ui, sans-serif"
                    letter-spacing="0.8"
                    style="transition: fill 0.3s ease"
                  >
                    {zone.label.toUpperCase()}
                  </text>
                </g>

                <!-- Uploaded logo preview -->
                {#if uploadedLogo && selectedZone === zone.id}
                  {@const pts = zone.path.match(/[\d.]+/g)?.map(Number) || []}
                  {@const cx = pts.filter((_,i) => i % 2 === 0).reduce((a,b) => a+b, 0) / (pts.length / 2)}
                  {@const cy = pts.filter((_,i) => i % 2 === 1).reduce((a,b) => a+b, 0) / (pts.length / 2)}
                  <image
                    href={uploadedLogo}
                    x={cx - 30 * logoScale}
                    y={cy - 22 * logoScale}
                    width={60 * logoScale}
                    height={44 * logoScale}
                    class="pointer-events-none"
                    preserveAspectRatio="xMidYMid meet"
                    opacity="0.9"
                  />
                {/if}
              {/each}
            </svg>

            <!-- Zone tier legend -->
            <div class="flex flex-wrap gap-5 mt-5 justify-center">
              {#each [
                { tier: 'premium', label: 'Premium' },
                { tier: 'standard', label: 'Standard' },
                { tier: 'basic', label: 'Basic' }
              ] as item}
                {@const cfg = tierConfig[item.tier as 'premium' | 'standard' | 'basic']}
                <div class="flex items-center gap-2 text-[11px]">
                  <span class="w-2.5 h-2.5 rounded-full" style="background: {cfg.color}; opacity: 0.7"></span>
                  <span class="text-white/30 tracking-wider">{item.label}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar: Zone details + uploader -->
      <div class="lg:col-span-4 space-y-4">
        <div class="animate-blur">
          <h3 class="font-heading text-base tracking-[0.2em] mb-3 text-white/40 uppercase">Zonas disponibles</h3>
          <div class="space-y-1.5">
            {#each zones as zone}
              {@const cfg = tierConfig[zone.tier]}
              {@const isSelected = selectedZone === zone.id}
              {@const isHovered = hoveredZone === zone.id}
              <button
                onclick={() => selectZone(zone.id)}
                onmouseenter={() => hoveredZone = zone.id}
                onmouseleave={() => hoveredZone = null}
                class="zone-card w-full text-left group relative"
                class:zone-card--active={isSelected}
                class:zone-card--hover={isHovered && !isSelected}
                data-hover
              >
                <!-- Tier accent bar -->
                <div
                  class="absolute left-0 top-0 bottom-0 w-[3px] rounded-l transition-all duration-300"
                  style="background: {cfg.color}; opacity: {isSelected ? 1 : isHovered ? 0.6 : 0.15}"
                ></div>

                <div class="pl-4 pr-3 py-3">
                  <div class="flex items-center justify-between">
                    <span class="font-heading text-[15px] tracking-wider transition-colors duration-200"
                      style="color: {isSelected ? cfg.color : isHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)'}"
                    >
                      {zone.label}
                    </span>
                    <span class="text-[9px] px-2 py-0.5 tracking-[0.15em] border rounded-sm transition-all duration-200"
                      style="color: {cfg.color}; border-color: {isSelected ? cfg.color : `${cfg.color}30`}; background: {isSelected ? `${cfg.color}15` : 'transparent'}"
                    >
                      {cfg.label}
                    </span>
                  </div>

                  {#if isSelected}
                    <div class="mt-2.5 space-y-1.5 text-[12px] text-white/50 leading-relaxed zone-detail-reveal">
                      <p>{zone.description}</p>
                      <p class="text-white/30">Tamaño aprox: <span style="color: {cfg.color}">{zone.size}</span></p>
                    </div>
                  {/if}
                </div>
              </button>
            {/each}
          </div>
        </div>

        <!-- Logo uploader -->
        {#if showUploader}
          <div class="uploader-panel space-y-4">
            <h3 class="font-heading text-sm tracking-[0.2em] text-boam-blue-light uppercase">Previsualiza tu logo</h3>

            {#if !uploadedLogo}
              <label class="upload-dropzone" data-hover>
                <svg class="w-8 h-8 text-boam-blue/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span class="text-xs text-white/40">Arrastra tu logo o haz clic</span>
                <span class="text-[10px] text-white/20">PNG o SVG con transparencia</span>
                <input
                  bind:this={fileInput}
                  type="file"
                  accept=".png,.svg,.webp"
                  class="hidden"
                  onchange={handleFile}
                />
              </label>
            {:else}
              <div class="space-y-3">
                <div class="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.05] rounded">
                  <img src={uploadedLogo} alt="Logo subido" class="w-12 h-12 object-contain" />
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-white/70">Logo cargado</p>
                    <p class="text-[10px] text-white/30 truncate">Zona: {getZoneById(selectedZone ?? '')?.label}</p>
                  </div>
                  <button
                    onclick={resetLogo}
                    class="text-white/20 hover:text-red-400 transition-colors p-1"
                    data-hover
                    aria-label="Eliminar logo"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div class="space-y-1.5">
                  <label for="logo-scale" class="text-[10px] text-white/25 tracking-wider uppercase">Escala</label>
                  <input
                    id="logo-scale"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    bind:value={logoScale}
                    class="w-full accent-boam-blue h-1"
                  />
                </div>
              </div>
            {/if}

            <a
              href="#contact"
              class="cta-button group flex items-center justify-center gap-2 w-full py-3.5 font-heading text-sm tracking-[0.2em] text-white uppercase"
              data-hover
            >
              <span>Solicitar presupuesto</span>
              <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  /* Car panel */
  .car-panel {
    background: linear-gradient(135deg, rgba(15,20,30,0.9), rgba(8,12,20,0.95));
    border: 1px solid rgba(255,255,255,0.04);
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.3),
      0 20px 60px -15px rgba(0,0,0,0.5),
      inset 0 1px 0 rgba(255,255,255,0.03);
  }

  /* Zone overlays */
  .zone-overlay {
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Connector lines */
  .connector-line {
    pointer-events: none;
  }

  /* Pin pulse animation */
  .pin-pulse {
    animation: pinPulse 2s ease-in-out infinite;
  }
  @keyframes pinPulse {
    0%, 100% { r: 8; opacity: 0.5; }
    50% { r: 13; opacity: 0.15; }
  }

  /* Zone cards */
  .zone-card {
    background: rgba(255,255,255,0.015);
    border: 1px solid rgba(255,255,255,0.03);
    border-radius: 4px;
    transition: all 0.25s ease;
    overflow: hidden;
  }
  .zone-card:hover {
    background: rgba(255,255,255,0.03);
    border-color: rgba(255,255,255,0.06);
  }
  .zone-card--active {
    background: rgba(40,98,155,0.08) !important;
    border-color: rgba(40,98,155,0.2) !important;
  }
  .zone-card--hover {
    background: rgba(255,255,255,0.035) !important;
    border-color: rgba(255,255,255,0.08) !important;
  }

  /* Zone detail reveal animation */
  .zone-detail-reveal {
    animation: detailReveal 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes detailReveal {
    from { opacity: 0; transform: translateY(-4px); max-height: 0; }
    to { opacity: 1; transform: translateY(0); max-height: 80px; }
  }

  /* Uploader panel */
  .uploader-panel {
    background: rgba(40,98,155,0.04);
    border: 1px solid rgba(40,98,155,0.12);
    border-radius: 6px;
    padding: 1.25rem;
    animation: fadeSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Upload dropzone */
  .upload-dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem;
    border: 1.5px dashed rgba(40,98,155,0.2);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.25s ease;
    background: transparent;
  }
  .upload-dropzone:hover {
    border-color: rgba(40,98,155,0.45);
    background: rgba(40,98,155,0.04);
  }

  /* CTA button */
  .cta-button {
    background: linear-gradient(135deg, #28629B, #1d4d7a);
    border-radius: 4px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  .cta-button::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.05), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .cta-button:hover {
    background: linear-gradient(135deg, #3a7fc4, #28629B);
    box-shadow: 0 4px 20px rgba(40,98,155,0.3);
  }
  .cta-button:hover::before {
    opacity: 1;
  }
</style>
