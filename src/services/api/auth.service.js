/**
 * MOCK auth service.
 * Accepts any non-empty password for the three demo usernames:
 *   fawzy (admin), budi (manager), siti (cashier)
 * Swap each function body for a real HTTP call when the contract is confirmed.
 */
import { delay } from '@/services/mock/data.js'

const DEMO_USERS = [
  { id: 1, name: 'Fawzy Admin', username: 'fawzy', role: 'admin', password: 'admin' },
  { id: 2, name: 'Budi Santoso', username: 'budi', role: 'manager', password: 'manager' },
  { id: 3, name: 'Siti Rahma', username: 'siti', role: 'cashier', password: 'cashier' },
]

export async function login({ username, password }) {
  const trimmedUser = String(username ?? '').trim()
  const trimmedPass = String(password ?? '').trim()

  const found = DEMO_USERS.find((u) => u.username === trimmedUser)

  if (!found || trimmedPass.length === 0) {
    const error = new Error('Incorrect username or password.')
    error.status = 'auth'
    throw error
  }

  const { password: _pw, ...user } = found
  return delay({ token: `demo-token-${found.id}`, user }, 200)
}

/**
 * Reconstructs the user from the persisted token so a page refresh does not
 * log the user out. Reads localStorage directly because the storage key is
 * owned by the auth store (via VueUse's useLocalStorage).
 */
export async function getCurrentUser() {
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('posretail.token') : null
  if (!raw) return null

  let token = raw
  try {
    token = JSON.parse(raw)
  } catch {
    /* value was not JSON-wrapped; use as-is */
  }
  if (!token) return null

  const match = /demo-token-(\d+)/.exec(String(token))
  if (!match) return null

  const id = Number(match[1])
  const found = DEMO_USERS.find((u) => u.id === id)
  if (!found) return null

  const { password: _pw, ...user } = found
  return delay(user, 80)
}

export async function logout() {
  return delay(null, 0)
}