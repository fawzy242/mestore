<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppButton from '@/components/ui/AppButton.vue'
import IconCheck from '@/components/icons/IconCheck.vue'
import IconPrint from '@/components/icons/IconPrint.vue'
import IconTransactions from '@/components/icons/IconTransactions.vue'
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
  <AppPageContainer max-width="500px">
    <div v-if="receipt" class="wrap">
      <div class="icon"><IconCheck /></div>
      <h2 class="title">Payment complete</h2>
      <p class="sub">
        Receipt <span class="mono">{{ receipt.receiptNo }}</span> saved to Transaction History.
        Stock has been updated.
      </p>

      <ReceiptBlock :receipt="receipt" />

      <div class="actions">
        <AppButton variant="secondary" @click="printReceipt">
          <IconPrint /> Print Receipt
        </AppButton>
        <AppButton variant="primary" @click="newSale">
          New Sale
        </AppButton>
      </div>

      <div class="secondary-links">
        <button type="button" @click="goTransactions">
          <IconTransactions /> View in Transactions
        </button>
      </div>
    </div>
  </AppPageContainer>
</template>

<style scoped>
.wrap {
  text-align: center;
  margin: 40px auto;
}

.icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-success-bg);
  color: var(--color-success);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 600;
}

.sub {
  color: var(--color-ink-soft);
  font-size: 13.5px;
  margin: 0 0 12px;
}

.actions {
  display: flex;
  gap: 10px;
}

.actions > * {
  flex: 1;
  justify-content: center;
}

.secondary-links {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.secondary-links button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--color-ink-soft);
}

.secondary-links button:hover {
  color: var(--color-primary-container);
}
</style>