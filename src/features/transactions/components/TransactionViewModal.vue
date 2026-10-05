<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import AppDetailRow from '@/components/ui/AppDetailRow.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import ReceiptBlock from '@/components/ui/ReceiptBlock.vue'
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
    header="Transaction Detail"
  >
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

    <template #footer>
      <Button label="Close" text severity="secondary" @click="visible = false" />
      <Button label="Print Receipt" icon="pi pi-print" @click="print" />
    </template>
  </Dialog>
</template>

<style scoped>
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