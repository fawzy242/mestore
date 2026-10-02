<script setup>
import AppTable from '@/components/ui/AppTable.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import IconTransactions from '@/components/icons/IconTransactions.vue'
import IconVisibility from '@/components/icons/IconVisibility.vue'
import AppIconButton from '@/components/ui/AppIconButton.vue'
import { formatRupiah } from '@/composables/useFormatters.js'

const props = defineProps({
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
        <IconTransactions class="receipt-icon" />
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
      <AppIconButton title="View" @click="emit('view', row)">
        <IconVisibility />
      </AppIconButton>
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
  color: var(--color-ink-soft);
  font-size: 16px;
}

.receipt-id {
  color: var(--color-primary-container);
  font-weight: 600;
}

.total {
  font-weight: 700;
}
</style>