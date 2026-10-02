<script setup>
defineProps({
  size: { type: Number, default: 24 },
  label: { type: String, default: 'Loading…' },
})
</script>

<template>
  <div class="spinner-wrap" role="status" aria-live="polite">
    <span
      class="spinner"
      :style="{ width: size + 'px', height: size + 'px' }"
      aria-hidden="true"
    ></span>
    <span class="sr-only">{{ label }}</span>
  </div>
</template>

<style scoped>
.spinner-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
}

.spinner {
  display: inline-block;
  border-radius: 50%;
  border: 3px solid var(--color-line);
  border-top-color: var(--color-primary);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>