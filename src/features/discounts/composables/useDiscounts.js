import { ref, reactive } from 'vue'
import * as discountsService from '@/services/api/discounts.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function useDiscounts() {
  const rows = ref([])
  const loading = ref(false)
  const error = ref(null)
  const approvalTab = ref('Approved')
  const sort = reactive({ key: '', dir: 'asc' })
  const filters = reactive({ search: '' })

  async function fetchDiscounts() {
    loading.value = true
    error.value = null
    try {
      const result = await discountsService.getDiscounts({
        search: filters.search,
        approvalStatus: approvalTab.value,
      })
      let items = result.items
      if (sort.key) {
        const dir = sort.dir === 'desc' ? -1 : 1
        items = [...items].sort((a, b) => {
          const av = a[sort.key]
          const bv = b[sort.key]
          if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
          return String(av).localeCompare(String(bv)) * dir
        })
      }
      rows.value = items
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      loading.value = false
    }
  }

  async function remove(id) {
    await discountsService.deleteDiscount(id)
    await fetchDiscounts()
  }

  async function bulkApprove(ids) {
    await discountsService.bulkApproveDiscounts(ids)
    await fetchDiscounts()
  }

  async function bulkPending(ids) {
    await discountsService.bulkPendingDiscounts(ids)
    await fetchDiscounts()
  }

  async function bulkReject(ids) {
    await discountsService.bulkRejectDiscounts(ids)
    await fetchDiscounts()
  }

  function setApprovalTab(status) {
    approvalTab.value = status
    fetchDiscounts()
  }

  function setSort(key) {
    if (sort.key === key) {
      sort.dir = sort.dir === 'asc' ? 'desc' : 'asc'
    } else {
      sort.key = key
      sort.dir = 'asc'
    }
    fetchDiscounts()
  }

  return {
    rows,
    loading,
    error,
    approvalTab,
    filters,
    sort,
    fetchDiscounts,
    remove,
    bulkApprove,
    bulkPending,
    bulkReject,
    setApprovalTab,
    setSort,
  }
}