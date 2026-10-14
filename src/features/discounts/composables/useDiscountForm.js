import { reactive, ref } from 'vue'
import * as discountsService from '@/services/api/discounts.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

function blankForm() {
  return {
    name: '',
    type: 'percentage',
    value: 0,
    scope: 'all',
    appliesTo: 'All products',
    minPurchase: 0,
    startDate: '',
    endDate: '',
    status: 'Active',
  }
}

export function useDiscountForm(id = null) {
  const isEdit = Boolean(id)
  const isSubmitting = ref(false)
  const isLoading = ref(false)
  const error = ref(null)
  const fieldErrors = reactive({})

  const form = reactive(blankForm())

  function clearFieldErrors() {
    Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])
  }

  function reset() {
    Object.assign(form, blankForm())
    clearFieldErrors()
    error.value = null
  }

  async function load() {
    if (!isEdit) return
    isLoading.value = true
    error.value = null
    clearFieldErrors()
    try {
      const d = await discountsService.getDiscountById(id)
      Object.assign(form, d)
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      isLoading.value = false
    }
  }

  function validate() {
    clearFieldErrors()
    let ok = true

    if (!form.name.trim()) {
      fieldErrors.name = 'Name is required'
      ok = false
    }

    if (!form.value || form.value <= 0) {
      fieldErrors.value = 'Value must be greater than 0'
      ok = false
    } else if (form.type === 'percentage' && form.value > 100) {
      fieldErrors.value = 'Percentage cannot exceed 100'
      ok = false
    }

    if (!form.startDate) {
      fieldErrors.startDate = 'Start date is required'
      ok = false
    }
    if (!form.endDate) {
      fieldErrors.endDate = 'End date is required'
      ok = false
    }

    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate)
      const end = new Date(form.endDate)
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end < start) {
        fieldErrors.endDate = 'End date must be on or after the start date'
        ok = false
      }
    }

    return ok
  }

  async function submit() {
    error.value = null
    if (!validate()) return null
    isSubmitting.value = true
    try {
      return isEdit
        ? await discountsService.updateDiscount(id, { ...form })
        : await discountsService.createDiscount({ ...form })
    } catch (err) {
      error.value = normalizeApiError(err)
      return null
    } finally {
      isSubmitting.value = false
    }
  }

  return { form, isEdit, isSubmitting, isLoading, error, fieldErrors, load, submit, reset }
}