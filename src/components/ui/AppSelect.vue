<script setup>
import { computed } from 'vue'
import Select from 'primevue/select'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const hasError = computed(() => Boolean(props.error))
</script>

<template>
  <div class="field" :class="{ 'has-error': hasError }">
    <label v-if="label" class="field-label">{{ label }}</label>
    <Select
      :model-value="modelValue"
      :options="options"
      option-label="label"
      option-value="value"
      :disabled="disabled"
      :class="{ 'p-invalid': hasError }"
      class="field-select"
      @update:model-value="(v) => emit('update:modelValue', v)"
    />
    <div v-if="hasError" class="field-error-msg">{{ error }}</div>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 160px;
}

.field-label {
  font-size: 12.5px;
  color: var(--text-muted);
  font-weight: 500;
}

.field-select {
  width: 100%;
}

.field-error-msg {
  color: var(--danger);
  font-size: 12px;
}
</style>