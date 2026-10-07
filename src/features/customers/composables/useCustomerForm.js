import { reactive, ref } from 'vue'
import * as customersService from '@/services/api/customers.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function useCustomerForm(id = null) {
  const isEdit = Boolean(id)
  const isSubmitting = ref(false)
  const isLoading = ref(false)
  const error = ref(null)
  const fieldErrors = reactive({})
  const form = reactive({ name: '', phone: '', email: '', address: '' })

  async function load() {
    if (!isEdit) return
    isLoading.value = true
    try {
      const customer = await customersService.getCustomerById(id)
      Object.assign(form, customer)
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      isLoading.value = false
    }
  }

  function validate() {
    Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])
    let ok = true
    if (!form.name.trim()) { fieldErrors.name = 'Name is required'; ok = false }
    if (!form.phone.trim()) { fieldErrors.phone = 'Phone is required'; ok = false }
    return ok
  }

  async function submit() {
    if (!validate()) return null
    isSubmitting.value = true
    try {
      return isEdit
        ? await customersService.updateCustomer(id, { ...form })
        : await customersService.createCustomer({ ...form })
    } catch (err) {
      error.value = normalizeApiError(err)
      return null
    } finally {
      isSubmitting.value = false
    }
  }

  return { form, isEdit, isSubmitting, isLoading, error, fieldErrors, load, submit }
}