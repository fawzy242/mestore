import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useLocalStorage, usePreferredDark } from '@vueuse/core'

export const useThemeStore = defineStore('theme', () => {
  // Persisted mode: 'light' | 'dark'. Defaults to system preference on first load.
  const systemDark = usePreferredDark()
  const mode = useLocalStorage('mestore.theme', systemDark.value ? 'dark' : 'light')

  const isDark = computed(() => mode.value === 'dark')

  function apply() {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark')
      html.setAttribute('data-theme', 'dark')
    } else {
      html.classList.remove('dark')
      html.setAttribute('data-theme', 'light')
    }
  }

  function setMode(next) {
    mode.value = next
    apply()
  }

  // Toggle flips between light and dark in a single call
  function toggle() {
    setMode(isDark.value ? 'light' : 'dark')
    return mode.value
  }

  watch(mode, apply)

  return { mode, isDark, setMode, toggle, apply }
})