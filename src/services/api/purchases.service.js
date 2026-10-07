import { db, delay, nextPurchaseId } from '@/services/mock/data.js'

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

export async function getPurchases(params = {}) {
  const { search = '', status = '', approvalStatus = 'Pending' } = params
  let items = db.purchases.filter((p) => p.IsDelete === 0)

  if (approvalStatus === 'Approved') {
    items = items.filter(isApproved)
  } else if (approvalStatus === 'Pending') {
    items = items.filter(isPending)
  }

  if (status) items = items.filter((p) => p.status === status)

  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (p) =>
        p.refNo.toLowerCase().includes(q) || p.supplierName.toLowerCase().includes(q),
    )
  }

  return delay({ items, total: items.length })
}

export async function getPurchaseById(id) {
  const found = db.purchases.find(
    (p) => String(p.id) === String(id) && p.IsDelete === 0,
  )
  if (!found) {
    const err = new Error('Purchase not found')
    err.status = 'not_found'
    throw err
  }
  return delay(found)
}

export async function createPurchase(payload) {
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const purchase = {
    id: nextPurchaseId(),
    refNo: `PO-2026-${String(100 + db.purchases.length).slice(-4)}`,
    IsActive: 1,
    IsDelete: 0,
    Approved: 0, // new records start as Pending
    ...payload,
  }
  if (!purchase.date) purchase.date = today
  db.purchases.push(purchase)
  return delay(purchase)
}

export async function updatePurchase(id, payload) {
  const idx = db.purchases.findIndex(
    (p) => String(p.id) === String(id) && p.IsDelete === 0,
  )
  if (idx < 0) {
    const err = new Error('Purchase not found')
    err.status = 'not_found'
    throw err
  }
  // Rule: editing pushes the record back to Pending.
  db.purchases[idx] = {
    ...db.purchases[idx],
    ...payload,
    IsActive: 1,
    IsDelete: 0,
    Approved: 0,
  }
  return delay(db.purchases[idx])
}

export async function deletePurchase(id) {
  const purchase = db.purchases.find(
    (p) => String(p.id) === String(id) && p.IsDelete === 0,
  )
  if (purchase) applyRejected(purchase)
  return delay(null)
}

export async function approvePurchase(id) {
  const purchase = db.purchases.find(
    (p) => String(p.id) === String(id) && p.IsDelete === 0,
  )
  if (purchase) applyApproved(purchase)
  return delay(purchase)
}

export async function bulkApprovePurchases(ids) {
  const set = new Set(ids.map(String))
  db.purchases.forEach((p) => {
    if (set.has(String(p.id)) && p.IsDelete === 0) applyApproved(p)
  })
  return delay({ updated: ids.length })
}

export async function bulkPendingPurchases(ids) {
  const set = new Set(ids.map(String))
  db.purchases.forEach((p) => {
    if (set.has(String(p.id)) && p.IsDelete === 0) applyPending(p)
  })
  return delay({ updated: ids.length })
}

export async function bulkRejectPurchases(ids) {
  const set = new Set(ids.map(String))
  db.purchases.forEach((p) => {
    if (set.has(String(p.id)) && p.IsDelete === 0) applyRejected(p)
  })
  return delay({ updated: ids.length })
}