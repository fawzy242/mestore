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
}

.field-label {
  display: block;
  font-size: 12.5px;
  color: var(--color-ink-soft);
  margin-bottom: 5px;
  font-weight: 500;
}

.field-input {
  width: 100%;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-s);
  padding: 10px 12px;
  font-size: 14px;
  background: var(--color-surface);
  color: var(--color-ink);
}

.field-input:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 0;
  border-color: var(--color-focus);
}

.field-error .field-input {
  border-color: var(--color-danger);
}

.field-error-msg {
  color: var(--color-danger);
  font-size: 12px;
  margin-top: 4px;
}
</style>