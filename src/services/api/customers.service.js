import { db, delay, nextCustomerId } from '@/services/mock/data.js'

export async function getCustomers(params = {}) {
  const { search = '', status = 'Active' } = params

  let items = db.customers.filter((c) => c.IsDelete === 0)
  items = items.filter((c) => (status === 'Active' ? c.IsActive === 1 : c.IsActive === 0))

  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.memberCode.toLowerCase().includes(q) ||
        c.phone.includes(search),
    )
  }

  return delay({ items, total: items.length })
}

export async function getCustomerById(id) {
  const found = db.customers.find((c) => String(c.id) === String(id) && c.IsDelete === 0)
  if (!found) {
    const err = new Error('Customer not found')
    err.status = 'not_found'
    throw err
  }
  return delay(found)
}

export async function createCustomer(payload) {
  const customer = {
    id: nextCustomerId(),
    memberCode: `C-${String(db.customers.length + 41).padStart(4, '0')}`,
    IsActive: 1,
    IsDelete: 0,
    joinedAt: new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    ...payload,
  }
  db.customers.push(customer)
  return delay(customer)
}

export async function updateCustomer(id, payload) {
  const idx = db.customers.findIndex(
    (c) => String(c.id) === String(id) && c.IsDelete === 0,
  )
  if (idx < 0) {
    const err = new Error('Customer not found')
    err.status = 'not_found'
    throw err
  }
  // Rule: editing pushes the record back to Inactive.
  db.customers[idx] = {
    ...db.customers[idx],
    ...payload,
    IsActive: 0,
  }
  return delay(db.customers[idx])
}

export async function deleteCustomer(id) {
  const customer = db.customers.find((c) => String(c.id) === String(id))
  if (customer) {
    customer.IsActive = 0
    customer.IsDelete = 1
  }
  return delay(null)
}

export async function bulkUpdateCustomerStatus(ids, status) {
  const idSet = new Set(ids.map(String))
  const isActive = status === 'Active' ? 1 : 0
  db.customers.forEach((c) => {
    if (idSet.has(String(c.id)) && c.IsDelete === 0) c.IsActive = isActive
  })
  return delay({ updated: ids.length, status })
}

export async function bulkDeleteCustomers(ids) {
  const idSet = new Set(ids.map(String))
  db.customers.forEach((c) => {
    if (idSet.has(String(c.id))) {
      c.IsActive = 0
      c.IsDelete = 1
    }
  })
  return delay({ updated: ids.length })
}