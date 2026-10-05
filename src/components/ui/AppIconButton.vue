<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  icon: { type: String, required: true },
  title: { type: String, default: '' },
  variant: { type: String, default: 'neutral' }, // neutral | danger | success
  disabled: { type: Boolean, default: false },
  size: { type: [Number, String], default: 16 },
})

defineEmits(['click'])
</script>

<template>
  <button
    type="button"
    class="icon-btn"
    :class="`variant-${variant}`"
    :title="title"
    :aria-label="title"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <AppIcon :name="icon" :size="size" />
  </button>
</template>

<style scoped>
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--btn-h-sm);
  height: var(--btn-h-sm);
  border-radius: var(--radius-md);
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}

.icon-btn:hover:not(:disabled) {
  background: var(--surface-hover);
  color: var(--text);
}

.icon-btn.variant-danger:hover:not(:disabled) {
  background: var(--danger-bg);
  color: var(--danger);
}

.icon-btn.variant-success:hover:not(:disabled) {
  background: var(--success-bg);
  color: var(--success);
}

.icon-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-ring);
}

.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>