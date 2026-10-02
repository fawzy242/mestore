<script setup>
import IconSearch from '@/components/icons/IconSearch.vue'

defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Search…' },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="search">
    <span class="search-icon" aria-hidden="true">
      <IconSearch />
    </span>
    <input
      type="search"
      class="search-input"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
    />
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
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-ink-soft);
  display: inline-flex;
}

.search-input {
  width: 100%;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-s);
  padding: 9px 12px 9px 34px;
  font-size: 13.5px;
  background: var(--color-surface);
  color: var(--color-ink);
}

.search-input:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 0;
  border-color: var(--color-focus);
}

.search-input::-webkit-search-cancel-button {
  cursor: pointer;
}
</style>