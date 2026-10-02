<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppSearchInput from '@/components/ui/AppSearchInput.vue'
import AppNoticeBanner from '@/components/ui/AppNoticeBanner.vue'
import CategoryChips from '../components/CategoryChips.vue'
import ProductTileGrid from '../components/ProductTileGrid.vue'
import CartButton from '../components/CartButton.vue'
import CurrentSaleModal from '../components/CurrentSaleModal.vue'
import { usePosCatalog } from '../composables/usePosCatalog.js'
import { useDebouncedSearch } from '@/composables/useDebouncedSearch.js'
import { usePosCartStore } from '@/stores/posCart.store.js'

const router = useRouter()
const cart = usePosCartStore()
const { products, categories, loading, error, filters, fetchCategories, fetchProducts } =
  usePosCatalog()

const cartModalOpen = ref(false)

const { value: searchValue } = useDebouncedSearch((v) => {
  filters.search = v
  fetchProducts()
})

watch(
  () => filters.category,
  () => fetchProducts(),
)

function addToCart(product) {
  const wasEmpty = cart.items.length === 0
  cart.addProduct(product)
  if (wasEmpty) cartModalOpen.value = true
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

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchProducts()])
})
</script>

<template>
  <AppPageContainer>
    <AppNoticeBanner
      variant="info"
      message="Cashier builds the cart here, then taps Cart to view sale and payment."
    />

    <div class="pos-toolbar">
      <AppSearchInput v-model="searchValue" placeholder="Search product name or scan barcode…" />
      <CartButton
        :item-count="cart.itemCount"
        :total="cart.total"
        @open="cartModalOpen = true"
      />
    </div>

    <CategoryChips
      :categories="categories"
      :model-value="filters.category"
      @update:model-value="(v) => (filters.category = v)"
    />

    <ProductTileGrid :products="products" :loading="loading" @add="addToCart" />

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
  </AppPageContainer>
</template>

<style scoped>
.pos-toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 14px;
}
</style>