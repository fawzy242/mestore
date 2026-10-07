<script setup>
import AppTable from '@/components/ui/AppTable.vue'
import MonoChip from '@/components/ui/MonoChip.vue'
import { formatRupiah } from '@/composables/useFormatters.js'

defineProps({
  rows: { type: Array, required: true },
  loading: { type: Boolean, default: false },
})

const columns = [
  { key: 'name', label: 'Product', sortable: true },
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'unitsSold', label: 'Units Sold', align: 'right', sortable: true },
  { key: 'revenue', label: 'Revenue', align: 'right', sortable: true, formatter: (v) => formatRupiah(v) },
]
</script>

<template>
  <AppTable
    :columns="columns"
    :rows="rows"
    :loading="loading"
    empty-message="No product data for this range."
  >
    <template #cell-sku="{ row }"><MonoChip variant="neutral">{{ row.sku }}</MonoChip></template>
    <template #cell-revenue="{ row }">
      <span class="mono revenue">{{ formatRupiah(row.revenue) }}</span>
    </template>
  </AppTable>
</template>

<style scoped>
.revenue {
  font-weight: 700;
  color: var(--primary);
}
</style>