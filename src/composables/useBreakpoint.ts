import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const DESKTOP_PX = 768

export function useBreakpoint() {
  const width = ref(typeof window === 'undefined' ? DESKTOP_PX : window.innerWidth)
  const onResize = () => (width.value = window.innerWidth)

  onMounted(() => window.addEventListener('resize', onResize))
  onBeforeUnmount(() => window.removeEventListener('resize', onResize))

  const isDesktop = computed(() => width.value >= DESKTOP_PX)
  return { isDesktop }
}
