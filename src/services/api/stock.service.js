import { db, delay, nextStockMoveId } from '@/services/mock/data.js'

const SORTABLE = ['productName', 'sku', 'category', 'stock', 'status']

function sortItems(items, sortKey, sortDir) {
  if (!sortKey || !SORTABLE.includes(sortKey)) return items
  const dir = sortDir === 'desc' ? -1 : 1
  return [...items].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
    return String(av).localeCompare(String(bv)) * dir
  })
}

/**
 * Flag semantics for the Approved/Pending family (Group B):
 *   Approved  → IsActive = 1, IsDelete = 0, Approved = 1
 *   Pending   → IsActive = 1, IsDelete = 0, Approved = 0
 *   Rejected  → IsActive = 0, IsDelete = 1, Approved = 0  (soft delete)
 */
function isApproved(m) {
  return m.IsDelete === 0 && m.Approved === 1
}
function isPending(m) {
  return m.IsDelete === 0 && m.IsActive === 1 && m.Approved === 0
}
function applyApproved(m) {
  m.IsActive = 1
  m.IsDelete = 0
  m.Approved = 1
}
function applyPending(m) {
  m.IsActive = 1
  m.IsDelete = 0
  m.Approved = 0
}
function applyRejected(m) {
  m.IsActive = 0
  m.IsDelete = 1
  m.Approved = 0
}

export async function getStockOverview(params = {}) {
  const {
    search = '',
    status = '',
    page = 1,
    pageSize = 10,
    sortKey = '',
    sortDir = 'asc',
  } = params

  let items = db.products.map((p) => ({
    id: p.id,
    productName: p.name,
    sku: p.sku,
    category: p.category,
    stock: p.stock,
    unit: p.unit,
    status: p.stock === 0 ? 'Out of stock' : p.stock <= 8 ? 'Low stock' : 'In stock',
    productStatus: p.status,
  }))

  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (p) => p.productName.toLowerCase().includes(q) || p.sku.includes(search),
    )
  }
  if (status) items = items.filter((p) => p.status === status)

  items = sortItems(items, sortKey, sortDir)

  const total = items.length
  const start = (page - 1) * pageSize
  const slice = items.slice(start, start + pageSize)

  return delay({ items: slice, total, page, pageSize })
}

export async function getStockHistory(params = {}) {
  const {
    search = '',
    productId,
    approvalStatus = 'Pending',
    page = 1,
    pageSize = 10,
    sortKey = '',
    sortDir = 'desc',
  } = params

  let items = db.stockMoves.filter((m) => m.IsDelete === 0)

  if (approvalStatus === 'Approved') {
    items = items.filter(isApproved)
  } else if (approvalStatus === 'Pending') {
    items = items.filter(isPending)
  }

  if (productId) items = items.filter((m) => m.productId === productId)

  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (m) =>
        m.productName.toLowerCase().includes(q) ||
        m.sku.includes(search) ||
        m.reason.toLowerCase().includes(q),
    )
  }

  const SORTABLE_HIST = [
    'date',
    'productName',
    'sku',
    'type',
    'quantity',
    'before',
    'after',
    'reason',
    'user',
  ]
  if (sortKey && SORTABLE_HIST.includes(sortKey)) {
    const dir = sortDir === 'desc' ? -1 : 1
    items.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })
  } else {
    items.sort((a, b) => (a.date < b.date ? 1 : -1))
  }

  const total = items.length
  const start = (page - 1) * pageSize
  const slice = items.slice(start, start + pageSize)

  return delay({ items: slice, total, page, pageSize })
}

export async function adjustStock(payload) {
  const product = db.products.find((p) => String(p.id) === String(payload.productId))
  if (!product) {
    const err = new Error('Product not found')
    err.status = 'not_found'
    throw err
  }
  const before = product.stock
  const after = Math.max(before + Number(payload.delta), 0)
  product.stock = after

  const move = {
    id: nextStockMoveId(),
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    type: payload.delta >= 0 ? 'in' : 'out',
    quantity: Math.abs(payload.delta),
    before,
    after,
    reason: payload.reason || 'Manual adjustment',
    user: payload.user || 'Admin',
    date: new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    IsActive: 1,
    IsDelete: 0,
    Approved: 0, // new moves start as Pending
  }
  db.stockMoves.unshift(move)
  return delay(move)
}

export async function getStockMoveById(id) {
  const found = db.stockMoves.find(
    (m) => String(m.id) === String(id) && m.IsDelete === 0,
  )
  if (!found) {
    const err = new Error('Stock move not found')
    err.status = 'not_found'
    throw err
  }
  return delay(found)
}

export async function updateStockMove(id, payload) {
  const idx = db.stockMoves.findIndex(
    (m) => String(m.id) === String(id) && m.IsDelete === 0,
  )
  if (idx < 0) {
    const err = new Error('Stock move not found')
    err.status = 'not_found'
    throw err
  }
  // Rule: editing pushes the record back to Pending.
  db.stockMoves[idx] = {
    ...db.stockMoves[idx],
    ...payload,
    IsActive: 1,
    IsDelete: 0,
    Approved: 0,
  }
  return delay(db.stockMoves[idx])
}

export async function deleteStockMove(id) {
  const move = db.stockMoves.find(
    (m) => String(m.id) === String(id) && m.IsDelete === 0,
  )
  if (move) applyRejected(move)
  return delay(null)
}

export async function approveStockMove(id) {
  const move = db.stockMoves.find(
    (m) => String(m.id) === String(id) && m.IsDelete === 0,
  )
  if (move) applyApproved(move)
  return delay(move)
}

export async function bulkApproveStockMoves(ids) {
  const set = new Set(ids.map(String))
  db.stockMoves.forEach((m) => {
    if (set.has(String(m.id)) && m.IsDelete === 0) applyApproved(m)
  })
  return delay({ updated: ids.length })
}

export async function bulkPendingStockMoves(ids) {
  const set = new Set(ids.map(String))
  db.stockMoves.forEach((m) => {
    if (set.has(String(m.id)) && m.IsDelete === 0) applyPending(m)
  })
  return delay({ updated: ids.length })
}

export async function bulkRejectStockMoves(ids) {
  const set = new Set(ids.map(String))
  db.stockMoves.forEach((m) => {
    if (set.has(String(m.id)) && m.IsDelete === 0) applyRejected(m)
  })
  return delay({ updated: ids.length })
}