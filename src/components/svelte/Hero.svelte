<script lang="ts">
  import { onMount } from 'svelte';

  let loaded = $state(false);
  let scrollY = $state(0);

  onMount(() => {
    loaded = true;
    const handleScroll = () => { scrollY = window.scrollY; };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });

  function scrollToSection() {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  }

  // Computed parallax opacity: hero fades out as you scroll
  let heroOpacity = $derived(Math.max(0, 1 - scrollY / 800));
</script>

<section id="hero" class="relative min-h-screen flex items-center justify-center overflow-hidden noise-bg">
  <!-- Scroll progress bar -->
  <div id="scroll-progress" class="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-boam-blue to-boam-blue-light z-[60]" style="width: 0%;"></div>

  <!-- Animated background grid -->
  <div class="absolute inset-0 opacity-10" style="transform: translateY({scrollY * 0.3}px)">
    <div class="absolute inset-0" style="
      background-image:
        linear-gradient(rgba(40,98,155,0.3) 1px, transparent 1px),
        linear-gradient(90deg, rgba(40,98,155,0.3) 1px, transparent 1px);
      background-size: 60px 60px;
    "></div>
  </div>

  <!-- Floating particles effect -->
  <div class="absolute inset-0 pointer-events-none overflow-hidden">
    <div class="absolute w-2 h-2 rounded-full bg-boam-blue/20 animate-pulse" style="top: 20%; left: 15%; transform: translateY({scrollY * 0.2}px)"></div>
    <div class="absolute w-1.5 h-1.5 rounded-full bg-boam-blue/15 animate-pulse" style="top: 60%; left: 80%; animation-delay: 0.5s; transform: translateY({scrollY * 0.1}px)"></div>
    <div class="absolute w-1 h-1 rounded-full bg-boam-blue/25 animate-pulse" style="top: 40%; left: 55%; animation-delay: 1s; transform: translateY({scrollY * 0.25}px)"></div>
    <div class="absolute w-2 h-2 rounded-full bg-boam-blue/10 animate-pulse" style="top: 75%; left: 35%; animation-delay: 1.5s; transform: translateY({scrollY * 0.15}px)"></div>
  </div>

  <!-- Diagonal racing stripe -->
  <div
    class="absolute top-0 right-0 w-[40vw] h-full bg-gradient-to-bl from-boam-blue/20 to-transparent -skew-x-12 origin-top-right transition-transform duration-1000"
    class:translate-x-0={loaded}
    class:translate-x-full={!loaded}
    style="transform: skewX(-12deg) translateY({scrollY * 0.1}px)"
  ></div>

  <!-- Secondary diagonal stripe -->
  <div
    class="absolute top-0 right-[12vw] w-[8vw] h-full bg-gradient-to-bl from-boam-blue/8 to-transparent -skew-x-12 origin-top-right transition-all duration-1000 delay-200"
    class:opacity-100={loaded}
    class:opacity-0={!loaded}
    style="transform: skewX(-12deg) translateY({scrollY * 0.05}px)"
  ></div>

  <!-- Decorative number -->
  <div
    class="absolute -right-10 top-1/2 font-heading text-[30vw] text-boam-blue/5 leading-none select-none pointer-events-none"
    style="transform: translateY(calc(-50% + {scrollY * 0.15}px)); opacity: {heroOpacity}"
  >
    06
  </div>

  <!-- Corner accents -->
  <div class="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-boam-blue/20 transition-all duration-1000 delay-[1500ms]"
    class:opacity-100={loaded}
    class:opacity-0={!loaded}
  ></div>
  <div class="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-boam-blue/20 transition-all duration-1000 delay-[1500ms]"
    class:opacity-100={loaded}
    class:opacity-0={!loaded}
  ></div>

  <!-- Main content -->
  <div class="relative z-10 mx-auto max-w-7xl px-6 w-full" style="opacity: {heroOpacity}">
    <div class="flex flex-col items-start gap-8">
      <!-- Overline -->
      <div
        class="flex items-center gap-3 transition-all duration-700 delay-300"
        class:opacity-100={loaded}
        class:opacity-0={!loaded}
        class:translate-y-0={loaded}
        class:translate-y-4={!loaded}
      >
        <span class="w-12 h-px bg-boam-blue"></span>
        <span class="text-boam-blue text-sm font-medium tracking-[0.3em] uppercase">UniRaid 2026 / Marruecos</span>
      </div>

      <!-- Title -->
      <h1 class="font-heading tracking-wider leading-[0.85]">
        <span
          class="block text-[clamp(3rem,12vw,10rem)] text-boam-white transition-all duration-700 delay-500"
          class:opacity-100={loaded}
          class:opacity-0={!loaded}
          class:translate-y-0={loaded}
          class:translate-y-8={!loaded}
        >
          BOAM
        </span>
        <span
          class="block text-[clamp(3rem,12vw,10rem)] text-transparent bg-clip-text bg-gradient-to-r from-boam-blue to-boam-blue-light transition-all duration-700 delay-700"
          class:opacity-100={loaded}
          class:opacity-0={!loaded}
          class:translate-y-0={loaded}
          class:translate-y-8={!loaded}
        >
          RACING
        </span>
      </h1>

      <!-- Subtitle -->
      <p
        class="max-w-lg text-lg text-boam-gray-light leading-relaxed transition-all duration-700 delay-[900ms]"
        class:opacity-100={loaded}
        class:opacity-0={!loaded}
        class:translate-y-0={loaded}
        class:translate-y-4={!loaded}
      >
        Aventura, solidaridad y motorsport. Somos un equipo juvenil rumbo al
        desierto de Marruecos en la mayor aventura raid universitaria de Europa.
      </p>

      <!-- CTAs -->
      <div
        class="flex flex-wrap gap-4 transition-all duration-700 delay-[1100ms]"
        class:opacity-100={loaded}
        class:opacity-0={!loaded}
        class:translate-y-0={loaded}
        class:translate-y-4={!loaded}
      >
        <a
          href="#sponsors"
          class="group relative inline-flex items-center gap-2 bg-boam-blue px-8 py-4 font-heading text-lg tracking-widest text-white uppercase overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-boam-blue/30"
          data-hover
        >
          <span class="absolute inset-0 bg-boam-blue-light translate-y-full group-hover:translate-y-0 transition-transform duration-500"></span>
          <span class="relative">Patrocinar</span>
          <svg class="relative w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
        <a
          href="#about"
          class="group inline-flex items-center gap-2 border border-boam-gray/30 px-8 py-4 font-heading text-lg tracking-widest text-boam-gray-light uppercase hover:border-boam-blue hover:text-boam-white transition-all duration-300"
          data-hover
        >
          Descubrir
        </a>
      </div>

      <!-- Stats bar -->
      <div
        class="flex flex-wrap gap-8 mt-8 pt-8 border-t border-boam-gray/20 transition-all duration-700 delay-[1300ms]"
        class:opacity-100={loaded}
        class:opacity-0={!loaded}
      >
        <div class="flex flex-col">
          <span class="font-heading text-3xl text-boam-blue">6000+</span>
          <span class="text-xs text-boam-gray tracking-wider uppercase">km de ruta</span>
        </div>
        <div class="flex flex-col">
          <span class="font-heading text-3xl text-boam-blue">40kg</span>
          <span class="text-xs text-boam-gray tracking-wider uppercase">Material solidario</span>
        </div>
        <div class="flex flex-col">
          <span class="font-heading text-3xl text-boam-blue">10</span>
          <span class="text-xs text-boam-gray tracking-wider uppercase">Días de aventura</span>
        </div>
        <div class="flex flex-col">
          <span class="font-heading text-3xl text-boam-blue">0</span>
          <span class="text-xs text-boam-gray tracking-wider uppercase">GPS permitidos</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Scroll indicator -->
  <button
    onclick={scrollToSection}
    class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-boam-gray transition-all duration-700 delay-[1500ms]"
    class:opacity-100={loaded}
    class:opacity-0={!loaded}
    data-hover
  >
    <span class="text-xs tracking-[0.3em] uppercase">Scroll</span>
    <div class="relative w-6 h-10 border-2 border-boam-gray/30 rounded-full flex justify-center">
      <div class="w-1 h-2.5 bg-boam-blue rounded-full mt-1.5 animate-bounce"></div>
    </div>
  </button>
</section>
