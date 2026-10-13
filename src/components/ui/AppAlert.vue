<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'error' },
  message: { type: String, default: '' },
  retryLabel: { type: String, default: '' },
})

defineEmits(['retry'])

const classes = computed(() => ['alert', `alert-${props.variant}`])
</script>

<template>
  <div :class="classes" role="alert">
    <span class="alert-message">
      <slot>{{ message }}</slot>
    </span>
    <button
      v-if="retryLabel"
      type="button"
      class="alert-retry"
      @click="$emit('retry')"
    >
      {{ retryLabel }}
    </button>
  </div>
</template>

<style scoped>
.alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 13px;
  border: 1px solid transparent;
  margin-bottom: 12px;
  flex-wrap: wrap;
  min-width: 0;
}

.alert-message {
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.alert-retry {
  font-weight: 500;
  text-decoration: underline;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.alert-error {
  background: var(--danger-bg);
  color: var(--danger);
}

.alert-warning {
  background: var(--warning-bg);
  color: var(--warning);
}

.alert-success {
  background: var(--success-bg);
  color: var(--success);
}

.alert-info {
  background: var(--primary-tint);
  color: var(--text-muted);
}

@media (max-width: 640px) {
  .alert {
    font-size: 12.5px;
    padding: 9px 12px;
  }
}
</style>