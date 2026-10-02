import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { ref, computed } from 'vue'

let toastSeq = 0

export const useUiStore = defineStore('ui', () => {
  /** Sidebar collapsed state — persisted across refreshes. */
  const sidebarCollapsed = useLocalStorage('posretail.sidebarCollapsed', false)

  /** Mobile off-canvas drawer state (not persisted — closes on navigation). */
  const mobileDrawerOpen = ref(false)

  /** Toast queue. */
  const toasts = ref([])

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function openMobileDrawer() {
    mobileDrawerOpen.value = true
  }

  function closeMobileDrawer() {
    mobileDrawerOpen.value = false
  }

  /** @param {string} message */
  function pushToast(message) {
    const id = ++toastSeq
    toasts.value.push({ id, message })
    setTimeout(() => dismissToast(id), 2200)
  }

  /** @param {number} id */
  function dismissToast(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const hasToasts = computed(() => toasts.value.length > 0)

  return {
    sidebarCollapsed,
    mobileDrawerOpen,
    toasts,
    hasToasts,
    toggleSidebar,
    openMobileDrawer,
    closeMobileDrawer,
    pushToast,
    dismissToast,
  }
})