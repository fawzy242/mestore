import { reactive, ref } from 'vue'
import * as purchasesService from '@/services/api/purchases.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function usePurchaseForm(id = null) {
  const isEdit = Boolean(id)
  const isSubmitting = ref(false)
  const isLoading = ref(false)
  const error = ref(null)
  const fieldErrors = reactive({})

  const form = reactive({
    supplierId: '',
    supplierName: '',
    items: [],          // [{ name, qty, price }]
    status: 'Pending',
    date: '',           // display string, e.g. "Sep 24, 2026"
  })

  async function load() {
    if (!isEdit) return
    isLoading.value = true
    try {
      const p = await purchasesService.getPurchaseById(id)
      form.supplierId = p.supplierId
      form.supplierName = p.supplierName
      form.items = p.items.map((i) => ({ ...i }))
      form.status = p.status
      form.date = p.date
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
    if (!form.supplierId) {
      fieldErrors.supplierId = 'Supplier is required'
      ok = false
    }
    if (!form.date) {
      fieldErrors.date = 'Date is required'
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
    return ok
  }

  async function submit() {
    if (!validate()) return null
    isSubmitting.value = true
    try {
      const supplier = form.supplierName
      const total = form.items.reduce(
        (sum, i) => sum + Number(i.qty) * Number(i.price),
        0,
      )
      const payload = {
        supplierId: form.supplierId,
        supplierName: supplier,
        items: form.items.map((i) => ({
          name: i.name,
          qty: Number(i.qty),
          price: Number(i.price),
        })),
        total,
        status: form.status,
        date: form.date,
      }
      return isEdit
        ? await purchasesService.updatePurchase(id, payload)
        : await purchasesService.createPurchase(payload)
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