<script lang="ts">
  interface Member {
    name: string;
    role: string;
    bio: string;
    initials: string;
  }

  const members: Member[] = [
    {
      name: 'Miembro 1',
      role: 'Piloto',
      bio: 'Apasionado del motorsport y la aventura off-road. Experiencia en rutas 4x4 y orientación.',
      initials: 'P1'
    },
    {
      name: 'Miembro 2',
      role: 'Copiloto / Navegante',
      bio: 'Experto en cartografía y orientación con brújula. El cerebro detrás de cada decisión en ruta.',
      initials: 'C1'
    },
    {
      name: 'Miembro 3',
      role: 'Mecánico / Logística',
      bio: 'Conocimiento profundo del vehículo y logística del equipo. Preparación técnica y repuestos.',
      initials: 'M1'
    },
    {
      name: 'Miembro 4',
      role: 'Comunicación / RRSS',
      bio: 'Storytelling visual del equipo. Captura cada momento del raid para sponsors y seguidores.',
      initials: 'CM'
    }
  ];

  let hoveredMember = $state<number | null>(null);
</script>

<section id="team" class="relative py-32 overflow-hidden">
  <!-- Background accent -->
  <div class="absolute top-1/2 -translate-y-1/2 -left-40 w-80 h-80 rounded-full bg-boam-blue/5 blur-3xl parallax-slow pointer-events-none"></div>
  <div class="absolute top-1/3 -right-40 w-80 h-80 rounded-full bg-boam-blue/3 blur-3xl parallax-fast pointer-events-none"></div>

  <!-- Large decorative number -->
  <div class="absolute left-6 top-1/2 -translate-y-1/2 font-heading text-[20vw] text-boam-blue/3 leading-none select-none pointer-events-none parallax-slow">04</div>

  <div class="mx-auto max-w-7xl px-6">
    <!-- Section header -->
    <div class="animate-reveal text-center mb-20">
      <span class="text-boam-blue text-sm font-medium tracking-[0.3em] uppercase">El equipo</span>
      <h2 class="font-heading text-[clamp(2.5rem,6vw,5rem)] tracking-wider mt-2">
        QUIÉN <span class="text-transparent bg-clip-text bg-gradient-to-r from-boam-blue to-boam-blue-light">CONDUCE</span>
      </h2>
      <p class="text-boam-gray-light mt-4 max-w-xl mx-auto">
        Un equipo joven, comprometido y con ganas de comerse el desierto.
      </p>
    </div>

    <!-- Team grid -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
      {#each members as member, i}
        <div
          class="group relative border border-boam-gray/10 bg-boam-gray-dark/10 p-6 transition-all duration-500 hover:border-boam-blue/30 hover:bg-boam-blue/5 hover:-translate-y-2"
          role="article"
          onmouseenter={() => hoveredMember = i}
          onmouseleave={() => hoveredMember = null}
          data-hover
        >
          <!-- Number badge -->
          <div class="absolute -top-3 -right-3 w-8 h-8 bg-boam-blue flex items-center justify-center font-heading text-sm text-white">
            {String(i + 1).padStart(2, '0')}
          </div>

          <!-- Avatar placeholder -->
          <div class="w-20 h-20 rounded-full bg-gradient-to-br from-boam-blue/30 to-boam-blue/10 border border-boam-blue/20 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-500">
            <span class="font-heading text-2xl text-boam-blue tracking-wider">{member.initials}</span>
          </div>

          <!-- Info -->
          <div class="text-center">
            <h3 class="font-heading text-xl tracking-wider group-hover:text-boam-blue-light transition-colors duration-300">{member.name}</h3>
            <span class="text-sm text-boam-blue tracking-wider uppercase">{member.role}</span>
            <p class="mt-3 text-sm text-boam-gray leading-relaxed">{member.bio}</p>
          </div>

          <!-- Decorative line -->
          <div class="absolute bottom-0 left-0 h-0.5 bg-boam-blue transition-all duration-500 {hoveredMember === i ? 'w-full' : 'w-0'}"></div>
        </div>
      {/each}
    </div>
  </div>
</section>
