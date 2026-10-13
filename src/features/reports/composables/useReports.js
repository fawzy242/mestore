import { computed, reactive, ref } from 'vue'
import * as reportsService from '@/services/api/reports.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

/**
 * Report registry — each entry declares the parameters the UI must render
 * for that report and how to build the export column set.
 */
export const REPORT_TYPES = Object.freeze([
  {
    id: 'sales-summary',
    label: 'Sales Summary',
    description: 'Totals, averages and payment mix for a period.',
    icon: 'payments',
    params: [
      {
        key: 'range',
        label: 'Period',
        type: 'select',
        required: true,
        default: 'last7',
        options: [
          { value: 'today', label: 'Today' },
          { value: 'last7', label: 'Last 7 days' },
          { value: 'last30', label: 'Last 30 days' },
          { value: 'last90', label: 'Last 90 days' },
        ],
      },
      {
        key: 'method',
        label: 'Payment Method',
        type: 'select',
        required: false,
        default: 'All',
        options: [
          { value: 'All', label: 'All methods' },
          { value: 'Cash', label: 'Cash' },
          { value: 'Card', label: 'Card' },
          { value: 'QRIS', label: 'QRIS' },
        ],
      },
    ],
  },
  {
    id: 'top-products',
    label: 'Top Products',
    description: 'Best sellers ranked by revenue or units sold.',
    icon: 'inventory-2',
    params: [
      {
        key: 'range',
        label: 'Period',
        type: 'select',
        required: true,
        default: 'last7',
        options: [
          { value: 'today', label: 'Today' },
          { value: 'last7', label: 'Last 7 days' },
          { value: 'last30', label: 'Last 30 days' },
          { value: 'last90', label: 'Last 90 days' },
        ],
      },
      {
        key: 'sortBy',
        label: 'Rank By',
        type: 'select',
        required: true,
        default: 'revenue',
        options: [
          { value: 'revenue', label: 'Revenue' },
          { value: 'unitsSold', label: 'Units Sold' },
        ],
      },
      {
        key: 'limit',
        label: 'Max Rows',
        type: 'number',
        required: true,
        default: 20,
        min: 1,
        max: 200,
      },
    ],
  },
  {
    id: 'category-performance',
    label: 'Category Performance',
    description: 'Revenue and unit share per category.',
    icon: 'category',
    params: [
      {
        key: 'range',
        label: 'Period',
        type: 'select',
        required: true,
        default: 'last30',
        options: [
          { value: 'last7', label: 'Last 7 days' },
          { value: 'last30', label: 'Last 30 days' },
          { value: 'last90', label: 'Last 90 days' },
        ],
      },
    ],
  },
  {
    id: 'cashier-performance',
    label: 'Cashier Performance',
    description: 'Sales and transaction volume per cashier.',
    icon: 'badge',
    params: [
      {
        key: 'range',
        label: 'Period',
        type: 'select',
        required: true,
        default: 'last30',
        options: [
          { value: 'last7', label: 'Last 7 days' },
          { value: 'last30', label: 'Last 30 days' },
          { value: 'last90', label: 'Last 90 days' },
        ],
      },
    ],
  },
  {
    id: 'inventory-status',
    label: 'Inventory Status',
    description: 'Current stock levels and reorder warnings.',
    icon: 'warehouse',
    params: [
      {
        key: 'stockFilter',
        label: 'Stock Level',
        type: 'select',
        required: true,
        default: 'All',
        options: [
          { value: 'All', label: 'All products' },
          { value: 'Low stock', label: 'Low stock only' },
          { value: 'Out of stock', label: 'Out of stock only' },
          { value: 'In stock', label: 'In stock only' },
        ],
      },
    ],
  },
])

/* ---------------------------------------------------------------------------
 * Composable
 * ------------------------------------------------------------------------- */

export function useReports() {
  const reportId = ref('sales-summary')
  const params = reactive({})
  const result = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const activeReport = computed(
    () => REPORT_TYPES.find((r) => r.id === reportId.value) || REPORT_TYPES[0],
  )

  function initParams() {
    Object.keys(params).forEach((k) => delete params[k])
    activeReport.value.params.forEach((p) => {
      params[p.key] = p.default ?? (p.type === 'number' ? 0 : '')
    })
  }

  function validate() {
    const missing = []
    activeReport.value.params.forEach((p) => {
      if (p.required && (params[p.key] === '' || params[p.key] == null)) {
        missing.push(p.label)
      }
    })
    return missing
  }

  function setReport(id) {
    reportId.value = id
    result.value = null
    error.value = null
    initParams()
  }

  async function run() {
    const missing = validate()
    if (missing.length) {
      error.value = { status: 'validation', message: `Required: ${missing.join(', ')}` }
      return null
    }
    loading.value = true
    error.value = null
    try {
      const data = await reportsService.getDashboardData({
        range: params.range || 'last7',
      })
      result.value = shapeResult(reportId.value, data, params)
      return result.value
    } catch (err) {
      error.value = normalizeApiError(err)
      return null
    } finally {
      loading.value = false
    }
  }

  initParams()

  return {
    REPORT_TYPES,
    reportId,
    activeReport,
    params,
    result,
    loading,
    error,
    setReport,
    run,
    validate,
  }
}

