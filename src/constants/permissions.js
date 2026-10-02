import { ROLE } from './roles.js'

/**
 * Route-level permission matrix.
 * Single source of truth — imported by both the router guard and the sidebar.
 * Route names here must match the `name` field in router/routes.js exactly.
 */
export const ROUTE_PERMISSIONS = Object.freeze({
  dashboard: [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],

  pos: [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],
  'pos.payment': [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],
  'pos.success': [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],

  'products.list': [ROLE.ADMIN, ROLE.MANAGER],
  'products.new': [ROLE.ADMIN, ROLE.MANAGER],
  'products.detail': [ROLE.ADMIN, ROLE.MANAGER],
  'products.edit': [ROLE.ADMIN, ROLE.MANAGER],

  'categories.list': [ROLE.ADMIN, ROLE.MANAGER],
  'categories.new': [ROLE.ADMIN, ROLE.MANAGER],
  'categories.edit': [ROLE.ADMIN, ROLE.MANAGER],

  'transactions.list': [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],
  'transactions.detail': [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],

  reports: [ROLE.ADMIN, ROLE.MANAGER],

  'users.list': [ROLE.ADMIN],
  'users.new': [ROLE.ADMIN],
  'users.detail': [ROLE.ADMIN],
  'users.edit': [ROLE.ADMIN],

  'shift.open': [ROLE.CASHIER],
  'shift.close': [ROLE.CASHIER],

  forbidden: [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],
})

/**
 * Check whether a role is permitted to open a named route.
 * @param {string} role
 * @param {string} routeName
 * @returns {boolean}
 */
export function canAccessRoute(role, routeName) {
  const allowed = ROUTE_PERMISSIONS[routeName]
  if (!allowed) return true
  return allowed.includes(role)
}