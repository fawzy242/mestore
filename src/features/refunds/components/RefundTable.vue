<script setup>
import Button from 'primevue/button'
import AppTable from '@/components/ui/AppTable.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import MonoChip from '@/components/ui/MonoChip.vue'
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
  { key: 'refNo', label: 'Refund', sortable: true },
  { key: 'originalTxId', label: 'Original Tx', sortable: true },
  { key: 'customerName', label: 'Customer', sortable: true },
  { key: 'date', label: 'Date', sortable: true },
  { key: 'amount', label: 'Amount', align: 'right', sortable: true },
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
    empty-message="No refunds found."
    @update:selected-keys="(v) => emit('update:selectedKeys', v)"
    @row-click="(row) => emit('view', row)"
    @sort-change="(k) => emit('sort-change', k)"
    @retry="emit('retry')"
  >
    <template #cell-refNo="{ row }"><MonoChip variant="primary">{{ row.refNo }}</MonoChip></template>
    <template #cell-originalTxId="{ row }"><MonoChip variant="neutral">{{ row.originalTxId }}</MonoChip></template>
    <template #cell-amount="{ row }"><span class="mono total">{{ formatRupiah(row.amount) }}</span></template>
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
.total { font-weight: 700; }
</style>