<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { Line, Doughnut, Bar } from 'vue-chartjs'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import KPIBar from '@/components/ui/KPIBar.vue'
import KPIStat from '@/components/ui/KPIStat.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppNoticeBanner from '@/components/ui/AppNoticeBanner.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'
import MonoChip from '@/components/ui/MonoChip.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useDashboard } from '../composables/useDashboard.js'
import { useChartTheme } from '@/composables/useChartTheme.js'
import { formatRupiah } from '@/composables/useFormatters.js'

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
)

const router = useRouter()
const {
  range,
  summary,
  categoryBreakdown,
  paymentMethods,
  dailyTrend,
  cashiers,
  lowStockItems,
  recentTransactions,
  loading,
  error,
  fetchDashboard,
  setRange,
} = useDashboard()

const { tokens } = useChartTheme()

onMounted(fetchDashboard)

const rangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'last7', label: '7 days' },
  { value: 'last30', label: '30 days' },
  { value: 'last90', label: '90 days' },
]

/* ---------------- Charts ---------------- */

const salesTrend = computed(() => ({
  labels: dailyTrend.value.map((d) => d.label),
  datasets: [
    {
      label: 'Sales',
      data: dailyTrend.value.map((d) => d.total),
      borderColor: tokens.value.primary,
      backgroundColor: hexAlpha(tokens.value.primary, 0.12),
      borderWidth: 2,
      tension: 0.35,
      fill: true,
      pointBackgroundColor: tokens.value.primary,
      pointBorderColor: tokens.value.surface,
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ],
}))

const categoryData = computed(() => ({
  labels: categoryBreakdown.value.map((c) => c.name),
  datasets: [
    {
      data: categoryBreakdown.value.map((c) => c.revenue),
      backgroundColor: categoryBreakdown.value.map((c) => c.color),
      borderColor: tokens.value.surface,
      borderWidth: 2,
    },
  ],
}))
const hasCategoryData = computed(() => categoryBreakdown.value.length > 0)

const paymentData = computed(() => ({
  labels: paymentMethods.value.map((m) => m.name),
  datasets: [
    {
      data: paymentMethods.value.map((m) => m.value),
      backgroundColor: paymentMethods.value.map((m) => m.color),
      borderRadius: 6,
      barThickness: 26,
    },
  ],
}))

/* ---------------- Chart options ---------------- */

const lineOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: tokens.value.surface,
      titleColor: tokens.value.text,
      bodyColor: tokens.value.textMuted,
      borderColor: tokens.value.border,
      borderWidth: 1,
      padding: 10,
      callbacks: { label: (ctx) => formatRupiah(ctx.parsed.y) },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: tokens.value.textMuted, font: { size: 11 } },
      border: { color: tokens.value.border },
    },
    y: {
      grid: { color: tokens.value.border },
      ticks: {
        color: tokens.value.textMuted,
        font: { size: 11 },
        callback: (v) => `${Math.round(v / 1000)}k`,
      },
      border: { color: tokens.value.border },
    },
  },
}))

const doughnutOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '62%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: tokens.value.textMuted,
        boxWidth: 10,
        boxHeight: 10,
        padding: 12,
        font: { size: 11 },
      },
    },
    tooltip: {
      backgroundColor: tokens.value.surface,
      titleColor: tokens.value.text,
      bodyColor: tokens.value.textMuted,
      borderColor: tokens.value.border,
      borderWidth: 1,
      padding: 10,
      callbacks: { label: (ctx) => formatRupiah(ctx.parsed) },
    },
  },
}))

const barOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: tokens.value.surface,
      titleColor: tokens.value.text,
      bodyColor: tokens.value.textMuted,
      borderColor: tokens.value.border,
      borderWidth: 1,
      padding: 10,
    },
  },
  scales: {
    x: {
      grid: { color: tokens.value.border },
      ticks: { color: tokens.value.textMuted, font: { size: 11 } },
      border: { color: tokens.value.border },
    },
    y: {
      grid: { display: false },
      ticks: { color: tokens.value.textMuted, font: { size: 11 } },
      border: { color: tokens.value.border },
    },
  },
}))

