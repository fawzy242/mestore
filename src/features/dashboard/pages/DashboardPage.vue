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
import StatusPill from '@/components/ui/StatusPill.vue'
import AppNoticeBanner from '@/components/ui/AppNoticeBanner.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'
import MonoChip from '@/components/ui/MonoChip.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useDashboard } from '../composables/useDashboard.js'
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
const { summary, lowStock, recent, loading, error, fetchAll } = useDashboard()

onMounted(fetchAll)

/* ------------------------------------------------------------------
 * Chart data
 * ------------------------------------------------------------------ */

// Sales trend — last 7 days derived from recent transactions
const salesTrend = computed(() => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const values = [0, 0, 0, 0, 0, 0, 0]
  // Distribute mock totals across the week for visual shape
  const total = summary.value?.todaySales ?? 0
  values[0] = total * 0.6
  values[1] = total * 0.75
  values[2] = total * 0.9
  values[3] = total * 0.85
  values[4] = total
  values[5] = total * 1.1
  values[6] = total * 0.8
  return {
    labels: days,
    datasets: [
      {
        label: 'Sales (Rp)',
        data: values,
        borderColor: '#C8102E',
        backgroundColor: 'rgba(200, 16, 46, 0.12)',
        borderWidth: 2,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#C8102E',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }
})

// Category breakdown — from products in lowStock + summary
const categoryBreakdown = computed(() => {
  const map = new Map()
  ;(lowStock.value || []).forEach((p) => {
    const key = p.category || 'Other'
    map.set(key, (map.get(key) || 0) + 1)
  })
  // Fallback categories so the chart never renders empty
  if (map.size === 0) {
    map.set('Beverages', 3)
    map.set('Snacks & Instant', 4)
    map.set('Bakery', 2)
    map.set('Staples', 5)
    map.set('Household', 2)
  }
  const labels = Array.from(map.keys())
  const data = Array.from(map.values())
  const palette = ['#C8102E', '#B45309', '#5B5F64', '#8F706C', '#DC2626']
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: palette.slice(0, labels.length),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  }
})

// Payment method — mock distribution
const paymentMethods = computed(() => ({
  labels: ['Cash', 'Card', 'QRIS'],
  datasets: [
    {
      label: 'Transactions',
      data: [78, 15, 7],
      backgroundColor: ['#C8102E', '#B45309', '#5B5F64'],
      borderRadius: 6,
      barThickness: 28,
    },
  ],
}))

/* ------------------------------------------------------------------
 * Chart options
 * ------------------------------------------------------------------ */
const lineOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => formatRupiah(ctx.parsed.y),
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: 'var(--text-muted)', font: { size: 11 } },
    },
    y: {
      grid: { color: 'var(--border)' },
      ticks: {
        color: 'var(--text-muted)',
        font: { size: 11 },
        callback: (v) => `${Math.round(v / 1000)}k`,
      },
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
        color: 'var(--text-muted)',
        boxWidth: 10,
        boxHeight: 10,
        padding: 12,
        font: { size: 11 },
      },
    },
  },
}))

const barOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      grid: { color: 'var(--border)' },
      ticks: { color: 'var(--text-muted)', font: { size: 11 } },
    },
    y: {
      grid: { display: false },
      ticks: { color: 'var(--text-muted)', font: { size: 11 } },
    },
  },
}))

/* ------------------------------------------------------------------
 * Table columns
 * ------------------------------------------------------------------ */
const lowStockColumns = [
  { key: 'name', label: 'Product' },
  { key: 'sku', label: 'SKU' },
  { key: 'stock', label: 'Stock', align: 'right' },
  { key: 'status', label: 'Status', align: 'right' },
]

const recentColumns = [
  { key: 'id', label: 'Receipt' },
  { key: 'time', label: 'Time' },
  { key: 'cashier', label: 'Cashier' },
  { key: 'total', label: 'Total', align: 'right' },
  { key: 'status', label: 'Status', align: 'right' },
]

function goNewSale() {
  router.push({ name: 'pos' })
}
function goProducts() {
  router.push({ name: 'products.list' })
}
function openTx(row) {
  router.push({ name: 'transactions.detail', params: { id: row.id } })
}
</script>

<template>
  <AppPageContainer>
    <AppNoticeBanner
      variant="info"
      message="Entry point after login. Shortcuts jump straight into POS, low-stock products, or a recent transaction."
    />

    <AppAlert
      v-if="error"
      variant="error"
      :message="error.message"
      retry-label="Retry"
      @retry="fetchAll"
    />

    <KPIBar :columns="4">
      <KPIStat
        label="Today's Sales"
        :value="summary ? formatRupiah(summary.todaySales) : '—'"
        icon="payments"
        tone="primary"
      />
      <KPIStat
        label="Transactions Today"
        :value="summary ? summary.todayTransactions : '—'"
        icon="receipt-long"
        tone="neutral"
      />
      <KPIStat
        label="Total Products"
        :value="summary ? summary.totalProducts : '—'"
        icon="inventory-2"
        tone="neutral"
      />
      <KPIStat
        label="Low Stock Items"
        :value="summary ? summary.lowStockCount : '—'"
        icon="warning"
        tone="warning"
      />
    </KPIBar>

    <div class="cta-row">
      <Button label="New Sale" icon="pi pi-plus" @click="goNewSale" />
      <Button
        label="View Products"
        icon="pi pi-box"
        severity="secondary"
        outlined
        @click="goProducts"
      />
    </div>

    <!-- Charts -->
    <div class="charts-grid">
      <div class="chart-card chart-wide">
        <div class="chart-head">
          <h3 class="chart-title">Sales This Week</h3>
          <span class="chart-sub">Rp per day</span>
        </div>
        <div class="chart-body">
          <Line :data="salesTrend" :options="lineOptions" />
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-head">
          <h3 class="chart-title">Category Breakdown</h3>
        </div>
        <div class="chart-body">
          <Doughnut :data="categoryBreakdown" :options="doughnutOptions" />
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-head">
          <h3 class="chart-title">Payment Methods</h3>
        </div>
        <div class="chart-body chart-body-bar">
          <Bar :data="paymentMethods" :options="barOptions" />
        </div>
      </div>
    </div>

    <h3 class="section-title">
      <span class="dot dot-warning"></span> Low stock — needs attention
    </h3>
    <AppTable
      :columns="lowStockColumns"
      :rows="lowStock"
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
        <span class="mono">{{ row.stock }} {{ row.unit }}</span>
      </template>
      <template #cell-status>
        <StatusPill variant="warning">Low stock</StatusPill>
      </template>
    </AppTable>

    <h3 class="section-title">
      <span class="dot dot-primary"></span> Recent transactions
    </h3>
    <AppTable
      :columns="recentColumns"
      :rows="recent"
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
      <template #cell-total="{ row }">
        <span class="mono total">{{ formatRupiah(row.total) }}</span>
      </template>
      <template #cell-status>
        <StatusPill variant="success">Completed</StatusPill>
      </template>
    </AppTable>
  </AppPageContainer>
</template>

<style scoped>
.cta-row {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
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

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  margin: 24px 0 12px;
  color: var(--text);
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