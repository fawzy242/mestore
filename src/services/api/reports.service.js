import { db, delay } from '@/services/mock/data.js'

/**
 * Range meta — used by dashboards and reports to translate a range key
 * into a day count and human label.
 */
const RANGE_META = {
  today: { label: 'Today', days: 1, multiplier: 0.18 },
  last7: { label: 'Last 7 days', days: 7, multiplier: 1 },
  last30: { label: 'Last 30 days', days: 30, multiplier: 4.2 },
  last90: { label: 'Last 90 days', days: 90, multiplier: 12.6 },
}

const PAYMENT_COLORS = { Cash: '#C8102E', Card: '#B45309', QRIS: '#5B5F64' }
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
  return { from: fmt(from), to: fmt(today), label: `${fmt(from)} - ${fmt(today)}` }
}

/* ----------------------------------------------------------------------------
 * Base aggregation helpers
 * ------------------------------------------------------------------------- */

function allTransactions() {
  return db.transactions || []
}

/**
 * Aggregates unitsSold & revenue per product name across every transaction.
 */
function aggregateProducts() {
  const productByName = new Map()
  ;(db.products || []).forEach((p) => productByName.set(p.name, p))

  const aggregates = new Map()
  for (const tx of allTransactions()) {
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

function derivePaymentMethods(txs) {
  const counts = new Map()
  const totals = new Map()
  for (const tx of txs) {
    const method = tx.method || 'Cash'
    counts.set(method, (counts.get(method) || 0) + 1)
    totals.set(method, (totals.get(method) || 0) + (Number(tx.total) || 0))
  }
  const ordered = ['Cash', 'Card', 'QRIS']
  const items = ordered
    .filter((m) => counts.has(m))
    .map((name) => ({
      name,
      value: counts.get(name),
      amount: totals.get(name) || 0,
      color: PAYMENT_COLORS[name] || FALLBACK_COLOR,
    }))
  for (const [name, value] of counts.entries()) {
    if (!ordered.includes(name)) {
      items.push({ name, value, amount: totals.get(name) || 0, color: FALLBACK_COLOR })
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
 * Weekly sales trend derived from transactions grouped by calendar day.
 * Always returns 7 buckets ending "today".
 */
function deriveDailyTrend(days = 7) {
  const buckets = new Map()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    buckets.set(key, { label: key, total: 0, transactions: 0 })
  }

  for (const tx of allTransactions()) {
    const d = new Date(tx.time)
    if (Number.isNaN(d.getTime())) continue
    d.setHours(0, 0, 0, 0)
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (buckets.has(key)) {
      const b = buckets.get(key)
      b.total += Number(tx.total) || 0
      b.transactions += 1
    }
  }

  return Array.from(buckets.values())
}

function deriveHourly(totalTransactions) {
  const weights = [4, 6, 9, 12, 10, 8, 14, 11, 9, 7, 5, 3]
  const totalWeight = weights.reduce((s, w) => s + w, 0)
  return weights.map((w, i) => ({
    hour: `${String(8 + i).padStart(2, '0')}:00`,
    transactions: Math.round((totalTransactions * w) / totalWeight),
  }))
}

/* ----------------------------------------------------------------------------
 * Public API — Dashboard
 * ------------------------------------------------------------------------- */

export async function getDashboardSummary() {
  const txs = allTransactions()
  const totalSales = txs.reduce((sum, t) => sum + (Number(t.total) || 0), 0)
  const cashSales = txs
    .filter((t) => t.method === 'Cash')
    .reduce((sum, t) => sum + (Number(t.total) || 0), 0)

  const products = db.products || []
  const lowStock = products.filter((p) => p.IsDelete === 0 && p.stock <= 8)

  return delay({
    todaySales: totalSales,
    todayTransactions: txs.length,
    cashCollected: cashSales,
    avgSale: txs.length > 0 ? Math.round(totalSales / txs.length) : 0,
    totalProducts: products.length,
    lowStockCount: lowStock.length,
  })
}

/**
 * Dashboard payload — everything derived from the same mock dataset so
 * charts, KPIs, and tables stay consistent.
 *
 * @param {{ range?: 'today'|'last7'|'last30'|'last90' }} [options]
 */
export async function getDashboardData({ range = 'last7' } = {}) {
  const meta = RANGE_META[range] || RANGE_META.last7
  const dates = rangeDates(meta.days)

  const txs = allTransactions()
  const baseSales = txs.reduce((s, t) => s + (Number(t.total) || 0), 0)
  const baseTx = txs.length
  const baseCash = txs
    .filter((t) => t.method === 'Cash')
    .reduce((s, t) => s + (Number(t.total) || 0), 0)

  const summary = {
    totalSales: scale(baseSales, meta.multiplier),
    totalTransactions: scale(baseTx, meta.multiplier),
    cashCollected: scale(baseCash, meta.multiplier),
    avgSale: baseTx > 0 ? Math.round(baseSales / baseTx) : 0,
    rangeLabel: dates.label,
    range,
  }

  const topProducts = aggregateProducts()
    .map((p) => ({
      ...p,
      unitsSold: scale(p.unitsSold, meta.multiplier),
      revenue: scale(p.revenue, meta.multiplier),
    }))
    .sort((a, b) => b.revenue - a.revenue)

  const categoryBreakdown = deriveCategoryBreakdown(topProducts)
  const paymentMethods = derivePaymentMethods(txs)
  const dailyTrend = deriveDailyTrend(7)
  const hourly = deriveHourly(summary.totalTransactions)

  // Cashier leaderboard derived from real transactions
  const cashierMap = new Map()
  for (const tx of txs) {
    const name = tx.cashier || 'Unknown'
    const cur = cashierMap.get(name) || { name, sales: 0, transactions: 0 }
    cur.sales += Number(tx.total) || 0
    cur.transactions += 1
    cashierMap.set(name, cur)
  }
  const cashiers = Array.from(cashierMap.values())
    .map((c) => ({
      ...c,
      sales: scale(c.sales, meta.multiplier),
      transactions: scale(c.transactions, meta.multiplier),
    }))
    .sort((a, b) => b.sales - a.sales)

  const lowStockItems = (db.products || [])
    .filter((p) => p.IsDelete === 0 && p.stock <= 8)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6)

  const recentTransactions = [...txs]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5)

  return delay({
    summary,
    topProducts,
    categoryBreakdown,
    paymentMethods,
    hourly,
    dailyTrend,
    cashiers,
    lowStockItems,
    recentTransactions,
    rangeMeta: { ...meta, from: dates.from, to: dates.to },
  })
}

/* ----------------------------------------------------------------------------
 * Public API — Reports (backward-compatible with existing ReportsPage)
 * ------------------------------------------------------------------------- */

export async function getReports({ range = 'last7' } = {}) {
  const data = await getDashboardData({ range })
  return {
    summary: data.summary,
    topProducts: data.topProducts.slice(0, 10),
    categoryBreakdown: data.categoryBreakdown,
    paymentMethods: data.paymentMethods,
    hourly: data.hourly,
    dailyTrend: data.dailyTrend,
    cashiers: data.cashiers,
    rangeMeta: data.rangeMeta,
  }
}