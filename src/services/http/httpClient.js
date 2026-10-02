import axios from 'axios'
import { normalizeApiError } from './apiError.js'

/**
 * Single Axios instance for the whole app.
 * - Attaches the bearer token when a session exists.
 * - Unwraps `response.data` on success.
 * - Normalizes all failures into AppError.
 *
 * NOTE: session token read is intentionally lazy (imported inside the interceptor)
 * to avoid a circular dependency between httpClient and the auth store.
 */
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

httpClient.interceptors.request.use(async (config) => {
  const { useAuthStore } = await import('@/stores/auth.store.js')
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(normalizeApiError(error)),
)

export default httpClient