<script setup>
import { computed, onMounted, ref } from 'vue'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppCard from '@/components/ui/AppCard.vue'
import ReportFilterBar from '../components/ReportFilterBar.vue'
import ReportStatCard from '../components/ReportStatCard.vue'
import TopProductsTable from '../components/TopProductsTable.vue'
import CategoryBreakdownCard from '../components/CategoryBreakdownCard.vue'
import { useReports } from '../composables/useReports.js'
import { useToast } from '@/composables/useToast.js'
import { exportCsv, exportXlsx, exportPdf } from '@/composables/useExport.js'
import { formatRupiah } from '@/composables/useFormatters.js'

const { push } = useToast()
const {
  range,
  summary,
  topProducts,
  categoryBreakdown,
  paymentMethods,
  hourly,
  loading,
  error,
  fetchReports,
  setRange,
} = useReports()

const exporting = ref('')

const rangeLabel = computed(() => {
  if (range.value === 'today') return 'Sep 24, 2026'
  if (range.value === 'last30') return 'Aug 26 - Sep 24, 2026'
  return 'Sep 18 - Sep 24, 2026'
})

const exportFilenameBase = computed(() => {
  const slug = range.value.replace(/\s+/g, '-').toLowerCase()
  const stamp = new Date().toISOString().slice(0, 10)
  return `mestore-report-${slug}-${stamp}`
})

/* ------------------------------------------------------------------
 * Export handlers
 * ------------------------------------------------------------------ */
