<script setup>
import { computed } from 'vue'
import { formatRupiah } from '@/composables/useFormatters.js'

const props = defineProps({
  categories: { type: Array, required: true },
})

const total = computed(() =>
  props.categories.reduce((s, c) => s + c.revenue, 0),
)
</script>

<template>
  <div class="breakdown">
    <div class="stack">
      <div
        v-for="c in categories"
        :key="c.name"
        class="stack-seg"
        :style="{ width: c.pct + '%', background: c.color }"
        :title="`${c.name} — ${c.pct}%`"
      ></div>
    </div>

    <div class="legend">
      <div v-for="c in categories" :key="c.name" class="legend-row">
        <span class="legend-swatch" :style="{ background: c.color }"></span>
        <span class="legend-name">{{ c.name }}</span>
        <span class="legend-units mono">{{ c.units }}</span>
        <span class="legend-amount mono">{{ formatRupiah(c.revenue) }}</span>
        <span class="legend-pct mono">{{ c.pct }}%</span>
      </div>
    </div>

    <div class="total-row">
      <span>Total</span>
      <span class="mono">{{ formatRupiah(total) }}</span>
    </div>
  </div>
</template>

<style scoped>
.breakdown {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.stack {
  display: flex;
  height: 12px;
  width: 100%;
  border-radius: 6px;
  overflow: hidden;
  background: var(--surface-hover);
}
.stack-seg {
  height: 100%;
}
.legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.legend-row {
  display: grid;
  grid-template-columns: 12px 1fr auto auto 44px;
  align-items: center;
  gap: 12px;
  font-size: 12.5px;
}
.legend-swatch {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}
.legend-name {
  color: var(--text);
  font-weight: 500;
}
.legend-units {
  font-size: 12px;
  color: var(--text-muted);
  text-align: right;
}
.legend-amount {
  font-size: 12px;
  color: var(--text);
  font-weight: 600;
  text-align: right;
}
.legend-pct {
  font-weight: 700;
  color: var(--text);
  text-align: right;
}
.total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  font-size: 13.5px;
  font-weight: 600;
}
</style>