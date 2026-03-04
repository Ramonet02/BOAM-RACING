<script lang="ts">
  const year = new Date().getFullYear();
</script>

<footer class="relative border-t border-boam-gray/10 py-16 bg-boam-black">
  <div class="mx-auto max-w-7xl px-6">
    <div class="grid md:grid-cols-3 gap-12 mb-12 animate-on-scroll">
      <!-- Brand -->
      <div>
        <div class="mb-4">
          <span class="font-heading text-3xl tracking-widest text-boam-white">BOAM</span>
          <span class="font-heading text-3xl tracking-widest text-boam-blue">RACING</span>
        </div>
        <p class="text-sm text-boam-gray leading-relaxed max-w-xs">
          Escudería juvenil participante en UniRaid.
          Aventura, solidaridad y motorsport en el desierto de Marruecos.
        </p>
      </div>

      <!-- Quick links -->
      <div>
        <h4 class="font-heading text-lg tracking-wider text-boam-gray-light mb-4">NAVEGACIÓN</h4>
        <nav class="flex flex-col gap-2">
          {#each [
            { href: '#hero', label: 'Inicio' },
            { href: '#about', label: 'Nosotros' },
            { href: '#car', label: 'El Coche' },
            { href: '#team', label: 'Equipo' },
            { href: '#gallery', label: 'Galería' },
            { href: '#sponsors', label: 'Patrocinio' },
            { href: '#contact', label: 'Contacto' }
          ] as link}
            <a
              href={link.href}
              class="text-sm text-boam-gray hover:text-boam-blue transition-colors duration-300 w-fit"
              data-hover
            >
              {link.label}
            </a>
          {/each}
        </nav>
      </div>

      <!-- UniRaid -->
      <div>
        <h4 class="font-heading text-lg tracking-wider text-boam-gray-light mb-4">UNIRAID</h4>
        <p class="text-sm text-boam-gray leading-relaxed mb-4">
          La mayor aventura raid solidaria universitaria de Europa.
          Más de 35 años de experiencia en el desierto.
        </p>
        <a
          href="https://www.uniraid.org/en/"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 text-sm text-boam-blue hover:text-boam-blue-light transition-colors duration-300"
          data-hover
        >
          <span>Visitar web oficial</span>
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-boam-gray/10">
      <p class="text-xs text-boam-gray">
        &copy; {year} BOAM Racing. Todos los derechos reservados.
      </p>
      <div class="flex items-center gap-1 text-xs text-boam-gray">
        <span>Hecho con</span>
        <svg class="w-3 h-3 text-boam-blue" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/>
        </svg>
        <span>para la aventura</span>
      </div>
    </div>
  </div>
</footer>
