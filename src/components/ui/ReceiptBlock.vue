<script setup>
import { formatRupiah } from '@/composables/useFormatters.js'

defineProps({
  receipt: { type: Object, required: true },
})
</script>

<template>
  <div class="receipt">
    <div v-if="receipt.receiptNo || receipt.id" class="rhead">
      <span class="mono">{{ receipt.receiptNo || receipt.id }}</span>
    </div>

    <div v-for="(line, i) in receipt.items" :key="i" class="rrow">
      <span class="name">{{ line.name }} x{{ line.qty }}</span>
      <span class="mono">{{ formatRupiah(line.price * line.qty) }}</span>
    </div>

    <hr />

    <div class="rrow">
      <span>Subtotal</span>
      <span class="mono">{{ formatRupiah(receipt.subtotal ?? receipt.total) }}</span>
    </div>
    <div v-if="receipt.discount != null" class="rrow">
      <span>Discount</span>
      <span class="mono">− {{ formatRupiah(receipt.discount) }}</span>
    </div>
    <div class="rrow">
      <span>VAT / Tax Included (11%)</span>
      <span class="mono">—</span>
    </div>
    <div class="rrow total">
      <div class="total-col">
        <span class="total-label">Total Amount Due</span>
        <span class="settled">Settled immediately</span>
      </div>
      <span class="mono total-value">{{ formatRupiah(receipt.total) }}</span>
    </div>
    <div class="rrow">
      <span>Cash Tendered</span>
      <span class="mono">{{ formatRupiah(receipt.tendered) }}</span>
    </div>
    <div class="rrow">
      <span>Change</span>
      <span class="mono">
        {{ formatRupiah(receipt.change ?? receipt.tendered - receipt.total) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.receipt {
  text-align: left;
  background: var(--color-surface);
  border: 1px dashed var(--color-line);
  border-radius: var(--radius-lg);
  padding: 18px;
  margin: 20px 0;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12.5px;
}

.rhead {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
}

.rrow {
  display: flex;
  justify-content: space-between;
  padding: 3px 0;
  align-items: flex-start;
  gap: 12px;
}

.name {
  flex: 1;
}

.rrow.total {
  font-weight: 700;
  padding-top: 10px;
  margin-top: 6px;
  border-top: 1px solid var(--color-line);
  align-items: center;
}

.total-col {
  display: flex;
  flex-direction: column;
}

.total-label {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.settled {
  font-size: 11px;
  color: var(--color-ink-soft);
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
}

.total-value {
  color: var(--color-primary-container);
  font-size: 18px;
}

hr {
  border: none;
  border-top: 1px dashed var(--color-line);
  margin: 8px 0;
}
</style>