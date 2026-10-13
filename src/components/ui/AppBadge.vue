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
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge-success {
  background: var(--success-bg);
  color: var(--success);
}

.badge-warning {
  background: var(--warning-bg);
  color: var(--warning);
}

.badge-inactive {
  background: var(--surface-hover);
  color: var(--text-muted);
}

@media (max-width: 640px) {
  .badge {
    font-size: 10.5px;
    padding: 2px 8px;
  }
}
</style>