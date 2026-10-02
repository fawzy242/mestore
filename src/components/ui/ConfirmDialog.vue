<script setup>
import AppModal from './AppModal.vue'
import AppButton from './AppButton.vue'

defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Are you sure?' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirm' },
  variant: { type: String, default: 'danger' }, // danger | primary
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm'])
</script>

<template>
  <AppModal
    :model-value="modelValue"
    :title="title"
    dismissible
    @update:model-value="(v) => emit('update:modelValue', v)"
  >
    <p class="confirm-message">{{ message }}</p>

    <template #footer>
      <AppButton variant="text" @click="emit('update:modelValue', false)">Cancel</AppButton>
      <AppButton
        :variant="variant"
        :loading="loading"
        @click="emit('confirm')"
      >
        {{ confirmLabel }}
      </AppButton>
    </template>
  </AppModal>
</template>

<style scoped>
.confirm-message {
  color: var(--color-ink-soft);
  font-size: 13.5px;
  margin: 0;
}
</style>