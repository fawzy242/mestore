<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import { useConfirm } from 'primevue/useconfirm'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppDetailRow from '@/components/ui/AppDetailRow.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import ProductFormModal from '../components/ProductFormModal.vue'
import { useProductDetail } from '../composables/useProductDetail.js'
import { useToast } from '@/composables/useToast.js'
import * as productsService from '@/services/api/products.service.js'
import { formatRupiah } from '@/composables/useFormatters.js'

const route = useRoute()
const router = useRouter()
const confirm = useConfirm()
const { push } = useToast()

const productId = computed(() => route.params.id)
const { product, loading, error, fetchProduct } = useProductDetail(productId.value)

const modalOpen = ref(false)

function openEdit() {
  modalOpen.value = true
}

function askDelete() {
  confirm.require({
    header: 'Delete product?',
    message: `Delete "${product.value.name}"? This will permanently remove it from your catalog. This can't be undone.`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await productsService.deleteProduct(product.value.id)
      push('Product deleted')
      router.push({ name: 'products.list' })
    },
  })
}

async function onSaved() {
  await fetchProduct()
}

onMounted(fetchProduct)
</script>

<template>
  <AppPageContainer max-width="720px">
    <AppCard padded>
      <AppAlert
        v-if="error"
        variant="error"
        :message="error.message"
        retry-label="Retry"
        @retry="fetchProduct"
      />
      <AppSpinner v-else-if="loading" />
      <template v-else-if="product">
        <div class="header">
          <h2 class="title">{{ product.name }}</h2>
          <StatusPill :variant="product.stock <= 8 ? 'warning' : 'success'">
            {{ product.stock <= 8 ? 'Low stock' : 'In stock' }}
          </StatusPill>
        </div>

        <AppDetailRow label="SKU" mono>{{ product.sku }}</AppDetailRow>
        <AppDetailRow label="Category">{{ product.category }}</AppDetailRow>
        <AppDetailRow label="Unit">{{ product.unit }}</AppDetailRow>
        <AppDetailRow label="Price" mono>{{ formatRupiah(product.price) }}</AppDetailRow>
        <AppDetailRow label="Cost" mono>{{ formatRupiah(product.cost) }}</AppDetailRow>
        <AppDetailRow label="Stock" mono>
          {{ product.stock }} {{ product.unit }}
        </AppDetailRow>

        <div class="actions">
          <Button label="Edit" icon="pi pi-pencil" outlined @click="openEdit" />
          <Button label="Delete" icon="pi pi-trash" severity="danger" @click="askDelete" />
        </div>
      </template>
    </AppCard>

    <ProductFormModal v-model="modalOpen" :product-id="productId" @saved="onSaved" />
  </AppPageContainer>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}
</style>