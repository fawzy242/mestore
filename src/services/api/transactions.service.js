/**
 * MOCK — swap for real endpoints when contract is confirmed.
 */
import { db, delay } from '@/services/mock/data.js'

const SORTABLE_KEYS = ['id', 'time', 'cashier', 'total']

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

function generateReceiptNumber() {
  return 'RC-' + String(1000 + Math.floor(Math.random() * 9000)).slice(-4)
}

export async function getTransactions(params = {}) {
  const {
    search = '',
    cashierId = null,
    limit,
    sortKey = '',
    sortDir = 'desc',
  } = params

  let items = [...db.transactions]
  if (search) items = items.filter((t) => t.id.toLowerCase().includes(search.toLowerCase()))
  if (cashierId != null) {
    const target = db.users.find((u) => u.id === cashierId)
    const name = target?.name?.split(' ')[0] || ''
    if (name) items = items.filter((t) => t.cashier === name)
  }
  items = sortItems(items, sortKey, sortDir)
  if (limit) items = items.slice(0, limit)
  return delay({ items, total: items.length })
}

export async function getTransactionById(id) {
  const found = db.transactions.find((t) => String(t.id) === String(id))
  if (!found) {
    const error = new Error('Transaction not found')
    error.status = 'not_found'
    throw error
  }
  return delay(found)
}

export async function createTransaction(payload) {
  const subtotal = payload.items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const discount = Number(payload.discount) || 0
  const total = Math.max(subtotal - discount, 0)
  const tendered = Number(payload.tendered) || total
  const receiptNo = generateReceiptNumber()
  const record = {
    id: receiptNo,
    time: new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    cashier: 'Siti',
    total,
    method: payload.method || 'Cash',
    tendered,
    items: payload.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
  }
  db.transactions.unshift(record)
  for (const line of payload.items) {
    const product = db.products.find((p) => p.name === line.name)
    if (product) product.stock = Math.max(product.stock - line.qty, 0)
  }
  return delay({
    receiptNo,
    items: record.items,
    subtotal,
    discount,
    total,
    tendered,
    change: tendered - total,
  })
}