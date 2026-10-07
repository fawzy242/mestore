<script setup>
import Button from 'primevue/button'
import AppTable from '@/components/ui/AppTable.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'
import { formatRupiah } from '@/composables/useFormatters.js'

defineProps({
  rows: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  error: { type: Object, default: null },
  pagination: { type: Object, default: null },
  sortKey: { type: String, default: '' },
  sortDir: { type: String, default: 'asc' },
  selectable: { type: Boolean, default: false },
  selectedKeys: { type: Array, default: () => [] },
})

const emit = defineEmits([
  'view',
  'edit',
  'delete',
  'page-change',
  'sort-change',
  'retry',
  'update:selectedKeys',
])

const columns = [
  { key: 'name', label: 'Product', sortable: true },
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'price', label: 'Price', align: 'right', sortable: true, formatter: (v) => formatRupiah(v) },
  { key: 'stock', label: 'Stock', align: 'right', sortable: true, formatter: (v, r) => `${v} ${r.unit}` },
  { key: 'status', label: 'Status' },
]
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
    :selectable="selectable"
    :selected-keys="selectedKeys"
    empty-message="No products found. Try a different search or add a new product."
    @update:selected-keys="(v) => emit('update:selectedKeys', v)"
    @row-click="(row) => emit('view', row)"
    @page-change="(p) => emit('page-change', p)"
    @sort-change="(k) => emit('sort-change', k)"
    @retry="emit('retry')"
  >
    <template #cell-name="{ row }">
      <div class="name-cell">
        <AvatarInitials :name="row.name" :size="28" tone="neutral" />
        <div class="name-text">
          <span class="name-primary">{{ row.name }}</span>
          <span class="name-secondary">{{ row.category }}</span>
        </div>
      </div>
    </template>

    <template #cell-status="{ row }">
      <StatusPill :variant="row.stock <= 8 ? 'warning' : 'success'">
        {{ row.stock <= 8 ? 'Low stock' : 'In stock' }}
      </StatusPill>
    </template>

    <template #row-actions="{ row }">
      <Button
        icon="pi pi-pencil"
        severity="secondary"
        text
        rounded
        size="small"
        aria-label="Edit"
        @click.stop="emit('edit', row)"
      />
      <Button
        icon="pi pi-trash"
        severity="danger"
        text
        rounded
        size="small"
        aria-label="Delete"
        @click.stop="emit('delete', row)"
      />
    </template>
  </AppTable>
</template>

<style scoped>
.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.name-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.name-primary {
  font-weight: 500;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.name-secondary {
  font-size: 11.5px;
  color: var(--text-muted);
}
</style>