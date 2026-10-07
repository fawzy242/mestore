import { db, delay, nextCashMoveId } from '@/services/mock/data.js'

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

export async function getCashMovements(params = {}) {
  const { search = '', type = '', approvalStatus = 'Pending' } = params
  let items = db.cashMoves.filter((c) => c.IsDelete === 0)

  if (approvalStatus === 'Approved') {
    items = items.filter(isApproved)
  } else if (approvalStatus === 'Pending') {
    items = items.filter(isPending)
  }

  if (type) items = items.filter((c) => c.type === type)

  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (c) => c.reason.toLowerCase().includes(q) || c.user.toLowerCase().includes(q),
    )
  }

  return delay({ items, total: items.length })
}

export async function getCashMovementById(id) {
  const found = db.cashMoves.find(
    (c) => String(c.id) === String(id) && c.IsDelete === 0,
  )
  if (!found) {
    const err = new Error('Cash movement not found')
    err.status = 'not_found'
    throw err
  }
  return delay(found)
}

export async function createCashMovement(payload) {
  const move = {
    id: nextCashMoveId(),
    date: new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    IsActive: 1,
    IsDelete: 0,
    Approved: 0, // new records start as Pending
    ...payload,
  }
  db.cashMoves.unshift(move)
  return delay(move)
}

export async function updateCashMovement(id, payload) {
  const idx = db.cashMoves.findIndex(
    (c) => String(c.id) === String(id) && c.IsDelete === 0,
  )
  if (idx < 0) {
    const err = new Error('Cash movement not found')
    err.status = 'not_found'
    throw err
  }
  // Rule: editing pushes the record back to Pending.
  db.cashMoves[idx] = {
    ...db.cashMoves[idx],
    ...payload,
    IsActive: 1,
    IsDelete: 0,
    Approved: 0,
  }
  return delay(db.cashMoves[idx])
}

export async function deleteCashMovement(id) {
  const move = db.cashMoves.find(
    (c) => String(c.id) === String(id) && c.IsDelete === 0,
  )
  if (move) applyRejected(move)
  return delay(null)
}

export async function approveCashMovement(id) {
  const move = db.cashMoves.find(
    (c) => String(c.id) === String(id) && c.IsDelete === 0,
  )
  if (move) applyApproved(move)
  return delay(move)
}

export async function bulkApproveCashMovements(ids) {
  const set = new Set(ids.map(String))
  db.cashMoves.forEach((c) => {
    if (set.has(String(c.id)) && c.IsDelete === 0) applyApproved(c)
  })
  return delay({ updated: ids.length })
}

export async function bulkPendingCashMovements(ids) {
  const set = new Set(ids.map(String))
  db.cashMoves.forEach((c) => {
    if (set.has(String(c.id)) && c.IsDelete === 0) applyPending(c)
  })
  return delay({ updated: ids.length })
}

export async function bulkRejectCashMovements(ids) {
  const set = new Set(ids.map(String))
  db.cashMoves.forEach((c) => {
    if (set.has(String(c.id)) && c.IsDelete === 0) applyRejected(c)
  })
  return delay({ updated: ids.length })
}