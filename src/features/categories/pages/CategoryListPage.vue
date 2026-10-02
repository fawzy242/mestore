<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppToolbar from '@/components/ui/AppToolbar.vue'
import AppSearchInput from '@/components/ui/AppSearchInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppTabs from '@/components/ui/AppTabs.vue'
import KPIBar from '@/components/ui/KPIBar.vue'
import KPIStat from '@/components/ui/KPIStat.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconLayers from '@/components/icons/IconProducts.vue'
import IconQrCode from '@/components/icons/IconQrCode.vue'
import IconAnalytics from '@/components/icons/IconAnalytics.vue'
import CategoryTable from '../components/CategoryTable.vue'
import { useCategories } from '../composables/useCategories.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog.js'
import { useToast } from '@/composables/useToast.js'

const router = useRouter()
const { push } = useToast()
const { rows, loading, error, search, fetchCategories, removeCategory } = useCategories()

const { state: confirmState, open: openConfirm, confirm: confirmOk, close: confirmCancel } =
  useConfirmDialog()
let pending = null

const kpis = computed(() => {
  const total = rows.value.length
  const skus = rows.value.reduce((sum, c) => sum + (c.productCount || 0), 0)
  return {
    taxonomy: total,
    skus,
    velocity: total ? (skus / total).toFixed(1) : '0',
  }
})

watch(search, fetchCategories)

const tabs = [
  { id: 'products', label: 'Products' },
  { id: 'categories', label: 'Categories' },
]

function goProducts() {
  router.push({ name: 'products.list' })
}
function goNew() {
  router.push({ name: 'categories.new' })
}
function goEdit(row) {
  router.push({ name: 'categories.edit', params: { id: row.id } })
}

async function askDelete(row) {
  pending = row
  const ok = await openConfirm({
    title: 'Delete category?',
    message: `Delete "${row.name}"? Products already in this category keep their data but lose this grouping. This can't be undone.`,
    confirmLabel: 'Delete',
    variant: 'danger',
  })
  if (ok && pending) {
    await removeCategory(pending.id)
    push('Category deleted')
    pending = null
  }
}

onMounted(fetchCategories)
</script>

<template>
  <AppPageContainer>
    <AppTabs
      model-value="categories"
      :tabs="tabs"
      @change="(id) => id === 'products' && goProducts()"
    />

    <KPIBar :columns="3">
      <KPIStat label="Active Taxonomy" :value="kpis.taxonomy" :icon="IconLayers" tone="primary" />
      <KPIStat label="Indexed SKUs" :value="kpis.skus" :icon="IconQrCode" tone="neutral" />
      <KPIStat
        label="Velocity Avg"
        :value="kpis.velocity"
        unit="/cat"
        :icon="IconAnalytics"
        tone="neutral"
      />
    </KPIBar>

    <AppToolbar>
      <template #search>
        <AppSearchInput v-model="search" placeholder="Search categories…" />
      </template>
      <template #actions>
        <AppButton variant="primary" @click="goNew">
          <IconPlus /> Add Category
        </AppButton>
      </template>
    </AppToolbar>

    <CategoryTable
      :rows="rows"
      :loading="loading"
      :error="error"
      @edit="goEdit"
      @delete="askDelete"
      @retry="fetchCategories"
    />

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