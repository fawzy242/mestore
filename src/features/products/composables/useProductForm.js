import { ref, reactive } from 'vue'
import { productSchema } from '../schemas/product.schema.js'
import * as productsService from '@/services/api/products.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function useProductForm(id = null) {
  const isEdit = Boolean(id)
  const isSubmitting = ref(false)
  const isLoading = ref(false)
  const error = ref(null)
  const fieldErrors = reactive({})

  const form = reactive({
    name: '',
    sku: '',
    category: '',
    unit: 'pcs',
    price: '',
    cost: '',
    stock: '',
  })

  async function load() {
    if (!isEdit) return
    isLoading.value = true
    try {
      const product = await productsService.getProductById(id)
      Object.assign(form, {
        ...product,
        price: String(product.price ?? ''),
        cost: String(product.cost ?? ''),
        stock: String(product.stock ?? ''),
      })
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      isLoading.value = false
    }
  }

  function validate() {
    Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])
    const normalized = {
      ...form,
      cost: form.cost === '' ? 0 : form.cost,
    }
    const parsed = productSchema.safeParse(normalized)
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0]
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
      })
      return false
    }
    return parsed.data
  }

  async function submit() {
    error.value = null
    const payload = validate()
    if (!payload) return null
    isSubmitting.value = true
    try {
      return isEdit
        ? await productsService.updateProduct(id, payload)
        : await productsService.createProduct(payload)
    } catch (err) {
      error.value = normalizeApiError(err)
      if (error.value.fieldErrors) Object.assign(fieldErrors, error.value.fieldErrors)
      return null
    } finally {
      isSubmitting.value = false
    }
  }

  return { form, isEdit, isSubmitting, isLoading, error, fieldErrors, load, submit }
}