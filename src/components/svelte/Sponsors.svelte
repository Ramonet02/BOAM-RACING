<script lang="ts">
  import Counter from './Counter.svelte';

  interface Tier {
    name: string;
    price: string;
    color: string;
    borderColor: string;
    bgColor: string;
    zones: string[];
    perks: string[];
    highlight?: boolean;
  }

  const tiers: Tier[] = [
    {
      name: 'BRONCE',
      price: 'Desde 100€',
      color: 'text-amber-700',
      borderColor: 'border-amber-700/30',
      bgColor: 'bg-amber-700/5',
      zones: ['Logo en zona Basic (Techo)'],
      perks: [
        'Logo en redes sociales',
        'Mención en comunicaciones',
        'Certificado de colaboración'
      ]
    },
    {
      name: 'PLATA',
      price: 'Desde 300€',
      color: 'text-gray-300',
      borderColor: 'border-gray-300/30',
      bgColor: 'bg-gray-300/5',
      zones: ['Logo en zona Standard', 'Aleta trasera o portón'],
      perks: [
        'Todo lo de Bronce',
        'Logo en camiseta del equipo',
        'Contenido de vídeo personalizado',
        'Reportaje fotográfico del raid'
      ]
    },
    {
      name: 'ORO',
      price: 'Desde 600€',
      color: 'text-amber-400',
      borderColor: 'border-amber-400/40',
      bgColor: 'bg-amber-400/5',
      zones: ['Logo en zona Premium', 'Puerta o Capó'],
      perks: [
        'Todo lo de Plata',
        'Logo prominente en vehículo',
        'Vídeo dedicado al sponsor',
        'Presencia en todos los materiales',
        'Story highlights permanentes'
      ],
      highlight: true
    },
    {
      name: 'TÍTULO',
      price: 'Consultar',
      color: 'text-boam-blue-light',
      borderColor: 'border-boam-blue/40',
      bgColor: 'bg-boam-blue/5',
      zones: ['Naming del equipo', 'Logo principal en capó + laterales'],
      perks: [
        'Todo lo de Oro',
        'Naming: "BOAM Racing by [Sponsor]"',
        'Presencia protagonista total',
        'Asistencia VIP al evento',
        'Colaboración estratégica a largo plazo'
      ]
    }
  ];

  let hoveredTier = $state<number | null>(null);
</script>

<section id="sponsors" class="relative py-32 overflow-hidden">
  <!-- Background accents - animated dividers -->
  <div class="absolute top-0 left-0 right-0 animated-divider"></div>
  <div class="absolute bottom-0 left-0 right-0 animated-divider"></div>

  <!-- Floating glow -->
  <div class="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-boam-blue/4 blur-[100px] parallax-slow pointer-events-none"></div>

  <div class="mx-auto max-w-7xl px-6">
    <!-- Section header -->
    <div class="animate-reveal text-center mb-8">
      <span class="text-boam-blue text-sm font-medium tracking-[0.3em] uppercase">Patrocinio</span>
      <h2 class="font-heading text-[clamp(2.5rem,6vw,5rem)] tracking-wider mt-2">
        FORMA PARTE DE LA<br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-boam-blue to-boam-blue-light">AVENTURA</span>
      </h2>
      <p class="text-boam-gray-light mt-4 max-w-2xl mx-auto">
        Tu marca en nuestro coche recorrerá más de 6.000 km a través de España y Marruecos.
        Visibilidad real, impacto social y una historia que contar.
      </p>
    </div>

    <!-- Impact numbers -->
    <div class="animate-blur flex flex-wrap justify-center gap-12 mb-20 py-8">
      <div class="text-center">
        <Counter target={6000} suffix="+" class="font-heading text-5xl text-boam-blue" />
        <p class="text-sm text-boam-gray mt-1">km de exposición</p>
      </div>
      <div class="text-center">
        <Counter target={10} suffix="" class="font-heading text-5xl text-boam-blue" />
        <p class="text-sm text-boam-gray mt-1">días de visibilidad</p>
      </div>
      <div class="text-center">
        <Counter target={500} suffix="+" class="font-heading text-5xl text-boam-blue" />
        <p class="text-sm text-boam-gray mt-1">participantes del raid</p>
      </div>
      <div class="text-center">
        <Counter target={50} suffix="K+" class="font-heading text-5xl text-boam-blue" />
        <p class="text-sm text-boam-gray mt-1">alcance en RRSS</p>
      </div>
    </div>

    <!-- Pricing tiers -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
      {#each tiers as tier, i}
        <div
          class="relative group border p-6 transition-all duration-500 hover:-translate-y-2
            {tier.highlight ? `${tier.borderColor} ${tier.bgColor} ring-1 ring-amber-400/20` : `${tier.borderColor} ${tier.bgColor}`}
            {hoveredTier === i ? 'border-opacity-100' : ''}"
          role="article"
          onmouseenter={() => hoveredTier = i}
          onmouseleave={() => hoveredTier = null}
          data-hover
        >
          {#if tier.highlight}
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-400 text-boam-black text-xs font-bold tracking-wider">
              POPULAR
            </div>
          {/if}

          <div class="mb-6">
            <h3 class="font-heading text-2xl tracking-widest {tier.color}">{tier.name}</h3>
            <p class="font-heading text-3xl mt-2">{tier.price}</p>
          </div>

          <!-- Zones -->
          <div class="mb-4 space-y-1">
            {#each tier.zones as zone}
              <div class="flex items-start gap-2 text-sm">
                <svg class="w-4 h-4 {tier.color} mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span class="text-boam-gray-light">{zone}</span>
              </div>
            {/each}
          </div>

          <div class="h-px bg-boam-gray/10 my-4"></div>

          <!-- Perks -->
          <ul class="space-y-2 mb-8">
            {#each tier.perks as perk}
              <li class="flex items-start gap-2 text-sm text-boam-gray">
                <span class="{tier.color}">+</span>
                <span>{perk}</span>
              </li>
            {/each}
          </ul>

          <!-- CTA -->
          <a
            href="#contact"
            class="block w-full text-center py-3 border {tier.borderColor} font-heading tracking-widest text-sm {tier.color} hover:bg-boam-blue hover:border-boam-blue hover:text-white transition-all duration-300"
            data-hover
          >
            CONTACTAR
          </a>

          <!-- Bottom accent line -->
          <div class="absolute bottom-0 left-0 h-0.5 {hoveredTier === i ? 'w-full' : 'w-0'} transition-all duration-500"
            style="background: linear-gradient(90deg, transparent, {'var(--color-boam-blue)'}, transparent)"></div>
        </div>
      {/each}
    </div>

    <!-- Additional note -->
    <div class="animate-blur text-center mt-12">
      <p class="text-boam-gray text-sm">
        Todos los paquetes son personalizables. ¿Tienes una propuesta diferente?
        <a href="#contact" class="text-boam-blue hover:text-boam-blue-light underline underline-offset-4 transition-colors" data-hover>
          Hablemos
        </a>
      </p>
    </div>
  </div>
</section>
