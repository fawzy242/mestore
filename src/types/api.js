/**
 * @typedef {Object} PaginatedResult
 * @property {Array} items
 * @property {number} total
 * @property {number} page
 * @property {number} pageSize
 */

/**
 * @typedef {Object} ListParams
 * @property {string} [search]
 * @property {number} [page]
 * @property {number} [pageSize]
 * @property {string} [sort]
 */

/**
 * @typedef {'network'|'timeout'|'validation'|'auth'|'forbidden'|'not_found'|'server'|'unknown'} AppErrorStatus
 */

/**
 * @typedef {Object} AppError
 * @property {AppErrorStatus} status
 * @property {string} message
 * @property {Record<string, string>} [fieldErrors]
 * @property {unknown} [raw]
 */

export {}