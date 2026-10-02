import { reactive, ref } from 'vue'
import { categorySchema } from '../schemas/category.schema.js'
import * as categoriesService from '@/services/api/categories.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function useCategoryForm(id = null) {
  const isEdit = Boolean(id)
  const isSubmitting = ref(false)
  const isLoading = ref(false)
  const error = ref(null)
  const fieldErrors = reactive({})
  const form = reactive({ name: '' })

  async function load() {
    if (!isEdit) return
    isLoading.value = true
    try {
      const category = await categoriesService.getCategoryById(id)
      form.name = category.name
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      isLoading.value = false
    }
  }

  function validate() {
    Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])
    const parsed = categorySchema.safeParse(form)
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0]
        if (key) fieldErrors[key] = issue.message
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
        ? await categoriesService.updateCategory(id, payload)
        : await categoriesService.createCategory(payload)
    } catch (err) {
      error.value = normalizeApiError(err)
      return null
    } finally {
      isSubmitting.value = false
    }
  }

  return { form, isEdit, isSubmitting, isLoading, error, fieldErrors, load, submit }
}