async function onExportCsv() {
  exporting.value = 'csv'
  try {
    // Combine everything into a single flat CSV with sections
    const sections = []
    sections.push(['MeStore — Reports Export'])
    sections.push([`Range: ${rangeLabel.value}`])
    sections.push([`Generated: ${new Date().toLocaleString('en-GB')}`])
    sections.push([])

    sections.push(['Summary'])
    sections.push(['Metric', 'Value'])
    if (summary.value) {
      sections.push(['Total Sales', formatRupiah(summary.value.totalSales)])
      sections.push(['Total Transactions', summary.value.totalTransactions])
      sections.push(['Cash Collected', formatRupiah(summary.value.cashCollected)])
      sections.push(['Average Sale', formatRupiah(summary.value.avgSale)])
    }
    sections.push([])

    sections.push(['Top Products'])
    sections.push(['Product', 'SKU', 'Category', 'Units Sold', 'Revenue'])
    topProducts.value.forEach((p) => {
      sections.push([p.name, p.sku, p.category, p.unitsSold, formatRupiah(p.revenue)])
    })
    sections.push([])

    sections.push(['Category Breakdown'])
    sections.push(['Category', 'Units', 'Revenue', 'Share %'])
    categoryBreakdown.value.forEach((c) => {
      sections.push([c.name, c.units, formatRupiah(c.revenue), `${c.pct}%`])
    })
    sections.push([])

    sections.push(['Payment Methods'])
    sections.push(['Method', 'Transactions', 'Share %'])
    paymentMethods.value.forEach((m) => {
      sections.push([m.name, m.value, `${m.pct}%`])
    })

    const escape = (v) => {
      const s = v == null ? '' : String(v)
      if (s.includes('"') || s.includes(',') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }
    const csv = sections.map((row) => row.map(escape).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportFilenameBase.value}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    push('CSV report downloaded')
  } catch (err) {
    push('Failed to export CSV', { severity: 'error' })
  } finally {
    exporting.value = ''
  }
}

async function onExportXlsx() {
  exporting.value = 'xlsx'
  try {
    const columns = [
      { label: 'Product', key: 'name' },
      { label: 'SKU', key: 'sku' },
      { label: 'Category', key: 'category' },
      { label: 'Units Sold', key: 'unitsSold' },
      { label: 'Revenue (Rp)', key: 'revenue', format: (v) => Number(v) },
    ]
    const meta = {
      'Report Range': rangeLabel.value,
      'Generated': new Date().toLocaleString('en-GB'),
      'Total Sales': summary.value ? formatRupiah(summary.value.totalSales) : '—',
      'Total Transactions': summary.value?.totalTransactions ?? '—',
      'Cash Collected': summary.value ? formatRupiah(summary.value.cashCollected) : '—',
      'Average Sale': summary.value ? formatRupiah(summary.value.avgSale) : '—',
    }
    await exportXlsx(
      `${exportFilenameBase.value}.xlsx`,
      'Top Products',
      columns,
      topProducts.value,
      meta,
    )
    push('Excel report downloaded')
  } catch (err) {
    push('Failed to export Excel', { severity: 'error' })
  } finally {
    exporting.value = ''
  }
}

async function onExportPdf() {
  exporting.value = 'pdf'
  try {
    const columns = [
      { label: 'Product', key: 'name' },
      { label: 'SKU', key: 'sku' },
      { label: 'Category', key: 'category' },
      { label: 'Units', key: 'unitsSold', align: 'right' },
      { label: 'Revenue', key: 'revenue', align: 'right', format: (v) => formatRupiah(v) },
    ]
    const summaryRows = summary.value
      ? {
          'Total Sales': formatRupiah(summary.value.totalSales),
          'Total Transactions': summary.value.totalTransactions,
          'Cash Collected': formatRupiah(summary.value.cashCollected),
          'Average Sale': formatRupiah(summary.value.avgSale),
        }
      : null
    await exportPdf(
      `${exportFilenameBase.value}.pdf`,
      'Reports & Analytics',
      `Range: ${rangeLabel.value}`,
      columns,
      topProducts.value,
      summaryRows,
    )
    push('PDF report downloaded')
  } catch (err) {
    push('Failed to export PDF', { severity: 'error' })
  } finally {
    exporting.value = ''
  }
}

onMounted(fetchReports)
</script>

<template>
  <AppPageContainer>
    <ReportFilterBar
      :range="range"
      :range-label="rangeLabel"
      :exporting="exporting"
      @update:range="setRange"
      @export-csv="onExportCsv"
      @export-xlsx="onExportXlsx"
      @export-pdf="onExportPdf"
    />

    <AppAlert
      v-if="error"
      variant="error"
      :message="error.message"
      retry-label="Retry"
      @retry="fetchReports"
    />

    <!-- Stat cards -->
    <div class="stats-grid">
      <ReportStatCard
        label="Total Sales"
        :value="summary ? formatRupiah(summary.totalSales) : '—'"
        :sub="`${summary?.totalTransactions ?? 0} transactions`"
        tone="primary"
        icon="payments"
      />
      <ReportStatCard
        label="Total Transactions"
        :value="summary ? String(summary.totalTransactions) : '—'"
        :sub="summary ? `Avg ${formatRupiah(summary.avgSale)} / sale` : ''"
        tone="neutral"
        icon="receipt-long"
      />
      <ReportStatCard
        label="Cash Collected"
        :value="summary ? formatRupiah(summary.cashCollected) : '—'"
        sub="Non-cash excluded"
        tone="success"
        icon="point-of-sale"
      />
      <ReportStatCard
        label="Categories"
        :value="String(categoryBreakdown.length)"
        sub="Active taxonomy"
        tone="warning"
        icon="category"
      />
    </div>

    <!-- Charts row -->
    <div class="charts-grid">
      <AppCard padded>
        <div class="card-head">
          <h3 class="card-title">Top Selling Products</h3>
          <span class="card-sub">Ranked by revenue</span>
        </div>

        <div class="bars">
          <div
            v-for="p in topProducts.slice(0, 5)"
            :key="p.id"
            class="bar-row"
          >
            <span class="bar-label">{{ p.name }}</span>
            <span class="bar-track">
              <span
                class="bar-fill"
                :style="{
                  width: `${Math.round((p.revenue / (topProducts[0]?.revenue || 1)) * 100)}%`,
                }"
              ></span>
            </span>
            <span class="bar-value mono">{{ formatRupiah(p.revenue) }}</span>
          </div>
        </div>
      </AppCard>

      <AppCard padded>
        <div class="card-head">
          <h3 class="card-title">Category Breakdown</h3>
          <span class="card-sub">Revenue share</span>
        </div>
        <CategoryBreakdownCard :categories="categoryBreakdown" />
      </AppCard>
    </div>

    <!-- Payment methods -->
    <AppCard padded class="payment-card">
      <div class="card-head">
        <h3 class="card-title">Payment Methods</h3>
        <span class="card-sub">Transaction count</span>
      </div>
      <div class="payment-grid">
        <div v-for="m in paymentMethods" :key="m.name" class="payment-item">
          <span class="payment-swatch" :style="{ background: m.color }"></span>
          <span class="payment-name">{{ m.name }}</span>
          <span class="payment-value mono">{{ m.value }}</span>
          <span class="payment-pct mono">{{ m.pct }}%</span>
        </div>
      </div>
    </AppCard>

    <!-- Top products table -->
    <div class="section-head">
      <h3 class="section-title">Detailed Product Performance</h3>
      <span class="section-count mono">{{ topProducts.length }} items</span>
    </div>
    <TopProductsTable :rows="topProducts" :loading="loading" />
  </AppPageContainer>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 560px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}
@media (max-width: 900px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

.payment-card {
  margin-bottom: 20px;
}

.card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 16px;
}
.card-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}
.card-sub {
  font-size: 11.5px;
  color: var(--text-muted);
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.bar-row {
  display: grid;
  grid-template-columns: 160px 1fr 110px;
  align-items: center;
  gap: 12px;
  font-size: 12.5px;
}
.bar-label {
  color: var(--text);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bar-track {
  display: block;
  height: 8px;
  background: var(--primary-tint);
  border-radius: 4px;
  overflow: hidden;
}
.bar-fill {
  display: block;
  height: 100%;
  background: var(--primary);
}
.bar-value {
  text-align: right;
  color: var(--text);
  font-weight: 600;
  font-size: 12px;
}

.payment-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
@media (max-width: 640px) {
  .payment-grid {
    grid-template-columns: 1fr;
  }
}
.payment-item {
  display: grid;
  grid-template-columns: 14px 1fr auto auto;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: var(--surface-alt);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  font-size: 13px;
}
.payment-swatch {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}
.payment-name {
  font-weight: 500;
  color: var(--text);
}
.payment-value {
  font-weight: 700;
  color: var(--text);
}
.payment-pct {
  color: var(--text-muted);
  font-size: 12px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.section-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: var(--text);
}
.section-count {
  font-size: 12px;
  color: var(--text-muted);
}
</style>