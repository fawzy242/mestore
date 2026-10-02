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
  margin: 0 auto;
}
</style>