/* ---------------------------------------------------------------------------
 * Shape result rows/columns based on the selected report.
 * ------------------------------------------------------------------------- */

function shapeResult(reportId, data, params) {
  const { summary, topProducts, categoryBreakdown, cashiers, rangeMeta } = data

  switch (reportId) {
    case 'sales-summary': {
      const method = params.method || 'All'
      const paymentMethods = data.paymentMethods.filter(
        (m) => method === 'All' || m.name === method,
      )
      return {
        title: 'Sales Summary',
        subtitle: `Period: ${rangeMeta.label}`,
        summaryRows: {
          'Total Sales': summary.totalSales,
          'Total Transactions': summary.totalTransactions,
          'Cash Collected': summary.cashCollected,
          'Average Sale': summary.avgSale,
          'Payment Method': method,
        },
        columns: [
          { label: 'Method', key: 'name' },
          { label: 'Transactions', key: 'value', align: 'right' },
          { label: 'Amount (Rp)', key: 'amount', align: 'right', format: (v) => Number(v) },
          { label: 'Share %', key: 'pct', align: 'right', format: (v) => `${v}%` },
        ],
        rows: paymentMethods,
      }
    }

    case 'top-products': {
      const sortBy = params.sortBy || 'revenue'
      const limit = Number(params.limit) || 20
      const sorted = [...topProducts].sort((a, b) => b[sortBy] - a[sortBy]).slice(0, limit)
      return {
        title: 'Top Products',
        subtitle: `Period: ${rangeMeta.label} · Ranked by ${sortBy}`,
        summaryRows: {
          'Report Rows': sorted.length,
          'Total Revenue': summary.totalSales,
          'Total Units': sorted.reduce((s, p) => s + p.unitsSold, 0),
        },
        columns: [
          { label: 'Product', key: 'name' },
          { label: 'SKU', key: 'sku' },
          { label: 'Category', key: 'category' },
          { label: 'Units Sold', key: 'unitsSold', align: 'right' },
          { label: 'Revenue (Rp)', key: 'revenue', align: 'right', format: (v) => Number(v) },
        ],
        rows: sorted,
      }
    }

    case 'category-performance': {
      return {
        title: 'Category Performance',
        subtitle: `Period: ${rangeMeta.label}`,
        summaryRows: {
          Categories: categoryBreakdown.length,
          'Total Revenue': summary.totalSales,
        },
        columns: [
          { label: 'Category', key: 'name' },
          { label: 'Units', key: 'units', align: 'right' },
          { label: 'Revenue (Rp)', key: 'revenue', align: 'right', format: (v) => Number(v) },
          { label: 'Share %', key: 'pct', align: 'right', format: (v) => `${v}%` },
        ],
        rows: categoryBreakdown,
      }
    }

    case 'cashier-performance': {
      return {
        title: 'Cashier Performance',
        subtitle: `Period: ${rangeMeta.label}`,
        summaryRows: {
          Cashiers: cashiers.length,
          'Total Revenue': summary.totalSales,
        },
        columns: [
          { label: 'Cashier', key: 'name' },
          { label: 'Transactions', key: 'transactions', align: 'right' },
          { label: 'Sales (Rp)', key: 'sales', align: 'right', format: (v) => Number(v) },
        ],
        rows: cashiers,
      }
    }

    case 'inventory-status': {
      const products = data.lowStockItems || []
      const filter = params.stockFilter || 'All'
      const rows = products
        .filter((p) => {
          if (filter === 'All') return true
          if (filter === 'Out of stock') return p.stock === 0
          if (filter === 'Low stock') return p.stock > 0 && p.stock <= 8
          if (filter === 'In stock') return p.stock > 8
          return true
        })
        .map((p) => ({
          name: p.name,
          sku: p.sku,
          category: p.category,
          stock: p.stock,
          unit: p.unit,
          status: p.stock === 0 ? 'Out of stock' : p.stock <= 8 ? 'Low stock' : 'In stock',
        }))
      return {
        title: 'Inventory Status',
        subtitle: `Filter: ${filter}`,
        summaryRows: {
          'Matching Products': rows.length,
        },
        columns: [
          { label: 'Product', key: 'name' },
          { label: 'SKU', key: 'sku' },
          { label: 'Category', key: 'category' },
          { label: 'Stock', key: 'stock', align: 'right' },
          { label: 'Unit', key: 'unit' },
          { label: 'Status', key: 'status' },
        ],
        rows,
      }
    }

    default:
      return null
  }
}