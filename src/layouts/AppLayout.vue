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
  background: var(--bg);
}

.main-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.content-inner {
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 1023px) {
  .content {
    padding: 20px;
  }
}

@media (max-width: 767px) {
  .desktop-sidebar {
    display: none;
  }
  .content {
    padding: 16px;
  }
}
</style>