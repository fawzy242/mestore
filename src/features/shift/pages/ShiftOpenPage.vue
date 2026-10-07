<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useShift } from '../composables/useShift.js'
import { useAuthStore } from '@/stores/auth.store.js'
import { useToast } from '@/composables/useToast.js'
import { formatRupiah } from '@/composables/useFormatters.js'

const route = useRoute()
const router = useRouter()
const shift = useShift()
const auth = useAuthStore()
const { push } = useToast()

const startingCash = ref(300000)

const quickAmounts = [
  { value: 200000, label: '200K' },
  { value: 300000, label: '300K' },
  { value: 500000, label: '500K' },
]

const cashierName = computed(() => auth.user?.name || 'Cashier')

function setAmount(v) {
  startingCash.value = v
}

function redirectAfterOpen() {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.length) {
    router.replace(redirect)
  } else {
    router.replace({ name: 'pos' })
  }
}

function openShift() {
  if (!startingCash.value || startingCash.value <= 0) {
    push('Enter a starting cash amount', { severity: 'warn' })
    return
  }
  shift.openShift(startingCash.value)
  push(`Shift started · ${formatRupiah(startingCash.value)} in drawer`)
  redirectAfterOpen()
}

onMounted(() => {
  // If a shift is already open (e.g. user navigated here manually), bounce out.
  if (shift.hasOpenShift.value) redirectAfterOpen()
})
</script>

<template>
  <AppPageContainer max-width="520px">
    <AppCard padded>
      <div class="head">
        <span class="head-icon">
          <AppIcon name="schedule" :size="24" />
        </span>
        <div class="head-text">
          <h2 class="title">Open Your Shift</h2>
          <p class="sub">Enter the starting cash in your drawer to begin accepting sales.</p>
        </div>
      </div>

      <Message severity="info" :closable="false" class="mb">
        Signed in as <strong>{{ cashierName }}</strong>. A shift must be open before you
        can use the POS.
      </Message>

      <div class="field">
        <label>Starting Cash (Rp)</label>
        <InputNumber
          v-model="startingCash"
          mode="currency"
          currency="IDR"
          locale="id-ID"
          :min="0"
          :step="1000"
          :show-buttons="false"
          class="full"
          placeholder="0"
        />
      </div>

      <div class="denoms">
        <button
          v-for="amt in quickAmounts"
          :key="amt.value"
          type="button"
          class="denom"
          :class="{ active: startingCash === amt.value }"
          @click="setAmount(amt.value)"
        >
          {{ amt.label }}
        </button>
      </div>

      <Button
        label="Open Shift"
        icon="pi pi-check"
        class="open-btn"
        @click="openShift"
      />
    </AppCard>
  </AppPageContainer>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}
.head-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--primary-tint);
  color: var(--primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.head-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}
.sub {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}
.mb {
  margin-bottom: 18px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}
.field label {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-muted);
}
.full {
  width: 100%;
}
.full :deep(input) {
  width: 100%;
  height: 44px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  font-weight: 600;
}
.denoms {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
.denom {
  flex: 1;
  padding: 10px 12px;
  background: var(--surface-hover);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  transition: all 120ms;
}
.denom:hover {
  background: var(--primary-tint);
  color: var(--primary);
}
.denom.active {
  background: var(--primary-tint);
  color: var(--primary);
  border-color: var(--primary);
}
.open-btn {
  width: 100%;
  height: 46px;
  font-weight: 600;
}
</style>