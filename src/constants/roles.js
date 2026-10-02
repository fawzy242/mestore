/**
 * Canonical role identifiers.
 * The values here MUST match the strings returned by the backend's user payload.
 * @type {Readonly<{ ADMIN: 'admin', MANAGER: 'manager', CASHIER: 'cashier' }>}
 */
export const ROLE = Object.freeze({
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
})

export const ALL_ROLES = Object.freeze([ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER])