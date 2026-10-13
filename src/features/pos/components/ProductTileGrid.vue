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

function stockOf(product) {
  return Number(product.stock) || 0
}

function isOutOfStock(product) {
  return stockOf(product) <= 0
}

function isLowStock(product) {
  const s = stockOf(product)
  return s > 0 && s <= 8
}

function stockVariant(product) {
  if (isOutOfStock(product)) return 'danger'
  if (isLowStock(product)) return 'warning'
  return 'success'
}

function stockLabel(product) {
  const s = stockOf(product)
  if (s <= 0) return 'Out of stock'
  return `${s} ${product.unit}`
}
</script>

<template>
  <div class="grid">
    <div
      v-for="product in products"
      :key="product.id"
      class="tile"
      :class="{
        'in-cart': qtyFor(product) > 0,
        'out-of-stock': isOutOfStock(product),
      }"
    >
      <div class="tile-top">
        <span class="sku mono">{{ product.sku }}</span>
        <StatusPill :variant="stockVariant(product)">
          {{ stockLabel(product) }}
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
            :disabled="qtyFor(product) >= stockOf(product)"
            @click.stop="emit('add', product)"
          >
            +
          </button>
        </div>

        <button
          v-else-if="!isOutOfStock(product)"
          type="button"
          class="add-btn"
          aria-label="Add to cart"
          @click.stop="emit('add', product)"
        >
          +
        </button>

        <span v-else class="out-chip">Out</span>
      </div>
    </div>

    <div v-if="!loading && products.length === 0" class="empty">
      No products match your search.
    </div>
  </div>
</template>

<style scoped>
/*
 * Responsive tile grid:
 *   ≥1100px → 5–6 columns
 *   ≥900px  → 4 columns
 *   ≥640px  → 3 columns
 *   ≥480px  → 2 columns
 *   <480px  → 2 columns (compact tiles)
 *
 * Grid height = viewport - everything above it. Values reduced on mobile
 * since the topbar and toolbar are shorter there.
 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  max-height: calc(100vh - var(--topbar-h, 60px) - 248px);
  overflow-y: auto;
  padding-right: 4px;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    max-height: calc(100vh - var(--topbar-h, 60px) - 300px);
  }
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    max-height: calc(100vh - var(--topbar-h, 60px) - 340px);
    padding-right: 0;
  }
}

@media (max-width: 380px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
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
  min-width: 0;
}

.tile:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-1);
}

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

.tile.out-of-stock {
  opacity: 0.55;
  cursor: not-allowed;
}

.tile.out-of-stock:hover {
  border-color: var(--border);
  box-shadow: none;
}

.tile.out-of-stock .price {
  color: var(--text-muted);
}

.tile-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 8px;
  min-width: 0;
}

.sku {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: 0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  transition: background 120ms ease, transform 80ms ease;
}

.add-btn:hover {
  background: var(--primary-hover);
}

.add-btn:active {
  transform: scale(0.96);
}

.out-chip {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 10px;
  border-radius: var(--radius-md);
  background: var(--surface-hover);
  color: var(--text-muted);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  flex-shrink: 0;
}

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

.stepper-btn:hover:not(:disabled) {
  background: var(--surface-hover);
  color: var(--text);
}

.stepper-btn:active:not(:disabled) {
  background: var(--border);
}

.stepper-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
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

/* --- Compact tiles on small screens --- */
@media (max-width: 640px) {
  .tile {
    padding: 11px;
    min-height: 126px;
    border-radius: var(--radius-md);
  }
  .tile.in-cart::before {
    top: 11px;
    bottom: 11px;
  }
  .tile-name {
    font-size: 12.5px;
    min-height: 32px;
    -webkit-line-clamp: 2;
  }
  .tile-cat {
    font-size: 10.5px;
    margin-bottom: 8px;
  }
  .tile-bottom {
    padding-top: 8px;
    gap: 6px;
  }
  .price {
    font-size: 12px;
  }
  .add-btn {
    width: 28px;
    height: 28px;
    font-size: 16px;
  }
  .stepper {
    height: 28px;
  }
  .stepper-btn {
    width: 24px;
    font-size: 14px;
  }
  .stepper-qty {
    min-width: 20px;
    font-size: 12px;
  }
  .out-chip {
    height: 28px;
    font-size: 10.5px;
    padding: 0 8px;
  }
  .sku {
    font-size: 10px;
  }
}

@media (max-width: 380px) {
  .tile-cat {
    display: none;
  }
}
</style>