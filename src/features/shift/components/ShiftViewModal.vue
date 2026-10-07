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
  shift: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])
const visible = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })

function close() {
  visible.value = false
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    :style="{ width: '520px' }"
    :show-header="false"
  >
    <div class="modal-head">
      <span class="head-icon">
        <AppIcon name="schedule" :size="20" />
      </span>
      <h2 class="head-title">Shift Detail</h2>
      <button type="button" class="head-close" aria-label="Close" @click="close">
        <AppIcon name="close" :size="14" />
      </button>
    </div>

    <div v-if="shift" class="modal-body">
      <div class="top-row">
        <span class="mono shift-id">{{ shift.id }}</span>
        <StatusPill :variant="shift.status === 'Open' ? 'success' : 'neutral'">
          {{ shift.status }}
        </StatusPill>
      </div>

      <AppDetailRow label="Cashier">{{ shift.cashier }}</AppDetailRow>
      <AppDetailRow label="Date">{{ shift.date }}</AppDetailRow>
      <AppDetailRow label="Opened At">{{ shift.openedAt || '—' }}</AppDetailRow>
      <AppDetailRow label="Closed At">{{ shift.closedAt || '—' }}</AppDetailRow>
      <AppDetailRow label="Opening Cash" mono>
        {{ formatRupiah(shift.openingCash) }}
      </AppDetailRow>
      <AppDetailRow label="Expected Cash" mono>
        {{ formatRupiah(shift.expectedCash) }}
      </AppDetailRow>
      <AppDetailRow label="Closing Cash" mono>
        {{ formatRupiah(shift.closingCash) }}
      </AppDetailRow>
      <AppDetailRow label="Variance" mono>
        {{ formatRupiah(shift.variance) }}
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
  flex-shrink: 0;
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
  transition: background 120ms ease, color 120ms ease;
}
.head-close:hover {
  background: var(--surface-hover);
  color: var(--text);
}
.modal-body {
  padding: 22px;
  display: flex;
  flex-direction: column;
}
.top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.shift-id {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}
</style>