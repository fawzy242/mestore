<script setup>
import Button from 'primevue/button'
import AppTable from '@/components/ui/AppTable.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import MonoChip from '@/components/ui/MonoChip.vue'

defineProps({
  rows: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  error: { type: Object, default: null },
  pagination: { type: Object, default: null },
  sortKey: { type: String, default: '' },
  sortDir: { type: String, default: 'asc' },
})

const emit = defineEmits(['adjust', 'view', 'page-change', 'sort-change', 'retry'])

const columns = [
  { key: 'productName', label: 'Product', sortable: true },
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'stock', label: 'Stock', align: 'right', sortable: true },
  { key: 'status', label: 'Status', align: 'center', sortable: true },
]

function statusVariant(s) {
  if (s === 'Out of stock') return 'danger'
  if (s === 'Low stock') return 'warning'
  return 'success'
}
</script>

<template>
  <AppTable
    :columns="columns"
    :rows="rows"
    :loading="loading"
    :error="error"
    :pagination="pagination"
    :sort-key="sortKey"
    :sort-dir="sortDir"
    empty-message="No products found."
    @page-change="(p) => emit('page-change', p)"
    @sort-change="(k) => emit('sort-change', k)"
    @retry="emit('retry')"
  >
    <template #cell-sku="{ row }">
      <MonoChip variant="neutral">{{ row.sku }}</MonoChip>
    </template>
    <template #cell-stock="{ row }">
      <span class="mono stock-value">{{ row.stock }} {{ row.unit }}</span>
    </template>
    <template #cell-status="{ row }">
      <StatusPill :variant="statusVariant(row.status)">{{ row.status }}</StatusPill>
    </template>
    <template #row-actions="{ row }">
      <Button icon="pi pi-eye" severity="secondary" text rounded size="small" aria-label="View" @click.stop="emit('view', row)" />
      <Button label="Adjust" icon="pi pi-tune" severity="secondary" text size="small" @click.stop="emit('adjust', row)" />
    </template>
  </AppTable>
</template>

<style scoped>
.stock-value {
  font-weight: 600;
}
</style>