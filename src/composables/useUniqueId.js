let counter = 0

/**
 * Returns a stable unique ID string for a component instance.
 * Used to link <label for> with its input, and aria-describedby with error text.
 *
 * Replaces Vue's built-in `useId` (3.5+) with a hand-rolled version so the
 * app works on Vue 3.4 too.
 */
export function useUniqueId(prefix = 'uid') {
  return `${prefix}-${++counter}`
}