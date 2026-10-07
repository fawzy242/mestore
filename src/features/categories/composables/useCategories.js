import { ref, reactive } from 'vue'
import * as categoriesService from '@/services/api/categories.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function useCategories() {
  const rows = ref([])
  const loading = ref(false)
  const error = ref(null)
  const search = ref('')
  const activeTab = ref('Active')
  const sort = reactive({ key: '', dir: 'asc' })

  async function fetchCategories() {
    loading.value = true
    error.value = null
    try {
      const isActive = activeTab.value === 'Active'
      const result = await categoriesService.getCategories({
        search: search.value,
        isActive,
        isDelete: false,
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

  async function removeCategory(id) {
    await categoriesService.deleteCategory(id)
    await fetchCategories()
  }

  async function bulkSetStatus(ids, nextStatus) {
    await categoriesService.bulkUpdateCategoryStatus(ids, nextStatus)
    await fetchCategories()
  }

  async function bulkDelete(ids) {
    await categoriesService.bulkDeleteCategories(ids)
    await fetchCategories()
  }

  function setStatusTab(next) {
    activeTab.value = next
    fetchCategories()
  }

  function setSort(key) {
    if (sort.key === key) {
      sort.dir = sort.dir === 'asc' ? 'desc' : 'asc'
    } else {
      sort.key = key
      sort.dir = 'asc'
    }
    fetchCategories()
  }

  return {
    rows,
    loading,
    error,
    search,
    activeTab,
    sort,
    fetchCategories,
    removeCategory,
    bulkSetStatus,
    bulkDelete,
    setStatusTab,
    setSort,
  }
}