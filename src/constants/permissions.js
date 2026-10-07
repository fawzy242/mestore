import { ROLE } from './roles.js'

export const ROUTE_PERMISSIONS = Object.freeze({
  dashboard: [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],

  pos: [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],

  'shift.open': [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],

  'products.list': [ROLE.ADMIN, ROLE.MANAGER],
  'products.detail': [ROLE.ADMIN, ROLE.MANAGER],

  'categories.list': [ROLE.ADMIN, ROLE.MANAGER],

  'stock.list': [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],

  'transactions.list': [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],
  'transactions.detail': [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],

  'shifts.list': [ROLE.ADMIN, ROLE.MANAGER],

  'suppliers.list': [ROLE.ADMIN, ROLE.MANAGER],
  'purchases.list': [ROLE.ADMIN, ROLE.MANAGER],
  'refunds.list': [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],
  'customers.list': [ROLE.ADMIN, ROLE.MANAGER],
  'discounts.list': [ROLE.ADMIN, ROLE.MANAGER],
  'cash-movements.list': [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],

  reports: [ROLE.ADMIN, ROLE.MANAGER],

  'users.list': [ROLE.ADMIN],
  'users.detail': [ROLE.ADMIN],

  forbidden: [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],
})

export function canAccessRoute(role, routeName) {
  const allowed = ROUTE_PERMISSIONS[routeName]
  if (!allowed) return true
  return allowed.includes(role)
}