import { ROLE } from './roles.js'

export const NAV_ITEMS = Object.freeze([
  { routeName: 'dashboard', label: 'Dashboard' },
  { routeName: 'pos', label: 'POS / Sales' },
  { routeName: 'products.list', label: 'Products' },
  { routeName: 'categories.list', label: 'Categories' },
  { routeName: 'stock.list', label: 'Product Stock' },
  { routeName: 'transactions.list', label: 'Transactions' },
  { routeName: 'shifts.list', label: 'Shift Management' },
  { routeName: 'suppliers.list', label: 'Suppliers' },
  { routeName: 'purchases.list', label: 'Purchases' },
  { routeName: 'refunds.list', label: 'Refunds' },
  { routeName: 'customers.list', label: 'Customers' },
  { routeName: 'discounts.list', label: 'Discounts & Promos' },
  { routeName: 'cash-movements.list', label: 'Cash In / Out' },
  { routeName: 'reports', label: 'Reports' },
  { routeName: 'users.list', label: 'Users' },
])

export const DEFAULT_LANDING_BY_ROLE = Object.freeze({
  [ROLE.ADMIN]: 'dashboard',
  [ROLE.MANAGER]: 'dashboard',
  [ROLE.CASHIER]: 'dashboard',
})