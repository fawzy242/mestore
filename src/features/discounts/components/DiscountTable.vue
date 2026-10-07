<script setup>
import Button from 'primevue/button'
import AppTable from '@/components/ui/AppTable.vue'
import StatusPill from '@/components/ui/StatusPill.vue'

defineProps({
  rows: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  error: { type: Object, default: null },
  approvalTab: { type: String, default: 'Approved' },
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

const columns = [
  { key: 'name', label: 'Promotion', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'value', label: 'Value', align: 'right', sortable: true },
  { key: 'appliesTo', label: 'Applies To', sortable: true },
  { key: 'startDate', label: 'Start', sortable: true },
  { key: 'endDate', label: 'End', sortable: true },
  { key: 'status', label: 'Status', align: 'center', sortable: true },
]

function fmtValue(row) {
  if (row.type === 'percentage') return `${row.value}%`
  return `Rp ${Number(row.value).toLocaleString('id-ID')}`
}

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
    empty-message="No promotions found."
    @update:selected-keys="(v) => emit('update:selectedKeys', v)"
    @row-click="(row) => emit('view', row)"
    @sort-change="(k) => emit('sort-change', k)"
    @retry="emit('retry')"
  >
    <template #cell-value="{ row }">
      <span class="mono value">{{ fmtValue(row) }}</span>
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
.value {
  font-weight: 700;
  color: var(--primary);
}
</style>