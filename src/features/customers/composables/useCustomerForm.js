import { reactive, ref } from 'vue'
import * as customersService from '@/services/api/customers.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

function blankForm() {
  return { name: '', phone: '', email: '', address: '' }
}

export function useCustomerForm(id = null) {
  const isEdit = Boolean(id)
  const isSubmitting = ref(false)
  const isLoading = ref(false)
  const error = ref(null)
  const fieldErrors = reactive({})

  const form = reactive(blankForm())

  function clearFieldErrors() {
    Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])
  }

  function reset() {
    Object.assign(form, blankForm())
    clearFieldErrors()
    error.value = null
  }

  async function load() {
    if (!isEdit) return
    isLoading.value = true
    error.value = null
    clearFieldErrors()
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
    clearFieldErrors()
    let ok = true
    if (!form.name.trim()) {
      fieldErrors.name = 'Name is required'
      ok = false
    }
    if (!form.phone.trim()) {
      fieldErrors.phone = 'Phone is required'
      ok = false
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      fieldErrors.email = 'Enter a valid email address'
      ok = false
    }
    return ok
  }

  async function submit() {
    error.value = null
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

  return { form, isEdit, isSubmitting, isLoading, error, fieldErrors, load, submit, reset }
}