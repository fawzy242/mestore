<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import AppCard from '@/components/ui/AppCard.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { usePosCartStore } from '@/stores/posCart.store.js'
import { useCheckout } from '../composables/useCheckout.js'
import { useToast } from '@/composables/useToast.js'
import { formatRupiah } from '@/composables/useFormatters.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'success', 'back'])

const cart = usePosCartStore()
const { push } = useToast()
const {
  method,
  tendered,
  isSubmitting,
  error,
  total,
  change,
  shortBy,
  canSubmit,
  submit,
} = useCheckout()

const methods = [
  { id: 'Cash', label: 'Cash', icon: 'payments' },
  { id: 'Card', label: 'Card', icon: 'credit-card' },
  { id: 'QRIS', label: 'QRIS', icon: 'qr-code-2' },
]

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const tenderedValue = ref(null)

function setTender(amount) {
  tenderedValue.value = amount
  tendered.value = String(amount)
}

function exact() {
  setTender(total.value)
}

function close() {
  visible.value = false
}

async function confirm() {
  if (!canSubmit.value) {
    push('Cash tendered is less than the total due', { severity: 'warn' })
    return
  }
  const result = await submit()
  if (result) {
    visible.value = false
    emit('success', result)
  }
}

function back() {
  visible.value = false
  emit('back')
}

// Reset local tender input whenever the modal opens so a previous session
// doesn't leak into a new one.
watch(visible, (open) => {
  if (open) {
    tenderedValue.value = null
    tendered.value = null
    if (cart.items.length === 0) {
      visible.value = false
    }
  }
})

onMounted(() => {
  if (visible.value && cart.items.length === 0) {
    visible.value = false
  }
})
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    :dismissable-mask="false"
    :style="{ width: '520px' }"
    :show-header="false"
  >
    <div class="modal-head">
      <span class="head-icon">
        <AppIcon name="payments" :size="20" />
      </span>
      <h2 class="head-title">Payment</h2>
      <button type="button" class="head-close" aria-label="Close" @click="close">
        <AppIcon name="close" :size="14" />
      </button>
    </div>

    <div class="modal-body">
      <AppCard padded class="due-card">
        <div class="line">
          <span>Items</span>
          <span class="mono">{{ cart.itemCount }}</span>
        </div>
        <div class="line total">
          <span>Amount Due</span>
          <span class="mono total-value">{{ formatRupiah(total) }}</span>
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
          <AppIcon :name="m.icon" :size="22" />
          <span>{{ m.label }}</span>
        </button>
      </div>

      <template v-if="method === 'Cash'">
        <div class="field">
          <label>Cash Tendered (Rp)</label>
          <InputNumber
            v-model="tenderedValue"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            :min="0"
            :show-buttons="false"
            placeholder="0"
            class="tender-input"
            @update:model-value="(v) => (tendered = String(v || 0))"
          />
        </div>

        <div class="denoms">
          <button type="button" class="denom" @click="exact">
            Exact ({{ formatRupiah(total) }})
          </button>
          <button type="button" class="denom" @click="setTender(30000)">30.000</button>
          <button type="button" class="denom" @click="setTender(50000)">50.000</button>
          <button type="button" class="denom" @click="setTender(100000)">100.000</button>
        </div>

        <div class="change" :class="{ error: shortBy > 0 && tenderedValue }">
          <div class="change-label">
            {{ shortBy > 0 && tenderedValue ? 'Short By' : 'Change Due' }}
          </div>
          <div class="change-value mono">
            {{ shortBy > 0 && tenderedValue ? formatRupiah(shortBy) : formatRupiah(change) }}
          </div>
        </div>
      </template>

      <div v-else class="noncash">
        <AppIcon name="terminal" :size="20" />
        <p>Ready to process with terminal simulation.</p>
      </div>

      <AppAlert v-if="error" variant="error" :message="error.message" />
    </div>

    <div class="mestore-modal-foot split">
      <Button
        label="Back"
        icon="pi pi-arrow-left"
        severity="secondary"
        text
        @click="back"
      />
      <Button
        label="Confirm Payment"
        icon="pi pi-check"
        :loading="isSubmitting"
        :disabled="!canSubmit"
        @click="confirm"
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
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.due-card {
  padding: 14px 16px;
}
.line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13.5px;
  color: var(--text-muted);
}
.line.total {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}
.total-value {
  color: var(--primary);
  font-size: 22px;
}

.methods {
  display: flex;
  gap: 10px;
}
.method {
  flex: 1;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px 12px;
  text-align: center;
  background: var(--surface);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 120ms;
  cursor: pointer;
}
.method:hover {
  background: var(--surface-hover);
  color: var(--text);
}
.method.active {
  border-color: var(--primary);
  background: var(--primary-tint);
  color: var(--primary);
  font-weight: 600;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field label {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-muted);
}

.tender-input {
  width: 100%;
}
.tender-input :deep(input) {
  width: 100%;
  height: 44px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  font-weight: 600;
}

.denoms {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.denom {
  flex: 1;
  min-width: 100px;
  padding: 10px 12px;
  background: var(--surface-hover);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: 12.5px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  color: var(--text);
  transition: all 120ms;
  cursor: pointer;
}
.denom:hover {
  background: var(--primary-tint);
  color: var(--primary);
}

.change {
  background: var(--success-bg);
  border-radius: var(--radius-lg);
  padding: 16px;
  text-align: center;
  transition: background 120ms;
}
.change.error {
  background: var(--danger-bg);
}
.change-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}
.change-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--success);
  margin-top: 2px;
}
.change.error .change-value {
  color: var(--danger);
}

.noncash {
  background: var(--surface-hover);
  border-radius: var(--radius-lg);
  padding: 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
</style>