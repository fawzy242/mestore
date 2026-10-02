<script setup>
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppDetailRow from '@/components/ui/AppDetailRow.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import IconArrowBack from '@/components/icons/IconArrowBack.vue'
import IconPrint from '@/components/icons/IconPrint.vue'
import ReceiptBlock from '@/components/ui/ReceiptBlock.vue'
import { useTransactionDetail } from '../composables/useTransactionDetail.js'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id)
const { transaction, loading, error, fetchTransaction } = useTransactionDetail(id.value)

function goBack() {
  router.push({ name: 'transactions.list' })
}
function print() {
  window.print()
}

onMounted(fetchTransaction)
</script>

<template>
  <AppPageContainer max-width="560px">
    <AppCard padded>
      <AppAlert v-if="error" variant="error" :message="error.message" retry-label="Retry" @retry="fetchTransaction" />
      <AppSpinner v-else-if="loading" />
      <template v-else-if="transaction">
        <div class="tx-head">
          <div class="tx-title-row">
            <h2 class="tx-title">Receipt #{{ transaction.receiptNo || transaction.id }}</h2>
            <StatusPill variant="success">Completed</StatusPill>
          </div>
        </div>

        <ReceiptBlock :receipt="transaction" />

        <AppDetailRow label="Payment">{{ transaction.method }}</AppDetailRow>
        <AppDetailRow label="Cashier">{{ transaction.cashier }}</AppDetailRow>
        <AppDetailRow label="Time">{{ transaction.time }}</AppDetailRow>

        <div class="actions">
          <AppButton variant="secondary" @click="goBack">
            <IconArrowBack /> Back to Transactions
          </AppButton>
          <AppButton variant="primary" @click="print">
            <IconPrint /> Print Receipt
          </AppButton>
        </div>
      </template>
    </AppCard>
  </AppPageContainer>
</template>

<style scoped>
.tx-head {
  margin-bottom: 8px;
}

.tx-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tx-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}
.actions > * {
  flex: 1;
  justify-content: center;
}
</style>