<script lang="ts">
  import { onMount } from 'svelte';

  let x = $state(0);
  let y = $state(0);
  let isHovering = $state(false);
  let isVisible = $state(false);
  let isMobile = $state(true);

  onMount(() => {
    isMobile = window.matchMedia('(pointer: coarse)').matches;
    if (isMobile) return;

    const handleMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!isVisible) isVisible = true;
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [data-hover], input, textarea, [role="button"]')) {
        isHovering = true;
      }
    };

    const handleOut = () => {
      isHovering = false;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseover', handleOver);
    window.addEventListener('mouseout', handleOut);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseover', handleOver);
      window.removeEventListener('mouseout', handleOut);
    };
  });
</script>

{#if !isMobile && isVisible}
  <div
    class="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-difference"
    style="transform: translate({x - (isHovering ? 24 : 6)}px, {y - (isHovering ? 24 : 6)}px)"
  >
    <div
      class="rounded-full bg-white transition-all duration-300 ease-out"
      class:w-3={!isHovering}
      class:h-3={!isHovering}
      class:w-12={isHovering}
      class:h-12={isHovering}
      class:opacity-80={isHovering}
    ></div>
  </div>
{/if}
