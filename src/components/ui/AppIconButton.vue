<script setup>
defineProps({
  title: { type: String, default: '' },
  variant: { type: String, default: 'neutral' }, // neutral | danger
  disabled: { type: Boolean, default: false },
})

defineEmits(['click'])
</script>

<template>
  <button
    type="button"
    class="icon-btn"
    :class="{ danger: variant === 'danger' }"
    :title="title"
    :aria-label="title"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.icon-btn {
  background: transparent;
  border: none;
  padding: 6px;
  border-radius: 6px;
  color: var(--color-ink-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover:not(:disabled) {
  background: var(--color-primary-tint);
  color: var(--color-primary);
}

.icon-btn.danger:hover:not(:disabled) {
  color: var(--color-danger);
}

.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>