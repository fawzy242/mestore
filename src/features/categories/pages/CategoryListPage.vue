<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Button from 'primevue/button'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppToolbar from '@/components/ui/AppToolbar.vue'
import AppSearchInput from '@/components/ui/AppSearchInput.vue'
import KPIBar from '@/components/ui/KPIBar.vue'
import KPIStat from '@/components/ui/KPIStat.vue'
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
  fetchCategories,
  removeCategory,
  bulkSetStatus,
  setStatusTab,
} = useCategories()

const activeTab = ref('Active')
const selectedKeys = ref([])

const formModalOpen = ref(false)
const formCategoryId = ref(null)
const viewModalOpen = ref(false)
const viewCategoryId = ref(null)

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

function onTabChange(next) {
  activeTab.value = next
  selectedKeys.value = []
  setStatusTab(next)
}

function openAdd() {
  formCategoryId.value = null
  formModalOpen.value = true
}

function openEdit(row) {
  formCategoryId.value = row.id
  formModalOpen.value = true
}

function openView(row) {
  viewCategoryId.value = row.id
  viewModalOpen.value = true
}

function editFromView(id) {
  viewModalOpen.value = false
  formCategoryId.value = id
  formModalOpen.value = true
}

async function askDelete(row) {
  await confirmAction({
    header: 'Delete category?',
    message: `Delete "${row.name}"? Products already in this category keep their data but lose this grouping. This can't be undone.`,
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

async function bulkDeactivate() {
  if (!selectedKeys.value.length) return
  const count = selectedKeys.value.length
  await confirmAction({
    header: 'Deactivate selected categories?',
    message: `Deactivate ${count} selected categor${count === 1 ? 'y' : 'ies'}?`,
    acceptLabel: 'Deactivate',
    rejectLabel: 'Cancel',
    variant: 'danger',
    accept: async () => {
      await bulkSetStatus(selectedKeys.value, 'Inactive')
      push(`${count} categories deactivated`)
      selectedKeys.value = []
    },
  })
}

async function bulkActivate() {
  if (!selectedKeys.value.length) return
  const count = selectedKeys.value.length
  await confirmAction({
    header: 'Activate selected categories?',
    message: `Activate ${count} selected categor${count === 1 ? 'y' : 'ies'}?`,
    acceptLabel: 'Activate',
    rejectLabel: 'Cancel',
    variant: 'success',
    accept: async () => {
      await bulkSetStatus(selectedKeys.value, 'Active')
      push(`${count} categories activated`)
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

    <AppToolbar>
      <template #search>
        <AppSearchInput v-model="search" placeholder="Search categories…" />
      </template>
      <template #actions>
        <Button label="Add Category" icon="pi pi-plus" @click="openAdd" />
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

    <CategoryTable
      :rows="rows"
      :loading="loading"
      :error="error"
      selectable
      :selected-keys="selectedKeys"
      @update:selected-keys="(v) => (selectedKeys = v)"
      @view="openView"
      @edit="openEdit"
      @delete="askDelete"
      @retry="fetchCategories"
    />

    <p class="page-footer">
      Showing <span class="mono">{{ rows.length }}</span> {{ activeTab.toLowerCase() }} categories
    </p>

    <CategoryFormModal
      v-model="formModalOpen"
      :category-id="formCategoryId"
      @saved="onSaved"
    />
    <CategoryViewModal
      v-model="viewModalOpen"
      :category-id="viewCategoryId"
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