/**
 * Returns a unique, monotonically increasing identifier per call.
 * Used to generate `id` attributes that must remain stable across the
 * component's lifetime. This is a plain helper — it lives under the standard
 * composable namespace for consistency, but has no reactive state.
 */
let counter = 0

export function useUniqueId(prefix = 'uid') {
  counter += 1
  return `${prefix}-${counter}`
}