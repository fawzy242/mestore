<script setup>
import { computed, onMounted, ref } from 'vue'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import KPIBar from '@/components/ui/KPIBar.vue'
import KPIStat from '@/components/ui/KPIStat.vue'
import { CrudToolbar, CrudTabs, BulkActionBar } from '@/components/crud/index.js'
import CategoryTable from '../components/CategoryTable.vue'
import CategoryFormModal from '../components/CategoryFormModal.vue'
import CategoryViewModal from '../components/CategoryViewModal.vue'
import { useCategories } from '../composables/useCategories.js'
import { useToast } from '@/composables/useToast.js'
import { useConfirm } from '@/composables/useConfirm.js'

const { push } = useToast()
const { confirmAction } = useConfirm()
const {
  rows,
  loading,
  error,
  search,
  activeTab,
  sort,
  fetchCategories,
  removeCategory,
  bulkSetStatus,
  bulkDelete,
  setStatusTab,
  setSort,
} = useCategories()

const selectedKeys = ref([])
const formOpen = ref(false)
const formId = ref(null)
const viewOpen = ref(false)
const viewId = ref(null)
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

const kpis = computed(() => {
  const total = rows.value.length
  const skus = rows.value.reduce((sum, c) => sum + (c.productCount || 0), 0)
  return {
    taxonomy: total,
    skus,
    velocity: total ? (skus / total).toFixed(1) : '0',
  }
})

function onTabChange(next) {
  selectedKeys.value = []
  setStatusTab(next)
}

async function onRefresh() {
  refreshing.value = true
  await fetchCategories()
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
  viewId.value = row.id
  viewOpen.value = true
}

async function askDelete(row) {
  await confirmAction({
    header: 'Delete category?',
    message: `Delete "${row.name}"? The record is hidden from both tabs. Products keep their data.`,
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    variant: 'danger',
    accept: async () => {
      await removeCategory(row.id)
      selectedKeys.value = selectedKeys.value.filter((k) => k !== row.id)
      push('Category deleted')
    },
  })
}

async function onBulkAction(key) {
  if (!selectedKeys.value.length) return
  const count = selectedKeys.value.length

  if (key === 'delete') {
    await confirmAction({
      header: 'Delete selected?',
      message: `Delete ${count} categor${count === 1 ? 'y' : 'ies'}? They will be hidden from both tabs.`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      variant: 'danger',
      accept: async () => {
        await bulkDelete(selectedKeys.value)
        push(`${count} categor${count === 1 ? 'y' : 'ies'} deleted`)
        selectedKeys.value = []
      },
    })
    return
  }

  const isActivate = key === 'activate'
  await confirmAction({
    header: isActivate ? 'Activate selected?' : 'Deactivate selected?',
    message: `${isActivate ? 'Activate' : 'Deactivate'} ${count} categor${count === 1 ? 'y' : 'ies'}?`,
    acceptLabel: isActivate ? 'Activate' : 'Deactivate',
    rejectLabel: 'Cancel',
    variant: isActivate ? 'success' : 'danger',
    accept: async () => {
      await bulkSetStatus(selectedKeys.value, isActivate ? 'Active' : 'Inactive')
      push(`${count} categor${count === 1 ? 'y' : 'ies'} ${isActivate ? 'activated' : 'deactivated'}`)
      selectedKeys.value = []
    },
  })
}

async function onSaved() {
  await fetchCategories()
}

onMounted(fetchCategories)
</script>

<template>
  <AppPageContainer>
    <KPIBar :columns="3">
      <KPIStat label="Active Taxonomy" :value="kpis.taxonomy" icon="layers" tone="primary" />
      <KPIStat label="Indexed SKUs" :value="kpis.skus" icon="qr-code-2" tone="neutral" />
      <KPIStat
        label="Velocity Avg"
        :value="kpis.velocity"
        unit="/cat"
        icon="analytics"
        tone="neutral"
      />
    </KPIBar>

    <CrudToolbar
      v-model:search="search"
      search-placeholder="Search categories…"
      add-label="Add Category"
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

    <CategoryTable
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
      @retry="fetchCategories"
    />

    <p class="page-footer">
      Showing <span class="mono">{{ rows.length }}</span> {{ activeTab.toLowerCase() }} categories
    </p>

    <CategoryFormModal v-model="formOpen" :category-id="formId" @saved="onSaved" />
    <CategoryViewModal v-model="viewOpen" :category-id="viewId" @edit="openEdit" />
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