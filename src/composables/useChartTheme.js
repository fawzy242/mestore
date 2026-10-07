import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useThemeStore } from '@/stores/theme.store.js'

/**
 * Returns the resolved color values from CSS custom properties on the
 * current document. Chart.js draws on a <canvas>, which cannot read
 * CSS variables — so we read them once at runtime and pass the literal
 * hex strings to Chart.js config.
 *
 * Recomputes whenever the app theme toggles, so charts adapt live
 * when the user switches light/dark mode.
 */
export function useChartTheme() {
  const theme = useThemeStore()
  const tick = ref(0)

  function readVar(name, fallback = '#000000') {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim()
    return value || fallback
  }

  const tokens = computed(() => {
    // depend on theme.mode so this recomputes on toggle
    void theme.mode
    void tick.value
    return {
      text: readVar('--text', '#18181B'),
      textMuted: readVar('--text-muted', '#71717A'),
      textFaint: readVar('--text-faint', '#A1A1AA'),
      border: readVar('--border', '#E4E4E7'),
      primary: readVar('--primary', '#C8102E'),
      primaryTint: readVar('--primary-tint', '#FEF2F2'),
      warning: readVar('--warning', '#B45309'),
      success: readVar('--success', '#15803D'),
      surface: readVar('--surface', '#FFFFFF'),
      surfaceAlt: readVar('--surface-alt', '#FAFAFA'),
    }
  })

  // Force a recompute right after the DOM updates the theme attribute.
  function refresh() {
    requestAnimationFrame(() => {
      tick.value++
    })
  }

  onMounted(() => {
    refresh()
  })

  // Watch theme mode so the token object always reflects the current theme.
  const stop = theme.$subscribe?.((_mutation, state) => {
    void state
    refresh()
  })

  onBeforeUnmount(() => {
    if (typeof stop === 'function') stop()
  })

  return { tokens, refresh }
}