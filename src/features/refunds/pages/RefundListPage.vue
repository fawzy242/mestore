<script setup>
import { computed, onMounted, ref } from 'vue'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import { CrudToolbar, CrudTabs, BulkActionBar } from '@/components/crud/index.js'
import RefundTable from '../components/RefundTable.vue'
import RefundFormModal from '../components/RefundFormModal.vue'
import RefundViewModal from '../components/RefundViewModal.vue'
import { useRefunds } from '../composables/useRefunds.js'
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
  fetchRefunds,
  remove,
  bulkApprove,
  bulkPending,
  bulkReject,
  setApprovalTab,
  setSort,
} = useRefunds()

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
  fetchRefunds()
})

function onTabChange(next) {
  selectedKeys.value = []
  setApprovalTab(next)
}

async function onRefresh() {
  refreshing.value = true
  await fetchRefunds()
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
    header: 'Delete refund?',
    message: `Delete refund "${row.refNo}"? This cannot be undone.`,
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    variant: 'danger',
    accept: async () => {
      await remove(row.id)
      selectedKeys.value = selectedKeys.value.filter((k) => k !== row.id)
      push('Refund deleted')
    },
  })
}

async function onBulkAction(key) {
  if (!selectedKeys.value.length) return
  const count = selectedKeys.value.length
  const map = {
    approve: { header: 'Approve selected?', message: `Approve ${count} refund(s)?`, label: 'Approve', variant: 'success', fn: bulkApprove, toast: `${count} refunds approved` },
    pending: { header: 'Move to Pending?', message: `Move ${count} refund(s) back to Pending?`, label: 'Move to Pending', variant: 'primary', fn: bulkPending, toast: `${count} refunds set to Pending` },
    reject: { header: 'Reject selected?', message: `Reject ${count} refund(s)?`, label: 'Reject', variant: 'danger', fn: bulkReject, toast: `${count} refunds rejected` },
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
  await fetchRefunds()
}

onMounted(fetchRefunds)
</script>

<template>
  <AppPageContainer>
    <CrudToolbar
      v-model:search="searchValue"
      search-placeholder="Search by refund, tx or customer…"
      add-label="New Refund"
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

    <RefundTable
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
      @retry="fetchRefunds"
    />

    <p class="page-footer">
      Showing <span class="mono">{{ rows.length }}</span> {{ approvalTab.toLowerCase() }} refunds
    </p>

    <RefundFormModal v-model="formOpen" :refund-id="formId" @saved="onSaved" />
    <RefundViewModal v-model="viewOpen" :refund="viewRow" />
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