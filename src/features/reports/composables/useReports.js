import { ref } from 'vue'
import * as reportsService from '@/services/api/reports.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function useReports() {
  const range = ref('last7')
  const summary = ref(null)
  const topProducts = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchReports() {
    loading.value = true
    error.value = null
    try {
      const result = await reportsService.getReports({ range: range.value })
      summary.value = result.summary
      topProducts.value = result.topProducts
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      loading.value = false
    }
  }

  return { range, summary, topProducts, loading, error, fetchReports }
}