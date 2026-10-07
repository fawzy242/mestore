<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import AppDetailRow from '@/components/ui/AppDetailRow.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import ReceiptBlock from '@/components/ui/ReceiptBlock.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import * as transactionsService from '@/services/api/transactions.service.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  transactionId: { type: [String, Number], default: null },
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const transaction = ref(null)
const loading = ref(false)

async function load() {
  if (!props.transactionId) return
  loading.value = true
  try {
    const t = await transactionsService.getTransactionById(props.transactionId)
    transaction.value = {
      ...t,
      subtotal: t.total,
      discount: 0,
      change: t.tendered - t.total,
    }
  } finally {
    loading.value = false
  }
}

function print() {
  window.print()
}

function close() {
  visible.value = false
}

watch(
  () => [visible.value, props.transactionId],
  ([open]) => {
    if (open) load()
  },
)

onMounted(() => {
  if (visible.value) load()
})
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    :style="{ width: '560px' }"
    :show-header="false"
  >
    <div class="modal-head">
      <span class="head-icon">
        <AppIcon name="receipt-long" :size="20" />
      </span>
      <h2 class="head-title">Transaction Detail</h2>
      <button
        type="button"
        class="head-close"
        aria-label="Close"
        @click="close"
      >
        <AppIcon name="close" :size="14" />
      </button>
    </div>

    <div class="modal-body">
      <div v-if="loading" class="loading">
        <AppSpinner />
      </div>

      <div v-else-if="transaction" class="body">
        <div class="tx-head">
          <h3 class="tx-title">Receipt #{{ transaction.id }}</h3>
          <StatusPill variant="success">Completed</StatusPill>
        </div>

        <ReceiptBlock :receipt="transaction" />

        <div class="details">
          <AppDetailRow label="Payment">{{ transaction.method }}</AppDetailRow>
          <AppDetailRow label="Cashier">{{ transaction.cashier }}</AppDetailRow>
          <AppDetailRow label="Time">{{ transaction.time }}</AppDetailRow>
        </div>
      </div>
    </div>

    <div class="mestore-modal-foot">
      <Button label="Close" text severity="secondary" @click="close" />
      <Button label="Print Receipt" icon="pi pi-print" @click="print" />
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
}

.loading {
  padding: 40px;
  display: flex;
  justify-content: center;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.tx-head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.tx-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
}
.details {
  display: flex;
  flex-direction: column;
}
</style>