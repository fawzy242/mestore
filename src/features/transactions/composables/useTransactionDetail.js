import { ref } from 'vue'
import * as transactionsService from '@/services/api/transactions.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function useTransactionDetail(id) {
  const transaction = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchTransaction() {
    loading.value = true
    error.value = null
    try {
      const t = await transactionsService.getTransactionById(id)
      transaction.value = {
        ...t,
        subtotal: t.total,
        discount: 0,
        change: t.tendered - t.total,
      }
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      loading.value = false
    }
  }

  return { transaction, loading, error, fetchTransaction }
}