import { db, delay, nextUserId } from '@/services/mock/data.js'

const SORTABLE_KEYS = ['name', 'username', 'role']

function sortItems(items, sortKey, sortDir) {
  if (!sortKey || !SORTABLE_KEYS.includes(sortKey)) return items
  const dir = sortDir === 'desc' ? -1 : 1
  return [...items].sort(
    (a, b) => String(a[sortKey]).localeCompare(String(b[sortKey])) * dir,
  )
}

export async function getUsers(params = {}) {
  const {
    search = '',
    role = '',
    isActive = true,
    page = 1,
    pageSize = 10,
    sortKey = '',
    sortDir = 'asc',
  } = params

  let items = db.users.filter((u) => u.IsDelete === 0)
  items = items.filter((u) => (isActive ? u.IsActive === 1 : u.IsActive === 0))

  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (u) => u.name.toLowerCase().includes(q) || u.username.includes(q),
    )
  }
  if (role) items = items.filter((u) => u.role === role)

  items = sortItems(items, sortKey, sortDir)

  const total = items.length
  const start = (page - 1) * pageSize
  const slice = items.slice(start, start + pageSize)

  return delay({ items: slice, total, page, pageSize })
}

export async function getUserById(id) {
  const found = db.users.find((u) => String(u.id) === String(id) && u.IsDelete === 0)
  if (!found) {
    const err = new Error('User not found')
    err.status = 'not_found'
    throw err
  }
  return delay(found)
}

export async function createUser(payload) {
  const user = {
    id: nextUserId(),
    IsActive: 1,
    IsDelete: 0,
    ...payload,
  }
  db.users.push(user)
  return delay(user)
}

export async function updateUser(id, payload) {
  const idx = db.users.findIndex((u) => String(u.id) === String(id) && u.IsDelete === 0)
  if (idx < 0) {
    const err = new Error('User not found')
    err.status = 'not_found'
    throw err
  }
  // Rule: editing pushes the record back to Inactive.
  db.users[idx] = {
    ...db.users[idx],
    ...payload,
    IsActive: 0,
  }
  return delay(db.users[idx])
}

export async function deleteUser(id) {
  const user = db.users.find((u) => String(u.id) === String(id))
  if (user) {
    user.IsActive = 0
    user.IsDelete = 1
  }
  return delay(null)
}

/**
 * Backward-compatible helper — the old API used `deactivateUser`.
 * Kept for any legacy callers; forwards to the new logic.
 */
export async function deactivateUser(id) {
  const user = db.users.find((u) => String(u.id) === String(id))
  if (user) user.IsActive = 0
  return delay(user)
}

export async function bulkUpdateUserStatus(ids, status) {
  const idSet = new Set(ids.map(String))
  const isActive = status === 'Active' ? 1 : 0
  db.users.forEach((u) => {
    if (idSet.has(String(u.id)) && u.IsDelete === 0) u.IsActive = isActive
  })
  return delay({ updated: ids.length, status })
}

export async function bulkDeleteUsers(ids) {
  const idSet = new Set(ids.map(String))
  db.users.forEach((u) => {
    if (idSet.has(String(u.id))) {
      u.IsActive = 0
      u.IsDelete = 1
    }
  })
  return delay({ updated: ids.length })
}