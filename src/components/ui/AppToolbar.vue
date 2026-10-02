<script setup>
/**
 * Standard list-page toolbar: search on the left (grows), filters in the middle,
 * primary action on the right. Wraps on narrow viewports.
 */
</script>

<template>
  <div class="toolbar">
    <div class="toolbar-main">
      <slot name="search" />
      <slot name="filters" />
    </div>
    <div v-if="$slots.actions" class="toolbar-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.toolbar-main {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

@media (max-width: 640px) {
  .toolbar-actions {
    margin-left: 0;
    width: 100%;
  }
  .toolbar-actions > * {
    flex: 1;
  }
}
</style>