import { ref, reactive } from 'vue'
import * as cashService from '@/services/api/cashMovements.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function useCashMovements() {
  const rows = ref([])
  const loading = ref(false)
  const error = ref(null)
  const approvalTab = ref('Approved')
  const sort = reactive({ key: '', dir: 'asc' })
  const filters = reactive({ search: '', type: '' })

  async function fetchCashMovements() {
    loading.value = true
    error.value = null
    try {
      const result = await cashService.getCashMovements({
        search: filters.search,
        type: filters.type,
        approvalStatus: approvalTab.value,
      })
      rows.value = result.items
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      loading.value = false
    }
  }

  async function remove(id) {
    await cashService.deleteCashMovement(id)
    await fetchCashMovements()
  }

  async function approve(id) {
    await cashService.approveCashMovement(id)
    await fetchCashMovements()
  }

  async function bulkApprove(ids) {
    await cashService.bulkApproveCashMovements(ids)
    await fetchCashMovements()
  }

  async function bulkPending(ids) {
    await cashService.bulkPendingCashMovements(ids)
    await fetchCashMovements()
  }

  async function bulkReject(ids) {
    await cashService.bulkRejectCashMovements(ids)
    await fetchCashMovements()
  }

  function setApprovalTab(status) {
    approvalTab.value = status
    fetchCashMovements()
  }

  function setSort(key) {
    if (sort.key === key) {
      sort.dir = sort.dir === 'asc' ? 'desc' : 'asc'
    } else {
      sort.key = key
      sort.dir = 'asc'
    }
    fetchCashMovements()
  }

  return {
    rows,
    loading,
    error,
    approvalTab,
    filters,
    sort,
    fetchCashMovements,
    remove,
    approve,
    bulkApprove,
    bulkPending,
    bulkReject,
    setApprovalTab,
    setSort,
  }
}