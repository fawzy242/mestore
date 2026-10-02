<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'primary' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
})

defineEmits(['click'])

const classes = computed(() => [
  'btn',
  `btn-${props.variant}`,
  { block: props.block, loading: props.loading },
])
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spinner" aria-hidden="true"></span>
    <slot />
  </button>
</template>

<style scoped>
.btn {
  border: none;
  border-radius: var(--radius-s);
  padding: 9px 18px;
  font-size: 13.5px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  line-height: 1.2;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn.block {
  width: 100%;
}

.btn-primary {
  background: var(--color-primary);
  color: #fff;
  box-shadow: var(--shadow-1);
}
.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
.btn-secondary:hover:not(:disabled) {
  background: var(--color-primary-tint);
}

.btn-text {
  background: transparent;
  color: var(--color-ink-soft);
}
.btn-text:hover:not(:disabled) {
  color: var(--color-ink);
}

.btn-danger {
  background: var(--color-danger);
  color: #fff;
}
.btn-danger:hover:not(:disabled) {
  background: #a51c1c;
}

.spinner {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-top-color: #fff;
  animation: spin 0.7s linear infinite;
}

.btn-secondary .spinner,
.btn-text .spinner {
  border-color: rgba(183, 28, 28, 0.3);
  border-top-color: var(--color-primary);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>