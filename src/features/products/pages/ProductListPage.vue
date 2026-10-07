<script setup>
import { computed, onMounted, ref } from 'vue'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import KPIBar from '@/components/ui/KPIBar.vue'
import KPIStat from '@/components/ui/KPIStat.vue'
import { CrudToolbar, CrudTabs, BulkActionBar } from '@/components/crud/index.js'
import ProductTable from '../components/ProductTable.vue'
import ProductFormModal from '../components/ProductFormModal.vue'
import ProductViewModal from '../components/ProductViewModal.vue'
import { useProducts } from '../composables/useProducts.js'
import { useDebouncedSearch } from '@/composables/useDebouncedSearch.js'
import { useToast } from '@/composables/useToast.js'
import { useConfirm } from '@/composables/useConfirm.js'
import * as categoriesService from '@/services/api/categories.service.js'

const { push } = useToast()
const { confirmAction } = useConfirm()

const {
  rows,
  loading,
  error,
  filters,
  sort,
  page,
  pageSize,
  total,
  pageCount,
  fetchProducts,
  removeProduct,
  bulkSetStatus,
  bulkDelete,
  applyFilter,
  setStatusTab,
  setSort,
  goToPage,
} = useProducts()

const activeTab = ref('Active')
const selectedKeys = ref([])
const categoryOptions = ref([{ value: '', label: 'All categories' }])
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
  const lowStock = rows.value.filter((p) => p.stock <= 8).length
  return {
    totalSkus: total.value,
    lowStock,
    inStock: rows.value.length - lowStock,
    categories: categoryOptions.value.length - 1,
  }
})

async function loadCategories() {
  const result = await categoriesService.getCategories({ status: 'Active' })
  categoryOptions.value = [
    { value: '', label: 'All categories' },
    ...result.items.map((c) => ({ value: c.name, label: c.name })),
  ]
}

const { value: searchValue } = useDebouncedSearch((v) => {
  filters.search = v
  applyFilter()
})

function onCategoryChange(v) {
  filters.category = v
  applyFilter()
}

function onTabChange(next) {
  activeTab.value = next
  selectedKeys.value = []
  setStatusTab(next)
}

async function onRefresh() {
  refreshing.value = true
  await fetchProducts()
  refreshing.value = false
}

function onPageChange(p) {
  goToPage(p)
  fetchProducts()
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
    header: 'Delete product?',
    message: `Delete "${row.name}"? This will permanently remove it from your catalog. This can't be undone.`,
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    variant: 'danger',
    accept: async () => {
      await removeProduct(row.id)
      selectedKeys.value = selectedKeys.value.filter((k) => k !== row.id)
      push('Product deleted')
    },
  })
}

async function onBulkAction(key) {
  if (!selectedKeys.value.length) return
  const count = selectedKeys.value.length

  if (key === 'delete') {
    await confirmAction({
      header: 'Delete selected?',
      message: `Delete ${count} product(s)? This cannot be undone.`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      variant: 'danger',
      accept: async () => {
        await bulkDelete(selectedKeys.value)
        push(`${count} product${count === 1 ? '' : 's'} deleted`)
        selectedKeys.value = []
      },
    })
    return
  }

  const isActivate = key === 'activate'
  await confirmAction({
    header: isActivate ? 'Activate selected?' : 'Deactivate selected?',
    message: `${isActivate ? 'Activate' : 'Deactivate'} ${count} product(s)?`,
    acceptLabel: isActivate ? 'Activate' : 'Deactivate',
    rejectLabel: 'Cancel',
    variant: isActivate ? 'success' : 'danger',
    accept: async () => {
      await bulkSetStatus(selectedKeys.value, isActivate ? 'Active' : 'Inactive')
      push(`${count} product${count === 1 ? '' : 's'} ${isActivate ? 'activated' : 'deactivated'}`)
      selectedKeys.value = []
    },
  })
}

async function onSaved() {
  await fetchProducts()
}

onMounted(async () => {
  await Promise.all([loadCategories(), fetchProducts()])
})
</script>

<template>
  <AppPageContainer>
    <KPIBar :columns="4">
      <KPIStat label="Total SKUs" :value="kpis.totalSkus" icon="inventory-2" tone="neutral" />
      <KPIStat label="Low Stock Warnings" :value="kpis.lowStock" icon="warning" tone="warning" />
      <KPIStat label="In Stock" :value="kpis.inStock" icon="check-circle" tone="success" />
      <KPIStat label="Categories Active" :value="kpis.categories" icon="category" tone="primary" />
    </KPIBar>

    <CrudToolbar
      v-model:search="searchValue"
      search-placeholder="Search products, SKU or category…"
      add-label="Add Product"
      :refreshing="refreshing"
      @refresh="onRefresh"
      @add="openAdd"
    >
      <template #filters>
        <AppSelect
          :model-value="filters.category"
          :options="categoryOptions"
          @update:model-value="onCategoryChange"
        />
      </template>
    </CrudToolbar>

    <CrudTabs :model-value="activeTab" :tabs="tabs" @update:model-value="onTabChange" />

    <BulkActionBar
      :count="selectedKeys.length"
      :actions="bulkActions"
      @action="onBulkAction"
      @clear="selectedKeys = []"
    />

    <ProductTable
      :rows="rows"
      :loading="loading"
      :error="error"
      :pagination="{ page, pageSize, total, pageCount }"
      :sort-key="sort.key"
      :sort-dir="sort.dir"
      :selectable="true"
      :selected-keys="selectedKeys"
      @update:selected-keys="(v) => (selectedKeys = v)"
      @view="openView"
      @edit="openEdit"
      @delete="askDelete"
      @page-change="onPageChange"
      @sort-change="setSort"
      @retry="fetchProducts"
    />

    <p class="page-footer">
      Showing <span class="mono">{{ rows.length }}</span> of
      <span class="mono">{{ total }}</span> {{ activeTab.toLowerCase() }} products
    </p>

    <ProductFormModal v-model="formOpen" :product-id="formId" @saved="onSaved" />
    <ProductViewModal v-model="viewOpen" :product-id="viewId" @edit="openEdit" />
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