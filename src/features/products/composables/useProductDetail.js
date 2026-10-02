import { ref } from 'vue'
import * as productsService from '@/services/api/products.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function useProductDetail(id) {
  const product = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchProduct() {
    loading.value = true
    error.value = null
    try {
      product.value = await productsService.getProductById(id)
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      loading.value = false
    }
  }

  return { product, loading, error, fetchProduct }
}