import { useThemeStore } from '@/stores/theme.store.js'

export function useTheme() {
  const theme = useThemeStore()
  return {
    mode: theme.mode,
    isDark: theme.isDark,
    setMode: theme.setMode,
    cycle: theme.cycle,
  }
}