<script setup>
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import AppDetailRow from '@/components/ui/AppDetailRow.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  customer: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'edit'])
const visible = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
function close() { visible.value = false }
function edit() {
  const id = props.customer?.id
  visible.value = false
  emit('edit', id)
}
const isActive = computed(() => props.customer?.IsActive === 1)
</script>

<template>
  <Dialog v-model:visible="visible" modal :draggable="false" :style="{ width: '540px' }" :show-header="false">
    <div class="modal-head">
      <span class="head-icon"><AppIcon name="group" :size="20" /></span>
      <h2 class="head-title">Customer Detail</h2>
      <button type="button" class="head-close" aria-label="Close" @click="close">
        <AppIcon name="close" :size="14" />
      </button>
    </div>
    <div class="modal-body" v-if="customer">
      <div class="top-row">
        <AvatarInitials :name="customer.name" :size="52" tone="primary" />
        <div class="top-text">
          <h3 class="name">{{ customer.name }}</h3>
          <span class="code mono">{{ customer.memberCode }}</span>
        </div>
        <StatusPill :variant="isActive ? 'success' : 'neutral'">
          {{ isActive ? 'Active' : 'Inactive' }}
        </StatusPill>
      </div>
      <AppDetailRow label="Phone">{{ customer.phone }}</AppDetailRow>
      <AppDetailRow label="Email">{{ customer.email || '—' }}</AppDetailRow>
      <AppDetailRow label="Address">{{ customer.address || '—' }}</AppDetailRow>
      <AppDetailRow label="Joined">{{ customer.joinedAt }}</AppDetailRow>
    </div>
    <div class="mestore-modal-foot">
      <Button label="Close" text severity="secondary" @click="close" />
      <Button label="Edit" icon="pi pi-pencil" @click="edit" />
    </div>
  </Dialog>
</template>

<style scoped>
.modal-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border);
}
.head-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--primary-tint);
  color: var(--primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.head-title {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}
.head-close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.head-close:hover {
  background: var(--surface-hover);
  color: var(--text);
}
.modal-body { padding: 22px; }
.top-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 16px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.top-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.name {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
}
.code {
  font-size: 12.5px;
  color: var(--text-muted);
}
</style>