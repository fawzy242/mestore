<script setup>
import Button from 'primevue/button'
import AppTable from '@/components/ui/AppTable.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import MonoChip from '@/components/ui/MonoChip.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'

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
  { key: 'name', label: 'Customer', sortable: true },
  { key: 'memberCode', label: 'Member ID', sortable: true },
  { key: 'phone', label: 'Phone', sortable: true },
  { key: 'status', label: 'Status', align: 'center', sortable: true },
  { key: 'joinedAt', label: 'Joined', sortable: true },
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
    empty-message="No customers found."
    @update:selected-keys="(v) => emit('update:selectedKeys', v)"
    @row-click="(row) => emit('view', row)"
    @sort-change="(k) => emit('sort-change', k)"
    @retry="emit('retry')"
  >
    <template #cell-name="{ row }">
      <div class="name-cell">
        <AvatarInitials :name="row.name" :size="28" tone="primary" />
        <span class="name-text">{{ row.name }}</span>
      </div>
    </template>
    <template #cell-memberCode="{ row }"><MonoChip variant="primary">{{ row.memberCode }}</MonoChip></template>
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

<style scoped>
.name-cell { display: flex; align-items: center; gap: 10px; }
.name-text { font-weight: 500; color: var(--text); }
</style>