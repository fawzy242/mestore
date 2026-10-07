<script setup>
import Button from 'primevue/button'
import AppTable from '@/components/ui/AppTable.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import { formatRupiah } from '@/composables/useFormatters.js'

defineProps({
  rows: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  error: { type: Object, default: null },
  pagination: { type: Object, default: null },
})

const emit = defineEmits(['view', 'page-change', 'retry'])

const columns = [
  { key: 'id', label: 'Shift ID' },
  { key: 'date', label: 'Date' },
  { key: 'cashier', label: 'Cashier' },
  { key: 'openedAt', label: 'Opened' },
  { key: 'closedAt', label: 'Closed' },
  { key: 'variance', label: 'Variance', align: 'right' },
  { key: 'status', label: 'Status', align: 'center' },
]

function varianceClass(v) {
  if (v < 0) return 'neg'
  if (v > 0) return 'pos'
  return 'zero'
}
</script>

<template>
  <AppTable
    :columns="columns"
    :rows="rows"
    :loading="loading"
    :error="error"
    :pagination="pagination"
    empty-message="No shift records found."
    @page-change="(p) => emit('page-change', p)"
    @retry="emit('retry')"
  >
    <template #cell-id="{ row }">
      <span class="mono shift-id">{{ row.id }}</span>
    </template>

    <template #cell-variance="{ row }">
      <span class="mono" :class="varianceClass(row.variance)">
        {{ formatRupiah(row.variance) }}
      </span>
    </template>

    <template #cell-status="{ row }">
      <StatusPill :variant="row.status === 'Open' ? 'success' : 'neutral'">
        {{ row.status }}
      </StatusPill>
    </template>

    <template #row-actions="{ row }">
      <Button
        icon="pi pi-eye"
        severity="secondary"
        text
        rounded
        size="small"
        aria-label="View"
        @click.stop="emit('view', row)"
      />
    </template>
  </AppTable>
</template>

<style scoped>
.shift-id {
  font-weight: 600;
  color: var(--primary);
}
.neg {
  color: var(--danger);
  font-weight: 600;
}
.pos {
  color: var(--warning);
  font-weight: 600;
}
.zero {
  color: var(--text-muted);
}
</style>