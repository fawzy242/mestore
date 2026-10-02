<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as categoriesService from '@/services/api/categories.service.js'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppPageHeader from '@/components/ui/AppPageHeader.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import MarginCalcBox from '@/components/ui/MarginCalcBox.vue'
import IconSave from '@/components/icons/IconSave.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import IconBarcodeScanner from '@/components/icons/IconBarcodeScanner.vue'
import { useProductForm } from '../composables/useProductForm.js'
import { useToast } from '@/composables/useToast.js'
import { useUnsavedChangesConfirm } from '@/composables/useUnsavedChangesConfirm.js'
import * as productsService from '@/services/api/products.service.js'

const route = useRoute()
const router = useRouter()
const { push } = useToast()

const productId = computed(() => route.params.id || null)
const { form, isEdit, isSubmitting, isLoading, fieldErrors, load, submit } =
  useProductForm(productId.value)

const categoryOptions = ref([])
const { state: dirtyState, confirmDiscard } = useUnsavedChangesConfirm()
const initialSnapshot = ref('')
const { state: deleteState, open: openDeleteConfirm, confirm: confirmDelete, close: cancelDelete } =
  useConfirmDialog()

import { useConfirmDialog } from '@/composables/useConfirmDialog.js'

function snapshot() {
  return JSON.stringify({
    name: form.name ?? '',
    sku: form.sku ?? '',
    category: form.category ?? '',
    unit: form.unit ?? '',
    price: String(form.price ?? ''),
    cost: String(form.cost ?? ''),
    stock: String(form.stock ?? ''),
  })
}

async function loadCategories() {
  const result = await categoriesService.getCategories()
  categoryOptions.value = result.items.map((c) => ({ value: c.name, label: c.name }))
  if (!form.category && categoryOptions.value.length) {
    form.category = categoryOptions.value[0].value
  }
}

async function onSubmit() {
  const saved = await submit()
  if (saved) {
    push(isEdit.value ? 'Product updated' : 'Product added')
    router.push({ name: 'products.list' })
  }
}

async function cancel() {
  const dirty = snapshot() !== initialSnapshot.value
  const ok = await confirmDiscard(dirty)
  if (ok) router.push({ name: 'products.list' })
}

async function askDelete() {
  const ok = await openDeleteConfirm({
    title: 'Delete product?',
    message: `Delete "${form.name}"? This will permanently remove it from your catalog. This can't be undone.`,
    confirmLabel: 'Delete',
    variant: 'danger',
  })
  if (!ok) return
  await productsService.deleteProduct(productId.value)
  push('Product deleted')
  router.push({ name: 'products.list' })
}

onMounted(async () => {
  await loadCategories()
  await load()
  initialSnapshot.value = snapshot()
})
</script>

<template>
  <AppPageContainer>
    <AppCard padded>
      <AppPageHeader
        :title="isEdit ? 'Edit Product' : 'Add Product'"
        :subtitle="isEdit ? `Editing product #${productId}` : 'Create a new catalog item.'"
      />

      <AppSpinner v-if="isLoading" />

      <form v-else class="form-grid" @submit.prevent="onSubmit">
        <AppInput
          v-model="form.name"
          label="Product Name"
          placeholder="e.g. Indomie Goreng"
          :error="fieldErrors.name"
        />
        <AppInput
          v-model="form.sku"
          label="SKU / Barcode"
          placeholder="e.g. 8991234567"
          :error="fieldErrors.sku"
        />
        <AppSelect
          v-model="form.category"
          label="Category"
          :options="categoryOptions"
          :error="fieldErrors.category"
        />
        <AppInput v-model="form.unit" label="Unit" placeholder="e.g. pcs, box" />
        <AppInput
          v-model="form.price"
          label="Price (Rp)"
          type="number"
          :error="fieldErrors.price"
        />
        <AppInput v-model="form.cost" label="Cost (Rp) — optional" type="number" />
        <AppInput
          v-model="form.stock"
          label="Stock Quantity"
          type="number"
          :error="fieldErrors.stock"
        />

        <MarginCalcBox :price="form.price" :cost="form.cost" />

        <div class="actions">
          <AppButton variant="secondary" @click="cancel">Cancel</AppButton>
          <AppButton variant="primary" type="submit" :loading="isSubmitting">
            <IconSave /> Save Product
          </AppButton>
          <AppButton
            v-if="isEdit"
            variant="danger"
            type="button"
            title="Delete product"
            @click="askDelete"
          >
            <IconTrash />
          </AppButton>
        </div>
      </form>
    </AppCard>

    <ConfirmDialog
      :model-value="dirtyState.isOpen.value"
      :title="dirtyState.title.value"
      :message="dirtyState.message.value"
      :confirm-label="dirtyState.confirmLabel.value"
      :variant="dirtyState.variant.value"
    />

    <ConfirmDialog
      :model-value="deleteState.isOpen.value"
      :title="deleteState.title.value"
      :message="deleteState.message.value"
      :confirm-label="deleteState.confirmLabel.value"
      :variant="deleteState.variant.value"
      @update:model-value="(v) => !v && cancelDelete()"
      @confirm="confirmDelete"
    />
  </AppPageContainer>
</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 16px;
}
@media (max-width: 700px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
.actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 10px;
  margin-top: 8px;
  align-items: center;
}
</style>