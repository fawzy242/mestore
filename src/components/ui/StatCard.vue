<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  sub: { type: String, default: '' },
  subVariant: { type: String, default: 'success' }, // success | warning | neutral
})
</script>

<template>
  <div class="stat-card">
    <div class="stat-label">{{ label }}</div>
    <div class="stat-value">{{ value }}</div>
    <div v-if="sub" class="stat-sub" :class="`sub-${subVariant}`">{{ sub }}</div>
  </div>
</template>

<style scoped>
.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-m);
  box-shadow: var(--shadow-1);
  padding: 18px 20px;
}

.stat-label {
  font-size: 12.5px;
  color: var(--color-ink-soft);
  margin-bottom: 6px;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  font-family: 'Roboto Mono', ui-monospace, monospace;
  line-height: 1.15;
}

.stat-sub {
  font-size: 12px;
  margin-top: 4px;
}

.sub-success {
  color: var(--color-success);
}

.sub-warning {
  color: var(--color-warning);
}

.sub-neutral {
  color: var(--color-ink-soft);
}
</style>