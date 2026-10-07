import { db, delay } from '@/services/mock/data.js'

/**
 * Range → { label, days, multiplier } — the multiplier simulates how much
 * larger a longer window is vs. the 7-day baseline, so numbers stay coherent.
 */
const RANGE_META = {
  today: { label: 'Today', from: 'Sep 24, 2026', to: 'Sep 24, 2026', multiplier: 0.18 },
  last7: { label: 'Last 7 days', from: 'Sep 18, 2026', to: 'Sep 24, 2026', multiplier: 1 },
  last30: { label: 'Last 30 days', from: 'Aug 26, 2026', to: 'Sep 24, 2026', multiplier: 4.2 },
  custom: { label: 'Custom Range', from: '', to: '', multiplier: 1 },
}

function scale(value, multiplier) {
  return Math.round(value * multiplier)
}

export async function getDashboardSummary() {
  const transactions = db.transactions
  const totalSales = transactions.reduce((sum, t) => sum + t.total, 0)
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

  // Summary
  const baseSales = db.transactions.reduce((sum, t) => sum + t.total, 0)
  const baseTx = db.transactions.length
  const baseCash = Math.round(baseSales * 0.72)

  const summary = {
    totalSales: scale(baseSales, mult),
    totalTransactions: scale(baseTx, mult),
    cashCollected: scale(baseCash, mult),
    avgSale: baseTx > 0 ? Math.round(baseSales / baseTx) : 0,
    rangeLabel: `${meta.from} - ${meta.to}`,
    range,
  }

  // Top products
  const topProducts = [...db.products]
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      unitsSold: scale(Math.max(220 - p.stock, 5), mult),
      revenue: scale(Math.max(220 - p.stock, 5) * p.price, mult),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  // Category breakdown — share of revenue from top products
  const totalRevenue = topProducts.reduce((s, p) => s + p.revenue, 0) || 1
  const catMap = new Map()
  topProducts.forEach((p) => {
    const cat = p.category || 'Other'
    const cur = catMap.get(cat) || { revenue: 0, units: 0 }
    cur.revenue += p.revenue
    cur.units += p.unitsSold
    catMap.set(cat, cur)
  })
  const palette = ['#C8102E', '#B45309', '#5B5F64', '#8F706C', '#DC2626', '#166534']
  const categoryBreakdown = Array.from(catMap.entries())
    .map(([name, v], i) => ({
      name,
      revenue: v.revenue,
      units: v.units,
      pct: Math.round((v.revenue / totalRevenue) * 100),
      color: palette[i % palette.length],
    }))
    .sort((a, b) => b.revenue - a.revenue)

  // Payment method split
  const paymentMethods = [
    { name: 'Cash', value: scale(78, 1), color: '#C8102E' },
    { name: 'Card', value: scale(15, 1), color: '#B45309' },
    { name: 'QRIS', value: scale(7, 1), color: '#5B5F64' },
  ]
  const payTotal = paymentMethods.reduce((s, m) => s + m.value, 0) || 1
  paymentMethods.forEach((m) => {
    m.pct = Math.round((m.value / payTotal) * 100)
  })

  // Hourly activity (simulated 24h distribution)
  const hourly = Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i
    const base = [4, 6, 9, 12, 10, 8, 14, 11, 9, 7, 5, 3][i]
    return {
      hour: `${String(hour).padStart(2, '0')}:00`,
      transactions: scale(base, mult),
    }
  })

  return delay({
    summary,
    topProducts,
    categoryBreakdown,
    paymentMethods,
    hourly,
    rangeMeta: meta,
  })
}