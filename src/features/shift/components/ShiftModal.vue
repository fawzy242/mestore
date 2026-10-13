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
    :show-header="false"
  >
    <div class="modal-head">
      <span class="head-icon" :class="{ open: isOpen }">
        <AppIcon name="schedule" :size="20" />
      </span>
      <h2 class="head-title">{{ isOpen ? 'Shift Information' : 'Open Shift' }}</h2>
      <button type="button" class="head-close" aria-label="Close" @click="visible = false">
        <AppIcon name="close" :size="14" />
      </button>
    </div>

    <!-- Shift is OPEN — info + close action -->
    <div v-if="isOpen" class="modal-body">
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
    <div v-else class="modal-body">
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

    <div class="mestore-modal-foot">
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
.head-icon.open {
  background: var(--success-bg);
  color: var(--success);
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
  flex-shrink: 0;
}
.head-close:hover {
  background: var(--surface-hover);
  color: var(--text);
}

.modal-body {
  padding: 22px;
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
  flex-wrap: wrap;
}
.info-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.info-col-right {
  align-items: flex-end;
  text-align: right;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  gap: 12px;
}
.lbl {
  color: var(--text-muted);
  flex-shrink: 0;
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
  min-width: 0;
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
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.denom {
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
  gap: 12px;
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

@media (max-width: 640px) {
  .modal-body {
    padding: 16px;
    gap: 14px;
  }
  .info-card {
    padding: 10px 12px;
    gap: 10px;
  }
  .info-col-right {
    align-items: flex-start;
    text-align: left;
  }
  .full :deep(input) {
    height: 42px;
    font-size: 14px;
  }
  .denoms {
    gap: 6px;
  }
  .denom {
    padding: 9px 8px;
    font-size: 12px;
  }
  .variance-value {
    font-size: 14px;
  }
}
</style>