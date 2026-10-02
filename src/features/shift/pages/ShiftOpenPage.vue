<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useShift } from '../composables/useShift.js'
import { useAuthStore } from '@/stores/auth.store.js'
import { useToast } from '@/composables/useToast.js'
import { formatRupiah } from '@/composables/useFormatters.js'
import { COPY } from '@/constants/copy.js'

const router = useRouter()
const shift = useShift()
const auth = useAuthStore()
const { push } = useToast()

const startingCash = ref(shift.startingCash.value || 300000)
const isSubmitting = ref(false)

const shiftStartedAt = computed(() =>
  new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }),
)

const quickAmounts = [
  { value: 200000, label: '200K' },
  { value: 300000, label: '300K' },
  { value: 500000, label: '500K' },
]

function setAmount(v) {
  startingCash.value = v
}

function submit() {
  if (!startingCash.value || startingCash.value <= 0) {
    push('Enter a starting cash amount', { severity: 'warn' })
    return
  }
  isSubmitting.value = true
  shift.openShift(startingCash.value)
  push(`Shift started with ${formatRupiah(startingCash.value)} in drawer`)
  router.push({ name: 'dashboard' })
  isSubmitting.value = false
}
</script>

<template>
  <div>
    <h2 class="page-title">{{ COPY.shift.openTitle }}</h2>
    <p class="page-sub">{{ COPY.shift.openSubtitle }}</p>

    <div class="meta-card">
      <div class="meta-col">
        <span class="meta-icon-wrap">
          <AppIcon name="badge" :size="18" />
        </span>
        <div class="meta-text">
          <span class="meta-label">Cashier</span>
          <span class="meta-value">{{ auth.user?.name || 'Cashier' }}</span>
        </div>
      </div>
      <div class="meta-col meta-col-right">
        <span class="meta-label">Shift Started</span>
        <span class="meta-value mono">{{ shiftStartedAt }}</span>
      </div>
    </div>

    <div class="form">
      <label class="field-label">Starting Cash (Rp)</label>
      <InputNumber
        v-model="startingCash"
        mode="currency"
        currency="IDR"
        locale="id-ID"
        :min="0"
        :step="1000"
        :show-buttons="false"
        class="cash-input"
        placeholder="0"
      />

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
        :label="COPY.shift.openButton"
        icon="pi pi-arrow-right"
        icon-pos="right"
        :loading="isSubmitting"
        class="submit-btn"
        @click="submit"
      />
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
}

.page-sub {
  color: var(--text-muted);
  font-size: 13px;
  margin: 0 0 20px;
}

.meta-card {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.meta-col {
  display: flex;
  align-items: center;
  gap: 12px;
}

.meta-col-right {
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.meta-icon-wrap {
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

.meta-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-label {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--text-muted);
}

.meta-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.form {
  text-align: left;
}

.field-label {
  display: block;
  font-size: 12.5px;
  color: var(--text-muted);
  margin-bottom: 6px;
  font-weight: 500;
}

.cash-input {
  width: 100%;
  margin-bottom: 14px;
}

:deep(.cash-input input) {
  width: 100%;
  height: 44px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  font-weight: 600;
}

.denoms {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
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

.submit-btn {
  width: 100%;
  height: 46px;
  font-weight: 600;
}
</style>