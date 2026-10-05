<script setup>
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

function confirm() {
  visible.value = false
  emit('confirm')
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    :style="{ width: '400px' }"
    :show-header="false"
  >
    <div class="body">
      <div class="icon-wrap">
        <AppIcon name="logout" :size="24" />
      </div>
      <h3 class="title">Logout?</h3>
      <p class="text">Are you sure you want to logout?</p>
    </div>

    <template #footer>
      <Button label="Cancel" text severity="secondary" @click="visible = false" />
      <Button
        label="Logout"
        icon="pi pi-sign-out"
        severity="danger"
        @click="confirm"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.body {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 8px 0;
}

.icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--danger-bg);
  color: var(--danger);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
}

.text {
  margin: 0;
  font-size: 13.5px;
  color: var(--text-muted);
}
</style>