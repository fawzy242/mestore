<script setup>
import StatusPill from '@/components/ui/StatusPill.vue'
import { formatRupiah } from '@/composables/useFormatters.js'

const props = defineProps({
  products: { type: Array, required: true },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['add'])
</script>

<template>
  <div class="grid">
    <button
      v-for="product in products"
      :key="product.id"
      type="button"
      class="tile"
      @click="emit('add', product)"
    >
      <div class="tile-top">
        <span class="sku mono">{{ product.sku }}</span>
        <StatusPill :variant="product.stock <= 8 ? 'warning' : 'success'">
          {{ product.stock }} {{ product.unit }}
        </StatusPill>
      </div>
      <div class="name">{{ product.name }}</div>
      <div class="cat">{{ product.category }}</div>
      <div class="tile-bottom">
        <span class="price mono">{{ formatRupiah(product.price) }}</span>
        <span class="add-btn" aria-hidden="true">+</span>
      </div>
    </button>

    <div v-if="!loading && products.length === 0" class="empty">
      No products match your search.
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  max-height: calc(100vh - 60px - 170px);
  overflow-y: auto;
  padding-right: 4px;
}

.tile {
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  padding: 12px;
  text-align: left;
  color: var(--color-ink);
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: border-color 120ms, box-shadow 120ms;
}

.tile:hover {
  border-color: var(--color-primary-container);
  box-shadow: var(--shadow-1);
}

.tile-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 6px;
}

.sku {
  font-size: 11px;
  color: var(--color-ink-soft);
  font-weight: 500;
}

.name {
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-ink);
}

.cat {
  font-size: 11.5px;
  color: var(--color-ink-soft);
  margin-bottom: 8px;
}

.tile-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid var(--color-line);
  margin-top: auto;
}

.price {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary-container);
}

.add-btn {
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  background: var(--color-primary-container);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  font-weight: 600;
}

.empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
  color: var(--color-ink-soft);
  font-size: 13px;
}
</style>