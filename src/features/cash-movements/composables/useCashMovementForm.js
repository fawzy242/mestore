import { reactive, ref } from 'vue'
import * as cashService from '@/services/api/cashMovements.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function useCashMovementForm(id = null) {
  const isEdit = Boolean(id)
  const isSubmitting = ref(false)
  const isLoading = ref(false)
  const error = ref(null)
  const fieldErrors = reactive({})
  const form = reactive({
    type: 'in',
    amount: 0,
    reason: '',
    user: '',
    shiftRef: '',
  })

  async function load() {
    if (!isEdit) return
    isLoading.value = true
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
    Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])
    let ok = true
    if (!form.amount || form.amount <= 0) { fieldErrors.amount = 'Amount must be positive'; ok = false }
    if (!form.reason.trim()) { fieldErrors.reason = 'Reason is required'; ok = false }
    return ok
  }

  async function submit() {
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
    form.type = 'in'
    form.amount = 0
    form.reason = ''
    form.user = ''
    form.shiftRef = ''
  }

  return { form, isEdit, isSubmitting, isLoading, error, fieldErrors, load, submit, reset }
}