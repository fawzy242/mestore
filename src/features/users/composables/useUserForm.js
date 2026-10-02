import { reactive, ref } from 'vue'
import { userSchema } from '../schemas/user.schema.js'
import * as usersService from '@/services/api/users.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function useUserForm(id = null) {
  const isEdit = Boolean(id)
  const isSubmitting = ref(false)
  const isLoading = ref(false)
  const error = ref(null)
  const fieldErrors = reactive({})

  const form = reactive({
    name: '',
    username: '',
    password: '',
    role: 'cashier',
    status: 'Active',
  })

  async function load() {
    if (!isEdit) return
    isLoading.value = true
    try {
      const user = await usersService.getUserById(id)
      Object.assign(form, user)
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      isLoading.value = false
    }
  }

  function validate() {
    Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])
    const parsed = userSchema.safeParse(form)
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0]
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
      })
      return false
    }
    if (!isEdit && !form.password) {
      fieldErrors.password = 'Password is required'
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
      const body = { ...payload }
      if (isEdit && !body.password) delete body.password
      return isEdit
        ? await usersService.updateUser(id, body)
        : await usersService.createUser(body)
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