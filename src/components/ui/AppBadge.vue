<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'success' }, // success | warning | inactive
})

const classes = computed(() => ['badge', `badge-${props.variant}`])
</script>

<template>
  <span :class="classes"><slot /></span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 500;
  line-height: 1.4;
}

.badge-success {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.badge-warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.badge-inactive {
  background: var(--color-line);
  color: var(--color-ink-soft);
}
</style>