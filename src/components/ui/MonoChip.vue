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
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.variant-neutral {
  background: var(--surface-hover);
  color: var(--text-muted);
}
.variant-primary {
  background: var(--primary-tint);
  color: var(--primary);
}
.variant-success {
  background: var(--success-bg);
  color: var(--success);
}
.variant-warning {
  background: var(--warning-bg);
  color: var(--warning);
}

@media (max-width: 640px) {
  .mono-chip {
    font-size: 11.5px;
    padding: 2px 6px;
  }
}
</style>