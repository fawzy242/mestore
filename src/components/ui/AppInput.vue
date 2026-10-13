<script setup>
import { computed } from 'vue'
import { useUniqueId } from '@/composables/useUniqueId.js'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

defineEmits(['update:modelValue', 'blur'])

const uid = useUniqueId('input')
const inputId = computed(() => `input-${uid}`)
const errorId = computed(() => `input-error-${uid}`)
const hasError = computed(() => Boolean(props.error))
</script>

<template>
  <div class="field" :class="{ 'field-error': hasError }">
    <label v-if="label" :for="inputId" class="field-label">{{ label }}</label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-describedby="hasError ? errorId : undefined"
      :aria-invalid="hasError ? 'true' : undefined"
      class="field-input"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur', $event)"
    />
    <div v-if="hasError" :id="errorId" class="field-error-msg">{{ error }}</div>
  </div>
</template>

<style scoped>
.field {
  margin-bottom: 16px;
  min-width: 0;
}

.field-label {
  display: block;
  font-size: 12.5px;
  color: var(--text-muted);
  margin-bottom: 5px;
  font-weight: 500;
}

.field-input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  font-size: 14px;
  background: var(--surface);
  color: var(--text);
  transition: border-color 120ms ease, box-shadow 120ms ease;
}

.field-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-ring);
}

.field-error .field-input {
  border-color: var(--danger);
}

.field-error-msg {
  color: var(--danger);
  font-size: 12px;
  margin-top: 4px;
}

@media (max-width: 640px) {
  .field-input {
    font-size: 13.5px;
    padding: 10px;
  }
}
</style>