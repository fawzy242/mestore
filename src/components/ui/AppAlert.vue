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
  border-radius: var(--radius-s);
  font-size: 13px;
  border: 1px solid transparent;
  margin-bottom: 12px;
}

.alert-message {
  flex: 1;
}

.alert-retry {
  font-weight: 500;
  text-decoration: underline;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
}

.alert-error {
  background: var(--color-primary-tint);
  color: var(--color-primary);
}

.alert-warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.alert-success {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.alert-info {
  background: var(--color-primary-tint);
  color: var(--color-ink-soft);
}
</style>