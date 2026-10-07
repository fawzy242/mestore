<script setup>
import Button from 'primevue/button'
import AppTable from '@/components/ui/AppTable.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import { formatRupiah } from '@/composables/useFormatters.js'

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

const emit = defineEmits(['view', 'edit', 'delete', 'retry', 'sort-change', 'update:selectedKeys'])

const columns = [
  { key: 'date', label: 'Date', sortable: true },
  { key: 'type', label: 'Type', align: 'center', sortable: true },
  { key: 'amount', label: 'Amount', align: 'right', sortable: true },
  { key: 'reason', label: 'Reason', sortable: true },
  { key: 'user', label: 'User', sortable: true },
  { key: 'shiftRef', label: 'Shift', sortable: true },
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
    empty-message="No cash movements found."
    @update:selected-keys="(v) => emit('update:selectedKeys', v)"
    @row-click="(row) => emit('view', row)"
    @sort-change="(k) => emit('sort-change', k)"
    @retry="emit('retry')"
  >
    <template #cell-type="{ row }">
      <StatusPill :variant="row.type === 'in' ? 'success' : 'danger'">
        {{ row.type === 'in' ? 'Cash In' : 'Cash Out' }}
      </StatusPill>
    </template>
    <template #cell-amount="{ row }">
      <span class="mono amount" :class="row.type === 'in' ? 'pos' : 'neg'">
        {{ row.type === 'in' ? '+' : '−' }} {{ formatRupiah(row.amount) }}
      </span>
    </template>
    <template #cell-shiftRef="{ row }"><span class="mono shift">{{ row.shiftRef }}</span></template>
    <template #cell-status="{ row }">
      <StatusPill :variant="statusVariant(row)">{{ statusLabel(row) }}</StatusPill>
    </template>
    <template #row-actions="{ row }">
      <Button icon="pi pi-pencil" severity="secondary" text rounded size="small" aria-label="Edit" @click.stop="emit('edit', row)" />
      <Button icon="pi pi-trash" severity="danger" text rounded size="small" aria-label="Delete" @click.stop="emit('delete', row)" />
    </template>
  </AppTable>
</template>

<style scoped>
.amount { font-weight: 700; }
.pos { color: var(--success); }
.neg { color: var(--danger); }
.shift { font-size: 12.5px; color: var(--text-muted); }
</style>