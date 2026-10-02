<script setup>
defineProps({
  variant: { type: String, default: 'neutral' },
})
</script>

<template>
  <span class="pill" :class="`pill-${variant}`">
    <slot />
  </span>
</template>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: var(--radius-xs);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  transition: background-color 150ms ease, color 150ms ease;
}
.pill-success {
  background: var(--success-bg);
  color: var(--success);
}
.pill-warning {
  background: var(--warning-bg);
  color: var(--warning);
}
.pill-neutral {
  background: var(--surface-hover);
  color: var(--text-muted);
}
.pill-danger {
  background: var(--danger-bg);
  color: var(--danger);
}
.pill-info {
  background: var(--info-bg);
  color: var(--info);
}
</style>