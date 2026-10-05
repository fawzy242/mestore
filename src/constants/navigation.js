import { ROLE } from './roles.js'

/**
 * Sidebar items.
 * Products and Categories are now separate entries.
 */
export const NAV_ITEMS = Object.freeze([
  { routeName: 'dashboard', label: 'Dashboard', icon: 'IconDashboard' },
  { routeName: 'pos', label: 'POS / Sales', icon: 'IconCart' },
  { routeName: 'products.list', label: 'Products', icon: 'IconProducts' },
  { routeName: 'categories.list', label: 'Categories', icon: 'IconCategories' },
  { routeName: 'transactions.list', label: 'Transactions', icon: 'IconTransactions' },
  { routeName: 'reports', label: 'Reports', icon: 'IconReports' },
  { routeName: 'users.list', label: 'Users', icon: 'IconUsers' },
])

export const DEFAULT_LANDING_BY_ROLE = Object.freeze({
  [ROLE.ADMIN]: 'dashboard',
  [ROLE.MANAGER]: 'dashboard',
  [ROLE.CASHIER]: 'dashboard',
})