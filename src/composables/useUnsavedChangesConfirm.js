import { useConfirmDialog } from './useConfirmDialog.js'

/**
 * Wrap a navigation action with a "Discard changes?" confirmation.
 * Called by feature forms when their vee-validate `isDirty` (or local
 * dirty flag) is true. Flagged in the .md §12.5 as pending product
 * sign-off — the entire behavior can be disabled by making this composable
 * a no-op if the product decision is "no".
 */
export function useUnsavedChangesConfirm() {
  const { state, open } = useConfirmDialog()

  async function confirmDiscard(isDirty) {
    if (!isDirty) return true
    return open({
      title: 'Discard changes?',
      message: 'You have unsaved changes. Leaving this page will lose them.',
      confirmLabel: 'Discard',
      variant: 'danger',
    })
  }

  return { state, confirmDiscard }
}