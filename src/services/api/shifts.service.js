/**
 * Shift Management service — view-only.
 * The shift lifecycle (open / close) is handled by useShift on the POS page.
 * This service only reads the historical shift records.
 */
import { db, delay } from '@/services/mock/data.js'

export async function getShifts(params = {}) {
  const { search = '', status = '', page = 1, pageSize = 10 } = params

  let items = [...db.shifts]

  if (status) {
    items = items.filter((s) => s.status === status)
  }

  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (s) =>
        String(s.id).toLowerCase().includes(q) ||
        s.cashier.toLowerCase().includes(q),
    )
  }

  items.sort((a, b) => (a.date < b.date ? 1 : -1))

  const total = items.length
  const start = (page - 1) * pageSize
  const slice = items.slice(start, start + pageSize)

  return delay({ items: slice, total, page, pageSize })
}

export async function getShiftById(id) {
  const found = db.shifts.find((s) => String(s.id) === String(id))
  if (!found) {
    const err = new Error('Shift not found')
    err.status = 'not_found'
    throw err
  }
  return delay(found)
}