<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import IconPayments from '@/components/icons/IconPayments.vue'
import IconCreditCard from '@/components/icons/IconCreditCard.vue'
import IconQrCode from '@/components/icons/IconQrCode.vue'
import IconArrowBack from '@/components/icons/IconArrowBack.vue'
import IconTaskAlt from '@/components/icons/IconTaskAlt.vue'
import { usePosCartStore } from '@/stores/posCart.store.js'
import { useCheckout } from '../composables/useCheckout.js'
import { useToast } from '@/composables/useToast.js'
import { formatRupiah } from '@/composables/useFormatters.js'

const router = useRouter()
const cart = usePosCartStore()
const { push } = useToast()
const { method, tendered, isSubmitting, error, total, change, shortBy, canSubmit, submit } =
  useCheckout()

const methods = [
  { id: 'Cash', label: 'Cash', icon: IconPayments },
  { id: 'Card', label: 'Card', icon: IconCreditCard },
  { id: 'QRIS', label: 'QRIS', icon: IconQrCode },
]

function setTender(amount) {
  tendered.value = String(amount)
}

function exact() {
  tendered.value = String(total.value)
}

async function confirm() {
  if (!canSubmit.value) {
    push('Cash tendered is less than the total due')
    return
  }
  const result = await submit()
  if (result) {
    router.push({ name: 'pos.success' })
  }
}

function back() {
  router.push({ name: 'pos' })
}

onMounted(() => {
  if (cart.items.length === 0) {
    router.replace({ name: 'pos' })
  }
})
</script>

<template>
  <AppPageContainer max-width="560px">
    <AppCard padded>
      <div class="line">
        <span>Items</span>
        <span class="mono">{{ cart.itemCount }}</span>
      </div>
      <div class="line total">
        <span>Amount Due</span>
        <span class="mono">{{ formatRupiah(total) }}</span>
      </div>
    </AppCard>

    <div class="methods">
      <button
        v-for="m in methods"
        :key="m.id"
        type="button"
        class="method"
        :class="{ active: method === m.id }"
        @click="method = m.id"
      >
        <component :is="m.icon" class="method-icon" />
        <span>{{ m.label }}</span>
      </button>
    </div>

    <AppInput
      v-if="method === 'Cash'"
      v-model="tendered"
      label="Cash Tendered (Rp)"
      type="number"
      placeholder="0"
    />

    <div v-if="method === 'Cash'" class="denoms">
      <button type="button" class="denom" @click="exact">
        Exact ({{ formatRupiah(total) }})
      </button>
      <button type="button" class="denom" @click="setTender(30000)">30.000</button>
      <button type="button" class="denom" @click="setTender(50000)">50.000</button>
      <button type="button" class="denom" @click="setTender(100000)">100.000</button>
    </div>

    <div
      v-if="method === 'Cash'"
      class="change"
      :class="{ error: shortBy > 0 && tendered }"
    >
      <div class="lbl">{{ shortBy > 0 && tendered ? 'Short By' : 'Change Due' }}</div>
      <div class="val">
        {{ shortBy > 0 && tendered ? formatRupiah(shortBy) : formatRupiah(change) }}
      </div>
    </div>

    <div v-else class="noncash">
      <p>Ready to process with terminal simulation.</p>
    </div>

    <AppAlert v-if="error" variant="error" :message="error.message" />

    <div class="actions">
      <AppButton variant="secondary" @click="back">
        <IconArrowBack /> Back
      </AppButton>
      <AppButton
        variant="primary"
        :loading="isSubmitting"
        :disabled="!canSubmit"
        @click="confirm"
      >
        <IconTaskAlt /> Confirm Payment
      </AppButton>
    </div>
  </AppPageContainer>
</template>

<style scoped>
.line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13.5px;
  color: var(--color-ink-soft);
}

.line.total {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 0;
  padding-top: 8px;
  border-top: 1px solid var(--color-line);
}

.line.total .mono {
  color: var(--color-primary-container);
}

.methods {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.method {
  flex: 1;
  border: 1.5px solid var(--color-line);
  border-radius: var(--radius-lg);
  padding: 14px 10px;
  text-align: center;
  background: var(--color-surface);
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: border-color 120ms, background 120ms;
}

.method:hover {
  background: var(--color-surface-container-low);
}

.method.active {
  border-color: var(--color-primary-container);
  background: var(--color-primary-tint);
  color: var(--color-primary-container);
  font-weight: 600;
}

.method-icon {
  font-size: 20px;
}

.denoms {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.denom {
  font-size: 11.5px;
  font-family: 'JetBrains Mono', monospace;
  padding: 5px 10px;
  background: var(--color-surface-container);
  border-radius: var(--radius-s);
  color: var(--color-ink);
  font-weight: 500;
}

.denom:hover {
  background: var(--color-surface-container-high);
}

.change {
  background: var(--color-success-bg);
  border-radius: var(--radius-lg);
  padding: 16px;
  text-align: center;
  margin: 14px 0;
}

.change.error {
  background: var(--color-primary-tint);
}

.change .lbl {
  font-size: 12px;
  color: var(--color-ink-soft);
}

.change .val {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-success);
  font-family: 'JetBrains Mono', monospace;
}

.change.error .val {
  color: var(--color-danger);
}

.noncash {
  background: var(--color-surface-container);
  border-radius: var(--radius-lg);
  padding: 16px;
  text-align: center;
  color: var(--color-ink-soft);
  font-size: 13px;
  margin: 14px 0;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.actions > * {
  flex: 1;
  justify-content: center;
}
</style>