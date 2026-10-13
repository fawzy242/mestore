<script setup>
defineProps({
  padded: { type: Boolean, default: true },
})
</script>

<template>
  <div class="card" :class="{ padded }">
    <header v-if="$slots.header" class="card-header">
      <slot name="header" />
    </header>
    <div class="card-body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-1);
  overflow: hidden;
}

.card.padded .card-body {
  padding: 20px;
}

.card.padded .card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.card.padded .card-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}

@media (max-width: 640px) {
  .card.padded .card-body {
    padding: 16px;
  }
  .card.padded .card-header {
    padding: 14px 16px;
  }
  .card.padded .card-footer {
    padding: 14px 16px;
  }
}
</style>