<script setup>
import Button from 'primevue/button'

defineProps({
  count: { type: Number, default: 0 },
  actions: { type: Array, required: true },
  // [{ key, label, icon, severity, outlined }]
})

const emit = defineEmits(['action', 'clear'])
</script>

<template>
  <Transition name="bulk-fade">
    <div v-if="count > 0" class="bulk-bar">
      <span class="bulk-count">{{ count }} selected</span>
      <div class="bulk-actions">
        <Button
          v-for="action in actions"
          :key="action.key"
          :label="action.label"
          :icon="action.icon"
          :severity="action.severity || 'secondary'"
          :outlined="action.outlined !== false"
          size="small"
          @click="emit('action', action.key)"
        />
      </div>
      <Button
        label="Clear"
        icon="pi pi-times"
        text
        severity="secondary"
        size="small"
        class="bulk-clear"
        @click="emit('clear')"
      />
    </div>
  </Transition>
</template>

<style scoped>
.bulk-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--primary-tint);
  border: 1px solid var(--primary);
  border-radius: var(--radius-md);
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.bulk-count {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  white-space: nowrap;
}
.bulk-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  flex-wrap: wrap;
}
.bulk-clear {
  flex-shrink: 0;
}
.bulk-fade-enter-active,
.bulk-fade-leave-active {
  transition: opacity 120ms ease, transform 120ms ease;
}
.bulk-fade-enter-from,
.bulk-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 640px) {
  .bulk-bar {
    gap: 8px;
  }
  .bulk-actions {
    width: 100%;
    margin-left: 0;
  }
  .bulk-actions > :deep(.p-button) {
    flex: 1;
    min-width: 0;
  }
}
</style>