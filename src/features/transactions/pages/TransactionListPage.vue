<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import TransactionTable from '../components/TransactionTable.vue'
import TransactionViewModal from '../components/TransactionViewModal.vue'
import { useTransactions } from '../composables/useTransactions.js'
import { useDebouncedSearch } from '@/composables/useDebouncedSearch.js'
import { useToast } from '@/composables/useToast.js'

const router = useRouter()
const { push } = useToast()
const { rows, loading, error, filters, fetchTransactions, isCashier } = useTransactions()

const cashierOptions = ref([{ value: '', label: 'All cashiers' }])
const dateRange = ref(null)

const viewModalOpen = ref(false)
const viewTransactionId = ref(null)

const { value: searchValue } = useDebouncedSearch((v) => {
  filters.search = v
  fetchTransactions()
})

watch(
  () => filters.cashier,
  () => fetchTransactions(),
)

function openView(row) {
  viewTransactionId.value = row.id
  viewModalOpen.value = true
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
        <div class="filter-item date-item">
          <AppIcon name="calendar-today" :size="18" class="filter-icon" />
          <div class="filter-text">
            <span class="filter-label">Date Range</span>
            <DatePicker
              v-model="dateRange"
              selection-mode="range"
              :show-icon="false"
              :manual-input="false"
              placeholder="Select dates"
              date-format="d M, yy"
              class="date-picker"
            />
          </div>
        </div>

        <div v-if="!isCashier" class="filter-item">
          <AppIcon name="badge" :size="18" class="filter-icon" />
          <div class="filter-text">
            <span class="filter-label">Cashier</span>
            <Select
              v-model="filters.cashier"
              :options="cashierOptions"
              option-label="label"
              option-value="value"
              class="filter-select"
            />
          </div>
        </div>

        <div class="filter-search">
          <span class="search-wrap">
            <AppIcon name="search" :size="18" class="search-icon" />
            <InputText
              v-model="searchValue"
              placeholder="Search receipt no…"
              class="search-input"
            />
          </span>
        </div>
      </div>

      <div class="filter-actions">
        <Button
          icon="pi pi-refresh"
          severity="secondary"
          text
          rounded
          aria-label="Reset filters"
          @click="refresh"
        />
        <Button
          label="Export CSV"
          icon="pi pi-download"
          @click="exportCsv"
        />
      </div>
    </div>

    <TransactionTable
      :rows="rows"
      :loading="loading"
      :error="error"
      @view="openView"
      @retry="fetchTransactions"
    />

    <TransactionViewModal
      v-model="viewModalOpen"
      :transaction-id="viewTransactionId"
    />
  </AppPageContainer>
</template>

<style scoped>
.flow-note {
  font-size: 11.5px;
  color: var(--text-muted);
  background: var(--primary-tint);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  margin-bottom: 18px;
  display: inline-block;
}

.filter-card {
  display: flex;
  align-items: stretch;
  gap: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 12px 14px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: stretch;
  gap: 10px;
  flex: 1;
  flex-wrap: wrap;
  min-width: 0;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface-hover);
  padding: 6px 12px;
  border-radius: var(--radius-md);
  min-width: 0;
}

.filter-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.filter-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.filter-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  font-weight: 600;
}

.date-item {
  min-width: 240px;
}

.date-picker {
  min-width: 200px;
}

.date-picker :deep(.p-datepicker-input) {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 12.5px;
  font-weight: 500;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text);
  box-shadow: none;
}

.date-picker :deep(.p-datepicker-input:focus) {
  box-shadow: none;
}

.filter-select {
  border: none;
  background: transparent;
  padding: 0;
  min-width: 140px;
}

.filter-select :deep(.p-select-label) {
  padding: 0;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text);
}

.filter-search {
  flex: 1;
  min-width: 200px;
}

.search-wrap {
  position: relative;
  display: block;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 40px;
  padding-left: 38px;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
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