import { ref } from 'vue'
import { normalizeApiError } from '@/services/http/apiError.js'

/**
 * Generic async state wrapper for one-off fetches.
 * Returns `{ data, loading, error, run, reset }`.
 *
 * @template T
 * @param {() => Promise<T>} fn
 * @param {{ immediate?: boolean, initial?: T }} [options]
 */
export function useAsyncState(fn, options = {}) {
  const data = ref(options.initial ?? null)
  const loading = ref(false)
  const error = ref(null)

  async function run(...args) {
    loading.value = true
    error.value = null
    try {
      const result = await fn(...args)
      data.value = result
      return result
    } catch (err) {
      error.value = normalizeApiError(err)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  function reset() {
    data.value = options.initial ?? null
    error.value = null
    loading.value = false
  }

  if (options.immediate) {
    // Fire and forget; callers can await `run()` explicitly if needed.
    run()
  }

  return { data, loading, error, run, reset }
}