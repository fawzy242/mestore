<script setup>
defineProps({
  modelValue: { type: String, required: true },
  tabs: { type: Array, required: true }, // [{ id, label, routeName? }]
})

const emit = defineEmits(['update:modelValue', 'change'])
</script>

<template>
  <div class="tabs-wrap">
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
  </div>
</template>

<style scoped>
.tabs-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
}
.tabs-wrap::-webkit-scrollbar {
  display: none;
}

.tabs {
  display: flex;
  gap: 4px;
  min-width: max-content;
}

.tab-btn {
  background: none;
  border: none;
  padding: 10px 4px;
  margin-right: 20px;
  font-size: 13.5px;
  color: var(--text-muted);
  border-bottom: 2px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: color 120ms ease, border-color 120ms ease;
}

.tab-btn.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  font-weight: 500;
}

.tab-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-ring);
  border-radius: var(--radius-sm);
}

@media (max-width: 640px) {
  .tabs {
    gap: 0;
  }
  .tab-btn {
    margin-right: 16px;
    font-size: 13px;
  }
}
</style>