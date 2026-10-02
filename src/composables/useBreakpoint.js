import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'

export function useBreakpoint() {
  const isDesktop = useMediaQuery('(min-width: 1200px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1199px)')
  const isMobile = useMediaQuery('(max-width: 767px)')

  return {
    isDesktop: computed(() => isDesktop.value),
    isTablet: computed(() => isTablet.value),
    isMobile: computed(() => isMobile.value),
  }
}