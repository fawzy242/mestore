import { normalizeApiError } from '@/services/http/apiError.js'

/**
 * Public wrapper around apiError normalization for composables that
 * prefer to catch locally and translate to a toast/banner.
 */
export function useAppError() {
  return { normalize: normalizeApiError }
}