<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  sub: { type: String, default: '' },
  tone: { type: String, default: 'primary' }, // primary | success | warning | neutral
  icon: { type: String, default: '' },
})
</script>

<template>
  <div class="stat-card">
    <div class="stat-row">
      <span class="stat-label">{{ label }}</span>
      <span v-if="icon" class="stat-icon" :class="`tone-${tone}`">
        <AppIcon :name="icon" :size="18" />
      </span>
    </div>
    <div class="stat-value mono">{{ value }}</div>
    <div v-if="sub" class="stat-sub">{{ sub }}</div>
  </div>
</template>

<style scoped>
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.stat-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}
.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.tone-primary {
  background: var(--primary-tint);
  color: var(--primary);
}
.tone-success {
  background: var(--success-bg);
  color: var(--success);
}
.tone-warning {
  background: var(--warning-bg);
  color: var(--warning);
}
.tone-neutral {
  background: var(--surface-hover);
  color: var(--text-muted);
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.15;
}
.stat-sub {
  font-size: 12px;
  color: var(--text-muted);
}
</style>