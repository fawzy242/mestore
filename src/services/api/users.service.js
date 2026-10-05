import { db, delay, nextUserId } from '@/services/mock/data.js'

const SORTABLE_KEYS = ['name', 'username', 'role', 'status']

function sortItems(items, sortKey, sortDir) {
  if (!sortKey || !SORTABLE_KEYS.includes(sortKey)) return items
  const dir = sortDir === 'desc' ? -1 : 1
  return [...items].sort((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey])) * dir)
}

export async function getUsers(params = {}) {
  const {
    search = '',
    role = '',
    status = 'Active',
    page = 1,
    pageSize = 10,
    sortKey = '',
    sortDir = 'asc',
  } = params

  let items = [...db.users]
  if (status) items = items.filter((u) => u.status === status)
  if (search) {
    const q = search.toLowerCase()
    items = items.filter((u) => u.name.toLowerCase().includes(q) || u.username.includes(q))
  }
  if (role) items = items.filter((u) => u.role === role)
  items = sortItems(items, sortKey, sortDir)

  const total = items.length
  const start = (page - 1) * pageSize
  const slice = items.slice(start, start + pageSize)

  return delay({ items: slice, total, page, pageSize })
}

export async function getUserById(id) {
  const found = db.users.find((u) => String(u.id) === String(id))
  if (!found) {
    const error = new Error('User not found')
    error.status = 'not_found'
    throw error
  }
  return delay(found)
}

export async function createUser(payload) {
  const user = { id: nextUserId(), ...payload }
  db.users.push(user)
  return delay(user)
}

export async function updateUser(id, payload) {
  const idx = db.users.findIndex((u) => String(u.id) === String(id))
  if (idx < 0) {
    const error = new Error('User not found')
    error.status = 'not_found'
    throw error
  }
  db.users[idx] = { ...db.users[idx], ...payload }
  return delay(db.users[idx])
}

export async function deactivateUser(id) {
  const user = db.users.find((u) => String(u.id) === String(id))
  if (user) user.status = 'Inactive'
  return delay(user)
}

export async function bulkUpdateUserStatus(ids, status) {
  const idSet = new Set(ids.map(String))
  db.users.forEach((u) => {
    if (idSet.has(String(u.id))) u.status = status
  })
  return delay({ updated: ids.length, status })
}