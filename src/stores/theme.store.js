import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useLocalStorage, usePreferredDark } from '@vueuse/core'

export const useThemeStore = defineStore('theme', () => {
  const mode = useLocalStorage('mestore.theme', 'system')
  const systemDark = usePreferredDark()

  const isDark = computed(() => {
    if (mode.value === 'dark') return true
    if (mode.value === 'light') return false
    return systemDark.value
  })

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

  function cycle() {
    const order = ['light', 'dark', 'system']
    const i = order.indexOf(mode.value)
    setMode(order[(i + 1) % order.length])
  }

  // Re-apply whenever system preference changes and mode is 'system'
  watch([systemDark, mode], apply)

  return { mode, isDark, setMode, cycle, apply }
})