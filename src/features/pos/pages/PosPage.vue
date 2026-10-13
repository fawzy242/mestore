<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Button from 'primevue/button'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppNoticeBanner from '@/components/ui/AppNoticeBanner.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import CategoryChips from '../components/CategoryChips.vue'
import ProductTileGrid from '../components/ProductTileGrid.vue'
import CartButton from '../components/CartButton.vue'
import CurrentSaleModal from '../components/CurrentSaleModal.vue'
import PaymentModal from '../components/PaymentModal.vue'
import TransactionSuccessModal from '../components/TransactionSuccessModal.vue'
import ShiftModal from '@/features/shift/components/ShiftModal.vue'
import { usePosCatalog } from '../composables/usePosCatalog.js'
import { useDebouncedSearch } from '@/composables/useDebouncedSearch.js'
import { usePosCartStore } from '@/stores/posCart.store.js'
import { useShift } from '@/features/shift/composables/useShift.js'

const cart = usePosCartStore()
const shift = useShift()
const { products, categories, loading, filters, fetchCategories, fetchProducts } =
  usePosCatalog()

const cartModalOpen = ref(false)
const paymentModalOpen = ref(false)
const successModalOpen = ref(false)
const shiftModalOpen = ref(false)

const { value: searchValue } = useDebouncedSearch((v) => {
  filters.search = v
  fetchProducts()
})

watch(
  () => filters.category,
  () => fetchProducts(),
)

const cartQtyMap = computed(() => {
  const map = {}
  for (const item of cart.items) {
    map[item.id] = item.qty
  }
  return map
})

function addToCart(product) {
  cart.addProduct(product)
}

function removeFromCart(product) {
  const item = cart.items.find((i) => i.id === product.id)
  if (!item) return
  if (item.qty <= 1) {
    cart.setQty(product.id, 0)
  } else {
    cart.setQty(product.id, item.qty - 1)
  }
}

function increment(id) {
  const item = cart.items.find((i) => i.id === id)
  if (!item) return
  if (item.qty >= (item.stock ?? Infinity)) return
  cart.setQty(id, item.qty + 1)
}

function decrement(id) {
  const item = cart.items.find((i) => i.id === id)
  if (item) cart.setQty(id, item.qty - 1)
}

function charge() {
  if (cart.items.length === 0) return
  cartModalOpen.value = false
  paymentModalOpen.value = true
}

function hold() {
  cart.clear()
  cartModalOpen.value = false
}

function onPaymentBack() {
  paymentModalOpen.value = false
  cartModalOpen.value = true
}

function onPaymentSuccess() {
  paymentModalOpen.value = false
  successModalOpen.value = true
}

function onNewSale() {
  successModalOpen.value = false
}

function openShiftModal() {
  shiftModalOpen.value = true
}

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchProducts()])
})
</script>

<template>
  <AppPageContainer>
    <AppNoticeBanner
      variant="info"
      message="Tap + on a product to add it. Tap Cart when ready to complete the sale."
    />

    <div class="pos-toolbar">
      <div class="search-wrap">
        <AppIcon name="search" :size="18" class="search-icon" />
        <input
          v-model="searchValue"
          type="text"
          class="search-input"
          placeholder="Search product name or scan barcode…"
        />
        <button type="button" class="scan-btn" aria-label="Scan barcode" title="Scan barcode">
          <AppIcon name="barcode-scanner" :size="22" />
        </button>
      </div>

      <div class="toolbar-actions">
        <Button
          :label="shift.hasOpenShift.value ? 'Shift Open' : 'Open Shift'"
          :icon="shift.hasOpenShift.value ? 'pi pi-check-circle' : 'pi pi-power-off'"
          :severity="shift.hasOpenShift.value ? 'success' : 'secondary'"
          outlined
          class="shift-btn"
          @click="openShiftModal"
        />
        <CartButton
          :item-count="cart.itemCount"
          :total="cart.total"
          @open="cartModalOpen = true"
        />
      </div>
    </div>

    <CategoryChips
      :categories="categories"
      :model-value="filters.category"
      @update:model-value="(v) => (filters.category = v)"
    />

    <ProductTileGrid
      :products="products"
      :loading="loading"
      :cart="cartQtyMap"
      @add="addToCart"
      @remove="removeFromCart"
    />

    <CurrentSaleModal
      v-model="cartModalOpen"
      :items="cart.items"
      :discount="cart.discount"
      @increment="increment"
      @decrement="decrement"
      @update:discount="cart.setDiscount"
      @clear="cart.clear()"
      @hold="hold"
      @charge="charge"
    />

    <PaymentModal
      v-model="paymentModalOpen"
      @back="onPaymentBack"
      @success="onPaymentSuccess"
    />

    <TransactionSuccessModal
      v-model="successModalOpen"
      @new-sale="onNewSale"
    />

    <ShiftModal v-model="shiftModalOpen" />
  </AppPageContainer>
</template>

<style scoped>
.pos-toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.search-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 44px;
  padding: 0 48px 0 42px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--text);
  outline: none;
  transition: border-color 120ms, box-shadow 120ms;
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-ring);
}

.scan-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--primary);
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}

.scan-btn:hover {
  background: var(--primary-tint);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

@media (max-width: 900px) {
  .pos-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  .search-wrap {
    width: 100%;
  }
  .toolbar-actions {
    width: 100%;
    justify-content: space-between;
  }
  .shift-btn {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .toolbar-actions {
    flex-wrap: wrap;
  }
  .shift-btn {
    order: 2;
    width: 100%;
    flex-basis: 100%;
  }
  .toolbar-actions :deep(.cart-btn) {
    order: 1;
    width: 100%;
    justify-content: center;
  }
  .search-input {
    height: 42px;
    font-size: 13.5px;
  }
}
</style>