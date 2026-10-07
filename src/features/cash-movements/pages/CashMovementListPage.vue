<script setup>
import { computed, onMounted, ref } from 'vue'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import { CrudToolbar, CrudTabs, BulkActionBar } from '@/components/crud/index.js'
import CashMovementTable from '../components/CashMovementTable.vue'
import CashMovementFormModal from '../components/CashMovementFormModal.vue'
import CashMovementViewModal from '../components/CashMovementViewModal.vue'
import { useCashMovements } from '../composables/useCashMovements.js'
import { useDebouncedSearch } from '@/composables/useDebouncedSearch.js'
import { useToast } from '@/composables/useToast.js'
import { useConfirm } from '@/composables/useConfirm.js'

const { push } = useToast()
const { confirmAction } = useConfirm()
const {
  rows,
  loading,
  error,
  approvalTab,
  filters,
  sort,
  fetchCashMovements,
  remove,
  bulkApprove,
  bulkPending,
  bulkReject,
  setApprovalTab,
  setSort,
} = useCashMovements()

const formOpen = ref(false)
const formId = ref(null)
const viewOpen = ref(false)
const viewRow = ref(null)
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
  fetchCashMovements()
})

function onTabChange(next) {
  selectedKeys.value = []
  setApprovalTab(next)
}

async function onRefresh() {
  refreshing.value = true
  await fetchCashMovements()
  refreshing.value = false
}

function openAdd() {
  formId.value = null
  formOpen.value = true
}
function openEdit(row) {
  formId.value = row.id
  formOpen.value = true
}
function openView(row) {
  viewRow.value = row
  viewOpen.value = true
}

async function askDelete(row) {
  await confirmAction({
    header: 'Delete cash movement?',
    message: `Delete this ${row.type === 'in' ? 'Cash In' : 'Cash Out'} of ${row.amount}? This cannot be undone.`,
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    variant: 'danger',
    accept: async () => {
      await remove(row.id)
      selectedKeys.value = selectedKeys.value.filter((k) => k !== row.id)
      push('Movement deleted')
    },
  })
}

async function onBulkAction(key) {
  if (!selectedKeys.value.length) return
  const count = selectedKeys.value.length
  const map = {
    approve: { header: 'Approve selected?', message: `Approve ${count} cash movement(s)?`, label: 'Approve', variant: 'success', fn: bulkApprove, toast: `${count} movements approved` },
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

async function onSaved() {
  await fetchCashMovements()
}

onMounted(fetchCashMovements)
</script>

<template>
  <AppPageContainer>
    <CrudToolbar
      v-model:search="searchValue"
      search-placeholder="Search by reason or user…"
      add-label="Record Movement"
      :refreshing="refreshing"
      @refresh="onRefresh"
      @add="openAdd"
    />

    <CrudTabs :model-value="approvalTab" :tabs="tabs" @update:model-value="onTabChange" />

    <BulkActionBar
      :count="selectedKeys.length"
      :actions="bulkActions"
      @action="onBulkAction"
      @clear="selectedKeys = []"
    />

    <CashMovementTable
      :rows="rows"
      :loading="loading"
      :error="error"
      :approval-tab="approvalTab"
      :selectable="true"
      :selected-keys="selectedKeys"
      :sort-key="sort.key"
      :sort-dir="sort.dir"
      @update:selected-keys="(v) => (selectedKeys = v)"
      @view="openView"
      @edit="openEdit"
      @delete="askDelete"
      @sort-change="setSort"
      @retry="fetchCashMovements"
    />

    <p class="page-footer">
      Showing <span class="mono">{{ rows.length }}</span> {{ approvalTab.toLowerCase() }} cash movements
    </p>

    <CashMovementFormModal v-model="formOpen" :movement-id="formId" @saved="onSaved" />
    <CashMovementViewModal v-model="viewOpen" :movement="viewRow" />
  </AppPageContainer>
</template>

<style scoped>
.page-footer {
  text-align: right;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 10px;
}
</style>