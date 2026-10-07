<script setup>
defineProps({
  modelValue: { type: String, required: true },
  tabs: { type: Array, required: true }, // [{ value, label }]
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
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
</template>