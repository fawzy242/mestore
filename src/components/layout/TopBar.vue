<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '@/stores/ui.store.js'
import AppIcon from '@/components/ui/AppIcon.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import ProfileMenu from './ProfileMenu.vue'
import TopBarClock from './TopBarClock.vue'

const route = useRoute()
const ui = useUiStore()

const title = computed(() => route.meta?.title || 'MeStore')
</script>

<template>
  <header class="topbar">
    <button
      type="button"
      class="menu-btn"
      :aria-label="ui.mobileDrawerOpen ? 'Close navigation' : 'Open navigation'"
      :aria-expanded="ui.mobileDrawerOpen"
      @click="ui.mobileDrawerOpen ? ui.closeMobileDrawer() : ui.openMobileDrawer()"
    >
      <AppIcon name="menu" :size="20" />
    </button>

    <h1 class="title">{{ title }}</h1>

    <div v-if="$slots.context" class="context">
      <slot name="context" />
    </div>

    <div class="topbar-actions">
      <TopBarClock />
      <ThemeToggle />
      <ProfileMenu />
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: var(--topbar-h);
  flex-shrink: 0;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 30;
  transition: background-color 150ms ease, border-color 150ms ease;
  padding-top: env(safe-area-inset-top, 0px);
  height: calc(var(--topbar-h) + env(safe-area-inset-top, 0px));
}

.title {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text);
}

.context {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-btn {
  display: none;
  padding: 6px;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
}
.menu-btn:hover {
  background: var(--surface-hover);
  color: var(--text);
}

@media (max-width: 767px) {
  .menu-btn {
    display: inline-flex;
  }
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .topbar {
    padding: 0 12px;
    padding-top: env(safe-area-inset-top, 0px);
    height: calc(56px + env(safe-area-inset-top, 0px));
    gap: 10px;
  }
  .title {
    font-size: 15px;
  }
}
</style>