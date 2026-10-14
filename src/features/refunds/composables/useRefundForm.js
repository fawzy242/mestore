import { reactive, ref } from 'vue'
import * as refundsService from '@/services/api/refunds.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

function blankForm() {
  return {
    originalTxId: '',
    customerName: '',
    items: [],
    reason: '',
    status: 'Pending',
    date: '',
  }
}

export function useRefundForm(id = null) {
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
    form.items = []
    clearFieldErrors()
    error.value = null
  }

  async function load() {
    if (!isEdit) return
    isLoading.value = true
    error.value = null
    clearFieldErrors()
    try {
      const r = await refundsService.getRefundById(id)
      form.originalTxId = r.originalTxId
      form.customerName = r.customerName
      form.items = r.items.map((i) => ({ ...i }))
      form.reason = r.reason
      form.status = r.status
      form.date = r.date
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      isLoading.value = false
    }
  }

  function addItem() {
    form.items.push({ name: '', qty: 1, price: 0 })
  }
  function removeItem(idx) {
    form.items.splice(idx, 1)
  }

  function validate() {
    clearFieldErrors()
    let ok = true

    if (!form.originalTxId.trim()) {
      fieldErrors.originalTxId = 'Original receipt is required'
      ok = false
    }
    if (form.items.length === 0) {
      fieldErrors.items = 'Add at least one item'
      ok = false
    } else {
      form.items.forEach((it, i) => {
        if (!it.name?.trim()) {
          fieldErrors[`item-name-${i}`] = 'Item name is required'
          ok = false
        }
        if (!it.qty || Number(it.qty) <= 0) {
          fieldErrors[`item-qty-${i}`] = 'Quantity must be greater than 0'
          ok = false
        }
        if (it.price == null || Number(it.price) < 0) {
          fieldErrors[`item-price-${i}`] = 'Price must be 0 or greater'
          ok = false
        }
      })
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
      const amount = form.items.reduce(
        (sum, i) => sum + Number(i.qty) * Number(i.price),
        0,
      )
      const payload = {
        originalTxId: form.originalTxId.trim(),
        customerName: form.customerName.trim() || 'Walk-in',
        items: form.items.map((i) => ({
          name: i.name.trim(),
          qty: Number(i.qty),
          price: Number(i.price),
        })),
        amount,
        reason: form.reason.trim(),
        status: form.status,
        date: form.date,
      }
      return isEdit
        ? await refundsService.updateRefund(id, payload)
        : await refundsService.createRefund(payload)
    } catch (err) {
      error.value = normalizeApiError(err)
      return null
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    form,
    isEdit,
    isSubmitting,
    isLoading,
    error,
    fieldErrors,
    load,
    submit,
    reset,
    addItem,
    removeItem,
  }
}