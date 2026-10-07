import { db, delay, nextRefundId } from '@/services/mock/data.js'

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

export async function getRefunds(params = {}) {
  const { search = '', status = '', approvalStatus = 'Pending' } = params
  let items = db.refunds.filter((r) => r.IsDelete === 0)

  if (approvalStatus === 'Approved') {
    items = items.filter(isApproved)
  } else if (approvalStatus === 'Pending') {
    items = items.filter(isPending)
  }

  if (status) items = items.filter((r) => r.status === status)

  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (r) =>
        r.refNo.toLowerCase().includes(q) ||
        r.originalTxId.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q),
    )
  }

  return delay({ items, total: items.length })
}

export async function getRefundById(id) {
  const found = db.refunds.find(
    (r) => String(r.id) === String(id) && r.IsDelete === 0,
  )
  if (!found) {
    const err = new Error('Refund not found')
    err.status = 'not_found'
    throw err
  }
  return delay(found)
}

export async function createRefund(payload) {
  const refund = {
    id: nextRefundId(),
    refNo: `RF-2026-${String(100 + db.refunds.length).slice(-4)}`,
    date:
      payload.date ||
      new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    IsActive: 1,
    IsDelete: 0,
    Approved: 0, // new records start as Pending
    ...payload,
  }
  db.refunds.unshift(refund)
  return delay(refund)
}

export async function updateRefund(id, payload) {
  const idx = db.refunds.findIndex(
    (r) => String(r.id) === String(id) && r.IsDelete === 0,
  )
  if (idx < 0) {
    const err = new Error('Refund not found')
    err.status = 'not_found'
    throw err
  }
  // Rule: editing pushes the record back to Pending.
  db.refunds[idx] = {
    ...db.refunds[idx],
    ...payload,
    IsActive: 1,
    IsDelete: 0,
    Approved: 0,
  }
  return delay(db.refunds[idx])
}

export async function deleteRefund(id) {
  const refund = db.refunds.find(
    (r) => String(r.id) === String(id) && r.IsDelete === 0,
  )
  if (refund) applyRejected(refund)
  return delay(null)
}

export async function approveRefund(id) {
  const refund = db.refunds.find(
    (r) => String(r.id) === String(id) && r.IsDelete === 0,
  )
  if (refund) applyApproved(refund)
  return delay(refund)
}

export async function bulkApproveRefunds(ids) {
  const set = new Set(ids.map(String))
  db.refunds.forEach((r) => {
    if (set.has(String(r.id)) && r.IsDelete === 0) applyApproved(r)
  })
  return delay({ updated: ids.length })
}

export async function bulkPendingRefunds(ids) {
  const set = new Set(ids.map(String))
  db.refunds.forEach((r) => {
    if (set.has(String(r.id)) && r.IsDelete === 0) applyPending(r)
  })
  return delay({ updated: ids.length })
}

export async function bulkRejectRefunds(ids) {
  const set = new Set(ids.map(String))
  db.refunds.forEach((r) => {
    if (set.has(String(r.id)) && r.IsDelete === 0) applyRejected(r)
  })
  return delay({ updated: ids.length })
}