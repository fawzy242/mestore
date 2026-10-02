import { ref } from 'vue'
import * as reportsService from '@/services/api/reports.service.js'
import * as productsService from '@/services/api/products.service.js'
import * as transactionsService from '@/services/api/transactions.service.js'
import { useAuthStore } from '@/stores/auth.store.js'
import { ROLE } from '@/constants/roles.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function useDashboard() {
  const auth = useAuthStore()
  const summary = ref(null)
  const lowStock = ref([])
  const recent = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const [s, low, tx] = await Promise.all([
        reportsService.getDashboardSummary(),
        productsService.getProducts({ lowStock: true }),
        transactionsService.getTransactions({
          limit: 3,
          cashierId: auth.role === ROLE.CASHIER ? auth.user?.id : undefined,
        }),
      ])
      summary.value = s
      lowStock.value = low.items
      recent.value = tx.items
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      loading.value = false
    }
  }

  return { summary, lowStock, recent, loading, error, fetchAll }
}