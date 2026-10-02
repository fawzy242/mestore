<script setup>
import AppTable from '@/components/ui/AppTable.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'
import AppIconButton from '@/components/ui/AppIconButton.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import { formatRupiah } from '@/composables/useFormatters.js'

const props = defineProps({
  rows: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  error: { type: Object, default: null },
  pagination: { type: Object, default: null },
  sortKey: { type: String, default: '' },
  sortDir: { type: String, default: 'asc' },
})

const emit = defineEmits(['view', 'edit', 'delete', 'page-change', 'sort-change', 'retry'])

const columns = [
  { key: 'name', label: 'Product', sortable: true },
  { key: 'sku', label: 'SKU', mono: true, sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'price', label: 'Price', mono: true, align: 'right', sortable: true, formatter: (v) => formatRupiah(v) },
  { key: 'stock', label: 'Stock', mono: true, align: 'right', sortable: true, formatter: (v, r) => `${v} ${r.unit}` },
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
    empty-message="No products found. Try a different search or add a new product."
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

    <template #row-actions="{ row }">
      <StatusPill :variant="row.stock <= 8 ? 'warning' : 'success'">
        {{ row.stock <= 8 ? 'Low stock' : 'In stock' }}
      </StatusPill>
      <AppIconButton title="Edit" @click="emit('edit', row)">
        <IconEdit />
      </AppIconButton>
      <AppIconButton title="Delete" variant="danger" @click="emit('delete', row)">
        <IconTrash />
      </AppIconButton>
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
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.name-secondary {
  font-size: 11.5px;
  color: var(--color-ink-soft);
}
</style>