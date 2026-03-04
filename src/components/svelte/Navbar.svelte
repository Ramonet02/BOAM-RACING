<script lang="ts">
  import { onMount } from 'svelte';

  let scrolled = $state(false);
  let menuOpen = $state(false);
  let activeSection = $state('hero');

  const navItems = [
    { id: 'hero', label: 'Inicio' },
    { id: 'about', label: 'Nosotros' },
    { id: 'car', label: 'El Coche' },
    { id: 'team', label: 'Equipo' },
    { id: 'gallery', label: 'Galería' },
    { id: 'sponsors', label: 'Patrocinio' },
    { id: 'contact', label: 'Contacto' },
  ];

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      menuOpen = false;
    }
  }

  onMount(() => {
    const handleScroll = () => {
      scrolled = window.scrollY > 50;

      const sections = navItems.map(item => ({
        id: item.id,
        el: document.getElementById(item.id)
      })).filter(s => s.el);

      for (let i = sections.length - 1; i >= 0; i--) {
        const rect = sections[i].el!.getBoundingClientRect();
        if (rect.top <= 150) {
          activeSection = sections[i].id;
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

<nav
  class="fixed top-0 left-0 right-0 z-50 transition-all duration-500 {scrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-md shadow-lg shadow-[#28629B]/10' : ''}"
>
  <div class="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
    <!-- Logo -->
    <button onclick={() => scrollTo('hero')} class="relative z-50 group" data-hover>
      <span class="font-heading text-2xl tracking-widest text-boam-white group-hover:text-boam-blue transition-colors duration-300">
        BOAM
      </span>
      <span class="font-heading text-2xl tracking-widest text-boam-blue group-hover:text-boam-white transition-colors duration-300">
        RACING
      </span>
    </button>

    <!-- Desktop Nav -->
    <div class="hidden lg:flex items-center gap-1">
      {#each navItems as item}
        <button
          onclick={() => scrollTo(item.id)}
          class="relative px-4 py-2 text-sm font-medium tracking-wide uppercase transition-colors duration-300 {activeSection === item.id ? 'text-boam-blue' : 'text-boam-gray-light hover:text-boam-white'}"
          data-hover
        >
          {item.label}
          {#if activeSection === item.id}
            <span class="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-boam-blue rounded-full"></span>
          {/if}
        </button>
      {/each}
    </div>

    <!-- Mobile Menu Toggle -->
    <button
      onclick={() => menuOpen = !menuOpen}
      class="relative z-50 lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
      data-hover
      aria-label="Menu"
    >
      <span
        class="block w-6 h-0.5 bg-boam-white transition-all duration-300 origin-center {menuOpen ? 'rotate-45 translate-y-2' : ''}"
      ></span>
      <span
        class="block w-6 h-0.5 bg-boam-white transition-all duration-300 {menuOpen ? 'opacity-0' : ''}"
      ></span>
      <span
        class="block w-6 h-0.5 bg-boam-white transition-all duration-300 origin-center {menuOpen ? '-rotate-45 -translate-y-2' : ''}"
      ></span>
    </button>
  </div>

  <!-- Mobile Menu -->
  {#if menuOpen}
    <div
      class="fixed inset-0 bg-[#0a0a0a]/98 backdrop-blur-xl z-40 flex items-center justify-center lg:hidden"
    >
      <div class="flex flex-col items-center gap-6">
        {#each navItems as item, i}
          <button
            onclick={() => scrollTo(item.id)}
            class="font-heading text-4xl tracking-widest uppercase text-boam-gray-light hover:text-boam-blue transition-colors duration-300"
            style="animation: fade-up 0.5s {0.1 + i * 0.08}s var(--ease-out-expo) both"
            data-hover
          >
            {item.label}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</nav>
