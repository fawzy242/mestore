<script setup>
defineProps({
  variant: { type: String, default: 'neutral' }, // neutral | primary | success | warning
})
</script>

<template>
  <span class="mono-chip" :class="`variant-${variant}`">
    <slot />
  </span>
</template>

<style scoped>
.mono-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-s);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
}

.variant-neutral {
  background: var(--color-surface-container);
  color: var(--color-ink-soft);
}
.variant-primary {
  background: var(--color-primary-tint);
  color: var(--color-primary-container);
}
.variant-success {
  background: var(--color-success-bg);
  color: var(--color-success);
}
.variant-warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}
</style>