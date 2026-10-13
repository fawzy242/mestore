<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <header class="page-header">
    <div class="page-header-text">
      <h2 class="page-title">{{ title }}</h2>
      <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="page-header-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.page-header-text {
  min-width: 0;
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 17px;
  font-weight: 500;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-subtitle {
  margin: 2px 0 0;
  font-size: 12.5px;
  color: var(--text-muted);
}

.page-header-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .page-header {
    gap: 10px;
  }
  .page-header-actions {
    width: 100%;
  }
  .page-header-actions > * {
    flex: 1;
  }
}
</style>