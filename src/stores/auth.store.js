import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import * as authService from '@/services/api/auth.service.js'

export const useAuthStore = defineStore('auth', () => {
  const token = useLocalStorage('posretail.token', null)
  const user = ref(null)
  const initialized = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value && user.value))
  const role = computed(() => user.value?.role ?? null)
  const initials = computed(() => {
    if (!user.value?.name) return ''
    return user.value.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('')
  })

  async function login(credentials) {
    const result = await authService.login(credentials)
    token.value = result.token
    user.value = result.user
    return result.user
  }

  function setSession(payload) {
    token.value = payload.token
    user.value = payload.user
  }

  async function restoreSession() {
    initialized.value = true
    if (!token.value) return
    try {
      const current = await authService.getCurrentUser()
      if (current) user.value = current
    } catch {
      token.value = null
      user.value = null
    }
  }

  async function logout() {
    try {
      await authService.logout()
    } catch {
      /* ignore */
    }
    token.value = null
    user.value = null
  }

  return {
    token,
    user,
    initialized,
    isAuthenticated,
    role,
    initials,
    login,
    setSession,
    restoreSession,
    logout,
  }
})