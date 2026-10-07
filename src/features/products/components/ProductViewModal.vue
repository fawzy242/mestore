<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import AppDetailRow from '@/components/ui/AppDetailRow.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
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

function close() {
  visible.value = false
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
    :show-header="false"
  >
    <div class="modal-head">
      <span class="head-icon">
        <AppIcon name="inventory-2" :size="20" />
      </span>
      <h2 class="head-title">Product Detail</h2>
      <button
        type="button"
        class="head-close"
        aria-label="Close"
        @click="close"
      >
        <AppIcon name="close" :size="14" />
      </button>
    </div>

    <div class="modal-body">
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
    </div>

    <div class="mestore-modal-foot">
      <Button label="Close" text severity="secondary" @click="close" />
      <Button label="Edit" icon="pi pi-pencil" @click="edit" />
    </div>
  </Dialog>
</template>

<style scoped>
.modal-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border);
}
.head-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--primary-tint);
  color: var(--primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.head-title {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}
.head-close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}
.head-close:hover {
  background: var(--surface-hover);
  color: var(--text);
}

.modal-body {
  padding: 22px;
}

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