import { ROLE } from './roles.js'

/**
 * Sidebar items.
 * `roles` is intentionally duplicated from ROUTE_PERMISSIONS — but sourced from
 * the same permission matrix via a small helper at render time (SidebarNav).
 * Here we only declare *which routes* appear in the sidebar and their visual identity.
 */
export const NAV_ITEMS = Object.freeze([
  { routeName: 'dashboard', label: 'Dashboard', icon: 'IconDashboard' },
  { routeName: 'pos', label: 'POS / Sales', icon: 'IconCart' },
  { routeName: 'products.list', label: 'Products', icon: 'IconProducts' },
  { routeName: 'transactions.list', label: 'Transactions', icon: 'IconTransactions' },
  { routeName: 'reports', label: 'Reports', icon: 'IconReports' },
  { routeName: 'users.list', label: 'Users', icon: 'IconUsers' },
])

export const DEFAULT_LANDING_BY_ROLE = Object.freeze({
  [ROLE.ADMIN]: 'dashboard',
  [ROLE.MANAGER]: 'dashboard',
  [ROLE.CASHIER]: 'shift.open',
})