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
  refund: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])
const visible = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
function close() { visible.value = false }

const isApproved = computed(() => props.refund?.Approved === 1)
</script>

<template>
  <Dialog v-model:visible="visible" modal :draggable="false" :style="{ width: '580px' }" :show-header="false">
    <div class="modal-head">
      <span class="head-icon"><AppIcon name="assignment-return" :size="20" /></span>
      <h2 class="head-title">Refund Detail</h2>
      <button type="button" class="head-close" aria-label="Close" @click="close">
        <AppIcon name="close" :size="14" />
      </button>
    </div>
    <div class="modal-body" v-if="refund">
      <div class="top-row">
        <span class="mono ref">{{ refund.refNo }}</span>
        <StatusPill :variant="isApproved ? 'success' : 'warning'">
          {{ isApproved ? 'Approved' : 'Pending' }}
        </StatusPill>
      </div>
      <AppDetailRow label="Original Tx">{{ refund.originalTxId }}</AppDetailRow>
      <AppDetailRow label="Customer">{{ refund.customerName }}</AppDetailRow>
      <AppDetailRow label="Date">{{ refund.date }}</AppDetailRow>
      <AppDetailRow label="Reason">{{ refund.reason }}</AppDetailRow>

      <div class="items-block">
        <div class="items-title">Refunded Items</div>
        <div v-for="(it, i) in refund.items" :key="i" class="item-row">
          <span>{{ it.name }}</span>
          <span class="mono">{{ it.qty }} × {{ formatRupiah(it.price) }}</span>
          <span class="mono item-total">{{ formatRupiah(it.qty * it.price) }}</span>
        </div>
      </div>

      <div class="total-row">
        <span>Refund Amount</span>
        <span class="mono total-value">{{ formatRupiah(refund.amount) }}</span>
      </div>
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
.modal-body {
  padding: 22px;
}
.top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.ref {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
}
.items-block {
  margin-top: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  background: var(--surface-alt);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.items-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
  color: var(--text-muted);
}
.item-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 10px;
  font-size: 13px;
}
.item-total {
  text-align: right;
  font-weight: 600;
}
.total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  margin-top: 12px;
  border-radius: var(--radius-md);
  background: var(--surface-alt);
  border: 1px solid var(--border);
  font-size: 14px;
  font-weight: 600;
}
.total-value {
  color: var(--primary);
  font-size: 18px;
  font-weight: 700;
}
</style>