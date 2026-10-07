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
  sortDir: { type: String, default: 'desc' },
})

const emit = defineEmits([
  'view',
  'edit',
  'delete',
  'retry',
  'sort-change',
  'update:selectedKeys',
])

const columns = [
  { key: 'date', label: 'Date', sortable: true },
  { key: 'productName', label: 'Product', sortable: true },
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'quantity', label: 'Qty', align: 'right', sortable: true },
  { key: 'before', label: 'Before', align: 'right', sortable: true },
  { key: 'after', label: 'After', align: 'right', sortable: true },
  { key: 'reason', label: 'Reason', sortable: true },
  { key: 'user', label: 'User', sortable: true },
  { key: 'status', label: 'Status', align: 'center', sortable: true },
]

function statusLabel(row) {
  return row.Approved === 1 ? 'Approved' : 'Pending'
}
function statusVariant(row) {
  return row.Approved === 1 ? 'success' : 'warning'
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
    empty-message="No stock movements."
    @update:selected-keys="(v) => emit('update:selectedKeys', v)"
    @row-click="(row) => emit('view', row)"
    @sort-change="(k) => emit('sort-change', k)"
    @retry="emit('retry')"
  >
    <template #cell-type="{ row }">
      <span class="mono" :class="`type-${row.type}`">{{ row.type }}</span>
    </template>
    <template #cell-sku="{ row }">
      <MonoChip variant="neutral">{{ row.sku }}</MonoChip>
    </template>
    <template #cell-quantity="{ row }">
      <span class="mono">{{ row.quantity }}</span>
    </template>
    <template #cell-before="{ row }">
      <span class="mono">{{ row.before }}</span>
    </template>
    <template #cell-after="{ row }">
      <span class="mono">{{ row.after }}</span>
    </template>
    <template #cell-status="{ row }">
      <StatusPill :variant="statusVariant(row)">{{ statusLabel(row) }}</StatusPill>
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
.type-in {
  color: var(--success);
}
.type-out {
  color: var(--danger);
}
.type-adjust {
  color: var(--warning);
}
</style>