<script lang="ts">
  import Counter from './Counter.svelte';
</script>

<section id="about" class="relative py-32 overflow-hidden">
  <!-- Section accent -->
  <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-boam-blue to-transparent parallax-slow"></div>

  <!-- Floating decorative element -->
  <div class="absolute -right-20 top-20 w-64 h-64 rounded-full bg-boam-blue/3 blur-3xl parallax-fast pointer-events-none"></div>

  <div class="mx-auto max-w-7xl px-6">
    <!-- Section header -->
    <div class="animate-reveal mb-20">
      <span class="text-boam-blue text-sm font-medium tracking-[0.3em] uppercase">Quiénes somos</span>
      <h2 class="font-heading text-[clamp(2.5rem,6vw,5rem)] tracking-wider mt-2 leading-tight">
        MÁS QUE UNA<br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-boam-blue to-boam-blue-light">CARRERA</span>
      </h2>
    </div>

    <div class="grid lg:grid-cols-2 gap-16 items-start">
      <!-- Text content -->
      <div class="space-y-8">
        <div class="animate-blur">
          <h3 class="font-heading text-2xl tracking-wider text-boam-blue mb-4">LA AVENTURA</h3>
          <p class="text-boam-gray-light leading-relaxed">
            UniRaid es la mayor aventura raid solidaria universitaria de Europa.
            Más de 6000 km de ruta, atravesando España, Marruecos y el desierto del Sáhara.
            Sin GPS, solo brújula y roadbook. Una prueba de orientación, resistencia y cooperación
            que transforma a quienes la viven.
          </p>
        </div>

        <div class="animate-blur delay-200">
          <h3 class="font-heading text-2xl tracking-wider text-boam-blue mb-4">LA SOLIDARIDAD</h3>
          <p class="text-boam-gray-light leading-relaxed">
            Cada equipo transporta un mínimo de 40 kg de material solidario que se entrega
            directamente a comunidades del sur de Marruecos. En la última edición se repartieron
            más de 15 toneladas de suministros, incluyendo bicicletas, sillas de ruedas y material médico.
          </p>
        </div>

        <div class="animate-blur delay-400">
          <h3 class="font-heading text-2xl tracking-wider text-boam-blue mb-4">EL EQUIPO BOAM</h3>
          <p class="text-boam-gray-light leading-relaxed">
            Somos un equipo joven con una pasión desbordante por el motorsport y la aventura.
            Preparamos nuestro vehículo, buscamos sponsors y entrenamos para dar lo mejor
            de nosotros en el desierto. Tu apoyo nos acerca a la meta.
          </p>
        </div>
      </div>

      <!-- Stats & visual -->
      <div class="space-y-6" data-parallax="0.05">
        <!-- UniRaid info card -->
        <div class="animate-scale relative bg-gradient-to-br from-boam-blue/10 to-boam-gray-dark/50 border border-boam-blue/20 p-8 overflow-hidden glow-hover">
          <div class="absolute top-0 right-0 w-32 h-32 bg-boam-blue/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <h3 class="font-heading text-3xl tracking-wider mb-6">UNIRAID EN NÚMEROS</h3>
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-1">
              <Counter target={35} suffix="+" class="font-heading text-4xl text-boam-blue" />
              <p class="text-sm text-boam-gray">Años de experiencia</p>
            </div>
            <div class="space-y-1">
              <Counter target={15} suffix=" ton" class="font-heading text-4xl text-boam-blue" />
              <p class="text-sm text-boam-gray">Material solidario</p>
            </div>
            <div class="space-y-1">
              <Counter target={260} suffix="" class="font-heading text-4xl text-boam-blue" />
              <p class="text-sm text-boam-gray">Bicicletas entregadas</p>
            </div>
            <div class="space-y-1">
              <Counter target={2000} suffix=" kg" class="font-heading text-4xl text-boam-blue" />
              <p class="text-sm text-boam-gray">Material médico</p>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="animate-reveal relative pl-8 space-y-6 border-l border-boam-blue/30">
          <div class="relative">
            <div class="absolute -left-[2.3rem] top-1 w-4 h-4 rounded-full bg-boam-blue"></div>
            <h4 class="font-heading text-xl tracking-wider">PREPARACIÓN</h4>
            <p class="text-sm text-boam-gray">Preparación del vehículo, búsqueda de sponsors y entrenamiento físico.</p>
          </div>
          <div class="relative">
            <div class="absolute -left-[2.3rem] top-1 w-4 h-4 rounded-full bg-boam-blue/60"></div>
            <h4 class="font-heading text-xl tracking-wider">TRAVESÍA</h4>
            <p class="text-sm text-boam-gray">Salida desde España, cruce del estrecho y ruta por Marruecos hasta el desierto.</p>
          </div>
          <div class="relative">
            <div class="absolute -left-[2.3rem] top-1 w-4 h-4 rounded-full bg-boam-blue/40"></div>
            <h4 class="font-heading text-xl tracking-wider">DESIERTO</h4>
            <p class="text-sm text-boam-gray">Orientación con brújula y roadbook. Dunas, pistas y campamentos bajo las estrellas.</p>
          </div>
          <div class="relative">
            <div class="absolute -left-[2.3rem] top-1 w-4 h-4 rounded-full bg-boam-blue/20 ring-2 ring-boam-blue"></div>
            <h4 class="font-heading text-xl tracking-wider">SOLIDARIDAD</h4>
            <p class="text-sm text-boam-gray">Entrega de material a comunidades locales. El verdadero objetivo de la aventura.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
