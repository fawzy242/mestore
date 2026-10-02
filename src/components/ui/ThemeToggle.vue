<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme.store.js'
import AppIcon from './AppIcon.vue'

const theme = useThemeStore()

const currentIcon = computed(() => {
  if (theme.mode === 'light') return 'light-mode'
  if (theme.mode === 'dark') return 'dark-mode'
  return 'brightness-auto'
})

const label = computed(() => {
  if (theme.mode === 'light') return 'Light'
  if (theme.mode === 'dark') return 'Dark'
  return 'System'
})
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="`Theme: ${label}. Click to cycle.`"
    :title="`Theme: ${label}`"
    @click="theme.cycle()"
  >
    <AppIcon :name="currentIcon" :size="18" />
  </button>
</template>

<style scoped>
.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 120ms, color 120ms;
}
.theme-toggle:hover {
  background: var(--surface-hover);
  color: var(--text);
}
</style>