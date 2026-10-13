<script setup>
defineProps({
  categories: { type: Array, required: true },
  modelValue: { type: String, default: 'All' },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="chips-wrap">
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
  </div>
</template>

<style scoped>
/* Horizontal scroll container — keeps chips usable on narrow viewports
 * without wrapping into multiple rows. */
.chips-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  margin-bottom: 16px;
}
.chips-wrap::-webkit-scrollbar {
  display: none;
}

.chips {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
  min-width: max-content;
  padding: 2px 0;
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
  white-space: nowrap;
  flex-shrink: 0;
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

@media (max-width: 640px) {
  .chips {
    gap: 6px;
  }
  .chip {
    padding: 7px 14px;
    font-size: 12px;
  }
}
</style>