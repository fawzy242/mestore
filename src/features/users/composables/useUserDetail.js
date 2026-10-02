import { ref } from 'vue'
import * as usersService from '@/services/api/users.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function useUserDetail(id) {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchUser() {
    loading.value = true
    error.value = null
    try {
      user.value = await usersService.getUserById(id)
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      loading.value = false
    }
  }

  return { user, loading, error, fetchUser }
}