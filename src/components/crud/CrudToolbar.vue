<script setup>
import Button from 'primevue/button'
import AppSearchInput from '@/components/ui/AppSearchInput.vue'

defineProps({
  search: { type: String, default: '' },
  searchPlaceholder: { type: String, default: 'Search…' },
  addLabel: { type: String, default: 'Add' },
  refreshing: { type: Boolean, default: false },
})

const emit = defineEmits(['update:search', 'refresh', 'add'])
</script>

<template>
  <div class="crud-toolbar">
    <div class="crud-toolbar-main">
      <AppSearchInput
        :model-value="search"
        :placeholder="searchPlaceholder"
        @update:model-value="(v) => emit('update:search', v)"
      />
      <slot name="filters" />
    </div>
    <div class="crud-toolbar-actions">
      <Button
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        aria-label="Refresh"
        :loading="refreshing"
        @click="emit('refresh')"
      />
      <Button
        :label="addLabel"
        icon="pi pi-plus"
        @click="emit('add')"
      />
    </div>
  </div>
</template>

<style scoped>
.crud-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.crud-toolbar-main {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}
.crud-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
@media (max-width: 640px) {
  .crud-toolbar-actions {
    margin-left: 0;
    width: 100%;
  }
  .crud-toolbar-actions > * {
    flex: 1;
  }
}
</style>