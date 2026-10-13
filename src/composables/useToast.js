import { useToast as usePrimeToast } from 'primevue/usetoast'

/**
 * Centralized toast service.
 *
 * Guarantees:
 *  - Only one Toast instance is mounted (in App.vue).
 *  - Severity is normalized to PrimeVue's allow-list.
 *  - Duplicate messages inside a short window are collapsed.
 *  - Long messages are truncated for readability.
 *  - Default lifetimes are consistent (2.5s success/info, 4s warn/error).
 *  - A default summary is always supplied so the toast has a visible title.
 */

const ALLOWED = new Set(['success', 'info', 'warn', 'error', 'secondary', 'contrast'])
const DEFAULT_LIFE = {
  success: 2500,
  info: 3000,
  warn: 4000,
  error: 4500,
  secondary: 3000,
  contrast: 3000,
}
const DEFAULT_SUMMARY = {
  success: 'Success',
  info: 'Info',
  warn: 'Warning',
  error: 'Error',
  secondary: 'Notice',
  contrast: 'Notice',
}
const MAX_LENGTH = 200
const DEDUPE_WINDOW = 1500

let seq = 0
const recentlyShown = new Map() // messageKey -> timestamp

function severityFor(input) {
  const s = String(input || 'success').toLowerCase()
  if (s === 'warning') return 'warn'
  if (ALLOWED.has(s)) return s
  return 'info'
}

function truncate(text) {
  const s = String(text ?? '')
  return s.length > MAX_LENGTH ? `${s.slice(0, MAX_LENGTH - 1)}…` : s
}

function dedupeKey(summary, detail, severity) {
  return `${severity}::${summary}::${detail}`
}

export function useToast() {
  const toast = usePrimeToast()

  function push(message, options = {}) {
    const severity = severityFor(options.severity)
    const summary = truncate(options.summary || DEFAULT_SUMMARY[severity] || 'Notice')
    const detail = truncate(message || '')
    const life = options.life ?? DEFAULT_LIFE[severity]

    // Dedupe identical toasts inside the window
    const key = dedupeKey(summary, detail, severity)
    const now = Date.now()
    const last = recentlyShown.get(key)
    if (last && now - last < DEDUPE_WINDOW) return
    recentlyShown.set(key, now)

    // Prune stale entries occasionally
    if (recentlyShown.size > 32) {
      for (const [k, t] of recentlyShown) {
        if (now - t > DEDUPE_WINDOW * 4) recentlyShown.delete(k)
      }
    }

    toast.add({
      id: ++seq,
      severity,
      summary,
      detail,
      life,
      group: options.group || 'default',
    })
  }

  const success = (message, summary = DEFAULT_SUMMARY.success) =>
    push(message, { severity: 'success', summary })
  const error = (message, summary = DEFAULT_SUMMARY.error) =>
    push(message, { severity: 'error', summary })
  const info = (message, summary = DEFAULT_SUMMARY.info) =>
    push(message, { severity: 'info', summary })
  const warn = (message, summary = DEFAULT_SUMMARY.warn) =>
    push(message, { severity: 'warn', summary })

  return { push, success, error, info, warn }
}