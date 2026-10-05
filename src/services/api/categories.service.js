import { db, delay, nextCategoryId } from '@/services/mock/data.js'

export async function getCategories(params = {}) {
  const { status = 'Active' } = params
  let items = db.categories.map((c) => ({
    ...c,
    productCount: db.products.filter((p) => p.category === c.name).length,
  }))
  if (status) items = items.filter((c) => (c.status || 'Active') === status)
  return delay({ items, total: items.length })
}

export async function getCategoryById(id) {
  const found = db.categories.find((c) => String(c.id) === String(id))
  if (!found) {
    const error = new Error('Category not found')
    error.status = 'not_found'
    throw error
  }
  return delay(found)
}

export async function createCategory(payload) {
  const category = { id: nextCategoryId(), status: 'Active', ...payload }
  db.categories.push(category)
  return delay(category)
}

export async function updateCategory(id, payload) {
  const idx = db.categories.findIndex((c) => String(c.id) === String(id))
  if (idx < 0) {
    const error = new Error('Category not found')
    error.status = 'not_found'
    throw error
  }
  db.categories[idx] = { ...db.categories[idx], ...payload }
  return delay(db.categories[idx])
}

export async function deleteCategory(id) {
  const idx = db.categories.findIndex((c) => String(c.id) === String(id))
  if (idx >= 0) db.categories.splice(idx, 1)
  return delay(null)
}

export async function bulkUpdateCategoryStatus(ids, status) {
  const idSet = new Set(ids.map(String))
  db.categories.forEach((c) => {
    if (idSet.has(String(c.id))) c.status = status
  })
  return delay({ updated: ids.length, status })
}