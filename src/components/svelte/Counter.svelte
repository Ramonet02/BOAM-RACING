<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    target: number;
    suffix?: string;
    class?: string;
    duration?: number;
  }

  let { target, suffix = '', class: className = '', duration = 2000 }: Props = $props();

  let current = $state(0);
  let visible = $state(false);
  let el: HTMLElement;

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !visible) {
          visible = true;
          animateCount();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  });

  function animateCount() {
    const start = performance.now();
    function frame(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      // Ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      current = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
</script>

<span bind:this={el} class={className}>
  {current.toLocaleString('es-ES')}{suffix}
</span>
