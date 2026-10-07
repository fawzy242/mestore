import { db, delay, nextProductId } from '@/services/mock/data.js'

const SORTABLE_KEYS = ['name', 'sku', 'category', 'price', 'stock']

function sortItems(items, sortKey, sortDir) {
  if (!sortKey || !SORTABLE_KEYS.includes(sortKey)) return items
  const dir = sortDir === 'desc' ? -1 : 1
  return [...items].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
    return String(av).localeCompare(String(bv)) * dir
  })
}

export async function getProducts(params = {}) {
  const {
    search = '',
    category = '',
    isActive = true,
    lowStock = false,
    page = 1,
    pageSize = 10,
    sortKey = '',
    sortDir = 'asc',
  } = params

  let items = db.products.filter((p) => p.IsDelete === 0)
  items = items.filter((p) => (isActive ? p.IsActive === 1 : p.IsActive === 0))

  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.includes(search),
    )
  }
  if (category) items = items.filter((p) => p.category === category)
  if (lowStock) items = items.filter((p) => p.stock <= 8)

  items = sortItems(items, sortKey, sortDir)

  const total = items.length
  const start = (page - 1) * pageSize
  const slice = items.slice(start, start + pageSize)

  return delay({ items: slice, total, page, pageSize })
}

export async function getProductById(id) {
  const found = db.products.find((p) => String(p.id) === String(id) && p.IsDelete === 0)
  if (!found) {
    const err = new Error('Product not found')
    err.status = 'not_found'
    throw err
  }
  return delay(found)
}

export async function createProduct(payload) {
  const product = {
    id: nextProductId(),
    IsActive: 1,
    IsDelete: 0,
    ...payload,
  }
  db.products.push(product)
  return delay(product)
}

export async function updateProduct(id, payload) {
  const idx = db.products.findIndex((p) => String(p.id) === String(id) && p.IsDelete === 0)
  if (idx < 0) {
    const err = new Error('Product not found')
    err.status = 'not_found'
    throw err
  }
  // Rule: editing pushes the record back to Inactive.
  db.products[idx] = {
    ...db.products[idx],
    ...payload,
    IsActive: 0,
  }
  return delay(db.products[idx])
}

export async function deleteProduct(id) {
  const product = db.products.find((p) => String(p.id) === String(id))
  if (product) {
    product.IsActive = 0
    product.IsDelete = 1
  }
  return delay(null)
}

export async function bulkUpdateProductStatus(ids, status) {
  const idSet = new Set(ids.map(String))
  const isActive = status === 'Active' ? 1 : 0
  db.products.forEach((p) => {
    if (idSet.has(String(p.id)) && p.IsDelete === 0) p.IsActive = isActive
  })
  return delay({ updated: ids.length, status })
}

export async function bulkDeleteProducts(ids) {
  const idSet = new Set(ids.map(String))
  db.products.forEach((p) => {
    if (idSet.has(String(p.id))) {
      p.IsActive = 0
      p.IsDelete = 1
    }
  })
  return delay({ updated: ids.length })
}