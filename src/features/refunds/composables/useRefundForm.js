import { reactive, ref } from 'vue'
import * as refundsService from '@/services/api/refunds.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function useRefundForm(id = null) {
  const isEdit = Boolean(id)
  const isSubmitting = ref(false)
  const isLoading = ref(false)
  const error = ref(null)
  const fieldErrors = reactive({})

  const form = reactive({
    originalTxId: '',
    customerName: '',
    items: [],      // [{ name, qty, price }]
    reason: '',
    status: 'Pending',
    date: '',
  })

  async function load() {
    if (!isEdit) return
    isLoading.value = true
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
    Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])
    let ok = true
    if (!form.originalTxId.trim()) {
      fieldErrors.originalTxId = 'Original receipt is required'
      ok = false
    }
    if (form.items.length === 0) {
      fieldErrors.items = 'Add at least one item'
      ok = false
    }
    form.items.forEach((it, i) => {
      if (!it.name) {
        fieldErrors[`item-name-${i}`] = 'Required'
        ok = false
      }
      if (!it.qty || it.qty <= 0) {
        fieldErrors[`item-qty-${i}`] = 'Invalid'
        ok = false
      }
    })
    if (!form.reason.trim()) {
      fieldErrors.reason = 'Reason is required'
      ok = false
    }
    return ok
  }

  async function submit() {
    if (!validate()) return null
    isSubmitting.value = true
    try {
      const amount = form.items.reduce(
        (sum, i) => sum + Number(i.qty) * Number(i.price),
        0,
      )
      const payload = {
        originalTxId: form.originalTxId,
        customerName: form.customerName || 'Walk-in',
        items: form.items.map((i) => ({
          name: i.name,
          qty: Number(i.qty),
          price: Number(i.price),
        })),
        amount,
        reason: form.reason,
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
    addItem,
    removeItem,
  }
}