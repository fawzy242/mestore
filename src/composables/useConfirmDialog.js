import { ref } from 'vue'

/**
 * Controller for the shared ConfirmDialog component.
 * Usage:
 *   const { state, open, close } = useConfirmDialog()
 *   const ok = await open({ title, message, confirmLabel, variant })
 */
export function useConfirmDialog() {
  const isOpen = ref(false)
  const title = ref('')
  const message = ref('')
  const confirmLabel = ref('Confirm')
  const variant = ref('danger')

  /** @type {null | (() => void)} */
  let resolver = null

  function open(options) {
    title.value = options.title ?? 'Are you sure?'
    message.value = options.message ?? ''
    confirmLabel.value = options.confirmLabel ?? 'Confirm'
    variant.value = options.variant ?? 'danger'
    isOpen.value = true
    return new Promise((resolve) => {
      resolver = resolve
    })
  }

  function confirm() {
    isOpen.value = false
    if (resolver) resolver(true)
    resolver = null
  }

  function close() {
    isOpen.value = false
    if (resolver) resolver(false)
    resolver = null
  }

  return {
    state: { isOpen, title, message, confirmLabel, variant },
    open,
    confirm,
    close,
  }
}