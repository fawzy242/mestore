<script setup>
defineProps({
  modelValue: { type: String, required: true },
  tabs: { type: Array, required: true }, // [{ id, label, routeName? }]
})

const emit = defineEmits(['update:modelValue', 'change'])
</script>

<template>
  <div class="tabs" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      role="tab"
      class="tab-btn"
      :class="{ active: modelValue === tab.id }"
      :aria-selected="modelValue === tab.id"
      @click="
        () => {
          emit('update:modelValue', tab.id)
          emit('change', tab.id)
        }
      "
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--color-line);
}

.tab-btn {
  background: none;
  border: none;
  padding: 10px 4px;
  margin-right: 20px;
  font-size: 13.5px;
  color: var(--color-ink-soft);
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 500;
}
</style>