import { db, delay } from '@/services/mock/data.js'

/**
 * Range meta — the multiplier simulates how much larger a longer window is
 * vs. the 7-day baseline. All derived metrics scale uniformly, so ratios
 * (avg sale, category share, payment share) remain constant across ranges.
 */
const RANGE_META = {
  today: { label: 'Today', days: 1, multiplier: 0.18 },
  last7: { label: 'Last 7 days', days: 7, multiplier: 1 },
  last30: { label: 'Last 30 days', days: 30, multiplier: 4.2 },
}

const PAYMENT_COLORS = {
  Cash: '#C8102E',
  Card: '#B45309',
  QRIS: '#5B5F64',
}
const FALLBACK_COLOR = '#8F706C'

const CATEGORY_PALETTE = ['#C8102E', '#B45309', '#5B5F64', '#8F706C', '#DC2626', '#166534']

function scale(value, multiplier) {
  return Math.round(value * multiplier)
}

function rangeDates(days) {
  const today = new Date()
  const from = new Date(today)
  from.setDate(today.getDate() - (days - 1))
  const fmt = (d) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const fromStr = fmt(from)
  const toStr = fmt(today)
  return { from: fromStr, to: toStr, label: `${fromStr} - ${toStr}` }
}

/**
 * Aggregate unitsSold and revenue per product name across all transactions.
 * Enriches each row with the product's SKU and category using db.products.
 */
function aggregateProducts() {
  const productByName = new Map()
  db.products.forEach((p) => productByName.set(p.name, p))

  const aggregates = new Map()
  for (const tx of db.transactions) {
    for (const line of tx.items || []) {
      const name = line.name
      const qty = Number(line.qty) || 0
      const price = Number(line.price) || 0
      const cur = aggregates.get(name) || { unitsSold: 0, revenue: 0 }
      cur.unitsSold += qty
      cur.revenue += qty * price
      aggregates.set(name, cur)
    }
  }

  return Array.from(aggregates.entries()).map(([name, v]) => {
    const p = productByName.get(name)
    return {
      id: p?.id ?? name,
      name,
      sku: p?.sku ?? '',
      category: p?.category ?? 'Other',
      unitsSold: v.unitsSold,
      revenue: v.revenue,
    }
  })
}

function derivePaymentMethods() {
  const counts = new Map()
  for (const tx of db.transactions) {
    const method = tx.method || 'Cash'
    counts.set(method, (counts.get(method) || 0) + 1)
  }
  const ordered = ['Cash', 'Card', 'QRIS']
  const items = ordered
    .filter((m) => counts.has(m))
    .map((name) => ({
      name,
      value: counts.get(name),
      color: PAYMENT_COLORS[name] || FALLBACK_COLOR,
    }))
  // Include any non-standard methods that appear in the data.
  for (const [name, value] of counts.entries()) {
    if (!ordered.includes(name)) {
      items.push({ name, value, color: FALLBACK_COLOR })
    }
  }
  const total = items.reduce((s, m) => s + m.value, 0) || 1
  items.forEach((m) => {
    m.pct = Math.round((m.value / total) * 100)
  })
  return items
}

function deriveCategoryBreakdown(topProducts) {
  const map = new Map()
  topProducts.forEach((p) => {
    const cat = p.category || 'Other'
    const cur = map.get(cat) || { revenue: 0, units: 0 }
    cur.revenue += p.revenue
    cur.units += p.unitsSold
    map.set(cat, cur)
  })
  const totalRevenue = topProducts.reduce((s, p) => s + p.revenue, 0) || 1
  return Array.from(map.entries())
    .map(([name, v], i) => ({
      name,
      revenue: v.revenue,
      units: v.units,
      pct: Math.round((v.revenue / totalRevenue) * 100),
      color: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length],
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

/**
 * Hourly distribution — derived from the total transaction count so the shape
 * scales with the selected range. This is a demo/UI placeholder; the Reports
 * page does not currently render it, but the field is retained for interface
 * stability.
 */
function deriveHourly(totalTransactions) {
  const weights = [4, 6, 9, 12, 10, 8, 14, 11, 9, 7, 5, 3]
  const totalWeight = weights.reduce((s, w) => s + w, 0)
  return weights.map((w, i) => ({
    hour: `${String(8 + i).padStart(2, '0')}:00`,
    transactions: Math.round((totalTransactions * w) / totalWeight),
  }))
}

export async function getDashboardSummary() {
  const transactions = db.transactions
  const totalSales = transactions.reduce((sum, t) => sum + (Number(t.total) || 0), 0)
  return delay({
    todaySales: totalSales,
    todayTransactions: transactions.length,
    totalProducts: db.products.length,
    lowStockCount: db.products.filter((p) => p.stock <= 8).length,
  })
}

export async function getReports({ range = 'last7' } = {}) {
  const meta = RANGE_META[range] || RANGE_META.last7
  const mult = meta.multiplier
  const dates = rangeDates(meta.days)

  // ---- Base metrics (before multiplier) ----
  const transactions = db.transactions
  const baseSales = transactions.reduce((s, t) => s + (Number(t.total) || 0), 0)
  const baseTx = transactions.length
  const baseCash = transactions
    .filter((t) => t.method === 'Cash')
    .reduce((s, t) => s + (Number(t.total) || 0), 0)

  // ---- Summary ----
  const summary = {
    totalSales: scale(baseSales, mult),
    totalTransactions: scale(baseTx, mult),
    cashCollected: scale(baseCash, mult),
    avgSale: baseTx > 0 ? Math.round(baseSales / baseTx) : 0,
    rangeLabel: dates.label,
    range,
  }

  // ---- Top products (from real transaction items) ----
  const topProducts = aggregateProducts()
    .map((p) => ({
      ...p,
      unitsSold: scale(p.unitsSold, mult),
      revenue: scale(p.revenue, mult),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  // ---- Category breakdown (derived from top products) ----
  const categoryBreakdown = deriveCategoryBreakdown(topProducts)

  // ---- Payment methods (from transaction.method) ----
  const paymentMethods = derivePaymentMethods()

  // ---- Hourly (demo placeholder, scaled by range) ----
  const hourly = deriveHourly(summary.totalTransactions)

  return delay({
    summary,
    topProducts,
    categoryBreakdown,
    paymentMethods,
    hourly,
    rangeMeta: { ...meta, from: dates.from, to: dates.to },
  })
}