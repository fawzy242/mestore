import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'

/**
 * Shift state — module-level singletons so the same reactive refs are shared
 * across the router guard, the sidebar, and any page. This avoids creating
 * new refs per call, and works outside component setup contexts.
 */
const startingCash = useLocalStorage('posretail.shift.startingCash', 0)
const salesTotal = useLocalStorage('posretail.shift.salesTotal', 0)
const hasOpenShift = useLocalStorage('posretail.shift.open', false)

const expected = computed(() => startingCash.value + salesTotal.value)

export function useShift() {
  function openShift(amount) {
    startingCash.value = Number(amount) || 0
    salesTotal.value = 0
    hasOpenShift.value = true
  }

  function addSale(amount) {
    salesTotal.value = Number(salesTotal.value) + Number(amount || 0)
  }

  function closeShift() {
    startingCash.value = 0
    salesTotal.value = 0
    hasOpenShift.value = false
  }

  return {
    startingCash,
    salesTotal,
    hasOpenShift,
    expected,
    openShift,
    addSale,
    closeShift,
  }
}