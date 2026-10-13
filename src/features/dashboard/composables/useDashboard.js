import { ref } from 'vue'
import * as reportsService from '@/services/api/reports.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function useDashboard() {
  const range = ref('last7')

  const summary = ref(null)
  const topProducts = ref([])
  const categoryBreakdown = ref([])
  const paymentMethods = ref([])
  const dailyTrend = ref([])
  const cashiers = ref([])
  const lowStockItems = ref([])
  const recentTransactions = ref([])

  const loading = ref(false)
  const error = ref(null)

  async function fetchDashboard() {
    loading.value = true
    error.value = null
    try {
      const data = await reportsService.getDashboardData({ range: range.value })
      summary.value = data.summary
      topProducts.value = data.topProducts
      categoryBreakdown.value = data.categoryBreakdown
      paymentMethods.value = data.paymentMethods
      dailyTrend.value = data.dailyTrend
      cashiers.value = data.cashiers
      lowStockItems.value = data.lowStockItems
      recentTransactions.value = data.recentTransactions
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      loading.value = false
    }
  }

  function setRange(next) {
    range.value = next
    fetchDashboard()
  }

  return {
    range,
    summary,
    topProducts,
    categoryBreakdown,
    paymentMethods,
    dailyTrend,
    cashiers,
    lowStockItems,
    recentTransactions,
    loading,
    error,
    fetchDashboard,
    setRange,
  }
}