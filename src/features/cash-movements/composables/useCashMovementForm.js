import { reactive, ref } from 'vue'
import * as cashService from '@/services/api/cashMovements.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

function blankForm() {
  return {
    type: 'in',
    amount: 0,
    reason: '',
    user: '',
    shiftRef: '',
  }
}

export function useCashMovementForm(id = null) {
  const isEdit = Boolean(id)
  const isSubmitting = ref(false)
  const isLoading = ref(false)
  const error = ref(null)
  const fieldErrors = reactive({})

  const form = reactive(blankForm())

  function clearFieldErrors() {
    Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])
  }

  async function load() {
    if (!isEdit) return
    isLoading.value = true
    error.value = null
    clearFieldErrors()
    try {
      const move = await cashService.getCashMovementById(id)
      Object.assign(form, move)
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      isLoading.value = false
    }
  }

  function validate() {
    clearFieldErrors()
    let ok = true
    if (!form.amount || form.amount <= 0) {
      fieldErrors.amount = 'Amount must be greater than 0'
      ok = false
    }
    if (!form.reason.trim()) {
      fieldErrors.reason = 'Reason is required'
      ok = false
    }
    return ok
  }

  async function submit() {
    error.value = null
    if (!validate()) return null
    isSubmitting.value = true
    try {
      return isEdit
        ? await cashService.updateCashMovement(id, { ...form })
        : await cashService.createCashMovement({ ...form })
    } catch (err) {
      error.value = normalizeApiError(err)
      return null
    } finally {
      isSubmitting.value = false
    }
  }

  function reset() {
    Object.assign(form, blankForm())
    clearFieldErrors()
    error.value = null
  }

  return { form, isEdit, isSubmitting, isLoading, error, fieldErrors, load, submit, reset }
}