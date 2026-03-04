<script lang="ts">
  let name = $state('');
  let email = $state('');
  let company = $state('');
  let message = $state('');
  let interest = $state('');
  let submitted = $state(false);
  let sending = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    sending = true;

    // Simulate form submission — replace with actual endpoint
    await new Promise(resolve => setTimeout(resolve, 1500));

    submitted = true;
    sending = false;
  }
</script>

<section id="contact" class="relative py-32 overflow-hidden bg-gradient-to-b from-boam-black via-boam-gray-dark/5 to-boam-black">
  <!-- Decorative glow -->
  <div class="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-boam-blue/3 blur-[120px] parallax-fast pointer-events-none"></div>

  <div class="mx-auto max-w-7xl px-6">
    <div class="grid lg:grid-cols-2 gap-16">
      <!-- Left: Info -->
      <div class="animate-slide-left">
        <span class="text-boam-blue text-sm font-medium tracking-[0.3em] uppercase">Contacto</span>
        <h2 class="font-heading text-[clamp(2.5rem,6vw,4rem)] tracking-wider mt-2 leading-tight">
          ¿LISTO PARA<br />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-boam-blue to-boam-blue-light">RODAR CON NOSOTROS?</span>
        </h2>
        <p class="text-boam-gray-light mt-6 leading-relaxed">
          Cuéntanos sobre tu marca y te prepararemos una propuesta personalizada
          con la mejor ubicación para tu logo en nuestro coche.
        </p>

        <div class="mt-12 space-y-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-boam-blue/10 border border-boam-blue/20 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-boam-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-boam-gray">Email</p>
              <p class="text-boam-white">contacto@boamracing.com</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-boam-blue/10 border border-boam-blue/20 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-boam-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-boam-gray">Ubicación</p>
              <p class="text-boam-white">España</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-boam-blue/10 border border-boam-blue/20 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-boam-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-boam-gray">Próximo Raid</p>
              <p class="text-boam-white">Octubre 2026 · Marruecos</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Form -->
      <div class="animate-slide-right">
        {#if submitted}
          <div class="h-full flex items-center justify-center border border-boam-blue/20 bg-boam-blue/5 p-12">
            <div class="text-center space-y-4">
              <div class="w-16 h-16 rounded-full bg-boam-blue/20 border border-boam-blue/40 flex items-center justify-center mx-auto">
                <svg class="w-8 h-8 text-boam-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 class="font-heading text-3xl tracking-wider">¡MENSAJE ENVIADO!</h3>
              <p class="text-boam-gray-light">Te responderemos lo antes posible. ¡Gracias por tu interés en BOAM Racing!</p>
            </div>
          </div>
        {:else}
          <form onsubmit={handleSubmit} class="space-y-5 border border-boam-gray/10 bg-boam-gray-dark/10 p-8">
            <div class="grid sm:grid-cols-2 gap-5">
              <div class="space-y-2">
                <label for="name" class="text-xs text-boam-gray tracking-wider uppercase">Nombre *</label>
                <input
                  id="name"
                  type="text"
                  bind:value={name}
                  required
                  class="w-full bg-boam-black/50 border border-boam-gray/20 px-4 py-3 text-boam-white placeholder-boam-gray/40 focus:border-boam-blue focus:outline-none transition-colors"
                  placeholder="Tu nombre"
                />
              </div>
              <div class="space-y-2">
                <label for="email" class="text-xs text-boam-gray tracking-wider uppercase">Email *</label>
                <input
                  id="email"
                  type="email"
                  bind:value={email}
                  required
                  class="w-full bg-boam-black/50 border border-boam-gray/20 px-4 py-3 text-boam-white placeholder-boam-gray/40 focus:border-boam-blue focus:outline-none transition-colors"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label for="company" class="text-xs text-boam-gray tracking-wider uppercase">Empresa / Marca</label>
              <input
                id="company"
                type="text"
                bind:value={company}
                class="w-full bg-boam-black/50 border border-boam-gray/20 px-4 py-3 text-boam-white placeholder-boam-gray/40 focus:border-boam-blue focus:outline-none transition-colors"
                placeholder="Nombre de tu empresa"
              />
            </div>

            <div class="space-y-2">
              <label for="interest" class="text-xs text-boam-gray tracking-wider uppercase">¿Qué plan te interesa?</label>
              <select
                id="interest"
                bind:value={interest}
                class="w-full bg-boam-black/50 border border-boam-gray/20 px-4 py-3 text-boam-white focus:border-boam-blue focus:outline-none transition-colors"
              >
                <option value="" class="bg-boam-black">Seleccionar...</option>
                <option value="bronce" class="bg-boam-black">Bronce (desde 100€)</option>
                <option value="plata" class="bg-boam-black">Plata (desde 300€)</option>
                <option value="oro" class="bg-boam-black">Oro (desde 600€)</option>
                <option value="titulo" class="bg-boam-black">Título (consultar)</option>
                <option value="otro" class="bg-boam-black">Otra propuesta</option>
              </select>
            </div>

            <div class="space-y-2">
              <label for="message" class="text-xs text-boam-gray tracking-wider uppercase">Mensaje *</label>
              <textarea
                id="message"
                bind:value={message}
                required
                rows="4"
                class="w-full bg-boam-black/50 border border-boam-gray/20 px-4 py-3 text-boam-white placeholder-boam-gray/40 focus:border-boam-blue focus:outline-none transition-colors resize-none"
                placeholder="Cuéntanos tu propuesta o pregunta..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={sending}
              class="group relative w-full bg-boam-blue py-4 font-heading text-lg tracking-widest text-white uppercase overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-boam-blue/30 disabled:opacity-50"
              data-hover
            >
              <span class="absolute inset-0 bg-boam-blue-light translate-y-full group-hover:translate-y-0 transition-transform duration-500"></span>
              <span class="relative flex items-center justify-center gap-2">
                {#if sending}
                  <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span>Enviando...</span>
                {:else}
                  <span>Enviar mensaje</span>
                  <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                {/if}
              </span>
            </button>
          </form>
        {/if}
      </div>
    </div>
  </div>
</section>
