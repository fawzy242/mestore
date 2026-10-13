<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import SidebarNav from '@/components/layout/SidebarNav.vue'
import TopBar from '@/components/layout/TopBar.vue'
import MobileDrawer from '@/components/layout/MobileDrawer.vue'
import { useUiStore } from '@/stores/ui.store.js'

const ui = useUiStore()
const route = useRoute()

watch(
  () => route.fullPath,
  () => ui.closeMobileDrawer(),
)
</script>

<template>
  <div class="app-layout">
    <SidebarNav class="desktop-sidebar" />
    <div class="main-column">
      <TopBar />
      <main class="content">
        <div class="content-inner">
          <router-view />
        </div>
      </main>
    </div>
    <MobileDrawer />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100%;
  min-height: 100vh;
  background: var(--bg);
  /* Guard against any transient horizontal overflow */
  overflow-x: clip;
  width: 100%;
}

.main-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* allow inner flex children to shrink */
}

.content {
  flex: 1;
  overflow-y: auto;
  overflow-x: clip;
  padding: 24px;
  /* Ensure the scroll container can't push the layout wider */
  min-width: 0;
}

.content-inner {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

/* --- Tablet --- */
@media (max-width: 1023px) {
  .content {
    padding: 20px;
  }
}

/* --- Mobile --- */
@media (max-width: 767px) {
  .desktop-sidebar {
    display: none;
  }
  .content {
    padding: 16px;
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  }
}

@media (max-width: 480px) {
  .content {
    padding: 12px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  }
}
</style>