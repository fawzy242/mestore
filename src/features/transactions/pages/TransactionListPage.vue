<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppSearchInput from '@/components/ui/AppSearchInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppButton from '@/components/ui/AppButton.vue'
import IconCalendar from '@/components/icons/IconCalendar.vue'
import IconBadge from '@/components/icons/IconBadge.vue'
import IconRefresh from '@/components/icons/IconRefresh.vue'
import IconFileDownload from '@/components/icons/IconFileDownload.vue'
import TransactionTable from '../components/TransactionTable.vue'
import { useTransactions } from '../composables/useTransactions.js'
import { useDebouncedSearch } from '@/composables/useDebouncedSearch.js'
import { useToast } from '@/composables/useToast.js'

const router = useRouter()
const { push } = useToast()
const { rows, loading, error, filters, fetchTransactions, isCashier } = useTransactions()
const cashierOptions = ref([{ value: '', label: 'All cashiers' }])

const { value: searchValue } = useDebouncedSearch((v) => {
  filters.search = v
  fetchTransactions()
})

watch(
  () => filters.cashier,
  () => fetchTransactions(),
)

function openDetail(row) {
  router.push({ name: 'transactions.detail', params: { id: row.id } })
}

function refresh() {
  fetchTransactions()
  push('Transactions refreshed')
}

function exportCsv() {
  push('CSV export is not available in this prototype')
}

function buildCashierOptions() {
  const names = Array.from(new Set(rows.value.map((t) => t.cashier))).sort()
  cashierOptions.value = [
    { value: '', label: 'All cashiers' },
    ...names.map((n) => ({ value: n, label: n })),
  ]
}

onMounted(async () => {
  await fetchTransactions()
  if (!isCashier) buildCashierOptions()
})
</script>

<template>
  <AppPageContainer>
    <p v-if="isCashier" class="flow-note">Showing your own transactions only.</p>

    <div class="filter-card">
      <div class="filter-group">
        <div class="filter-item">
          <IconCalendar class="filter-icon" />
          <div class="filter-text">
            <span class="filter-label">Date Range</span>
            <span class="filter-value mono">Sep 18 - Sep 24, 2026</span>
          </div>
        </div>

        <div v-if="!isCashier" class="filter-item">
          <IconBadge class="filter-icon" />
          <div class="filter-text">
            <span class="filter-label">Cashier</span>
            <AppSelect
              :model-value="filters.cashier"
              :options="cashierOptions"
              class="filter-select"
              @update:model-value="(v) => (filters.cashier = v)"
            />
          </div>
        </div>

        <div class="filter-search">
          <AppSearchInput v-model="searchValue" placeholder="Search receipt no…" />
        </div>
      </div>

      <div class="filter-actions">
        <button type="button" class="icon-action" title="Reset filters" @click="refresh">
          <IconRefresh />
        </button>
        <AppButton variant="primary" @click="exportCsv">
          <IconFileDownload /> Export CSV
        </AppButton>
      </div>
    </div>

    <TransactionTable
      :rows="rows"
      :loading="loading"
      :error="error"
      @view="openDetail"
      @retry="fetchTransactions"
    />
  </AppPageContainer>
</template>

<style scoped>
.flow-note {
  font-size: 11.5px;
  color: var(--color-ink-soft);
  background: var(--color-primary-tint);
  border-radius: var(--radius-s);
  padding: 8px 12px;
  margin-bottom: 18px;
  display: inline-block;
}

.filter-card {
  display: flex;
  align-items: stretch;
  gap: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  padding: 12px 14px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-1);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  flex-wrap: wrap;
  min-width: 0;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface-container-low);
  padding: 6px 12px;
  border-radius: var(--radius-md);
  min-width: 0;
}

.filter-icon {
  color: var(--color-ink-soft);
  font-size: 18px;
  flex-shrink: 0;
}

.filter-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.filter-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-ink-soft);
  font-weight: 600;
}

.filter-value {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--color-ink);
  white-space: nowrap;
}

.filter-search {
  flex: 1;
  min-width: 200px;
}

.filter-select {
  margin-bottom: 0;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-action {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-surface-container-low);
  color: var(--color-ink-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-action:hover {
  background: var(--color-surface-container);
  color: var(--color-ink);
}

@media (max-width: 640px) {
  .filter-search {
    width: 100%;
  }
  .filter-actions {
    margin-left: 0;
    width: 100%;
  }
}
</style>