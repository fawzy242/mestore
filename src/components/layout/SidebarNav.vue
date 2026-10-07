<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store.js'
import { useUiStore } from '@/stores/ui.store.js'
import { useToast } from '@/composables/useToast.js'
import { useBreakpoint } from '@/composables/useBreakpoint.js'
import { useConfirm } from '@/composables/useConfirm.js'
import { NAV_ITEMS } from '@/constants/navigation.js'
import { canAccessRoute } from '@/constants/permissions.js'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps({
  drawer: { type: Boolean, default: false },
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const { push } = useToast()
const { isTablet } = useBreakpoint()
const { confirmAction } = useConfirm()

const visibleItems = computed(() =>
  NAV_ITEMS.filter((item) => canAccessRoute(auth.role, item.routeName)),
)

const collapsed = computed(() => {
  if (props.drawer) return false
  return ui.sidebarCollapsed
})

// Route name → Material Symbols icon name (via Iconify)
const iconMap = {
  dashboard: 'dashboard',
  pos: 'shopping-cart',
  'products.list': 'inventory-2',
  'categories.list': 'category',
  'stock.list': 'warehouse',
  'transactions.list': 'receipt-long',
  'shifts.list': 'schedule',
  'suppliers.list': 'local-shipping',
  'purchases.list': 'shopping-basket',
  'refunds.list': 'assignment-return',
  'customers.list': 'group',
  'discounts.list': 'sell',
  'cash-movements.list': 'payments',
  reports: 'bar-chart',
  'users.list': 'badge',
}

function isActive(name) {
  return (
    route.name === name ||
    (route.name && name.includes('.') && route.name.split('.')[0] === name.split('.')[0])
  )
}

function go(name) {
  router.push({ name })
  if (props.drawer) ui.closeMobileDrawer()
}

async function askLogout() {
  await confirmAction({
    header: 'Logout?',
    message: 'Are you sure you want to logout?',
    acceptLabel: 'Logout',
    rejectLabel: 'Cancel',
    variant: 'danger',
    accept: async () => {
      await auth.logout()
      push('Logged out')
      router.push({ name: 'login' })
    },
  })
}

onMounted(() => {
  if (props.drawer) return
  if (isTablet.value && localStorage.getItem('mestore.sidebarCollapsed') === null) {
    ui.sidebarCollapsed = true
  }
})
</script>

<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="sidebar-header">
      <div class="brand">
        <div class="brand-mark">M</div>
        <div v-if="!collapsed" class="brand-name">MeStore</div>
      </div>
      <button
        v-if="!drawer"
        class="toggle-btn"
        type="button"
        title="Toggle sidebar"
        aria-label="Toggle sidebar"
        @click="ui.toggleSidebar"
      >
        <AppIcon name="menu" :size="20" />
      </button>
    </div>

    <nav class="nav">
      <button
        v-for="item in visibleItems"
        :key="item.routeName"
        type="button"
        class="nav-item"
        :class="{ active: isActive(item.routeName) }"
        @click="go(item.routeName)"
      >
        <AppIcon :name="iconMap[item.routeName] || 'circle'" :size="20" />
        <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
      </button>
    </nav>

    <div class="sidebar-footer">
      <button type="button" class="nav-item" @click="askLogout">
        <AppIcon name="logout" :size="20" />
        <span v-if="!collapsed" class="nav-label">Logout</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-w);
  background: var(--sidebar-bg);
  color: var(--sidebar-fg);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  transition: width 180ms ease;
  padding-top: env(safe-area-inset-top, 0px);
}

.sidebar.collapsed {
  width: var(--sidebar-w-collapsed);
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid var(--sidebar-border);
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
}

.brand-mark {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: #fff;
  color: var(--sidebar-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
  flex-shrink: 0;
}

.brand-name {
  font-weight: 700;
  font-size: 15px;
  white-space: nowrap;
}

.toggle-btn {
  margin-left: auto;
  padding: 6px;
  border-radius: var(--radius-sm);
  color: #fff;
  opacity: 0.85;
  background: transparent;
  display: inline-flex;
  border: none;
  cursor: pointer;
}

.sidebar.collapsed .toggle-btn {
  margin-left: 0;
}

.toggle-btn:hover {
  background: var(--sidebar-hover-bg);
  opacity: 1;
}

.nav {
  padding: 10px 8px;
  flex: 1;
  overflow-y: auto;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 11px 12px;
  margin-bottom: 2px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--sidebar-fg-muted);
  font-size: 14px;
  font-family: inherit;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  position: relative;
  transition: background 120ms;
  cursor: pointer;
}

.nav-item:hover {
  background: var(--sidebar-hover-bg);
  color: #fff;
}

.nav-item.active {
  background: var(--sidebar-active-bg);
  color: #fff;
  font-weight: 500;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: #fff;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 11px 0;
}

.sidebar-footer {
  padding: 8px;
  border-top: 1px solid var(--sidebar-border);
}
</style>