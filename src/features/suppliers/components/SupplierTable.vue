<script setup>
import Button from 'primevue/button'
import AppTable from '@/components/ui/AppTable.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import MonoChip from '@/components/ui/MonoChip.vue'

defineProps({
  rows: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  error: { type: Object, default: null },
  selectable: { type: Boolean, default: false },
  selectedKeys: { type: Array, default: () => [] },
  sortKey: { type: String, default: '' },
  sortDir: { type: String, default: 'asc' },
})

const emit = defineEmits(['view', 'edit', 'delete', 'retry', 'sort-change', 'update:selectedKeys'])

const columns = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'name', label: 'Supplier', sortable: true },
  { key: 'contact', label: 'Contact', sortable: true },
  { key: 'phone', label: 'Phone', sortable: true },
  { key: 'status', label: 'Status', align: 'center', sortable: true },
]

function isActive(row) {
  return row.IsActive === 1
}
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
    empty-message="No suppliers found."
    @update:selected-keys="(v) => emit('update:selectedKeys', v)"
    @row-click="(row) => emit('view', row)"
    @sort-change="(k) => emit('sort-change', k)"
    @retry="emit('retry')"
  >
    <template #cell-code="{ row }"><MonoChip variant="neutral">{{ row.code }}</MonoChip></template>
    <template #cell-status="{ row }">
      <StatusPill :variant="isActive(row) ? 'success' : 'neutral'">
        {{ isActive(row) ? 'Active' : 'Inactive' }}
      </StatusPill>
    </template>
    <template #row-actions="{ row }">
      <Button icon="pi pi-pencil" severity="secondary" text rounded size="small" aria-label="Edit" @click.stop="emit('edit', row)" />
      <Button icon="pi pi-trash" severity="danger" text rounded size="small" aria-label="Delete" @click.stop="emit('delete', row)" />
    </template>
  </AppTable>
</template>