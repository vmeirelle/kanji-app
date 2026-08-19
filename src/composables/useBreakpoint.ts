import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const DESKTOP_PX = 768 // matches the 48rem layout breakpoint

/** Reactive viewport size, narrowed to the one distinction the layout needs. */
export function useBreakpoint() {
  const width = ref(typeof window === 'undefined' ? DESKTOP_PX : window.innerWidth)
  const onResize = () => (width.value = window.innerWidth)

  onMounted(() => window.addEventListener('resize', onResize))
  onBeforeUnmount(() => window.removeEventListener('resize', onResize))

  const isDesktop = computed(() => width.value >= DESKTOP_PX)
  return { isDesktop }
}
