/**
 * MOCK — pattern only. Wire to real backend when contract is confirmed.
 */
import { db, delay } from '@/services/mock/data.js'

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
  const transactions = db.transactions
  const totalSales = transactions.reduce((sum, t) => sum + t.total, 0)
  const summary = {
    totalSales,
    totalTransactions: transactions.length,
    cashCollected: totalSales,
    range,
  }

  const topProducts = [...db.products]
    .map((p) => ({
      name: p.name,
      unitsSold: Math.max(220 - p.stock, 5),
      revenue: Math.max(220 - p.stock, 5) * p.price,
    }))
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5)

  return delay({ summary, topProducts })
}