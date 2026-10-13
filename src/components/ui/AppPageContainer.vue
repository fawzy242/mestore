<script setup>
defineProps({
  maxWidth: { type: String, default: 'none' },
})
</script>

<template>
  <div class="page-container" :style="{ maxWidth }">
    <slot />
  </div>
</template>

<style scoped>
.page-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  min-width: 0;
}

@media (max-width: 640px) {
  .page-container {
    /* Force container to shrink on mobile; prevents child elements from
       widening the layout through min-width values. */
    max-width: 100vw;
  }
}
</style>