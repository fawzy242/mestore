import { ref, reactive } from 'vue'
import * as transactionsService from '@/services/api/transactions.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'
import { useAuthStore } from '@/stores/auth.store.js'
import { ROLE } from '@/constants/roles.js'

export function useTransactions() {
  const auth = useAuthStore()
  const rows = ref([])
  const loading = ref(false)
  const error = ref(null)
  const filters = reactive({ search: '', cashier: '' })

  async function fetchTransactions() {
    loading.value = true
    error.value = null
    try {
      const result = await transactionsService.getTransactions({
        search: filters.search,
        cashierId: auth.role === ROLE.CASHIER ? auth.user?.id : undefined,
      })
      let items = result.items
      if (filters.cashier && auth.role !== ROLE.CASHIER) {
        items = items.filter((t) => t.cashier === filters.cashier)
      }
      rows.value = items
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      loading.value = false
    }
  }

  return { rows, loading, error, filters, fetchTransactions, isCashier: auth.role === ROLE.CASHIER }
}