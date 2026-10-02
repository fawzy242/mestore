<script setup>
const props = defineProps({
  categories: { type: Array, required: true },
  modelValue: { type: String, default: 'All' },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="chips">
    <button
      v-for="cat in ['All', ...categories]"
      :key="cat"
      type="button"
      class="chip"
      :class="{ active: modelValue === cat }"
      @click="emit('update:modelValue', cat)"
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
  margin-bottom: 14px;
}

.chip {
  padding: 7px 14px;
  border-radius: 20px;
  border: 1px solid var(--color-line);
  background: var(--color-surface);
  font-size: 12.5px;
  color: var(--color-ink);
}

.chip.active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
</style>