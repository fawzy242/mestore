/**
 * @typedef {'admin'|'manager'|'cashier'} Role
 * @typedef {'Active'|'Inactive'} UserStatus
 */

/**
 * @typedef {Object} User
 * @property {string|number} id
 * @property {string} name
 * @property {string} username
 * @property {Role} role
 * @property {UserStatus} status
 */

/**
 * @typedef {Object} UserPayload
 * @property {string} name
 * @property {string} username
 * @property {string} [password]
 * @property {Role} role
 * @property {UserStatus} status
 */

export {}