import { db, delay, nextCategoryId } from '@/services/mock/data.js'

export async function getCategories(params = {}) {
  const { search = '', isActive = true, isDelete = false } = params

  let items = db.categories.filter((c) => c.IsDelete === (isDelete ? 1 : 0))
  if (!isDelete) {
    items = items.filter((c) => (isActive ? c.IsActive === 1 : c.IsActive === 0))
  }

  if (search) {
    const q = search.toLowerCase()
    items = items.filter((c) => c.name.toLowerCase().includes(q))
  }

  const enriched = items.map((c) => ({
    ...c,
    productCount: db.products.filter((p) => p.category === c.name && p.IsDelete === 0).length,
  }))

  return delay({ items: enriched, total: enriched.length })
}

export async function getCategoryById(id) {
  const found = db.categories.find((c) => String(c.id) === String(id) && c.IsDelete === 0)
  if (!found) {
    const err = new Error('Category not found')
    err.status = 'not_found'
    throw err
  }
  return delay(found)
}

export async function createCategory(payload) {
  const category = {
    id: nextCategoryId(),
    IsActive: 1,
    IsDelete: 0,
    ...payload,
  }
  db.categories.push(category)
  return delay(category)
}

export async function updateCategory(id, payload) {
  const idx = db.categories.findIndex(
    (c) => String(c.id) === String(id) && c.IsDelete === 0,
  )
  if (idx < 0) {
    const err = new Error('Category not found')
    err.status = 'not_found'
    throw err
  }
  // Rule: editing pushes the record back to Inactive.
  db.categories[idx] = {
    ...db.categories[idx],
    ...payload,
    IsActive: 0,
  }
  return delay(db.categories[idx])
}

export async function deleteCategory(id) {
  const category = db.categories.find((c) => String(c.id) === String(id))
  if (category) {
    category.IsActive = 0
    category.IsDelete = 1
  }
  return delay(null)
}

export async function bulkUpdateCategoryStatus(ids, status) {
  const idSet = new Set(ids.map(String))
  const isActive = status === 'Active' ? 1 : 0
  db.categories.forEach((c) => {
    if (idSet.has(String(c.id)) && c.IsDelete === 0) c.IsActive = isActive
  })
  return delay({ updated: ids.length, status })
}

export async function bulkDeleteCategories(ids) {
  const idSet = new Set(ids.map(String))
  db.categories.forEach((c) => {
    if (idSet.has(String(c.id))) {
      c.IsActive = 0
      c.IsDelete = 1
    }
  })
  return delay({ updated: ids.length })
}