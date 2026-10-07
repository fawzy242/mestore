<script setup>
import { computed, onMounted, ref } from 'vue'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import { CrudToolbar, CrudTabs, BulkActionBar } from '@/components/crud/index.js'
import CustomerTable from '../components/CustomerTable.vue'
import CustomerFormModal from '../components/CustomerFormModal.vue'
import CustomerViewModal from '../components/CustomerViewModal.vue'
import { useCustomers } from '../composables/useCustomers.js'
import { useDebouncedSearch } from '@/composables/useDebouncedSearch.js'
import { useToast } from '@/composables/useToast.js'
import { useConfirm } from '@/composables/useConfirm.js'

const { push } = useToast()
const { confirmAction } = useConfirm()
const {
  rows,
  loading,
  error,
  filters,
  sort,
  fetchCustomers,
  remove,
  bulkSetStatus,
  bulkDelete,
  setStatusTab,
  setSort,
} = useCustomers()

const activeTab = ref('Active')
const formOpen = ref(false)
const formId = ref(null)
const viewOpen = ref(false)
const viewRow = ref(null)
const selectedKeys = ref([])
const refreshing = ref(false)

const tabs = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
]

const bulkActions = computed(() =>
  activeTab.value === 'Active'
    ? [
        { key: 'deactivate', label: 'Deactivate', icon: 'pi pi-ban', severity: 'danger' },
        { key: 'delete', label: 'Delete', icon: 'pi pi-trash', severity: 'danger' },
      ]
    : [
        { key: 'activate', label: 'Activate', icon: 'pi pi-check-circle', severity: 'success' },
        { key: 'delete', label: 'Delete', icon: 'pi pi-trash', severity: 'danger' },
      ],
)

const { value: searchValue } = useDebouncedSearch((v) => {
  filters.search = v
  fetchCustomers()
})

function onTabChange(next) {
  activeTab.value = next
  selectedKeys.value = []
  setStatusTab(next)
}

async function onRefresh() {
  refreshing.value = true
  await fetchCustomers()
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
    header: 'Delete customer?',
    message: `Delete "${row.name}" (${row.memberCode})? This cannot be undone.`,
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    variant: 'danger',
    accept: async () => {
      await remove(row.id)
      selectedKeys.value = selectedKeys.value.filter((k) => k !== row.id)
      push('Customer deleted')
    },
  })
}

async function onBulkAction(key) {
  if (!selectedKeys.value.length) return
  const count = selectedKeys.value.length

  if (key === 'delete') {
    await confirmAction({
      header: 'Delete selected?',
      message: `Delete ${count} customer(s)? This cannot be undone.`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      variant: 'danger',
      accept: async () => {
        await bulkDelete(selectedKeys.value)
        push(`${count} customer${count === 1 ? '' : 's'} deleted`)
        selectedKeys.value = []
      },
    })
    return
  }

  const isActivate = key === 'activate'
  await confirmAction({
    header: isActivate ? 'Activate selected?' : 'Deactivate selected?',
    message: `${isActivate ? 'Activate' : 'Deactivate'} ${count} customer(s)?`,
    acceptLabel: isActivate ? 'Activate' : 'Deactivate',
    rejectLabel: 'Cancel',
    variant: isActivate ? 'success' : 'danger',
    accept: async () => {
      await bulkSetStatus(selectedKeys.value, isActivate ? 'Active' : 'Inactive')
      push(`${count} customer${count === 1 ? '' : 's'} ${isActivate ? 'activated' : 'deactivated'}`)
      selectedKeys.value = []
    },
  })
}

async function onSaved() {
  await fetchCustomers()
}

onMounted(fetchCustomers)
</script>

<template>
  <AppPageContainer>
    <CrudToolbar
      v-model:search="searchValue"
      search-placeholder="Search customers or member ID…"
      add-label="Add Customer"
      :refreshing="refreshing"
      @refresh="onRefresh"
      @add="openAdd"
    />

    <CrudTabs :model-value="activeTab" :tabs="tabs" @update:model-value="onTabChange" />

    <BulkActionBar
      :count="selectedKeys.length"
      :actions="bulkActions"
      @action="onBulkAction"
      @clear="selectedKeys = []"
    />

    <CustomerTable
      :rows="rows"
      :loading="loading"
      :error="error"
      :selectable="true"
      :selected-keys="selectedKeys"
      :sort-key="sort.key"
      :sort-dir="sort.dir"
      @update:selected-keys="(v) => (selectedKeys = v)"
      @view="openView"
      @edit="openEdit"
      @delete="askDelete"
      @sort-change="setSort"
      @retry="fetchCustomers"
    />

    <p class="page-footer">
      Showing <span class="mono">{{ rows.length }}</span> {{ activeTab.toLowerCase() }} members
    </p>

    <CustomerFormModal v-model="formOpen" :customer-id="formId" @saved="onSaved" />
    <CustomerViewModal v-model="viewOpen" :customer="viewRow" />
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