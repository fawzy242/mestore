import { ref, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import * as shiftsService from '@/services/api/shifts.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

// ---------- POS shift state (shared across the app) ----------
const startingCash = useLocalStorage('mestore.shift.startingCash', 0)
const salesTotal = useLocalStorage('mestore.shift.salesTotal', 0)
const hasOpenShift = useLocalStorage('mestore.shift.open', false)

const expected = computed(() => startingCash.value + salesTotal.value)

/**
 * useShift()  used by POS, ProfileMenu, useCheckout, and the router guard.
 * Exposes the current shift state plus open/addSale/closeShift actions.
 */
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

// ---------- Shift Management list (view-only page) ----------
const rows = ref([])
const loading = ref(false)
const error = ref(null)
const filters = { search: '', status: '' }
let currentPage = 1
const pageSize = 10
const total = ref(0)

/**
 * useShifts()  used ONLY by Shift Management (view-only list page).
 * Named useShifts because it manages a collection, not the current shift.
 */
export function useShifts() {
  async function fetchShifts() {
    loading.value = true
    error.value = null
    try {
      const result = await shiftsService.getShifts({
        search: filters.search,
        status: filters.status,
        page: currentPage,
        pageSize,
      })
      rows.value = result.items
      total.value = result.total
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      loading.value = false
    }
  }

  function applyFilter() {
    currentPage = 1
    fetchShifts()
  }

  function goToPage(p) {
    currentPage = p
  }

  return {
    rows,
    loading,
    error,
    filters,
    page: computed(() => currentPage),
    pageSize,
    total,
    pageCount: computed(() => Math.max(Math.ceil(total.value / pageSize), 1)),
    fetchShifts,
    applyFilter,
    goToPage,
  }
}

