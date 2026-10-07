import { ref, reactive } from 'vue'
import * as purchasesService from '@/services/api/purchases.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function usePurchases() {
  const rows = ref([])
  const loading = ref(false)
  const error = ref(null)
  const approvalTab = ref('Approved')
  const sort = reactive({ key: '', dir: 'asc' })
  const filters = reactive({ search: '', status: '' })

  async function fetchPurchases() {
    loading.value = true
    error.value = null
    try {
      const result = await purchasesService.getPurchases({
        search: filters.search,
        status: filters.status,
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
    await purchasesService.deletePurchase(id)
    await fetchPurchases()
  }

  async function approve(id) {
    await purchasesService.approvePurchase(id)
    await fetchPurchases()
  }

  async function bulkApprove(ids) {
    await purchasesService.bulkApprovePurchases(ids)
    await fetchPurchases()
  }

  async function bulkPending(ids) {
    await purchasesService.bulkPendingPurchases(ids)
    await fetchPurchases()
  }

  async function bulkReject(ids) {
    await purchasesService.bulkRejectPurchases(ids)
    await fetchPurchases()
  }

  function setApprovalTab(status) {
    approvalTab.value = status
    fetchPurchases()
  }

  function setSort(key) {
    if (sort.key === key) {
      sort.dir = sort.dir === 'asc' ? 'desc' : 'asc'
    } else {
      sort.key = key
      sort.dir = 'asc'
    }
    fetchPurchases()
  }

  return {
    rows,
    loading,
    error,
    approvalTab,
    filters,
    sort,
    fetchPurchases,
    remove,
    approve,
    bulkApprove,
    bulkPending,
    bulkReject,
    setApprovalTab,
    setSort,
  }
}