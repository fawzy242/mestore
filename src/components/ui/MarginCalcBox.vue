<script setup>
import { computed } from 'vue'
import { formatRupiah } from '@/composables/useFormatters.js'

const props = defineProps({
  price: { type: [String, Number], default: 0 },
  cost: { type: [String, Number], default: 0 },
})

const priceNum = computed(() => Number(props.price) || 0)
const costNum = computed(() => Number(props.cost) || 0)
const margin = computed(() => priceNum.value - costNum.value)
const marginPct = computed(() => {
  if (priceNum.value <= 0) return 0
  return (margin.value / priceNum.value) * 100
})
</script>

<template>
  <div class="margin-box">
    <span class="lbl">Gross Margin</span>
    <div class="values">
      <span class="amount">{{ formatRupiah(margin) }} / unit</span>
      <span class="pct">{{ marginPct.toFixed(1) }}%</span>
    </div>
  </div>
</template>

<style scoped>
.margin-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  background: var(--color-surface-container-low);
  border: 1px solid var(--color-line);
  font-size: 13px;
  grid-column: 1 / -1;
}
.lbl {
  color: var(--color-ink-soft);
  font-weight: 500;
}
.values {
  display: flex;
  align-items: center;
  gap: 12px;
}
.amount {
  font-family: 'JetBrains Mono', monospace;
  color: var(--color-ink);
  font-weight: 500;
}
.pct {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  background: var(--color-surface-container);
  padding: 2px 8px;
  border-radius: var(--radius-s);
  color: var(--color-primary-container);
}
</style>