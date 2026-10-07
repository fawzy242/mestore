<script setup>
import Button from 'primevue/button'
import AppTable from '@/components/ui/AppTable.vue'
import MonoChip from '@/components/ui/MonoChip.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useCategoryIcons } from '../composables/useCategoryIcons.js'

defineProps({
  rows: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  error: { type: Object, default: null },
  selectable: { type: Boolean, default: false },
  selectedKeys: { type: Array, default: () => [] },
  sortKey: { type: String, default: '' },
  sortDir: { type: String, default: 'asc' },
})

const emit = defineEmits([
  'view',
  'edit',
  'delete',
  'retry',
  'sort-change',
  'update:selectedKeys',
])

const { iconFor } = useCategoryIcons()

const columns = [
  { key: 'name', label: 'Category Name', sortable: true },
  { key: 'productCount', label: 'Products', align: 'center', sortable: true },
]
</script>

<template>
  <AppTable
    :columns="columns"
    :rows="rows"
    :loading="loading"
    :error="error"
    :selectable="selectable"
    :selected-keys="selectedKeys"
    :sort-key="sortKey"
    :sort-dir="sortDir"
    empty-message="No categories found."
    @update:selected-keys="(v) => emit('update:selectedKeys', v)"
    @row-click="(row) => emit('view', row)"
    @sort-change="(k) => emit('sort-change', k)"
    @retry="emit('retry')"
  >
    <template #cell-name="{ row }">
      <div class="name-cell">
        <span class="icon-square">
          <AppIcon :name="iconFor(row.name)" :size="16" />
        </span>
        <span class="name-text">{{ row.name }}</span>
      </div>
    </template>

    <template #cell-productCount="{ row }">
      <MonoChip variant="neutral">{{ row.productCount }}</MonoChip>
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
}
.icon-square {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--surface-hover);
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.name-text {
  font-weight: 500;
  color: var(--text);
}
</style>