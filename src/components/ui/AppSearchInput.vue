<script setup>
import InputText from 'primevue/inputtext'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Search…' },
})

const emit = defineEmits(['update:modelValue'])

function clear() {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="search">
    <AppIcon name="search" :size="18" class="search-icon" />
    <InputText
      :model-value="modelValue"
      :placeholder="placeholder"
      class="search-input"
      @update:model-value="(v) => emit('update:modelValue', v)"
    />
    <button
      v-if="modelValue"
      type="button"
      class="search-clear"
      aria-label="Clear search"
      @click="clear"
    >
      <AppIcon name="close" :size="14" />
    </button>
  </div>
</template>

<style scoped>
.search {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding-left: 36px;
  padding-right: 34px;
}

.search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: none;
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}

.search-clear:hover {
  background: var(--surface-hover);
  color: var(--text);
}
</style>