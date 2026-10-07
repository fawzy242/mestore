<script setup>
import { onMounted, ref } from 'vue'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppToolbar from '@/components/ui/AppToolbar.vue'
import AppSearchInput from '@/components/ui/AppSearchInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import ShiftTable from '../components/ShiftTable.vue'
import ShiftViewModal from '../components/ShiftViewModal.vue'
import { useShifts } from '../composables/useShift.js'
import { useDebouncedSearch } from '@/composables/useDebouncedSearch.js'

const {
  rows,
  loading,
  error,
  filters,
  page,
  pageSize,
  total,
  pageCount,
  fetchShifts,
  applyFilter,
  goToPage,
} = useShifts()

const statusOptions = [
  { value: '', label: 'All shifts' },
  { value: 'Open', label: 'Open' },
  { value: 'Closed', label: 'Closed' },
]

const viewOpen = ref(false)
const selected = ref(null)

const { value: searchValue } = useDebouncedSearch((v) => {
  filters.search = v
  applyFilter()
})

function onStatus(v) {
  filters.status = v
  applyFilter()
}

function onPageChange(p) {
  goToPage(p)
  fetchShifts()
}

function openView(row) {
  selected.value = row
  viewOpen.value = true
}

onMounted(fetchShifts)
</script>

<template>
  <AppPageContainer>
    <AppToolbar>
      <template #search>
        <AppSearchInput v-model="searchValue" placeholder="Search shift ID or cashier…" />
      </template>
      <template #filters>
        <AppSelect
          :model-value="filters.status"
          :options="statusOptions"
          @update:model-value="onStatus"
        />
      </template>
    </AppToolbar>

    <ShiftTable
      :rows="rows"
      :loading="loading"
      :error="error"
      :pagination="{ page, pageSize, total, pageCount }"
      @view="openView"
      @page-change="onPageChange"
      @retry="fetchShifts"
    />

    <p class="page-footer">
      Showing <span class="mono">{{ rows.length }}</span> of
      <span class="mono">{{ total }}</span> shift records
    </p>

    <ShiftViewModal v-model="viewOpen" :shift="selected" />
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