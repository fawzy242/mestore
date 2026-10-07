<script setup>
import Button from 'primevue/button'
import AppTable from '@/components/ui/AppTable.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'
import MonoChip from '@/components/ui/MonoChip.vue'

defineProps({
  rows: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  error: { type: Object, default: null },
  pagination: { type: Object, default: null },
  sortKey: { type: String, default: '' },
  sortDir: { type: String, default: 'asc' },
  selectable: { type: Boolean, default: false },
  selectedKeys: { type: Array, default: () => [] },
})

const emit = defineEmits([
  'view',
  'edit',
  'delete',
  'page-change',
  'sort-change',
  'retry',
  'update:selectedKeys',
])

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'username', label: 'Username', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
]

const roleDots = {
  admin: 'var(--primary)',
  manager: 'var(--warning)',
  cashier: 'var(--text-muted)',
}

function roleLabel(v) {
  return v.charAt(0).toUpperCase() + v.slice(1)
}
</script>

<template>
  <AppTable
    :columns="columns"
    :rows="rows"
    :loading="loading"
    :error="error"
    :pagination="pagination"
    :sort-key="sortKey"
    :sort-dir="sortDir"
    :selectable="selectable"
    :selected-keys="selectedKeys"
    empty-message="No users found."
    @update:selected-keys="(v) => emit('update:selectedKeys', v)"
    @row-click="(row) => emit('view', row)"
    @page-change="(p) => emit('page-change', p)"
    @sort-change="(k) => emit('sort-change', k)"
    @retry="emit('retry')"
  >
    <template #cell-name="{ row }">
      <div class="name-cell">
        <AvatarInitials :name="row.name" :size="32" tone="primary" />
        <span class="name-text">{{ row.name }}</span>
      </div>
    </template>

    <template #cell-username="{ row }">
      <MonoChip variant="neutral">@{{ row.username }}</MonoChip>
    </template>

    <template #cell-role="{ row }">
      <span class="role-cell">
        <span class="role-dot" :style="{ background: roleDots[row.role] }"></span>
        {{ roleLabel(row.role) }}
      </span>
    </template>

    <template #cell-status="{ row }">
      <StatusPill :variant="row.IsActive === 1 ? 'success' : 'neutral'">
        {{ row.IsActive === 1 ? 'Active' : 'Inactive' }}
      </StatusPill>
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
.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.name-text {
  font-weight: 500;
  color: var(--text);
}
.role-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: var(--text);
}
.role-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
</style>