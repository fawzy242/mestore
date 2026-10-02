<script setup>
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppDetailRow from '@/components/ui/AppDetailRow.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useProductDetail } from '../composables/useProductDetail.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog.js'
import { useToast } from '@/composables/useToast.js'
import * as productsService from '@/services/api/products.service.js'
import { formatRupiah } from '@/composables/useFormatters.js'

const route = useRoute()
const router = useRouter()
const { push } = useToast()
const productId = computed(() => route.params.id)
const { product, loading, error, fetchProduct } = useProductDetail(productId.value)

const { state: confirmState, open: openConfirm, confirm: confirmOk, close: confirmCancel } =
  useConfirmDialog()

function goEdit() {
  router.push({ name: 'products.edit', params: { id: product.value.id } })
}

async function askDelete() {
  const ok = await openConfirm({
    title: 'Delete product?',
    message: `Delete "${product.value.name}"? This will permanently remove it from your catalog. This can't be undone.`,
    confirmLabel: 'Delete',
    variant: 'danger',
  })
  if (!ok) return
  await productsService.deleteProduct(product.value.id)
  push('Product deleted')
  router.push({ name: 'products.list' })
}

onMounted(fetchProduct)
</script>

<template>
  <AppPageContainer>
    <AppCard padded>
      <AppAlert v-if="error" variant="error" :message="error.message" retry-label="Retry" @retry="fetchProduct" />
      <AppSpinner v-else-if="loading" />
      <template v-else-if="product">
        <AppDetailRow label="Name">{{ product.name }}</AppDetailRow>
        <AppDetailRow label="SKU" mono>{{ product.sku }}</AppDetailRow>
        <AppDetailRow label="Category">{{ product.category }}</AppDetailRow>
        <AppDetailRow label="Unit">{{ product.unit }}</AppDetailRow>
        <AppDetailRow label="Price" mono>{{ formatRupiah(product.price) }}</AppDetailRow>
        <AppDetailRow label="Cost" mono>{{ formatRupiah(product.cost) }}</AppDetailRow>
        <AppDetailRow label="Stock" mono>
          {{ product.stock }} {{ product.unit }}
          <AppBadge :variant="product.stock <= 8 ? 'warning' : 'success'">
            {{ product.stock <= 8 ? 'Low stock' : 'In stock' }}
          </AppBadge>
        </AppDetailRow>

        <div class="actions">
          <AppButton variant="secondary" @click="goEdit">Edit</AppButton>
          <AppButton variant="danger" @click="askDelete">Delete</AppButton>
        </div>
      </template>
    </AppCard>

    <ConfirmDialog
      :model-value="confirmState.isOpen.value"
      :title="confirmState.title.value"
      :message="confirmState.message.value"
      :confirm-label="confirmState.confirmLabel.value"
      :variant="confirmState.variant.value"
      @update:model-value="(v) => !v && confirmCancel()"
      @confirm="confirmOk"
    />
  </AppPageContainer>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}
</style>