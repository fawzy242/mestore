<script setup>
import Button from 'primevue/button'
import AppTable from '@/components/ui/AppTable.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { formatRupiah } from '@/composables/useFormatters.js'

defineProps({
  rows: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  error: { type: Object, default: null },
})

const emit = defineEmits(['view', 'retry'])

const columns = [
  { key: 'id', label: 'Receipt' },
  { key: 'time', label: 'Date / Time' },
  { key: 'cashier', label: 'Cashier' },
  { key: 'total', label: 'Total', align: 'right' },
  { key: 'status', label: 'Status', align: 'center' },
]
</script>

<template>
  <AppTable
    :columns="columns"
    :rows="rows"
    :loading="loading"
    :error="error"
    clickable-rows
    empty-message="No transactions found for this range."
    @row-click="(row) => emit('view', row)"
    @retry="emit('retry')"
  >
    <template #cell-id="{ row }">
      <span class="receipt-cell">
        <AppIcon name="receipt" :size="16" class="receipt-icon" />
        <span class="mono receipt-id">{{ row.id }}</span>
      </span>
    </template>

    <template #cell-total="{ row }">
      <span class="mono total">{{ formatRupiah(row.total) }}</span>
    </template>

    <template #cell-status>
      <StatusPill variant="success">Completed</StatusPill>
    </template>

    <template #row-actions="{ row }">
      <Button
        icon="pi pi-eye"
        severity="secondary"
        text
        rounded
        size="small"
        aria-label="View receipt"
        @click.stop="emit('view', row)"
      />
    </template>
  </AppTable>
</template>

<style scoped>
.receipt-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.receipt-icon {
  color: var(--text-muted);
}

.receipt-id {
  color: var(--primary);
  font-weight: 600;
}

.total {
  font-weight: 700;
}
</style>