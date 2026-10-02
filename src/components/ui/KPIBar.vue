<script setup>
defineProps({
  columns: { type: Number, default: 4 },
})
</script>

<template>
  <div class="kpi-bar" :style="`--cols: ${columns}`">
    <slot />
  </div>
</template>

<style scoped>
.kpi-bar {
  display: grid;
  grid-template-columns: repeat(var(--cols), 1fr);
  gap: 12px;
  margin-bottom: 18px;
}

@media (max-width: 900px) {
  .kpi-bar {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .kpi-bar {
    grid-template-columns: 1fr;
  }
}
</style>