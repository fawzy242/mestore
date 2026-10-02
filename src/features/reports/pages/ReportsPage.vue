<script setup>
import { computed, onMounted, watch } from 'vue'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import StatCard from '@/components/ui/StatCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import IconCalendar from '@/components/icons/IconCalendar.vue'
import IconStars from '@/components/icons/IconStars.vue'
import IconPieChart from '@/components/icons/IconPieChart.vue'
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
  { key: 'unitsSold', label: 'Units Sold', mono: true, align: 'right' },
  { key: 'revenue', label: 'Revenue', mono: true, align: 'right', formatter: (v) => formatRupiah(v) },
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
  const colors = ['#b71c1c', '#885000', '#5b5f64', '#8f706c', '#c62828']
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
    <div class="window-card">
      <div class="window-left">
        <IconCalendar class="window-icon" />
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

    <AppAlert v-if="error" variant="error" :message="error.message" retry-label="Retry" @retry="fetchReports" />

    <div class="grid-3">
      <StatCard
        label="Total Sales"
        :value="summary ? formatRupiah(summary.totalSales) : '—'"
        sub="vs previous period"
        sub-variant="success"
      />
      <StatCard
        label="Total Transactions"
        :value="summary ? summary.totalTransactions : '—'"
        :sub="
          summary && summary.totalTransactions
            ? `Avg ${formatRupiah(Math.round(summary.totalSales / summary.totalTransactions))} / sale`
            : ''
        "
        sub-variant="neutral"
      />
      <StatCard
        label="Cash Collected"
        :value="summary ? formatRupiah(summary.cashCollected) : '—'"
        sub="100% cash tendered"
        sub-variant="neutral"
      />
    </div>

    <div class="sections">
      <div class="section-main">
        <h3 class="section-title">
          <IconStars class="section-icon" /> Top Selling Products
        </h3>

        <AppCard v-if="!loading && topProducts.length" padded>
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
        </AppCard>

        <AppTable
          :columns="columns"
          :rows="topProducts"
          :loading="loading"
          empty-message="No data for this range."
        />
      </div>

      <div class="section-side">
        <h3 class="section-title">
          <IconPieChart class="section-icon" /> Category Breakdown
        </h3>

        <AppCard padded>
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
        </AppCard>
      </div>
    </div>
  </AppPageContainer>
</template>

<style scoped>
.window-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  padding: 12px 16px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-1);
  flex-wrap: wrap;
  gap: 12px;
}

.window-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.window-icon {
  font-size: 20px;
  color: var(--color-primary-container);
}

.window-text {
  display: flex;
  flex-direction: column;
}

.window-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--color-ink-soft);
}

.window-select {
  margin-bottom: 0;
  min-width: 180px;
}

.window-right {
  font-size: 12.5px;
  color: var(--color-ink-soft);
}

.date-value {
  font-weight: 600;
  color: var(--color-ink);
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 900px) {
  .grid-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

.sections {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-top: 28px;
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
  font-weight: 500;
  margin: 0 0 12px;
  color: var(--color-ink);
}

.section-icon {
  color: var(--color-primary-container);
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.bar-row {
  display: grid;
  grid-template-columns: 180px 1fr 60px;
  align-items: center;
  gap: 12px;
  font-size: 12.5px;
}

.bar-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-ink);
}

.bar-track {
  height: 8px;
  background: var(--color-primary-tint);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: var(--color-primary-container);
}

.bar-value {
  text-align: right;
  color: var(--color-ink-soft);
}

.stack {
  display: flex;
  height: 12px;
  width: 100%;
  border-radius: 6px;
  overflow: hidden;
  background: var(--color-surface-container);
  margin-bottom: 16px;
}

.stack-seg {
  height: 100%;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
}

.legend-swatch {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-name {
  flex: 1;
  color: var(--color-ink);
}

.legend-amount {
  color: var(--color-ink-soft);
  font-size: 12px;
}

.legend-pct {
  font-weight: 700;
  width: 40px;
  text-align: right;
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