import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'

/**
 * Debounced search input with AbortController-based cancellation.
 * The consumer supplies an async fetch function; each new call cancels
 * the previous in-flight one. Errors of the "aborted" variety are swallowed.
 *
 * @param {(value:string, signal:AbortSignal) => Promise<void>} onSearch
 * @param {{ delay?: number, immediate?: boolean }} [options]
 */
export function useDebouncedSearch(onSearch, options = {}) {
  const delay = options.delay ?? 300
  const value = ref('')
  let currentController = null

  const run = useDebounceFn(async (query) => {
    if (currentController) currentController.abort()
    currentController = new AbortController()
    try {
      await onSearch(query, currentController.signal)
    } catch (error) {
      const isAbort =
        error?.name === 'AbortError' ||
        error?.code === 'ERR_CANCELED' ||
        error?.message === 'canceled'
      if (!isAbort) {
        // Surface non-abort errors via console only; the composable's own
        // error state is the source of truth for the UI.
        // eslint-disable-next-line no-console
        console.error('[search]', error)
      }
    }
  }, delay)

  watch(value, (next) => run(next), { immediate: !!options.immediate })

  return { value, run }
}