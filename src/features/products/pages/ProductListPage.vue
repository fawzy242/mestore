<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import * as categoriesService from '@/services/api/categories.service.js'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppToolbar from '@/components/ui/AppToolbar.vue'
import AppSearchInput from '@/components/ui/AppSearchInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import KPIBar from '@/components/ui/KPIBar.vue'
import KPIStat from '@/components/ui/KPIStat.vue'
import ProductTable from '../components/ProductTable.vue'
import ProductFormModal from '../components/ProductFormModal.vue'
import ProductViewModal from '../components/ProductViewModal.vue'
import { useProducts } from '../composables/useProducts.js'
import { useDebouncedSearch } from '@/composables/useDebouncedSearch.js'
import { useToast } from '@/composables/useToast.js'
import { useConfirm } from '@/composables/useConfirm.js'

const router = useRouter()
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
  applyFilter,
  setStatusTab,
  setSort,
  goToPage,
} = useProducts()

const activeTab = ref('Active')
const selectedKeys = ref([])
const categoryOptions = ref([{ value: '', label: 'All categories' }])

const formModalOpen = ref(false)
const formProductId = ref(null)
const viewModalOpen = ref(false)
const viewProductId = ref(null)

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

function onCategoryChange(value) {
  filters.category = value
  applyFilter()
}

function onPageChange(p) {
  goToPage(p)
  fetchProducts()
}

function onTabChange(next) {
  activeTab.value = next
  selectedKeys.value = []
  setStatusTab(next)
}

function openAdd() {
  formProductId.value = null
  formModalOpen.value = true
}

function openEdit(row) {
  formProductId.value = row.id
  formModalOpen.value = true
}

function openView(row) {
  viewProductId.value = row.id
  viewModalOpen.value = true
}

function editFromView(id) {
  viewModalOpen.value = false
  formProductId.value = id
  formModalOpen.value = true
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

async function bulkDeactivate() {
  if (!selectedKeys.value.length) return
  const count = selectedKeys.value.length
  await confirmAction({
    header: 'Deactivate selected products?',
    message: `Deactivate ${count} selected product(s)? They will no longer appear in the active catalog.`,
    acceptLabel: 'Deactivate',
    rejectLabel: 'Cancel',
    variant: 'danger',
    accept: async () => {
      await bulkSetStatus(selectedKeys.value, 'Inactive')
      push(`${count} products deactivated`)
      selectedKeys.value = []
    },
  })
}

async function bulkActivate() {
  if (!selectedKeys.value.length) return
  const count = selectedKeys.value.length
  await confirmAction({
    header: 'Activate selected products?',
    message: `Activate ${count} selected product(s)? They will return to the active catalog.`,
    acceptLabel: 'Activate',
    rejectLabel: 'Cancel',
    variant: 'success',
    accept: async () => {
      await bulkSetStatus(selectedKeys.value, 'Active')
      push(`${count} products activated`)
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
    <div class="mestore-tabs">
      <button
        type="button"
        class="mestore-tab"
        :class="{ active: activeTab === 'Active' }"
        @click="onTabChange('Active')"
      >
        Active
      </button>
      <button
        type="button"
        class="mestore-tab"
        :class="{ active: activeTab === 'Inactive' }"
        @click="onTabChange('Inactive')"
      >
        Inactive
      </button>
    </div>

    <KPIBar :columns="4">
      <KPIStat label="Total SKUs" :value="kpis.totalSkus" icon="inventory-2" tone="neutral" />
      <KPIStat label="Low Stock Warnings" :value="kpis.lowStock" icon="warning" tone="warning" />
      <KPIStat label="In Stock" :value="kpis.inStock" icon="check-circle" tone="success" />
      <KPIStat label="Categories Active" :value="kpis.categories" icon="category" tone="primary" />
    </KPIBar>

    <AppToolbar>
      <template #search>
        <AppSearchInput v-model="searchValue" placeholder="Search products, SKU or category…" />
      </template>
      <template #filters>
        <AppSelect
          :model-value="filters.category"
          :options="categoryOptions"
          @update:model-value="onCategoryChange"
        />
      </template>
      <template #actions>
        <Button label="Add Product" icon="pi pi-plus" @click="openAdd" />
      </template>
    </AppToolbar>

    <div v-if="selectedKeys.length" class="bulk-bar">
      <span class="bulk-count">{{ selectedKeys.length }} selected</span>
      <Button
        v-if="activeTab === 'Active'"
        label="Deactivate"
        icon="pi pi-ban"
        severity="danger"
        outlined
        size="small"
        @click="bulkDeactivate"
      />
      <Button
        v-else
        label="Activate"
        icon="pi pi-check-circle"
        severity="success"
        outlined
        size="small"
        @click="bulkActivate"
      />
      <Button
        label="Clear"
        icon="pi pi-times"
        text
        severity="secondary"
        size="small"
        @click="selectedKeys = []"
      />
    </div>

    <ProductTable
      :rows="rows"
      :loading="loading"
      :error="error"
      :pagination="{ page, pageSize, total, pageCount }"
      :sort-key="sort.key"
      :sort-dir="sort.dir"
      selectable
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
      <span class="mono">{{ total }}</span> {{ activeTab.toLowerCase() }} items
    </p>

    <ProductFormModal
      v-model="formModalOpen"
      :product-id="formProductId"
      @saved="onSaved"
    />
    <ProductViewModal
      v-model="viewModalOpen"
      :product-id="viewProductId"
      @edit="editFromView"
    />
  </AppPageContainer>
</template>

<style scoped>
.bulk-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--primary-tint);
  border: 1px solid var(--primary);
  border-radius: var(--radius-md);
  margin-bottom: 12px;
}

.bulk-count {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  margin-right: auto;
}

.page-footer {
  text-align: right;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 10px;
}
</style>