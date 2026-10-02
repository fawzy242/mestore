<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import SidebarNav from './SidebarNav.vue'
import { useUiStore } from '@/stores/ui.store.js'

const ui = useUiStore()
const route = useRoute()
const drawerRef = ref(null)
let previouslyFocused = null

function close() {
  ui.closeMobileDrawer()
}

function handleClickOutside(event) {
  if (!ui.mobileDrawerOpen) return
  if (drawerRef.value && !drawerRef.value.contains(event.target)) close()
}

function handleKeydown(event) {
  if (event.key === 'Escape') close()
}

watch(
  () => route.fullPath,
  () => close(),
)

watch(
  () => ui.mobileDrawerOpen,
  (open) => {
    if (open) {
      previouslyFocused = document.activeElement
      document.addEventListener('keydown', handleKeydown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = ''
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus()
      previouslyFocused = null
    }
  },
)

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Transition name="drawer-fade">
    <div v-if="ui.mobileDrawerOpen" class="overlay">
      <div
        ref="drawerRef"
        class="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        <SidebarNav drawer />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 45;
  display: flex;
}

.drawer {
  max-width: 90vw;
  height: 100%;
  display: flex;
  overflow: hidden;
}

.drawer :deep(.sidebar) {
  width: var(--sidebar-w);
}

.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.18s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
</style>