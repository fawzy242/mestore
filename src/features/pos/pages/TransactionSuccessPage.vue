<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ReceiptBlock from '@/components/ui/ReceiptBlock.vue'
import { usePosCartStore } from '@/stores/posCart.store.js'

const router = useRouter()
const cart = usePosCartStore()
const receipt = ref(null)

function newSale() {
  router.push({ name: 'pos' })
}

function goTransactions() {
  router.push({ name: 'transactions.list' })
}

function printReceipt() {
  window.print()
}

onMounted(() => {
  receipt.value = cart.consumeLastCompleted()
  if (!receipt.value) {
    router.replace({ name: 'pos' })
  }
})
</script>

<template>
  <AppPageContainer max-width="560px">
    <div v-if="receipt" class="wrap">
      <div class="icon">
        <AppIcon name="check" :size="32" />
      </div>
      <h2 class="title">Payment complete</h2>
      <p class="sub">
        Receipt <span class="mono receipt-no">{{ receipt.receiptNo }}</span> saved to
        Transaction History. Stock has been updated.
      </p>

      <ReceiptBlock :receipt="receipt" />

      <div class="actions">
        <Button
          label="Print Receipt"
          icon="pi pi-print"
          severity="secondary"
          outlined
          @click="printReceipt"
          class="action-btn"
        />
        <Button
          label="New Sale"
          icon="pi pi-plus"
          @click="newSale"
          class="action-btn"
        />
      </div>

      <button type="button" class="secondary-link" @click="goTransactions">
        <AppIcon name="receipt-long" :size="16" />
        <span>View in Transactions</span>
      </button>
    </div>
  </AppPageContainer>
</template>

<style scoped>
.wrap {
  text-align: center;
  margin: 40px auto;
}

.icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--success-bg);
  color: var(--success);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;
}

.title {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
}

.sub {
  color: var(--text-muted);
  font-size: 13.5px;
  margin: 0 0 14px;
  line-height: 1.5;
}

.receipt-no {
  color: var(--primary);
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  height: 46px;
  font-weight: 600;
}

.secondary-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 20px;
  background: transparent;
  border: none;
  padding: 6px 10px;
  color: var(--text-muted);
  font-size: 12.5px;
  font-weight: 500;
}

.secondary-link:hover {
  color: var(--primary);
}
</style>