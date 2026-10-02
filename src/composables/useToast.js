import { useToast as usePrimeToast } from 'primevue/usetoast'

/**
 * Thin wrapper over PrimeVue's toast service. Keeps the same `push(message)`
 * signature used across the app so call sites don't change.
 */
export function useToast() {
  const toast = usePrimeToast()

  function push(message, options = {}) {
    toast.add({
      severity: options.severity || 'success',
      summary: options.summary || '',
      detail: message,
      life: options.life ?? 2500,
    })
  }

  function success(message, summary = 'Success') {
    push(message, { severity: 'success', summary })
  }
  function error(message, summary = 'Error') {
    push(message, { severity: 'error', summary, life: 4000 })
  }
  function info(message, summary = 'Info') {
    push(message, { severity: 'info', summary })
  }
  function warn(message, summary = 'Warning') {
    push(message, { severity: 'warn', summary })
  }

  return { push, success, error, info, warn }
}