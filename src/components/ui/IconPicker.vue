<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: 'category' },
  options: {
    type: Array,
    default: () => [
      { value: 'shopping_bag', label: 'Bag' },
      { value: 'kitchen', label: 'Kitchen' },
      { value: 'fastfood', label: 'Fast food' },
      { value: 'shelves', label: 'Shelves' },
      { value: 'local_offer', label: 'Tag' },
    ],
  },
})

defineEmits(['update:modelValue'])

const options = computed(() => props.options)
</script>

<template>
  <div class="icon-picker">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      class="picker-btn"
      :class="{ active: modelValue === opt.value }"
      :aria-label="opt.label"
      @click="$emit('update:modelValue', opt.value)"
    >
      <slot :name="opt.value">
        <span class="letter">{{ opt.value.charAt(0).toUpperCase() }}</span>
      </slot>
    </button>
  </div>
</template>

<style scoped>
.icon-picker {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}
.picker-btn {
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-surface-container);
  color: var(--color-ink-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 120ms;
}
.picker-btn:hover {
  background: var(--color-primary-tint);
  color: var(--color-primary-container);
}
.picker-btn.active {
  background: var(--color-primary-container);
  color: #fff;
}
.letter {
  font-weight: 700;
  font-size: 14px;
}
</style>