<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import AppDetailRow from '@/components/ui/AppDetailRow.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'
import * as productsService from '@/services/api/products.service.js'
import { formatRupiah } from '@/composables/useFormatters.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  productId: { type: [String, Number], default: null },
})

const emit = defineEmits(['update:modelValue', 'edit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const product = ref(null)
const loading = ref(false)

async function load() {
  if (!props.productId) return
  loading.value = true
  try {
    product.value = await productsService.getProductById(props.productId)
  } finally {
    loading.value = false
  }
}

function edit() {
  const id = product.value?.id
  visible.value = false
  emit('edit', id)
}

watch(
  () => [visible.value, props.productId],
  ([open]) => {
    if (open) load()
  },
)

onMounted(() => {
  if (visible.value) load()
})
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    :style="{ width: '560px' }"
    header="Product Detail"
  >
    <div v-if="loading" class="loading">
      <AppSpinner />
    </div>

    <div v-else-if="product" class="body">
      <div class="product-head">
        <AvatarInitials :name="product.name" :size="52" tone="neutral" />
        <div class="product-head-text">
          <h3 class="product-name">{{ product.name }}</h3>
          <span class="product-category">{{ product.category }}</span>
        </div>
        <StatusPill :variant="product.stock <= 8 ? 'warning' : 'success'">
          {{ product.stock <= 8 ? 'Low stock' : 'In stock' }}
        </StatusPill>
      </div>

      <div class="details">
        <AppDetailRow label="SKU" mono>{{ product.sku }}</AppDetailRow>
        <AppDetailRow label="Unit">{{ product.unit }}</AppDetailRow>
        <AppDetailRow label="Price" mono>{{ formatRupiah(product.price) }}</AppDetailRow>
        <AppDetailRow label="Cost" mono>{{ formatRupiah(product.cost) }}</AppDetailRow>
        <AppDetailRow label="Stock" mono>{{ product.stock }} {{ product.unit }}</AppDetailRow>
      </div>
    </div>

    <template #footer>
      <Button label="Close" text severity="secondary" @click="visible = false" />
      <Button label="Edit" icon="pi pi-pencil" @click="edit" />
    </template>
  </Dialog>
</template>

<style scoped>
.loading {
  padding: 40px;
  display: flex;
  justify-content: center;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.product-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.product-head-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.product-name {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-category {
  font-size: 12.5px;
  color: var(--text-muted);
}

.details {
  display: flex;
  flex-direction: column;
}
</style>