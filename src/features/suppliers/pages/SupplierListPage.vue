<script setup>
import { computed, onMounted, ref } from 'vue'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import { CrudToolbar, CrudTabs, BulkActionBar } from '@/components/crud/index.js'
import SupplierTable from '../components/SupplierTable.vue'
import SupplierFormModal from '../components/SupplierFormModal.vue'
import SupplierViewModal from '../components/SupplierViewModal.vue'
import { useSuppliers } from '../composables/useSuppliers.js'
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
  fetchSuppliers,
  remove,
  bulkSetStatus,
  bulkDelete,
  setStatusTab,
  setSort,
} = useSuppliers()

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
  fetchSuppliers()
})

function onTabChange(next) {
  activeTab.value = next
  selectedKeys.value = []
  setStatusTab(next)
}

async function onRefresh() {
  refreshing.value = true
  await fetchSuppliers()
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
    header: 'Delete supplier?',
    message: `Delete "${row.name}"? This cannot be undone.`,
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    variant: 'danger',
    accept: async () => {
      await remove(row.id)
      selectedKeys.value = selectedKeys.value.filter((k) => k !== row.id)
      push('Supplier deleted')
    },
  })
}

async function onBulkAction(key) {
  if (!selectedKeys.value.length) return
  const count = selectedKeys.value.length

  if (key === 'delete') {
    await confirmAction({
      header: 'Delete selected?',
      message: `Delete ${count} supplier(s)? This cannot be undone.`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      variant: 'danger',
      accept: async () => {
        await bulkDelete(selectedKeys.value)
        push(`${count} supplier${count === 1 ? '' : 's'} deleted`)
        selectedKeys.value = []
      },
    })
    return
  }

  const isActivate = key === 'activate'
  await confirmAction({
    header: isActivate ? 'Activate selected?' : 'Deactivate selected?',
    message: `${isActivate ? 'Activate' : 'Deactivate'} ${count} supplier(s)?`,
    acceptLabel: isActivate ? 'Activate' : 'Deactivate',
    rejectLabel: 'Cancel',
    variant: isActivate ? 'success' : 'danger',
    accept: async () => {
      await bulkSetStatus(selectedKeys.value, isActivate ? 'Active' : 'Inactive')
      push(`${count} supplier${count === 1 ? '' : 's'} ${isActivate ? 'activated' : 'deactivated'}`)
      selectedKeys.value = []
    },
  })
}

async function onSaved() {
  await fetchSuppliers()
}

onMounted(fetchSuppliers)
</script>

<template>
  <AppPageContainer>
    <CrudToolbar
      v-model:search="searchValue"
      search-placeholder="Search suppliers…"
      add-label="Add Supplier"
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

    <SupplierTable
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
      @retry="fetchSuppliers"
    />

    <p class="page-footer">
      Showing <span class="mono">{{ rows.length }}</span> {{ activeTab.toLowerCase() }} suppliers
    </p>

    <SupplierFormModal v-model="formOpen" :supplier-id="formId" @saved="onSaved" />
    <SupplierViewModal v-model="viewOpen" :supplier="viewRow" />
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