import { ref, reactive } from 'vue'
import * as productsService from '@/services/api/products.service.js'
import * as categoriesService from '@/services/api/categories.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function usePosCatalog() {
  const products = ref([])
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)
  const filters = reactive({ search: '', category: 'All' })

  async function fetchCategories() {
    try {
      const result = await categoriesService.getCategories()
      categories.value = result.items.map((c) => c.name)
    } catch (err) {
      error.value = normalizeApiError(err)
    }
  }

  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      const result = await productsService.getProducts({
        search: filters.search,
        category: filters.category === 'All' ? '' : filters.category,
        pageSize: 1000, // POS shows the full catalog at once
      })
      products.value = result.items
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      loading.value = false
    }
  }

  return { products, categories, loading, error, filters, fetchCategories, fetchProducts }
}