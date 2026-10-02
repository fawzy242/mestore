<script setup>
import AppTable from '@/components/ui/AppTable.vue'
import MonoChip from '@/components/ui/MonoChip.vue'
import AppIconButton from '@/components/ui/AppIconButton.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import { useCategoryIcons } from '../composables/useCategoryIcons.js'

const props = defineProps({
  rows: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  error: { type: Object, default: null },
})

const emit = defineEmits(['edit', 'delete', 'retry'])
const { iconFor } = useCategoryIcons()

const columns = [
  { key: 'index', label: '#', align: 'center' },
  { key: 'name', label: 'Category Name' },
  { key: 'productCount', label: 'Products', align: 'center' },
]

function rowIndex(row) {
  const i = props.rows.indexOf(row)
  return String(i + 1).padStart(2, '0')
}
</script>

<template>
  <AppTable
    :columns="columns"
    :rows="rows"
    :loading="loading"
    :error="error"
    empty-message="No categories found."
    @retry="emit('retry')"
  >
    <template #cell-index="{ row }">
      <span class="index mono">{{ rowIndex(row) }}</span>
    </template>

    <template #cell-name="{ row }">
      <div class="name-cell">
        <span class="icon-square">
          <component :is="iconFor(row.name)" />
        </span>
        <span class="name-text">{{ row.name }}</span>
      </div>
    </template>

    <template #cell-productCount="{ row }">
      <MonoChip variant="neutral">{{ row.productCount }}</MonoChip>
    </template>

    <template #row-actions="{ row }">
      <AppIconButton title="Edit" @click="emit('edit', row)">
        <IconEdit />
      </AppIconButton>
      <AppIconButton title="Delete" variant="danger" @click="emit('delete', row)">
        <IconTrash />
      </AppIconButton>
    </template>
  </AppTable>
</template>

<style scoped>
.index {
  font-size: 12.5px;
  color: var(--color-ink-soft);
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-square {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-s);
  background: var(--color-surface-container);
  color: var(--color-ink-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.name-text {
  font-weight: 500;
  color: var(--color-ink);
}
</style>