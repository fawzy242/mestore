<script setup>
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import AppIcon from '@/components/ui/AppIcon.vue'
import { formatRupiah } from '@/composables/useFormatters.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  items: { type: Array, required: true },
  discount: { type: Number, default: 0 },
})

const emit = defineEmits([
  'update:modelValue',
  'increment',
  'decrement',
  'update:discount',
  'clear',
  'hold',
  'charge',
])

const subtotal = computed(() => props.items.reduce((sum, i) => sum + i.price * i.qty, 0))
const total = computed(() => Math.max(subtotal.value - props.discount, 0))
const itemCount = computed(() => props.items.reduce((sum, i) => sum + i.qty, 0))

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const discountProxy = computed({
  get: () => props.discount,
  set: (v) => emit('update:discount', Number(v) || 0),
})

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :modal="true"
    :draggable="false"
    :closable="false"
    :dismissable-mask="false"
    :style="{ width: '520px' }"
    class="cart-modal"
  >
    <template #header>
      <div class="modal-head">
        <div class="head-left">
          <span class="head-title">Current Sale</span>
          <span class="head-pill">{{ itemCount }} items</span>
        </div>
        <div class="head-actions">
          <button class="link-btn" type="button" @click="emit('clear')">CLEAR</button>
          <button class="icon-btn" type="button" title="Close" @click="close">
            <AppIcon name="close" :size="18" />
          </button>
        </div>
      </div>
    </template>

    <div class="items">
      <div v-for="item in items" :key="item.id" class="row">
        <div class="nm">
          <span class="nm-name">{{ item.name }}</span>
          <span class="nm-sub mono">{{ formatRupiah(item.price) }} × {{ item.qty }}</span>
        </div>

        <div class="qty-ctrl">
          <button type="button" class="qty-btn" @click="emit('decrement', item.id)">−</button>
          <span class="qty-value mono">{{ item.qty }}</span>
          <button type="button" class="qty-btn" @click="emit('increment', item.id)">+</button>
        </div>

        <div class="amt mono">{{ formatRupiah(item.price * item.qty) }}</div>
      </div>

      <div v-if="items.length === 0" class="empty">
        Cart is empty. Search or tap a product to add it.
      </div>
    </div>

    <div class="foot">
      <div class="coupon-row">
        <AppIcon name="sell" :size="16" class="coupon-icon" />
        <span class="coupon-label">Discount</span>
        <InputNumber
          v-model="discountProxy"
          mode="currency"
          currency="IDR"
          locale="id-ID"
          :min="0"
          :show-buttons="false"
          class="coupon-input"
          placeholder="0"
        />
      </div>

      <div class="totals">
        <div class="line">
          <span>Subtotal</span>
          <span class="mono">{{ formatRupiah(subtotal) }}</span>
        </div>
        <div class="line">
          <span>Discount</span>
          <span class="mono">− {{ formatRupiah(discount) }}</span>
        </div>
        <div class="line total">
          <span>Total</span>
          <span class="mono total-value">{{ formatRupiah(total) }}</span>
        </div>
      </div>

      <div class="actions">
        <button type="button" class="hold-btn" @click="emit('hold')">
          Hold / Cancel Sale
        </button>
        <Button
          :label="`Charge (${formatRupiah(total)})`"
          icon="pi pi-credit-card"
          :disabled="items.length === 0"
          class="charge-btn"
          @click="emit('charge')"
        />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
:deep(.cart-modal .p-dialog-content) {
  padding: 0;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.head-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.head-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.head-pill {
  font-size: 11px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  background: var(--primary-tint);
  color: var(--primary);
  padding: 3px 8px;
  border-radius: var(--radius-xs);
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.link-btn {
  font-size: 11.5px;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  font-weight: 600;
  background: transparent;
  border: none;
  padding: 6px 8px;
}
.link-btn:hover {
  color: var(--text);
}

.icon-btn {
  padding: 6px;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  background: transparent;
  border: none;
  display: inline-flex;
}
.icon-btn:hover {
  background: var(--surface-hover);
  color: var(--text);
}

.items {
  padding: 8px 24px;
  max-height: 44vh;
  overflow-y: auto;
}

.row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.row:last-child {
  border-bottom: none;
}

.nm {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.nm-name {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text);
}

.nm-sub {
  font-size: 11.5px;
  color: var(--text-muted);
}

.qty-ctrl {
  display: inline-flex;
  align-items: center;
  gap: 0;
  background: var(--surface-hover);
  border-radius: var(--radius-sm);
  padding: 2px;
  flex-shrink: 0;
}

.qty-btn {
  width: 26px;
  height: 26px;
  border-radius: var(--radius-xs);
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 15px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qty-btn:hover {
  background: var(--surface);
}

.qty-value {
  min-width: 26px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}

.amt {
  width: 92px;
  text-align: right;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text);
}

.empty {
  text-align: center;
  padding: 40px 0;
  color: var(--text-muted);
  font-size: 13px;
}

.foot {
  padding: 16px 24px 20px;
  border-top: 1px solid var(--border);
}

.coupon-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.coupon-icon {
  color: var(--text-muted);
}

.coupon-label {
  font-size: 12.5px;
  color: var(--text-muted);
  white-space: nowrap;
}

.coupon-input {
  flex: 1;
}

:deep(.coupon-input input) {
  width: 100%;
  height: 38px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}

.totals {
  background: var(--surface-alt);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  margin-bottom: 14px;
}

.line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 13px;
  color: var(--text-muted);
}

.line.total {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  margin-top: 6px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}

.total-value {
  color: var(--primary);
  font-size: 20px;
  font-weight: 700;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hold-btn {
  background: transparent;
  border: none;
  padding: 10px 4px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
}
.hold-btn:hover {
  color: var(--text);
}

.charge-btn {
  flex: 1;
  height: 44px;
  font-weight: 600;
  font-size: 14px;
}
</style>