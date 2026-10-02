import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * POS current-sale cart. Persists across the pos → payment → success flow.
 * Also stores the most recently completed receipt for the success page.
 */
export const usePosCartStore = defineStore('posCart', () => {
  /** @type {import('vue').Ref<Array<{id:string|number, name:string, price:number, qty:number}>>} */
  const items = ref([])
  const discount = ref(0)

  /** @type {import('vue').Ref<null | object>} */
  const lastCompleted = ref(null)

  const subtotal = computed(() => items.value.reduce((sum, i) => sum + i.price * i.qty, 0))
  const total = computed(() => Math.max(subtotal.value - (discount.value || 0), 0))
  const itemCount = computed(() => items.value.reduce((sum, i) => sum + i.qty, 0))

  function addProduct(product) {
    const existing = items.value.find((i) => i.id === product.id)
    if (existing) {
      existing.qty += 1
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: 1,
      })
    }
  }

  function setQty(id, qty) {
    const item = items.value.find((i) => i.id === id)
    if (!item) return
    if (qty <= 0) {
      items.value = items.value.filter((i) => i.id !== id)
    } else {
      item.qty = qty
    }
  }

  function removeItem(id) {
    items.value = items.value.filter((i) => i.id !== id)
  }

  function setDiscount(value) {
    discount.value = Number(value) || 0
  }

  function clear() {
    items.value = []
    discount.value = 0
  }

  function setLastCompleted(payload) {
    lastCompleted.value = payload
  }

  function consumeLastCompleted() {
    const value = lastCompleted.value
    lastCompleted.value = null
    return value
  }

  return {
    items,
    discount,
    lastCompleted,
    subtotal,
    total,
    itemCount,
    addProduct,
    setQty,
    removeItem,
    setDiscount,
    clear,
    setLastCompleted,
    consumeLastCompleted,
  }
})