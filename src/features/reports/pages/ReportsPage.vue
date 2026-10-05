<script setup>
import { computed, onMounted, watch } from 'vue'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useReports } from '../composables/useReports.js'
import { formatRupiah } from '@/composables/useFormatters.js'

const { range, summary, topProducts, loading, error, fetchReports } = useReports()

const rangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'last7', label: 'Last 7 days' },
  { value: 'last30', label: 'Last 30 days' },
]

const columns = [
  { key: 'name', label: 'Product' },
  { key: 'category', label: 'Category' },
  { key: 'unitsSold', label: 'Units Sold', align: 'right' },
  { key: 'revenue', label: 'Revenue', align: 'right', formatter: (v) => formatRupiah(v) },
]

const maxUnits = computed(() =>
  topProducts.value.reduce((m, p) => Math.max(m, p.unitsSold), 1),
)

const categoryBreakdown = computed(() => {
  const map = new Map()
  const totalRev = topProducts.value.reduce((s, p) => s + p.revenue, 0) || 1
  topProducts.value.forEach((p) => {
    const cat = p.category || 'Other'
    const cur = map.get(cat) || { revenue: 0, units: 0 }
    cur.revenue += p.revenue
    cur.units += p.unitsSold
    map.set(cat, cur)
  })
  const colors = ['#C8102E', '#B45309', '#5B5F64', '#8F706C', '#DC2626']
  return Array.from(map.entries())
    .map(([name, v], i) => ({
      name,
      ...v,
      pct: Math.round((v.revenue / totalRev) * 100),
      color: colors[i % colors.length],
    }))
    .sort((a, b) => b.revenue - a.revenue)
})

function rangeLabel() {
  if (range.value === 'today') return 'Sep 24, 2026'
  if (range.value === 'last30') return 'Aug 26 - Sep 24, 2026'
  return 'Sep 18 - Sep 24, 2026'
}

watch(range, fetchReports)
onMounted(fetchReports)
</script>

<template>
  <AppPageContainer>
    <!-- Reporting window card -->
    <div class="window-card">
      <div class="window-left">
        <span class="window-icon-wrap">
          <AppIcon name="calendar-today" :size="20" />
        </span>
        <div class="window-text">
          <span class="window-label">Reporting Window</span>
          <AppSelect
            :model-value="range"
            :options="rangeOptions"
            class="window-select"
            @update:model-value="(v) => (range = v)"
          />
        </div>
      </div>
      <div class="window-right">
        <span class="mono date-value">{{ rangeLabel() }}</span>
      </div>
    </div>

    <AppAlert
      v-if="error"
      variant="error"
      :message="error.message"
      retry-label="Retry"
      @retry="fetchReports"
    />

    <!-- Stat cards -->
    <div class="grid-3">
      <div class="stat-card">
        <span class="stat-label">Total Sales</span>
        <span class="stat-value mono">
          {{ summary ? formatRupiah(summary.totalSales) : '—' }}
        </span>
        <span class="stat-sub">vs previous period</span>
      </div>

      <div class="stat-card">
        <span class="stat-label">Total Transactions</span>
        <span class="stat-value mono">
          {{ summary ? summary.totalTransactions : '—' }}
        </span>
        <span class="stat-sub">
          {{
            summary && summary.totalTransactions
              ? `Avg ${formatRupiah(Math.round(summary.totalSales / summary.totalTransactions))} / sale`
              : '—'
          }}
        </span>
      </div>

      <div class="stat-card">
        <span class="stat-label">Cash Collected</span>
        <span class="stat-value mono">
          {{ summary ? formatRupiah(summary.cashCollected) : '—' }}
        </span>
        <span class="stat-sub">100% cash tendered</span>
      </div>
    </div>

    <!-- Main content grid -->
    <div class="sections">
      <div class="section-main">
        <h3 class="section-title">
          <AppIcon name="stars" :size="18" class="section-icon" /> Top Selling Products
        </h3>

        <div class="chart-card">
          <div class="bars">
            <div v-for="p in topProducts" :key="p.name" class="bar-row">
              <div class="bar-label">{{ p.name }}</div>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{ width: `${Math.round((p.unitsSold / maxUnits) * 100)}%` }"
                ></div>
              </div>
              <div class="bar-value mono">{{ p.unitsSold }}</div>
            </div>
          </div>
        </div>

        <AppTable
          :columns="columns"
          :rows="topProducts"
          :loading="loading"
          empty-message="No data for this range."
        />
      </div>

      <div class="section-side">
        <h3 class="section-title">
          <AppIcon name="pie-chart" :size="18" class="section-icon" /> Category Breakdown
        </h3>

        <div class="chart-card">
          <div class="stack">
            <div
              v-for="c in categoryBreakdown"
              :key="c.name"
              class="stack-seg"
              :style="{ width: c.pct + '%', background: c.color }"
              :title="`${c.name} ${c.pct}%`"
            ></div>
          </div>

          <div class="legend">
            <div v-for="c in categoryBreakdown" :key="c.name" class="legend-row">
              <span class="legend-swatch" :style="{ background: c.color }"></span>
              <span class="legend-name">{{ c.name }}</span>
              <span class="legend-amount mono">{{ formatRupiah(c.revenue) }}</span>
              <span class="legend-pct mono">{{ c.pct }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppPageContainer>
</template>

<style scoped>
.window-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px 18px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.window-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.window-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--primary-tint);
  color: var(--primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.window-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.window-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--text-muted);
}

.window-select {
  min-width: 180px;
  margin-bottom: 0;
}

.window-right {
  font-size: 12.5px;
  color: var(--text-muted);
}

.date-value {
  font-weight: 600;
  color: var(--text);
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

@media (max-width: 900px) {
  .grid-3 {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.15;
}

.stat-sub {
  font-size: 12px;
  color: var(--text-muted);
}

.sections {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

@media (max-width: 900px) {
  .sections {
    grid-template-columns: 1fr;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--text);
}

.section-icon {
  color: var(--primary);
}

.chart-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  margin-bottom: 16px;
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bar-row {
  display: grid;
  grid-template-columns: 180px 1fr 60px;
  align-items: center;
  gap: 14px;
  font-size: 12.5px;
}

.bar-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text);
  font-weight: 500;
}

.bar-track {
  height: 8px;
  background: var(--primary-tint);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: var(--primary);
}

.bar-value {
  text-align: right;
  color: var(--text-muted);
  font-weight: 600;
}

.stack {
  display: flex;
  height: 12px;
  width: 100%;
  border-radius: 6px;
  overflow: hidden;
  background: var(--surface-hover);
  margin-bottom: 16px;
}

.stack-seg {
  height: 100%;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
}

.legend-swatch {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-name {
  flex: 1;
  color: var(--text);
  font-weight: 500;
}

.legend-amount {
  color: var(--text-muted);
  font-size: 12px;
}

.legend-pct {
  font-weight: 700;
  width: 40px;
  text-align: right;
  color: var(--text);
}

@media (max-width: 700px) {
  .bar-row {
    grid-template-columns: 1fr 50px;
  }
  .bar-track {
    display: none;
  }
}
</style>