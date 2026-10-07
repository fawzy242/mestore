import { ref, reactive } from 'vue'
import * as productsService from '@/services/api/products.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'
import { usePagination } from '@/composables/usePagination.js'

export function useProducts() {
  const rows = ref([])
  const loading = ref(false)
  const error = ref(null)
  const filters = reactive({ search: '', category: '', isActive: true })
  const sort = reactive({ key: '', dir: 'asc' })
  const { page, pageSize, total, pageCount, setTotal, goToPage, reset } =
    usePagination({ pageSize: 10 })

  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      const result = await productsService.getProducts({
        search: filters.search,
        category: filters.category,
        isActive: filters.isActive,
        page: page.value,
        pageSize: pageSize.value,
        sortKey: sort.key,
        sortDir: sort.dir,
      })
      rows.value = result.items
      setTotal(result.total)
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      loading.value = false
    }
  }

  async function removeProduct(id) {
    await productsService.deleteProduct(id)
    if (rows.value.length === 1 && page.value > 1) {
      goToPage(page.value - 1)
    }
    await fetchProducts()
  }

  async function bulkSetStatus(ids, status) {
    await productsService.bulkUpdateProductStatus(ids, status)
    await fetchProducts()
  }

  async function bulkDelete(ids) {
    await productsService.bulkDeleteProducts(ids)
    await fetchProducts()
  }

  function applyFilter() {
    reset()
    fetchProducts()
  }

  function setStatusTab(tabValue) {
    filters.isActive = tabValue === 'Active'
    reset()
    fetchProducts()
  }

  function setSort(key) {
    if (sort.key === key) {
      sort.dir = sort.dir === 'asc' ? 'desc' : 'asc'
    } else {
      sort.key = key
      sort.dir = 'asc'
    }
    fetchProducts()
  }

  return {
    rows,
    loading,
    error,
    filters,
    sort,
    page,
    pageSize,
    total,
    pageCount,
    fetchProducts,
    removeProduct,
    bulkSetStatus,
    bulkDelete,
    applyFilter,
    setStatusTab,
    setSort,
    goToPage,
  }
}