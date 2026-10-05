<script setup>
defineProps({
  categories: { type: Array, required: true },
  modelValue: { type: String, default: 'All' },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="chips">
    <button
      v-for="cat in ['All', ...categories]"
      :key="cat"
      type="button"
      class="chip"
      :class="{ active: modelValue === cat }"
      @click="$emit('update:modelValue', cat)"
    >
      {{ cat }}
    </button>
  </div>
</template>

<style scoped>
.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.chip {
  padding: 8px 16px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-muted);
  transition: all 120ms;
  cursor: pointer;
}

.chip:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.chip.active {
  background: var(--primary);
  color: var(--primary-fg);
  border-color: var(--primary);
  font-weight: 600;
}
</style>