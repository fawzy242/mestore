import { db, delay, nextDiscountId } from '@/services/mock/data.js'

/**
 * Flag semantics for the Approved/Pending family (Group B):
 *   Approved  → IsActive = 1, IsDelete = 0, Approved = 1
 *   Pending   → IsActive = 1, IsDelete = 0, Approved = 0
 *   Rejected  → IsActive = 0, IsDelete = 1, Approved = 0  (soft delete)
 */
function isApproved(r) {
  return r.IsDelete === 0 && r.Approved === 1
}
function isPending(r) {
  return r.IsDelete === 0 && r.IsActive === 1 && r.Approved === 0
}
function applyApproved(r) {
  r.IsActive = 1
  r.IsDelete = 0
  r.Approved = 1
}
function applyPending(r) {
  r.IsActive = 1
  r.IsDelete = 0
  r.Approved = 0
}
function applyRejected(r) {
  r.IsActive = 0
  r.IsDelete = 1
  r.Approved = 0
}

export async function getDiscounts(params = {}) {
  const { search = '', approvalStatus = 'Approved' } = params
  let items = db.discounts.filter((d) => d.IsDelete === 0)

  if (approvalStatus === 'Approved') {
    items = items.filter(isApproved)
  } else if (approvalStatus === 'Pending') {
    items = items.filter(isPending)
  }

  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (d) =>
        d.name.toLowerCase().includes(q) || d.appliesTo.toLowerCase().includes(q),
    )
  }

  return delay({ items, total: items.length })
}

export async function getDiscountById(id) {
  const found = db.discounts.find((d) => String(d.id) === String(id) && d.IsDelete === 0)
  if (!found) {
    const err = new Error('Discount not found')
    err.status = 'not_found'
    throw err
  }
  return delay(found)
}

export async function createDiscount(payload) {
  const discount = {
    id: nextDiscountId(),
    IsActive: 1,
    IsDelete: 0,
    Approved: 0, // new records start as Pending
    ...payload,
  }
  db.discounts.push(discount)
  return delay(discount)
}

export async function updateDiscount(id, payload) {
  const idx = db.discounts.findIndex(
    (d) => String(d.id) === String(id) && d.IsDelete === 0,
  )
  if (idx < 0) {
    const err = new Error('Discount not found')
    err.status = 'not_found'
    throw err
  }
  // Rule: editing pushes the record back to Pending.
  db.discounts[idx] = {
    ...db.discounts[idx],
    ...payload,
    IsActive: 1,
    IsDelete: 0,
    Approved: 0,
  }
  return delay(db.discounts[idx])
}

export async function deleteDiscount(id) {
  const discount = db.discounts.find(
    (d) => String(d.id) === String(id) && d.IsDelete === 0,
  )
  if (discount) applyRejected(discount)
  return delay(null)
}

export async function approveDiscount(id) {
  const discount = db.discounts.find(
    (d) => String(d.id) === String(id) && d.IsDelete === 0,
  )
  if (discount) applyApproved(discount)
  return delay(discount)
}

export async function bulkApproveDiscounts(ids) {
  const set = new Set(ids.map(String))
  db.discounts.forEach((d) => {
    if (set.has(String(d.id)) && d.IsDelete === 0) applyApproved(d)
  })
  return delay({ updated: ids.length })
}

export async function bulkPendingDiscounts(ids) {
  const set = new Set(ids.map(String))
  db.discounts.forEach((d) => {
    if (set.has(String(d.id)) && d.IsDelete === 0) applyPending(d)
  })
  return delay({ updated: ids.length })
}

export async function bulkRejectDiscounts(ids) {
  const set = new Set(ids.map(String))
  db.discounts.forEach((d) => {
    if (set.has(String(d.id)) && d.IsDelete === 0) applyRejected(d)
  })
  return delay({ updated: ids.length })
}