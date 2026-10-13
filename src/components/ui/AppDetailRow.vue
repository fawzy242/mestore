<script setup>
defineProps({
  label: { type: String, required: true },
  mono: { type: Boolean, default: false },
})
</script>

<template>
  <div class="detail-row">
    <span class="detail-label">{{ label }}</span>
    <span class="detail-value" :class="{ mono }">
      <slot />
    </span>
  </div>
</template>

<style scoped>
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13.5px;
  min-width: 0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: var(--text-muted);
  flex-shrink: 0;
}

.detail-value {
  text-align: right;
  color: var(--text);
  min-width: 0;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.detail-value.mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 480px) {
  .detail-row {
    font-size: 13px;
    gap: 10px;
  }
  .detail-label {
    font-size: 12.5px;
  }
}
</style>