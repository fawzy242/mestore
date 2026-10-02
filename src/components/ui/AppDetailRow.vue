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
  border-bottom: 1px solid var(--color-line);
  font-size: 13.5px;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: var(--color-ink-soft);
}

.detail-value {
  text-align: right;
  color: var(--color-ink);
}
</style>