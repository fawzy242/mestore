<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as categoriesService from '@/services/api/categories.service.js'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppToolbar from '@/components/ui/AppToolbar.vue'
import AppSearchInput from '@/components/ui/AppSearchInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppTabs from '@/components/ui/AppTabs.vue'
import KPIBar from '@/components/ui/KPIBar.vue'
import KPIStat from '@/components/ui/KPIStat.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconInventory from '@/components/icons/IconProducts.vue'
import IconWarning from '@/components/icons/IconWarning.vue'
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue'
import IconCategory from '@/components/icons/IconCategory.vue'
import ProductTable from '../components/ProductTable.vue'
import { useProducts } from '../composables/useProducts.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog.js'
import { useDebouncedSearch } from '@/composables/useDebouncedSearch.js'
import { useToast } from '@/composables/useToast.js'

const router = useRouter()
const { push } = useToast()
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
  applyFilter,
  setSort,
  goToPage,
} = useProducts()

const { state: confirmState, open: openConfirm, confirm: confirmOk, close: confirmCancel } =
  useConfirmDialog()
let pendingDelete = null

const categoryOptions = ref([{ value: '', label: 'All categories' }])

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
  const result = await categoriesService.getCategories()
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

function goNew() {
  router.push({ name: 'products.new' })
}
function goEdit(row) {
  router.push({ name: 'products.edit', params: { id: row.id } })
}
function goDetail(row) {
  router.push({ name: 'products.detail', params: { id: row.id } })
}
function goCategories() {
  router.push({ name: 'categories.list' })
}

async function askDelete(row) {
  pendingDelete = row
  const ok = await openConfirm({
    title: 'Delete product?',
    message: `Delete "${row.name}"? This will permanently remove it from your catalog. This can't be undone.`,
    confirmLabel: 'Delete',
    variant: 'danger',
  })
  if (ok && pendingDelete) {
    await removeProduct(pendingDelete.id)
    push('Product deleted')
    pendingDelete = null
  }
}

const tabs = [
  { id: 'products', label: 'Products' },
  { id: 'categories', label: 'Categories' },
]

onMounted(async () => {
  await Promise.all([loadCategories(), fetchProducts()])
})
</script>

<template>
  <AppPageContainer>
    <AppTabs
      model-value="products"
      :tabs="tabs"
      @change="(id) => id === 'categories' && goCategories()"
    />

    <KPIBar :columns="4">
      <KPIStat label="Total SKUs" :value="kpis.totalSkus" :icon="IconInventory" tone="neutral" />
      <KPIStat label="Low Stock Warnings" :value="kpis.lowStock" :icon="IconWarning" tone="warning" />
      <KPIStat label="In Stock" :value="kpis.inStock" :icon="IconCheckCircle" tone="success" />
      <KPIStat label="Categories Active" :value="kpis.categories" :icon="IconCategory" tone="primary" />
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
        <AppButton variant="primary" @click="goNew">
          <IconPlus /> Add Product
        </AppButton>
      </template>
    </AppToolbar>

    <ProductTable
      :rows="rows"
      :loading="loading"
      :error="error"
      :pagination="{ page, pageSize, total, pageCount }"
      :sort-key="sort.key"
      :sort-dir="sort.dir"
      @view="goDetail"
      @edit="goEdit"
      @delete="askDelete"
      @page-change="onPageChange"
      @sort-change="setSort"
      @retry="fetchProducts"
    />

    <p class="page-footer">
      Showing <span class="mono">{{ rows.length }}</span> of
      <span class="mono">{{ total }}</span> active inventory catalog items
    </p>

    <ConfirmDialog
      :model-value="confirmState.isOpen.value"
      :title="confirmState.title.value"
      :message="confirmState.message.value"
      :confirm-label="confirmState.confirmLabel.value"
      :variant="confirmState.variant.value"
      @update:model-value="(v) => !v && confirmCancel()"
      @confirm="confirmOk"
    />
  </AppPageContainer>
</template>

<style scoped>
.page-footer {
  text-align: right;
  font-size: 12px;
  color: var(--color-ink-soft);
  margin-top: 10px;
}
</style>