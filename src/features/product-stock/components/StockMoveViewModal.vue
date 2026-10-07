<script setup>
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import AppDetailRow from '@/components/ui/AppDetailRow.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  move: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])
const visible = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
function close() { visible.value = false }

const isApproved = computed(() => props.move?.Approved === 1)
</script>

<template>
  <Dialog v-model:visible="visible" modal :draggable="false" :style="{ width: '520px' }" :show-header="false">
    <div class="modal-head">
      <span class="head-icon"><AppIcon name="tune" :size="20" /></span>
      <h2 class="head-title">Stock Move Detail</h2>
      <button type="button" class="head-close" aria-label="Close" @click="close">
        <AppIcon name="close" :size="14" />
      </button>
    </div>
    <div v-if="move" class="modal-body">
      <div class="top-row">
        <span class="mono product-name">{{ move.productName }}</span>
        <StatusPill :variant="isApproved ? 'success' : 'warning'">
          {{ isApproved ? 'Approved' : 'Pending' }}
        </StatusPill>
      </div>
      <AppDetailRow label="SKU" mono>{{ move.sku }}</AppDetailRow>
      <AppDetailRow label="Type">{{ move.type }}</AppDetailRow>
      <AppDetailRow label="Quantity" mono>{{ move.quantity }}</AppDetailRow>
      <AppDetailRow label="Before" mono>{{ move.before }}</AppDetailRow>
      <AppDetailRow label="After" mono>{{ move.after }}</AppDetailRow>
      <AppDetailRow label="Reason">{{ move.reason }}</AppDetailRow>
      <AppDetailRow label="User">{{ move.user }}</AppDetailRow>
      <AppDetailRow label="Date">{{ move.date }}</AppDetailRow>
    </div>
    <div class="mestore-modal-foot">
      <Button label="Close" text severity="secondary" @click="close" />
    </div>
  </Dialog>
</template>

<style scoped>
.modal-head { display: flex; align-items: center; gap: 12px; padding: 18px 22px; border-bottom: 1px solid var(--border); }
.head-icon { width: 36px; height: 36px; border-radius: var(--radius-md); background: var(--primary-tint); color: var(--primary); display: inline-flex; align-items: center; justify-content: center; }
.head-title { flex: 1; margin: 0; font-size: 16px; font-weight: 600; color: var(--text); }
.head-close { width: 32px; height: 32px; border-radius: var(--radius-md); background: transparent; border: none; color: var(--text-muted); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
.head-close:hover { background: var(--surface-hover); color: var(--text); }
.modal-body { padding: 22px; }
.top-row { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; margin-bottom: 8px; border-bottom: 1px solid var(--border); }
.product-name { font-size: 14px; font-weight: 700; color: var(--text); }
</style>