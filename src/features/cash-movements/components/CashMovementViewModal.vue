<script setup>
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import AppDetailRow from '@/components/ui/AppDetailRow.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { formatRupiah } from '@/composables/useFormatters.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  movement: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])
const visible = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
function close() { visible.value = false }

const isApproved = computed(() => props.movement?.Approved === 1)
</script>

<template>
  <Dialog v-model:visible="visible" modal :draggable="false" :style="{ width: '500px' }" :show-header="false">
    <div class="modal-head">
      <span class="head-icon"><AppIcon name="payments" :size="20" /></span>
      <h2 class="head-title">Cash Movement Detail</h2>
      <button type="button" class="head-close" aria-label="Close" @click="close">
        <AppIcon name="close" :size="14" />
      </button>
    </div>
    <div class="modal-body" v-if="movement">
      <div class="top-row">
        <StatusPill :variant="movement.type === 'in' ? 'success' : 'danger'">
          {{ movement.type === 'in' ? 'Cash In' : 'Cash Out' }}
        </StatusPill>
        <span class="mono amount" :class="movement.type === 'in' ? 'pos' : 'neg'">
          {{ movement.type === 'in' ? '+' : '−' }} {{ formatRupiah(movement.amount) }}
        </span>
      </div>
      <AppDetailRow label="Date">{{ movement.date }}</AppDetailRow>
      <AppDetailRow label="Reason">{{ movement.reason }}</AppDetailRow>
      <AppDetailRow label="Recorded By">{{ movement.user }}</AppDetailRow>
      <AppDetailRow label="Shift Ref">{{ movement.shiftRef || '—' }}</AppDetailRow>
      <AppDetailRow label="Approval">
        <StatusPill :variant="isApproved ? 'success' : 'warning'">
          {{ isApproved ? 'Approved' : 'Pending' }}
        </StatusPill>
      </AppDetailRow>
    </div>
    <div class="mestore-modal-foot">
      <Button label="Close" text severity="secondary" @click="close" />
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
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.amount {
  font-size: 18px;
  font-weight: 700;
}
.pos { color: var(--success); }
.neg { color: var(--danger); }
</style>