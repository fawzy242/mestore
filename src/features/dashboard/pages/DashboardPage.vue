<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import KPIBar from '@/components/ui/KPIBar.vue'
import KPIStat from '@/components/ui/KPIStat.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import AppNoticeBanner from '@/components/ui/AppNoticeBanner.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'
import IconAdd from '@/components/icons/IconPlus.vue'
import IconInventory from '@/components/icons/IconProducts.vue'
import IconTransactions from '@/components/icons/IconTransactions.vue'
import IconWarning from '@/components/icons/IconWarning.vue'
import IconPayments from '@/components/icons/IconPayments.vue'
import { useDashboard } from '../composables/useDashboard.js'
import { formatRupiah } from '@/composables/useFormatters.js'

const router = useRouter()
const { summary, lowStock, recent, loading, error, fetchAll } = useDashboard()

onMounted(fetchAll)

const lowStockColumns = [
  { key: 'name', label: 'Product' },
  { key: 'sku', label: 'SKU', mono: true },
  { key: 'stock', label: 'Stock', mono: true, formatter: (v, row) => `${v} ${row.unit}` },
  { key: 'status', label: 'Status' },
]

const recentColumns = [
  { key: 'id', label: 'Receipt', mono: true },
  { key: 'time', label: 'Time' },
  { key: 'cashier', label: 'Cashier' },
  { key: 'total', label: 'Total', mono: true, formatter: (v) => formatRupiah(v) },
  { key: 'status', label: 'Status' },
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
      message="Entry point after login / shift start. Shortcuts jump straight into POS, low-stock products, or a recent transaction."
    />

    <AppAlert v-if="error" variant="error" :message="error.message" retry-label="Retry" @retry="fetchAll" />

    <KPIBar :columns="4">
      <KPIStat
        label="Today's Sales"
        :value="summary ? formatRupiah(summary.todaySales) : '—'"
        :icon="IconPayments"
        tone="primary"
      />
      <KPIStat
        label="Transactions Today"
        :value="summary ? summary.todayTransactions : '—'"
        :icon="IconTransactions"
        tone="neutral"
      />
      <KPIStat
        label="Total Products"
        :value="summary ? summary.totalProducts : '—'"
        :icon="IconInventory"
        tone="neutral"
      />
      <KPIStat
        label="Low Stock Items"
        :value="summary ? summary.lowStockCount : '—'"
        :icon="IconWarning"
        tone="warning"
      />
    </KPIBar>

    <div class="cta-row">
      <AppButton variant="primary" @click="goNewSale">
        <IconAdd /> New Sale
      </AppButton>
      <AppButton variant="secondary" @click="goProducts">View Products</AppButton>
    </div>

    <h3 class="section-title">
      <span class="dot dot-warning"></span> Low stock — needs attention
    </h3>
    <AppTable
      :columns="lowStockColumns"
      :rows="lowStock.map((p) => ({ ...p, status: 'Low stock' }))"
      :loading="loading"
      empty-message="No low-stock items"
    >
      <template #row-actions="{ row }">
        <StatusPill variant="warning">{{ row.status }}</StatusPill>
      </template>
    </AppTable>

    <h3 class="section-title">
      <span class="dot dot-primary"></span> Recent transactions
    </h3>
    <AppTable
      :columns="recentColumns"
      :rows="recent.map((t) => ({ ...t, status: 'Completed' }))"
      :loading="loading"
      clickable-rows
      empty-message="No transactions yet"
      @row-click="openTx"
    >
      <template #row-actions="{ row }">
        <div class="cell-receipt">
          <AvatarInitials :name="row.cashier" :size="24" tone="neutral" />
          <StatusPill variant="success">{{ row.status }}</StatusPill>
        </div>
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

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  margin: 28px 0 12px;
  color: var(--color-ink);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.dot-warning {
  background: var(--color-warning);
}
.dot-primary {
  background: var(--color-primary-container);
}

.cell-receipt {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>