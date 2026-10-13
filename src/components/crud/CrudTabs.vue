<script setup>
defineProps({
  modelValue: { type: String, required: true },
  tabs: { type: Array, required: true }, // [{ value, label }]
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="mestore-tabs-wrap">
    <div class="mestore-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="mestore-tab"
        :class="{ active: modelValue === tab.value }"
        @click="emit('update:modelValue', tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Horizontal scroll container — keeps tabs from overflowing on mobile */
.mestore-tabs-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border);
}
.mestore-tabs-wrap::-webkit-scrollbar {
  display: none;
}

.mestore-tabs {
  display: flex;
  align-items: stretch;
  gap: 24px;
  background: transparent;
  border: none;
  padding: 0;
  min-width: max-content;
}

.mestore-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 2px;
  margin: 0;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: color 120ms ease, border-color 120ms ease;
}

.mestore-tab:hover {
  color: var(--text);
}

.mestore-tab.active {
  color: var(--primary);
  font-weight: 600;
  border-bottom-color: var(--primary);
  margin-bottom: -1px;
}

.mestore-tab:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-ring);
  border-radius: var(--radius-sm);
}

@media (max-width: 640px) {
  .mestore-tabs {
    gap: 18px;
  }
  .mestore-tab {
    font-size: 13px;
  }
}
</style>