<script setup>
import AppTable from '@/components/ui/AppTable.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'
import MonoChip from '@/components/ui/MonoChip.vue'
import AppIconButton from '@/components/ui/AppIconButton.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import IconBlock from '@/components/icons/IconBlock.vue'
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue'

const props = defineProps({
  rows: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  error: { type: Object, default: null },
  pagination: { type: Object, default: null },
  sortKey: { type: String, default: '' },
  sortDir: { type: String, default: 'asc' },
})

const emit = defineEmits(['view', 'edit', 'deactivate', 'reactivate', 'page-change', 'sort-change', 'retry'])

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'username', label: 'Username', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
]

const roleDots = {
  admin: 'var(--color-primary-container)',
  manager: 'var(--color-tertiary)',
  cashier: 'var(--color-secondary)',
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
    clickable-rows
    empty-message="No users found."
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
      <StatusPill :variant="row.status === 'Active' ? 'success' : 'neutral'">
        {{ row.status }}
      </StatusPill>
    </template>

    <template #row-actions="{ row }">
      <AppIconButton title="Edit" @click="emit('edit', row)">
        <IconEdit />
      </AppIconButton>
      <AppIconButton
        v-if="row.status === 'Active'"
        title="Deactivate"
        variant="danger"
        @click="emit('deactivate', row)"
      >
        <IconBlock />
      </AppIconButton>
      <AppIconButton
        v-else
        title="Reactivate"
        @click="emit('reactivate', row)"
      >
        <IconCheckCircle />
      </AppIconButton>
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
  color: var(--color-ink);
}

.role-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.role-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
</style>