<script setup>
import AppPageContainer from '@/components/ui/AppPageContainer.vue'

defineProps({
  title: { type: String, required: true },
  phase: { type: String, required: true },
})
</script>

<template>
  <AppPageContainer>
    <h2 class="placeholder-title">{{ title }}</h2>
    <p class="placeholder-sub">Implemented in {{ phase }}.</p>
  </AppPageContainer>
</template>

<style scoped>
.placeholder-title {
  margin: 0 0 6px;
  font-size: 20px;
  font-weight: 500;
}
.placeholder-sub {
  color: var(--color-ink-soft);
  font-size: 13.5px;
  margin: 0;
}
</style>