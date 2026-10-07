import { reactive, ref } from 'vue'
import * as stockService from '@/services/api/stock.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'
import { usePagination } from '@/composables/usePagination.js'

export function useProductStock() {
  const rows = ref([])
  const history = ref([])
  const loading = ref(false)
  const historyLoading = ref(false)
  const error = ref(null)
  const approvalTab = ref('Approved')
  const historySort = reactive({ key: 'date', dir: 'desc' })
  const filters = reactive({ search: '', status: '' })
  const overviewSort = reactive({ key: '', dir: 'asc' })
  const { page, pageSize, total, pageCount, setTotal, goToPage, reset } = usePagination({ pageSize: 10 })

  async function fetchStock() {
    loading.value = true
    error.value = null
    try {
      const result = await stockService.getStockOverview({
        search: filters.search,
        status: filters.status,
        page: page.value,
        pageSize: pageSize.value,
        sortKey: overviewSort.key,
        sortDir: overviewSort.dir,
      })
      rows.value = result.items
      setTotal(result.total)
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchHistory(status) {
    historyLoading.value = true
    try {
      const result = await stockService.getStockHistory({
        approvalStatus: status ?? approvalTab.value,
        pageSize: 200,
        sortKey: historySort.key,
        sortDir: historySort.dir,
      })
      history.value = result.items
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      historyLoading.value = false
    }
  }

  async function adjust(payload) {
    await stockService.adjustStock(payload)
    await fetchStock()
    await fetchHistory()
  }

  async function updateMove(id, payload) {
    await stockService.updateStockMove(id, payload)
    await fetchHistory()
  }

  async function removeMove(id) {
    await stockService.deleteStockMove(id)
    await fetchHistory()
  }

  async function approve(id) {
    await stockService.approveStockMove(id)
    await fetchHistory()
  }

  async function bulkApprove(ids) {
    await stockService.bulkApproveStockMoves(ids)
    await fetchHistory()
  }

  async function bulkPending(ids) {
    await stockService.bulkPendingStockMoves(ids)
    await fetchHistory()
  }

  async function bulkReject(ids) {
    await stockService.bulkRejectStockMoves(ids)
    await fetchHistory()
  }

  function setApprovalTab(status) {
    approvalTab.value = status
    fetchHistory(status)
  }

  function setHistorySort(key) {
    if (historySort.key === key) {
      historySort.dir = historySort.dir === 'asc' ? 'desc' : 'asc'
    } else {
      historySort.key = key
      historySort.dir = 'asc'
    }
    fetchHistory()
  }

  function setOverviewSort(key) {
    if (overviewSort.key === key) {
      overviewSort.dir = overviewSort.dir === 'asc' ? 'desc' : 'asc'
    } else {
      overviewSort.key = key
      overviewSort.dir = 'asc'
    }
    fetchStock()
  }

  function applyFilter() {
    reset()
    fetchStock()
  }

  return {
    rows,
    history,
    loading,
    historyLoading,
    error,
    approvalTab,
    filters,
    historySort,
    overviewSort,
    page,
    pageSize,
    total,
    pageCount,
    fetchStock,
    fetchHistory,
    adjust,
    updateMove,
    removeMove,
    approve,
    bulkApprove,
    bulkPending,
    bulkReject,
    setApprovalTab,
    setHistorySort,
    setOverviewSort,
    applyFilter,
    goToPage,
  }
}