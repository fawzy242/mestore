import { computed, ref } from 'vue'
import * as transactionsService from '@/services/api/transactions.service.js'
import { usePosCartStore } from '@/stores/posCart.store.js'
import { useShift } from '@/features/shift/composables/useShift.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function useCheckout() {
  const cart = usePosCartStore()
  const shift = useShift()
  const method = ref('Cash')
  const tendered = ref(null)
  const isSubmitting = ref(false)
  const error = ref(null)

  const total = computed(() => cart.total)
  const tenderedNumber = computed(() => Number(tendered.value) || 0)
  const change = computed(() => Math.max(tenderedNumber.value - total.value, 0))
  const shortBy = computed(() => Math.max(total.value - tenderedNumber.value, 0))
  const canSubmit = computed(() => {
    if (cart.items.length === 0) return false
    if (method.value !== 'Cash') return true
    return tenderedNumber.value >= total.value
  })

  async function submit() {
    if (!canSubmit.value) return null
    isSubmitting.value = true
    error.value = null
    try {
      const receipt = await transactionsService.createTransaction({
        items: cart.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
        discount: cart.discount,
        method: method.value,
        tendered: method.value === 'Cash' ? tenderedNumber.value : total.value,
      })
      shift.addSale(receipt.total)
      cart.setLastCompleted(receipt)
      cart.clear()
      return receipt
    } catch (err) {
      error.value = normalizeApiError(err)
      return null
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    method,
    tendered,
    isSubmitting,
    error,
    total,
    change,
    shortBy,
    canSubmit,
    submit,
  }
}