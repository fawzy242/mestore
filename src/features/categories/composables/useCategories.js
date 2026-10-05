import { ref } from 'vue'
import * as categoriesService from '@/services/api/categories.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function useCategories() {
  const rows = ref([])
  const loading = ref(false)
  const error = ref(null)
  const search = ref('')
  const status = ref('Active')

  async function fetchCategories() {
    loading.value = true
    error.value = null
    try {
      const result = await categoriesService.getCategories({ status: status.value })
      const q = search.value.toLowerCase()
      rows.value = q
        ? result.items.filter((c) => c.name.toLowerCase().includes(q))
        : result.items
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      loading.value = false
    }
  }

  async function removeCategory(id) {
    await categoriesService.deleteCategory(id)
    await fetchCategories()
  }

  async function bulkSetStatus(ids, nextStatus) {
    await categoriesService.bulkUpdateCategoryStatus(ids, nextStatus)
    await fetchCategories()
  }

  function setStatusTab(next) {
    status.value = next
    fetchCategories()
  }

  return {
    rows,
    loading,
    error,
    search,
    status,
    fetchCategories,
    removeCategory,
    bulkSetStatus,
    setStatusTab,
  }
}