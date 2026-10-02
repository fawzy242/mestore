import { COPY } from '@/constants/copy.js'

/**
 * Normalize any thrown value into a consistent AppError shape.
 * Consumers (composables, stores) only ever see this shape — never raw Axios errors.
 *
 * @param {unknown} error
 * @returns {import('@/types/api.js').AppError}
 */
export function normalizeApiError(error) {
  // Already normalized
  if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
    return /** @type {any} */ (error)
  }

  // Network error — no response reached us
  if (error && typeof error === 'object' && error.code === 'ERR_NETWORK') {
    return makeError('network', COPY.errors.network, null, error)
  }

  // Timeout
  if (error && typeof error === 'object' && error.code === 'ECONNABORTED') {
    return makeError('timeout', COPY.errors.timeout, null, error)
  }

  const response = error?.response
  if (!response) {
    return makeError('unknown', COPY.errors.unknown, null, error)
  }

  const { status, data } = response

  if (status === 401) return makeError('auth', COPY.errors.forbidden, null, error)
  if (status === 403) return makeError('forbidden', COPY.errors.forbidden, null, error)
  if (status === 404) return makeError('not_found', COPY.errors.notFound, null, error)
  if (status >= 500) return makeError('server', COPY.errors.server, null, error)

  if (status === 400 || status === 422) {
    const message = data?.message || 'Please check the highlighted fields.'
    const fieldErrors = extractFieldErrors(data)
    return makeError('validation', message, fieldErrors, error)
  }

  return makeError('unknown', data?.message || COPY.errors.unknown, null, error)
}

/**
 * @param {any} data
 * @returns {Record<string, string>|null}
 */
function extractFieldErrors(data) {
  if (!data) return null
  if (data.errors && typeof data.errors === 'object') return data.errors
  if (data.fieldErrors && typeof data.fieldErrors === 'object') return data.fieldErrors
  return null
}

/**
 * @param {import('@/types/api.js').AppErrorStatus} status
 * @param {string} message
 * @param {Record<string, string>|null} fieldErrors
 * @param {unknown} raw
 * @returns {import('@/types/api.js').AppError}
 */
function makeError(status, message, fieldErrors, raw) {
  return { status, message, fieldErrors: fieldErrors || undefined, raw }
}