function hexAlpha(hex, alpha) {
  const h = String(hex).replace('#', '')
  if (h.length !== 6) return hex
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/* ---------------- Tables ---------------- */

const lowStockColumns = [
  { key: 'name', label: 'Product' },
  { key: 'sku', label: 'SKU' },
  { key: 'stock', label: 'Stock', align: 'right' },
]

const recentColumns = [
  { key: 'id', label: 'Receipt' },
  { key: 'time', label: 'Time' },
  { key: 'cashier', label: 'Cashier' },
  { key: 'method', label: 'Payment', align: 'center' },
  { key: 'total', label: 'Total', align: 'right' },
]

const cashierColumns = [
  { key: 'name', label: 'Cashier' },
  { key: 'transactions', label: 'Transactions', align: 'right' },
  { key: 'sales', label: 'Sales', align: 'right' },
]

/* ---------------- Navigation ---------------- */

const goNewSale = () => router.push({ name: 'pos' })
const goProducts = () => router.push({ name: 'products.list' })
const goStock = () => router.push({ name: 'stock.list' })
const goTransactions = () => router.push({ name: 'transactions.list' })
const goReports = () => router.push({ name: 'reports' })
const openTx = (row) => router.push({ name: 'transactions.detail', params: { id: row.id } })
</script>

<template>
  <AppPageContainer>
    <AppNoticeBanner
      variant="info"
      message="Real-time overview of store performance. All numbers reflect the current mock dataset."
    />

    <AppAlert
      v-if="error"
      variant="error"
      :message="error.message"
      retry-label="Retry"
      @retry="fetchDashboard"
    />

    <!-- Range filter + quick actions -->
    <div class="toolbar">
      <div class="range-chips">
        <button
          v-for="opt in rangeOptions"
          :key="opt.value"
          type="button"
          class="range-chip"
          :class="{ active: range === opt.value }"
          @click="setRange(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
      <div class="quick-actions">
        <Button
          label="New Sale"
          icon="pi pi-plus"
          size="small"
          @click="goNewSale"
        />
        <Button
          label="View Products"
          icon="pi pi-box"
          severity="secondary"
          outlined
          size="small"
          @click="goProducts"
        />
        <Button
          label="View Reports"
          icon="pi pi-chart-bar"
          severity="secondary"
          outlined
          size="small"
          @click="goReports"
        />
      </div>
    </div>

    <KPIBar :columns="4">
      <KPIStat
        label="Total Sales"
        :value="summary ? formatRupiah(summary.totalSales) : '—'"
        icon="payments"
        tone="primary"
      />
      <KPIStat
        label="Transactions"
        :value="summary ? summary.totalTransactions : '—'"
        icon="receipt-long"
        tone="neutral"
      />
      <KPIStat
        label="Avg. Sale"
        :value="summary ? formatRupiah(summary.avgSale) : '—'"
        icon="trending-up"
        tone="neutral"
      />
      <KPIStat
        label="Low Stock"
        :value="summary ? summary.lowStockCount : '—'"
        icon="warning"
        tone="warning"
      />
    </KPIBar>

    <!-- Charts row -->
    <div class="charts-grid">
      <div class="chart-card chart-wide">
        <div class="chart-head">
          <h3 class="chart-title">Daily Sales Trend</h3>
          <span class="chart-sub">Last 7 days · {{ range }}</span>
        </div>
        <div class="chart-body">
          <Line :data="salesTrend" :options="lineOptions" />
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-head">
          <h3 class="chart-title">Category Share</h3>
          <span class="chart-sub">Revenue</span>
        </div>
        <div class="chart-body">
          <Doughnut v-if="hasCategoryData" :data="categoryData" :options="doughnutOptions" />
          <div v-else class="chart-empty">No category data</div>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-head">
          <h3 class="chart-title">Payment Methods</h3>
        </div>
        <div class="chart-body chart-body-bar">
          <Bar :data="paymentData" :options="barOptions" />
        </div>
      </div>
    </div>

    <!-- Low stock -->
    <div class="section-head">
      <h3 class="section-title">
        <span class="dot dot-warning"></span> Low stock — needs attention
      </h3>
      <button type="button" class="section-link" @click="goStock">
        View all <AppIcon name="arrow-right-alt" :size="14" />
      </button>
    </div>
    <AppTable
      :columns="lowStockColumns"
      :rows="lowStockItems"
      :loading="loading"
      empty-message="No low-stock items"
    >
      <template #cell-name="{ row }">
        <div class="name-cell">
          <AvatarInitials :name="row.name" :size="28" tone="neutral" />
          <div class="name-text">
            <span class="name-primary">{{ row.name }}</span>
            <span class="name-secondary">{{ row.category }}</span>
          </div>
        </div>
      </template>
      <template #cell-sku="{ row }">
        <MonoChip variant="neutral">{{ row.sku }}</MonoChip>
      </template>
      <template #cell-stock="{ row }">
        <StatusPill :variant="row.stock === 0 ? 'danger' : 'warning'">
          {{ row.stock }} {{ row.unit }}
        </StatusPill>
      </template>
    </AppTable>

    <!-- Cashier leaderboard -->
    <div class="section-head">
      <h3 class="section-title">
        <span class="dot dot-primary"></span> Cashier performance
      </h3>
    </div>
    <AppTable
      :columns="cashierColumns"
      :rows="cashiers"
      :loading="loading"
      empty-message="No cashier activity"
    >
      <template #cell-name="{ row }">
        <div class="name-cell">
          <AvatarInitials :name="row.name" :size="28" tone="primary" />
          <span class="name-primary">{{ row.name }}</span>
        </div>
      </template>
      <template #cell-sales="{ row }">
        <span class="mono total">{{ formatRupiah(row.sales) }}</span>
      </template>
    </AppTable>

    <!-- Recent transactions -->
    <div class="section-head">
      <h3 class="section-title">
        <span class="dot dot-primary"></span> Recent transactions
      </h3>
      <button type="button" class="section-link" @click="goTransactions">
        View all <AppIcon name="arrow-right-alt" :size="14" />
      </button>
    </div>
    <AppTable
      :columns="recentColumns"
      :rows="recentTransactions"
      :loading="loading"
      clickable-rows
      empty-message="No transactions yet"
      @row-click="openTx"
    >
      <template #cell-id="{ row }">
        <div class="receipt-cell">
          <AppIcon name="receipt" :size="16" class="receipt-icon" />
          <span class="mono receipt-id">{{ row.id }}</span>
        </div>
      </template>
      <template #cell-method="{ row }">
        <MonoChip variant="neutral">{{ row.method }}</MonoChip>
      </template>
      <template #cell-total="{ row }">
        <span class="mono total">{{ formatRupiah(row.total) }}</span>
      </template>
    </AppTable>
  </AppPageContainer>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.range-chips {
  display: inline-flex;
  gap: 4px;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 3px;
}
.range-chip {
  border: none;
  background: transparent;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 120ms, color 120ms;
}
.range-chip:hover {
  color: var(--text);
}
.range-chip.active {
  background: var(--surface);
  color: var(--primary);
  font-weight: 600;
  box-shadow: var(--shadow-1);
}
.quick-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .toolbar {
    align-items: stretch;
  }
  .quick-actions {
    width: 100%;
  }
  .quick-actions > :deep(.p-button) {
    flex: 1;
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
}
@media (max-width: 1100px) {
  .charts-grid {
    grid-template-columns: 1fr 1fr;
  }
  .chart-wide {
    grid-column: 1 / -1;
  }
}
@media (max-width: 700px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}
.chart-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.chart-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}
.chart-sub {
  font-size: 11.5px;
  color: var(--text-muted);
}
.chart-body {
  position: relative;
  height: 220px;
}
.chart-body-bar {
  height: 160px;
}
.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  font-size: 13px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 24px 0 12px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: var(--text);
}
.section-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--primary);
  background: transparent;
  border: none;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 120ms ease;
}
.section-link:hover {
  background: var(--primary-tint);
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.dot-warning {
  background: var(--warning);
}
.dot-primary {
  background: var(--primary);
}
.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.name-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.name-primary {
  font-weight: 500;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.name-secondary {
  font-size: 11.5px;
  color: var(--text-muted);
}
.receipt-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.receipt-icon {
  color: var(--text-muted);
}
.receipt-id {
  color: var(--primary);
  font-weight: 600;
}
.total {
  font-weight: 700;
}
</style>