<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppNoticeBanner from '@/components/ui/AppNoticeBanner.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import CategoryChips from '../components/CategoryChips.vue'
import ProductTileGrid from '../components/ProductTileGrid.vue'
import CartButton from '../components/CartButton.vue'
import CurrentSaleModal from '../components/CurrentSaleModal.vue'
import ShiftModal from '@/features/shift/components/ShiftModal.vue'
import { usePosCatalog } from '../composables/usePosCatalog.js'
import { useDebouncedSearch } from '@/composables/useDebouncedSearch.js'
import { usePosCartStore } from '@/stores/posCart.store.js'
import { useShift } from '@/features/shift/composables/useShift.js'
import { formatRupiah } from '@/composables/useFormatters.js'

const router = useRouter()
const cart = usePosCartStore()
const shift = useShift()
const { products, categories, loading, error, filters, fetchCategories, fetchProducts } =
  usePosCatalog()

const cartModalOpen = ref(false)
const shiftModalOpen = ref(false)

const { value: searchValue } = useDebouncedSearch((v) => {
  filters.search = v
  fetchProducts()
})

watch(
  () => filters.category,
  () => fetchProducts(),
)

// Build a `{ [productId]: qty }` map for the tile grid so each tile
// can render its own quantity stepper.
const cartQtyMap = computed(() => {
  const map = {}
  for (const item of cart.items) {
    map[item.id] = item.qty
  }
  return map
})

function addToCart(product) {
  cart.addProduct(product)
  // Do NOT auto-open the modal — the user must tap the Cart button.
}

function removeFromCart(product) {
  const item = cart.items.find((i) => i.id === product.id)
  if (!item) return
  if (item.qty <= 1) {
    cart.setQty(product.id, 0) // removes item
  } else {
    cart.setQty(product.id, item.qty - 1)
  }
}

function increment(id) {
  const item = cart.items.find((i) => i.id === id)
  if (item) cart.setQty(id, item.qty + 1)
}

function decrement(id) {
  const item = cart.items.find((i) => i.id === id)
  if (item) cart.setQty(id, item.qty - 1)
}

function charge() {
  if (cart.items.length === 0) return
  cartModalOpen.value = false
  router.push({ name: 'pos.payment' })
}

function hold() {
  cart.clear()
  cartModalOpen.value = false
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
        <button type="button" class="scan-btn" aria-label="Scan barcode">
          <AppIcon name="barcode-scanner" :size="20" />
        </button>
      </div>

      <div class="toolbar-actions">
        <Button
          :label="shift.hasOpenShift.value ? 'Shift Open' : 'Shift Closed'"
          :icon="shift.hasOpenShift.value ? 'pi pi-clock' : 'pi pi-power-off'"
          :severity="shift.hasOpenShift.value ? 'success' : 'warning'"
          outlined
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
  min-width: 260px;
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
  padding: 0 44px 0 42px;
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
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--primary);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>