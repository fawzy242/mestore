<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import AppIcon from '@/components/ui/AppIcon.vue'
import ReceiptBlock from '@/components/ui/ReceiptBlock.vue'
import { usePosCartStore } from '@/stores/posCart.store.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'new-sale'])

const router = useRouter()
const cart = usePosCartStore()

const receipt = ref(null)

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

watch(visible, (open) => {
  if (open) {
    receipt.value = cart.consumeLastCompleted()
    // If there is no receipt to show, silently close.
    if (!receipt.value) visible.value = false
  }
})

function close() {
  visible.value = false
}

function newSale() {
  visible.value = false
  emit('new-sale')
}

function printReceipt() {
  window.print()
}

function goTransactions() {
  visible.value = false
  router.push({ name: 'transactions.list' })
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
        <AppIcon name="receipt-long" :size="20" />
      </span>
      <h2 class="head-title">Payment complete</h2>
      <button type="button" class="head-close" aria-label="Close" @click="close">
        <AppIcon name="close" :size="14" />
      </button>
    </div>

    <div class="modal-body" v-if="receipt">
      <div class="success-mark">
        <AppIcon name="check" :size="32" />
      </div>
      <p class="sub">
        Receipt <span class="mono receipt-no">{{ receipt.receiptNo }}</span> saved to
        Transaction History. Stock has been updated.
      </p>

      <div class="print-receipt">
        <ReceiptBlock :receipt="receipt" />
      </div>

      <button type="button" class="secondary-link" @click="goTransactions">
        <AppIcon name="receipt-long" :size="16" />
        <span>View in Transactions</span>
      </button>
    </div>

    <div class="mestore-modal-foot">
      <Button
        label="Print Receipt"
        icon="pi pi-print"
        severity="secondary"
        outlined
        @click="printReceipt"
      />
      <Button
        label="New Sale"
        icon="pi pi-plus"
        @click="newSale"
      />
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
  background: var(--success-bg);
  color: var(--success);
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
  text-align: center;
}

.success-mark {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--success-bg);
  color: var(--success);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
}

.sub {
  color: var(--text-muted);
  font-size: 13px;
  margin: 0 0 8px;
  line-height: 1.5;
}

.receipt-no {
  color: var(--primary);
  font-weight: 600;
}

.secondary-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  background: transparent;
  border: none;
  padding: 6px 10px;
  color: var(--text-muted);
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
}
.secondary-link:hover {
  color: var(--primary);
}
</style>