import { reactive, ref } from 'vue'
import * as discountsService from '@/services/api/discounts.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function useDiscountForm(id = null) {
  const isEdit = Boolean(id)
  const isSubmitting = ref(false)
  const isLoading = ref(false)
  const error = ref(null)
  const fieldErrors = reactive({})

  const form = reactive({
    name: '',
    type: 'percentage',  // 'percentage' | 'fixed'
    value: 0,
    scope: 'all',        // 'all' | 'category' | 'product'
    appliesTo: 'All products',
    minPurchase: 0,
    startDate: '',
    endDate: '',
    status: 'Active',
  })

  async function load() {
    if (!isEdit) return
    isLoading.value = true
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
    Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])
    let ok = true
    if (!form.name.trim()) { fieldErrors.name = 'Name is required'; ok = false }
    if (form.value <= 0) { fieldErrors.value = 'Value must be positive'; ok = false }
    if (!form.startDate) { fieldErrors.startDate = 'Start date is required'; ok = false }
    if (!form.endDate) { fieldErrors.endDate = 'End date is required'; ok = false }
    return ok
  }

  async function submit() {
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

  return { form, isEdit, isSubmitting, isLoading, error, fieldErrors, load, submit }
}