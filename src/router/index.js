import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes.js'
import { useAuthStore } from '@/stores/auth.store.js'
import { useShift } from '@/features/shift/composables/useShift.js'
import { ROUTE_PERMISSIONS } from '@/constants/permissions.js'
import { ROLE } from '@/constants/roles.js'

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.initialized) {
    await auth.restoreSession()
  }

  if (to.meta.public) return true

  if (!auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  const permitted = ROUTE_PERMISSIONS[to.name]
  if (permitted && !permitted.includes(auth.role)) {
    return { name: 'forbidden' }
  }

  if (
    to.meta.requiresOpenShift &&
    auth.role === ROLE.CASHIER &&
    !useShift().hasOpenShift.value
  ) {
    return { name: 'shift.open' }
  }

  return true
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — RetailPOS` : 'RetailPOS'
})

export default router