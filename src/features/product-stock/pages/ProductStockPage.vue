<script setup>
import { computed, onMounted, ref } from 'vue'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import { CrudToolbar, CrudTabs, BulkActionBar } from '@/components/crud/index.js'
import ProductStockTable from '../components/ProductStockTable.vue'
import ProductStockHistoryTable from '../components/ProductStockHistoryTable.vue'
import StockAdjustModal from '../components/StockAdjustModal.vue'
import StockMoveFormModal from '../components/StockMoveFormModal.vue'
import StockMoveViewModal from '../components/StockMoveViewModal.vue'
import { useProductStock } from '../composables/useProductStock.js'
import { useDebouncedSearch } from '@/composables/useDebouncedSearch.js'
import { useToast } from '@/composables/useToast.js'
import { useConfirm } from '@/composables/useConfirm.js'

const { push } = useToast()
const { confirmAction } = useConfirm()

const {
  rows,
  history,
  loading,
  historyLoading,
  error,
  approvalTab,
  filters,
  historySort,
  overviewSort,
  page,
  pageSize,
  total,
  pageCount,
  fetchStock,
  fetchHistory,
  adjust,
  updateMove,
  removeMove,
  bulkApprove,
  bulkPending,
  bulkReject,
  setApprovalTab,
  setHistorySort,
  setOverviewSort,
  applyFilter,
  goToPage,
} = useProductStock()

const statusOptions = [
  { value: '', label: 'All stock statuses' },
  { value: 'In stock', label: 'In stock' },
  { value: 'Low stock', label: 'Low stock' },
  { value: 'Out of stock', label: 'Out of stock' },
]

const adjustOpen = ref(false)
const adjustProduct = ref(null)
const formOpen = ref(false)
const editingMove = ref(null)
const viewOpen = ref(false)
const viewingMove = ref(null)
const selectedKeys = ref([])
const refreshing = ref(false)

const tabs = [
  { value: 'Approved', label: 'Approved' },
  { value: 'Pending', label: 'Pending' },
]

const bulkActions = computed(() =>
  approvalTab.value === 'Approved'
    ? [
        { key: 'pending', label: 'Pending', icon: 'pi pi-clock', severity: 'secondary' },
        { key: 'reject', label: 'Reject', icon: 'pi pi-times-circle', severity: 'danger' },
      ]
    : [
        { key: 'approve', label: 'Approve', icon: 'pi pi-check-circle', severity: 'success' },
        { key: 'reject', label: 'Reject', icon: 'pi pi-times-circle', severity: 'danger' },
      ],
)

const { value: searchValue } = useDebouncedSearch((v) => {
  filters.search = v
  applyFilter()
})

function onStatusChange(v) {
  filters.status = v
  applyFilter()
}

function onPageChange(p) {
  goToPage(p)
  fetchStock()
}

function onTabChange(next) {
  selectedKeys.value = []
  setApprovalTab(next)
}

async function onRefresh() {
  refreshing.value = true
  await fetchStock()
  await fetchHistory()
  refreshing.value = false
}

function openAdjust(row) {
  adjustProduct.value = row
  adjustOpen.value = true
}

async function onAdjust(payload) {
  await adjust(payload)
  push('Stock adjustment submitted for approval')
}

function openAdd() {
  editingMove.value = null
  formOpen.value = true
}

function openEdit(row) {
  editingMove.value = row
  formOpen.value = true
}

async function onSaved(payload) {
  if (editingMove.value) {
    await updateMove(editingMove.value.id, payload)
    push('Stock move updated')
  } else {
    await adjust(payload)
    push('Stock move added')
  }
}

function openView(row) {
  viewingMove.value = row
  viewOpen.value = true
}

async function askDelete(row) {
  await confirmAction({
    header: 'Delete stock move?',
    message: `Delete this ${row.type} move of ${row.quantity} units? This cannot be undone.`,
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    variant: 'danger',
    accept: async () => {
      await removeMove(row.id)
      push('Stock move deleted')
    },
  })
}

async function onBulkAction(key) {
  if (!selectedKeys.value.length) return
  const count = selectedKeys.value.length
  const map = {
    approve: { header: 'Approve selected?', message: `Approve ${count} stock movement(s)?`, label: 'Approve', variant: 'success', fn: bulkApprove, toast: `${count} movements approved` },
    pending: { header: 'Move to Pending?', message: `Move ${count} movement(s) back to Pending?`, label: 'Move to Pending', variant: 'primary', fn: bulkPending, toast: `${count} movements set to Pending` },
    reject: { header: 'Reject selected?', message: `Reject ${count} movement(s)?`, label: 'Reject', variant: 'danger', fn: bulkReject, toast: `${count} movements rejected` },
  }
  const cfg = map[key]
  if (!cfg) return
  await confirmAction({
    header: cfg.header,
    message: cfg.message,
    acceptLabel: cfg.label,
    rejectLabel: 'Cancel',
    variant: cfg.variant,
    accept: async () => {
      await cfg.fn(selectedKeys.value)
      push(cfg.toast)
      selectedKeys.value = []
    },
  })
}

onMounted(async () => {
  await Promise.all([fetchStock(), fetchHistory('Approved')])
})
</script>

<template>
  <AppPageContainer>
    <!-- Section 1 — Current Product Stock overview -->
    <h3 class="section-title">Current Product Stock</h3>

    <CrudToolbar
      v-model:search="searchValue"
      search-placeholder="Search products or SKU…"
      add-label="Adjust Stock"
      :refreshing="refreshing"
      @refresh="onRefresh"
      @add="openAdd"
    >
      <template #filters>
        <AppSelect :model-value="filters.status" :options="statusOptions" @update:model-value="onStatusChange" />
      </template>
    </CrudToolbar>

    <ProductStockTable
      :rows="rows"
      :loading="loading"
      :error="error"
      :pagination="{ page, pageSize, total, pageCount }"
      :sort-key="overviewSort.key"
      :sort-dir="overviewSort.dir"
      @adjust="openAdjust"
      @view="openAdjust"
      @page-change="onPageChange"
      @sort-change="setOverviewSort"
      @retry="fetchStock"
    />

    <p class="page-footer">
      Showing <span class="mono">{{ rows.length }}</span> of
      <span class="mono">{{ total }}</span> products
    </p>

    <!-- Section 2 — Stock Movements -->
    <h3 class="section-title">Stock Movements</h3>

    <CrudTabs :model-value="approvalTab" :tabs="tabs" @update:model-value="onTabChange" />

    <BulkActionBar
      :count="selectedKeys.length"
      :actions="bulkActions"
      @action="onBulkAction"
      @clear="selectedKeys = []"
    />

    <ProductStockHistoryTable
      :rows="history"
      :loading="historyLoading"
      :error="error"
      :selectable="true"
      :selected-keys="selectedKeys"
      :sort-key="historySort.key"
      :sort-dir="historySort.dir"
      @update:selected-keys="(v) => (selectedKeys = v)"
      @view="openView"
      @edit="openEdit"
      @delete="askDelete"
      @sort-change="setHistorySort"
      @retry="() => fetchHistory(approvalTab)"
    />

    <StockAdjustModal v-model="adjustOpen" :product="adjustProduct" @saved="onAdjust" />
    <StockMoveFormModal v-model="formOpen" :move="editingMove" @saved="onSaved" />
    <StockMoveViewModal v-model="viewOpen" :move="viewingMove" />
  </AppPageContainer>
</template>

<style scoped>
.section-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--text);
}
.section-title:not(:first-child) {
  margin-top: 28px;
}
.page-footer {
  text-align: right;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 10px;
}
</style>