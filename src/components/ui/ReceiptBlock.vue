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
      <span class="mono amount">{{ formatRupiah(line.price * line.qty) }}</span>
    </div>

    <hr />

    <div class="rrow">
      <span>Subtotal</span>
      <span class="mono amount">{{ formatRupiah(receipt.subtotal ?? receipt.total) }}</span>
    </div>
    <div v-if="receipt.discount != null" class="rrow">
      <span>Discount</span>
      <span class="mono amount">− {{ formatRupiah(receipt.discount) }}</span>
    </div>
    <div class="rrow">
      <span>VAT / Tax Included (11%)</span>
      <span class="mono amount">—</span>
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
      <span class="mono amount">{{ formatRupiah(receipt.tendered) }}</span>
    </div>
    <div class="rrow">
      <span>Change</span>
      <span class="mono amount">
        {{ formatRupiah(receipt.change ?? receipt.tendered - receipt.total) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.receipt {
  text-align: left;
  background: var(--surface);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  padding: 18px;
  margin: 20px 0;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12.5px;
  min-width: 0;
  overflow: hidden;
}

.rhead {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rrow {
  display: flex;
  justify-content: space-between;
  padding: 3px 0;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text);
}

.amount {
  color: var(--text);
  flex-shrink: 0;
}

.rrow.total {
  font-weight: 700;
  padding-top: 10px;
  margin-top: 6px;
  border-top: 1px solid var(--border);
  align-items: center;
}

.total-col {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.total-label {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--text);
}

.settled {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
}

.total-value {
  color: var(--primary);
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

hr {
  border: none;
  border-top: 1px dashed var(--border);
  margin: 8px 0;
}

@media (max-width: 480px) {
  .receipt {
    padding: 14px;
    font-size: 12px;
    border-radius: var(--radius-md);
  }
  .total-value {
    font-size: 16px;
  }
  .total-label {
    font-size: 12px;
  }
  .settled {
    font-size: 10.5px;
  }
}
</style>