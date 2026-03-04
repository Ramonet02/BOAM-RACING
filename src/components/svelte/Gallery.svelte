<script lang="ts">
  interface Video {
    id: string;
    title: string;
    thumbnail: string;
    embedUrl: string;
  }

  // Placeholder videos — replace with actual BoamRacing content
  const videos: Video[] = [
    {
      id: '1',
      title: 'UniRaid 2025 - Highlights',
      thumbnail: '',
      embedUrl: ''
    },
    {
      id: '2',
      title: 'Preparación del vehículo',
      thumbnail: '',
      embedUrl: ''
    },
    {
      id: '3',
      title: 'Navegación en el desierto',
      thumbnail: '',
      embedUrl: ''
    },
    {
      id: '4',
      title: 'Entrega solidaria',
      thumbnail: '',
      embedUrl: ''
    }
  ];

  let activeVideo = $state<string | null>(null);

  function openVideo(id: string) {
    activeVideo = id;
  }

  function closeVideo() {
    activeVideo = null;
  }
</script>

<section id="gallery" class="relative py-32 overflow-hidden bg-gradient-to-b from-boam-black via-boam-gray-dark/10 to-boam-black">
  <!-- Decorative floating element -->
  <div class="absolute top-20 -right-32 w-96 h-96 rounded-full bg-boam-blue/3 blur-[100px] parallax-fast pointer-events-none"></div>

  <div class="mx-auto max-w-7xl px-6">
    <!-- Section header -->
    <div class="animate-reveal mb-20">
      <span class="text-boam-blue text-sm font-medium tracking-[0.3em] uppercase">Contenido</span>
      <h2 class="font-heading text-[clamp(2.5rem,6vw,5rem)] tracking-wider mt-2 leading-tight">
        GALERÍA Y<br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-boam-blue to-boam-blue-light">REDES SOCIALES</span>
      </h2>
    </div>

    <!-- Video grid -->
    <div class="grid sm:grid-cols-2 gap-6 mb-16 stagger-children">
      {#each videos as video}
        <button
          onclick={() => openVideo(video.id)}
          class="group relative aspect-video bg-boam-gray-dark/30 border border-boam-gray/10 overflow-hidden hover:border-boam-blue/30 transition-all duration-500"
          data-hover
        >
          <!-- Placeholder gradient -->
          <div class="absolute inset-0 bg-gradient-to-br from-boam-blue/10 to-boam-gray-dark/50 group-hover:from-boam-blue/20 transition-all duration-500"></div>

          <!-- Play button -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-16 h-16 rounded-full bg-boam-blue/80 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-boam-blue transition-all duration-300">
              <svg class="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>

          <!-- Title overlay -->
          <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-boam-black/80 to-transparent">
            <h3 class="font-heading text-lg tracking-wider text-boam-white">{video.title}</h3>
          </div>

          <!-- Corner accent -->
          <div class="absolute top-0 right-0 w-12 h-12">
            <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-boam-blue/50 group-hover:border-boam-blue transition-colors duration-300"></div>
          </div>
        </button>
      {/each}
    </div>

    <!-- Social Media Links -->
    <div class="animate-blur">
      <h3 class="font-heading text-2xl tracking-wider text-center mb-8">SÍGUENOS EN REDES</h3>
      <div class="flex flex-wrap justify-center gap-4">
        <!-- Instagram -->
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex items-center gap-3 px-6 py-4 border border-boam-gray/20 bg-boam-gray-dark/10 hover:border-pink-500/40 hover:bg-pink-500/5 transition-all duration-300"
          data-hover
        >
          <svg class="w-6 h-6 text-boam-gray group-hover:text-pink-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
          <span class="font-heading tracking-wider group-hover:text-pink-400 transition-colors">Instagram</span>
        </a>

        <!-- TikTok -->
        <a
          href="https://tiktok.com"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex items-center gap-3 px-6 py-4 border border-boam-gray/20 bg-boam-gray-dark/10 hover:border-cyan-400/40 hover:bg-cyan-400/5 transition-all duration-300"
          data-hover
        >
          <svg class="w-6 h-6 text-boam-gray group-hover:text-cyan-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.17V11.7a4.82 4.82 0 01-3.56-1.45V6.69h3.56z"/>
          </svg>
          <span class="font-heading tracking-wider group-hover:text-cyan-400 transition-colors">TikTok</span>
        </a>

        <!-- YouTube -->
        <a
          href="https://youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex items-center gap-3 px-6 py-4 border border-boam-gray/20 bg-boam-gray-dark/10 hover:border-red-500/40 hover:bg-red-500/5 transition-all duration-300"
          data-hover
        >
          <svg class="w-6 h-6 text-boam-gray group-hover:text-red-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span class="font-heading tracking-wider group-hover:text-red-500 transition-colors">YouTube</span>
        </a>

        <!-- Twitter/X -->
        <a
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex items-center gap-3 px-6 py-4 border border-boam-gray/20 bg-boam-gray-dark/10 hover:border-boam-white/40 hover:bg-boam-white/5 transition-all duration-300"
          data-hover
        >
          <svg class="w-6 h-6 text-boam-gray group-hover:text-boam-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span class="font-heading tracking-wider group-hover:text-boam-white transition-colors">X</span>
        </a>
      </div>
    </div>
  </div>

  <!-- Video lightbox -->
  {#if activeVideo}
    <div
      class="fixed inset-0 z-50 bg-boam-black/95 backdrop-blur-lg flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
    >
      <button
        onclick={closeVideo}
        class="absolute top-6 right-6 w-12 h-12 flex items-center justify-center text-boam-gray hover:text-boam-white transition-colors"
        data-hover
        aria-label="Cerrar vídeo"
      >
        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div class="w-full max-w-4xl aspect-video bg-boam-gray-dark/50 border border-boam-gray/20 flex items-center justify-center">
        <div class="text-center">
          <svg class="w-16 h-16 text-boam-blue mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <p class="font-heading text-xl tracking-wider text-boam-gray">Vídeo próximamente</p>
          <p class="text-sm text-boam-gray/60 mt-2">El contenido se añadirá cuando esté disponible</p>
        </div>
      </div>
    </div>
  {/if}
</section>
