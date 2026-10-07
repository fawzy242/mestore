<script setup>
import { computed, onMounted, ref } from 'vue'
import { CrudToolbar, CrudTabs, BulkActionBar } from '@/components/crud/index.js'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import DiscountTable from '../components/DiscountTable.vue'
import DiscountFormModal from '../components/DiscountFormModal.vue'
import DiscountViewModal from '../components/DiscountViewModal.vue'
import { useDiscounts } from '../composables/useDiscounts.js'
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
  fetchDiscounts,
  remove,
  bulkApprove,
  bulkPending,
  bulkReject,
  setApprovalTab,
  setSort,
} = useDiscounts()

const tabs = [
  { value: 'Approved', label: 'Approved' },
  { value: 'Pending', label: 'Pending' },
]

const formOpen = ref(false)
const formId = ref(null)
const viewOpen = ref(false)
const selected = ref(null)
const selectedKeys = ref([])
const refreshing = ref(false)

const bulkActions = computed(() => {
  if (approvalTab.value === 'Approved') {
    return [
      { key: 'pending', label: 'Pending', icon: 'pi pi-clock', severity: 'secondary' },
      { key: 'reject', label: 'Reject', icon: 'pi pi-times-circle', severity: 'danger' },
    ]
  }
  return [
    { key: 'approve', label: 'Approve', icon: 'pi pi-check-circle', severity: 'success' },
    { key: 'reject', label: 'Reject', icon: 'pi pi-times-circle', severity: 'danger' },
  ]
})

const { value: searchValue } = useDebouncedSearch((v) => {
  filters.search = v
  fetchDiscounts()
})

function onTabChange(next) {
  selectedKeys.value = []
  setApprovalTab(next)
}

async function onRefresh() {
  refreshing.value = true
  await fetchDiscounts()
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
  selected.value = row
  viewOpen.value = true
}

async function askDelete(row) {
  await confirmAction({
    header: 'Delete promotion?',
    message: `Delete "${row.name}"? This cannot be undone.`,
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    variant: 'danger',
    accept: async () => {
      await remove(row.id)
      push('Promotion deleted')
    },
  })
}

async function onBulkAction(key) {
  if (!selectedKeys.value.length) return
  const count = selectedKeys.value.length
  const map = {
    approve: { header: 'Approve selected?', message: `Approve ${count} promotion(s)?`, label: 'Approve', variant: 'success', fn: bulkApprove, toast: `${count} promotions approved` },
    pending: { header: 'Move to Pending?', message: `Move ${count} promotion(s) back to Pending?`, label: 'Move to Pending', variant: 'primary', fn: bulkPending, toast: `${count} promotions set to Pending` },
    reject: { header: 'Reject selected?', message: `Reject ${count} promotion(s)?`, label: 'Reject', variant: 'danger', fn: bulkReject, toast: `${count} promotions rejected` },
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
  await fetchDiscounts()
}

onMounted(fetchDiscounts)
</script>

<template>
  <AppPageContainer>
    <CrudToolbar
      v-model:search="searchValue"
      search-placeholder="Search promotions…"
      add-label="Add Promotion"
      :refreshing="refreshing"
      @refresh="onRefresh"
      @add="openAdd"
    />

    <CrudTabs
      :model-value="approvalTab"
      :tabs="tabs"
      @update:model-value="onTabChange"
    />

    <BulkActionBar
      :count="selectedKeys.length"
      :actions="bulkActions"
      @action="onBulkAction"
      @clear="selectedKeys = []"
    />

    <DiscountTable
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
      @retry="fetchDiscounts"
    />

    <p class="page-footer">
      Showing <span class="mono">{{ rows.length }}</span>
      {{ approvalTab.toLowerCase() }} promotions
    </p>

    <DiscountFormModal v-model="formOpen" :discount-id="formId" @saved="onSaved" />
    <DiscountViewModal v-model="viewOpen" :discount="selected" @edit="openEdit" />
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