import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * POS current-sale cart. Persists across the pos → payment → success flow.
 * Also stores the most recently completed receipt for the success page.
 *
 * Cart items carry a `stock` snapshot taken from the product at the moment
 * it is added. This snapshot caps the per-item quantity at the UI layer.
 * The service layer (transactions.service) re-validates against live stock
 * before the sale is committed, so the snapshot is a safety rail, not the
 * authority.
 */
export const usePosCartStore = defineStore('posCart', () => {
  /**
   * @type {import('vue').Ref<Array<{
   *   id: string|number,
   *   name: string,
   *   price: number,
   *   qty: number,
   *   stock: number
   * }>>}
   */
  const items = ref([])
  const discount = ref(0)

  /** @type {import('vue').Ref<null | object>} */
  const lastCompleted = ref(null)

  const subtotal = computed(() => items.value.reduce((sum, i) => sum + i.price * i.qty, 0))
  const total = computed(() => Math.max(subtotal.value - (discount.value || 0), 0))
  const itemCount = computed(() => items.value.reduce((sum, i) => sum + i.qty, 0))

  /**
   * Adds a product to the cart, or increments the existing line.
   * Refuses when the product is out of stock, or when the line has reached
   * the stock snapshot ceiling.
   */
  function addProduct(product) {
    const stock = Number(product.stock) || 0
    if (stock < 1) return // out-of-stock guard

    const existing = items.value.find((i) => i.id === product.id)
    if (existing) {
      // Refresh the stock snapshot so subsequent + clicks honor current stock.
      existing.stock = stock
      if (existing.qty < existing.stock) {
        existing.qty += 1
      }
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        stock,
        qty: 1,
      })
    }
  }

  /**
   * Sets the quantity of a line. Values above the stock ceiling are clamped.
   * Values of zero (or below) remove the line entirely.
   */
  function setQty(id, qty) {
    const item = items.value.find((i) => i.id === id)
    if (!item) return
    const requested = Number(qty) || 0
    if (requested <= 0) {
      items.value = items.value.filter((i) => i.id !== id)
      return
    }
    const max = Math.max(Number(item.stock) || 0, 0)
    const next = Math.min(requested, max)
    if (next <= 0) {
      items.value = items.value.filter((i) => i.id !== id)
      return
    }
    item.qty = next
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