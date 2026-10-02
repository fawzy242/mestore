<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  unit: { type: String, default: '' },
  icon: { type: String, default: '' },
  tone: { type: String, default: 'neutral' },
})

const valueTone = computed(() => `value-${props.tone}`)
const iconTone = computed(() => `icon-${props.tone}`)
</script>

<template>
  <div class="kpi">
    <div class="kpi-text">
      <span class="kpi-label">{{ label }}</span>
      <span class="kpi-value" :class="valueTone">
        {{ value }}
        <span v-if="unit" class="unit">{{ unit }}</span>
      </span>
    </div>
    <div v-if="icon" class="kpi-icon" :class="iconTone">
      <slot name="icon">
        <span class="letter">{{ String(icon).charAt(0).toUpperCase() }}</span>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.kpi {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: background-color 150ms ease, border-color 150ms ease;
}

.kpi-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.kpi-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kpi-value {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.15;
  color: var(--text);
}

.kpi-value .unit {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-muted);
  margin-left: 2px;
}

.value-primary {
  color: var(--primary);
}
.value-success {
  color: var(--success);
}
.value-warning {
  color: var(--warning);
}
.value-danger {
  color: var(--danger);
}

.kpi-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}

.icon-neutral {
  background: var(--surface-hover);
  color: var(--text-muted);
}
.icon-primary {
  background: var(--primary-tint);
  color: var(--primary);
}
.icon-success {
  background: var(--success-bg);
  color: var(--success);
}
.icon-warning {
  background: var(--warning-bg);
  color: var(--warning);
}

.letter {
  font-weight: 700;
  font-size: 14px;
}
</style>