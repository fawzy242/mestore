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
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-1);
  padding: 18px 20px;
  min-width: 0;
}

.stat-label {
  font-size: 12.5px;
  color: var(--text-muted);
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  line-height: 1.15;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-sub {
  font-size: 12px;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sub-success {
  color: var(--success);
}

.sub-warning {
  color: var(--warning);
}

.sub-neutral {
  color: var(--text-muted);
}

@media (max-width: 640px) {
  .stat-card {
    padding: 14px 16px;
  }
  .stat-value {
    font-size: 22px;
  }
}
</style>