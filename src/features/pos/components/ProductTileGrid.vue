<script setup>
import StatusPill from '@/components/ui/StatusPill.vue'
import { formatRupiah } from '@/composables/useFormatters.js'

const props = defineProps({
  products: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  cart: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['add', 'remove'])

function qtyFor(product) {
  return props.cart[product.id] || 0
}
</script>

<template>
  <div class="grid">
    <div
      v-for="product in products"
      :key="product.id"
      class="tile"
      :class="{ 'in-cart': qtyFor(product) > 0 }"
    >
      <div class="tile-top">
        <span class="sku mono">{{ product.sku }}</span>
        <StatusPill :variant="product.stock <= 8 ? 'warning' : 'success'">
          {{ product.stock }} {{ product.unit }}
        </StatusPill>
      </div>

      <div class="tile-name">{{ product.name }}</div>
      <div class="tile-cat">{{ product.category }}</div>

      <div class="tile-bottom">
        <span class="price mono">{{ formatRupiah(product.price) }}</span>

        <div v-if="qtyFor(product) > 0" class="stepper">
          <button
            type="button"
            class="stepper-btn"
            aria-label="Decrease quantity"
            @click.stop="emit('remove', product)"
          >
            −
          </button>
          <span class="stepper-qty mono">{{ qtyFor(product) }}</span>
          <button
            type="button"
            class="stepper-btn"
            aria-label="Increase quantity"
            @click.stop="emit('add', product)"
          >
            +
          </button>
        </div>

        <button
          v-else
          type="button"
          class="add-btn"
          aria-label="Add to cart"
          @click.stop="emit('add', product)"
        >
          +
        </button>
      </div>
    </div>

    <div v-if="!loading && products.length === 0" class="empty">
      No products match your search.
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  max-height: calc(100vh - 260px);
  overflow-y: auto;
  padding-right: 4px;
}

/* ---- Tile ---- */
.tile {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  transition: border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease;
  min-height: 138px;
  position: relative;
}

.tile:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-1);
}

/* In-cart: subtle tint + thin accent line, NOT a full red border */
.tile.in-cart {
  background: var(--primary-tint);
  border-color: var(--border);
}

.tile.in-cart::before {
  content: '';
  position: absolute;
  left: 0;
  top: 14px;
  bottom: 14px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--primary);
}

/* ---- Tile content ---- */
.tile-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 8px;
}

.sku {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: 0.02em;
}

.tile-name {
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 35px;
}

.tile-cat {
  font-size: 11.5px;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.tile-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid var(--border);
  margin-top: auto;
  gap: 8px;
}

.price {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--primary);
  white-space: nowrap;
}

/* ---- Not-in-cart: single red + ---- */
.add-btn {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-md);
  background: var(--primary);
  color: var(--primary-fg);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  line-height: 1;
  font-weight: 500;
  flex-shrink: 0;
  cursor: pointer;
  transition: background 120ms ease;
}

.add-btn:hover {
  background: var(--primary-hover);
}

.add-btn:active {
  transform: scale(0.96);
}

/* ---- In cart: neutral stepper, no borders except a soft container ---- */
.stepper {
  display: inline-flex;
  align-items: center;
  height: 30px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
}

.stepper-btn {
  width: 26px;
  height: 100%;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 100ms ease, color 100ms ease;
}

.stepper-btn:hover {
  background: var(--surface-hover);
  color: var(--text);
}

.stepper-btn:active {
  background: var(--border);
}

.stepper-qty {
  min-width: 22px;
  padding: 0 4px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  user-select: none;
}

.empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
  font-size: 13px;
}
</style>