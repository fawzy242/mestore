import { ROLE } from './roles.js'

export const ROUTE_PERMISSIONS = Object.freeze({
  dashboard: [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],

  pos: [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],
  'pos.payment': [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],
  'pos.success': [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],

  'products.list': [ROLE.ADMIN, ROLE.MANAGER],
  'products.detail': [ROLE.ADMIN, ROLE.MANAGER],

  'categories.list': [ROLE.ADMIN, ROLE.MANAGER],

  'transactions.list': [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],
  'transactions.detail': [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],

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