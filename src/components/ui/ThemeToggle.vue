<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme.store.js'
import AppIcon from './AppIcon.vue'

const theme = useThemeStore()

const iconName = computed(() => (theme.isDark ? 'light-mode' : 'dark-mode'))
const label = computed(() => (theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'))
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="label"
    :title="label"
    @click="theme.toggle"
  >
    <AppIcon :name="iconName" :size="18" />
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
}

.theme-toggle:hover {
  background: var(--surface-hover);
  color: var(--text);
  border-color: var(--border-strong);
}

.theme-toggle:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-ring);
}
</style>