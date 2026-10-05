<script setup>
import { computed, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useShift } from '../composables/useShift.js'
import { useAuthStore } from '@/stores/auth.store.js'
import { useToast } from '@/composables/useToast.js'
import { formatRupiah } from '@/composables/useFormatters.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const shift = useShift()
const auth = useAuthStore()
const { push } = useToast()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const isOpen = computed(() => shift.hasOpenShift.value)

const startingCash = ref(shift.startingCash.value || 300000)
const countedCash = ref(null)

const quickAmounts = [
  { value: 200000, label: '200K' },
  { value: 300000, label: '300K' },
  { value: 500000, label: '500K' },
]

const counted = computed(() => Number(countedCash.value) || 0)
const variance = computed(() => counted.value - shift.expected.value)

const shiftStartedAt = computed(() =>
  new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }),
)

function setAmount(v) {
  startingCash.value = v
}

function openShift() {
  if (!startingCash.value || startingCash.value <= 0) {
    push('Enter a starting cash amount', { severity: 'warn' })
    return
  }
  shift.openShift(startingCash.value)
  push(`Shift started · ${formatRupiah(startingCash.value)} in drawer`)
  visible.value = false
}

function closeShift() {
  shift.closeShift()
  push('Shift closed')
  visible.value = false
}

// Reset inputs when modal opens
watch(visible, (open) => {
  if (!open) return
  if (isOpen.value) {
    countedCash.value = null
  } else {
    startingCash.value = shift.startingCash.value || 300000
  }
})
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    :style="{ width: '520px' }"
    :header="isOpen ? 'Shift Information' : 'Open Shift'"
  >
    <!-- Shift is OPEN — show info + close action -->
    <div v-if="isOpen" class="body">
      <div class="info-card">
        <div class="info-col">
          <span class="info-label">Cashier</span>
          <span class="info-value">{{ auth.user?.name || 'Cashier' }}</span>
        </div>
        <div class="info-col info-col-right">
          <span class="info-label">Shift Started</span>
          <span class="info-value mono">{{ shiftStartedAt }}</span>
        </div>
      </div>

      <div class="summary">
        <div class="row">
          <span class="lbl">Starting Cash</span>
          <span class="mono">{{ formatRupiah(shift.startingCash.value) }}</span>
        </div>
        <div class="row">
          <span class="lbl">Sales This Shift</span>
          <span class="mono">{{ formatRupiah(shift.salesTotal.value) }}</span>
        </div>
        <div class="row total-row">
          <span class="lbl">Expected in Drawer</span>
          <span class="mono total-value">{{ formatRupiah(shift.expected.value) }}</span>
        </div>
      </div>

      <div class="field">
        <label>Counted Cash (Rp)</label>
        <InputNumber
          v-model="countedCash"
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

      <div v-if="countedCash" class="variance-box" :class="variance < 0 ? 'neg' : 'pos'">
        <span class="variance-label">Variance</span>
        <span class="variance-value mono">
          {{ variance < 0 ? '− ' : variance > 0 ? '+ ' : '' }}{{ formatRupiah(Math.abs(variance)) }}
        </span>
      </div>
    </div>

    <!-- Shift is CLOSED — open a new shift -->
    <div v-else class="body">
      <Message severity="info" :closable="false" class="mb">
        Open a shift to begin accepting sales. Enter the starting cash in your drawer.
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
    </div>

    <template #footer>
      <Button label="Cancel" text severity="secondary" @click="visible = false" />
      <Button
        v-if="isOpen"
        label="Close Shift"
        icon="pi pi-power-off"
        severity="danger"
        :disabled="countedCash === null"
        @click="closeShift"
      />
      <Button
        v-else
        label="Open Shift"
        icon="pi pi-check"
        @click="openShift"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.info-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-col-right {
  align-items: flex-end;
}

.info-label {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--text-muted);
}

.info-value {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text);
}

.summary {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px;
  background: var(--surface-alt);
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
}

.lbl {
  color: var(--text-muted);
}

.total-row {
  border-top: 1px solid var(--border);
  margin-top: 4px;
  padding-top: 10px;
}

.total-value {
  color: var(--primary);
  font-weight: 700;
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

.variance-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--surface-hover);
}

.variance-box.neg {
  background: var(--danger-bg);
  color: var(--danger);
}

.variance-box.pos {
  background: var(--warning-bg);
  color: var(--warning);
}

.variance-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.variance-value {
  font-size: 15px;
  font-weight: 700;
}

.mb {
  margin-bottom: 4px;
}
</style>