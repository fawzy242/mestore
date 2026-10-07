import { ref, reactive } from 'vue'
import * as refundsService from '@/services/api/refunds.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function useRefunds() {
  const rows = ref([])
  const loading = ref(false)
  const error = ref(null)
  const approvalTab = ref('Approved')
  const sort = reactive({ key: '', dir: 'asc' })
  const filters = reactive({ search: '', status: '' })

  async function fetchRefunds() {
    loading.value = true
    error.value = null
    try {
      const result = await refundsService.getRefunds({
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
    await refundsService.deleteRefund(id)
    await fetchRefunds()
  }

  async function approve(id) {
    await refundsService.approveRefund(id)
    await fetchRefunds()
  }

  async function bulkApprove(ids) {
    await refundsService.bulkApproveRefunds(ids)
    await fetchRefunds()
  }

  async function bulkPending(ids) {
    await refundsService.bulkPendingRefunds(ids)
    await fetchRefunds()
  }

  async function bulkReject(ids) {
    await refundsService.bulkRejectRefunds(ids)
    await fetchRefunds()
  }

  function setApprovalTab(status) {
    approvalTab.value = status
    fetchRefunds()
  }

  function setSort(key) {
    if (sort.key === key) {
      sort.dir = sort.dir === 'asc' ? 'desc' : 'asc'
    } else {
      sort.key = key
      sort.dir = 'asc'
    }
    fetchRefunds()
  }

  return {
    rows,
    loading,
    error,
    approvalTab,
    filters,
    sort,
    fetchRefunds,
    remove,
    approve,
    bulkApprove,
    bulkPending,
    bulkReject,
    setApprovalTab,
    setSort,
  }
}