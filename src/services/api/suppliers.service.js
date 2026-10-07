import { db, delay, nextSupplierId } from '@/services/mock/data.js'

export async function getSuppliers(params = {}) {
  const { search = '', status = 'Active' } = params

  let items = db.suppliers.filter((s) => s.IsDelete === 0)
  items = items.filter((s) => (status === 'Active' ? s.IsActive === 1 : s.IsActive === 0))

  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.contact.toLowerCase().includes(q),
    )
  }

  return delay({ items, total: items.length })
}

export async function getSupplierById(id) {
  const found = db.suppliers.find((s) => String(s.id) === String(id) && s.IsDelete === 0)
  if (!found) {
    const err = new Error('Supplier not found')
    err.status = 'not_found'
    throw err
  }
  return delay(found)
}

export async function createSupplier(payload) {
  const supplier = {
    id: nextSupplierId(),
    code: `SUP-${String(db.suppliers.length + 1).padStart(3, '0')}`,
    IsActive: 1,
    IsDelete: 0,
    joinedAt: new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    ...payload,
  }
  db.suppliers.push(supplier)
  return delay(supplier)
}

export async function updateSupplier(id, payload) {
  const idx = db.suppliers.findIndex(
    (s) => String(s.id) === String(id) && s.IsDelete === 0,
  )
  if (idx < 0) {
    const err = new Error('Supplier not found')
    err.status = 'not_found'
    throw err
  }
  // Rule: editing pushes the record back to Inactive.
  db.suppliers[idx] = {
    ...db.suppliers[idx],
    ...payload,
    IsActive: 0,
  }
  return delay(db.suppliers[idx])
}

export async function deleteSupplier(id) {
  const supplier = db.suppliers.find((s) => String(s.id) === String(id))
  if (supplier) {
    supplier.IsActive = 0
    supplier.IsDelete = 1
  }
  return delay(null)
}

export async function bulkUpdateSupplierStatus(ids, status) {
  const idSet = new Set(ids.map(String))
  const isActive = status === 'Active' ? 1 : 0
  db.suppliers.forEach((s) => {
    if (idSet.has(String(s.id)) && s.IsDelete === 0) s.IsActive = isActive
  })
  return delay({ updated: ids.length, status })
}

export async function bulkDeleteSuppliers(ids) {
  const idSet = new Set(ids.map(String))
  db.suppliers.forEach((s) => {
    if (idSet.has(String(s.id))) {
      s.IsActive = 0
      s.IsDelete = 1
    }
  })
  return delay({ updated: ids.length })
}