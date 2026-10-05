<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Message from 'primevue/message'
import AppIcon from '@/components/ui/AppIcon.vue'
import MarginCalcBox from '@/components/ui/MarginCalcBox.vue'
import { useProductForm } from '../composables/useProductForm.js'
import { useToast } from '@/composables/useToast.js'
import * as categoriesService from '@/services/api/categories.service.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  productId: { type: [String, Number], default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const { push } = useToast()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const isEdit = computed(() => Boolean(props.productId))
const { form, isSubmitting, isLoading, error, fieldErrors, load, submit } = useProductForm(
  props.productId,
)

const categoryOptions = ref([])

async function loadCategories() {
  const result = await categoriesService.getCategories()
  categoryOptions.value = result.items.map((c) => ({ label: c.name, value: c.name }))
  if (!form.category && categoryOptions.value.length) {
    form.category = categoryOptions.value[0].value
  }
}

async function onSubmit() {
  const saved = await submit()
  if (saved) {
    push(isEdit.value ? 'Product updated' : 'Product added')
    emit('saved', saved)
    visible.value = false
  } else if (error.value) {
    push(error.value.message, { severity: 'error' })
  }
}

function close() {
  visible.value = false
}

watch(visible, async (open) => {
  if (open) {
    await loadCategories()
    if (isEdit.value) await load()
  }
})

onMounted(() => {
  if (visible.value) {
    loadCategories()
    if (isEdit.value) load()
  }
})
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    :style="{ width: '640px' }"
    :header="isEdit ? 'Edit Product' : 'Add Product'"
  >
    <div v-if="isLoading" class="loading">Loading…</div>

    <form v-else class="form" @submit.prevent="onSubmit">
      <div class="field full">
        <label>Product Name *</label>
        <InputText
          v-model="form.name"
          placeholder="e.g. Indomie Goreng"
          :class="{ 'p-invalid': fieldErrors.name }"
        />
        <small v-if="fieldErrors.name" class="err">{{ fieldErrors.name }}</small>
      </div>

      <div class="field">
        <label>SKU / Barcode *</label>
        <InputText
          v-model="form.sku"
          placeholder="e.g. 8991234567"
          :class="{ 'p-invalid': fieldErrors.sku }"
        />
        <small v-if="fieldErrors.sku" class="err">{{ fieldErrors.sku }}</small>
      </div>

      <div class="field">
        <label>Category *</label>
        <Select
          v-model="form.category"
          :options="categoryOptions"
          option-label="label"
          option-value="value"
          placeholder="Select category"
          :class="{ 'p-invalid': fieldErrors.category }"
        />
        <small v-if="fieldErrors.category" class="err">{{ fieldErrors.category }}</small>
      </div>

      <div class="field">
        <label>Unit</label>
        <InputText v-model="form.unit" placeholder="e.g. pcs, box" />
      </div>

      <div class="field">
        <label>Stock Quantity *</label>
        <InputNumber
          v-model="form.stock"
          :min="0"
          :use-grouping="false"
          :class="{ 'p-invalid': fieldErrors.stock }"
        />
        <small v-if="fieldErrors.stock" class="err">{{ fieldErrors.stock }}</small>
      </div>

      <div class="field">
        <label>Price (Rp) *</label>
        <InputNumber
          v-model="form.price"
          mode="currency"
          currency="IDR"
          locale="id-ID"
          :min="0"
          :class="{ 'p-invalid': fieldErrors.price }"
        />
        <small v-if="fieldErrors.price" class="err">{{ fieldErrors.price }}</small>
      </div>

      <div class="field">
        <label>Cost (Rp) — optional</label>
        <InputNumber
          v-model="form.cost"
          mode="currency"
          currency="IDR"
          locale="id-ID"
          :min="0"
        />
      </div>

      <MarginCalcBox class="full" :price="form.price" :cost="form.cost" />

      <Message v-if="error" severity="error" :closable="false" class="full">
        {{ error.message }}
      </Message>
    </form>

    <template #footer>
      <Button label="Cancel" text severity="secondary" @click="close" />
      <Button
        :label="isEdit ? 'Save Changes' : 'Save Product'"
        icon="pi pi-check"
        :loading="isSubmitting"
        @click="onSubmit"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.loading {
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
}

.form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field.full {
  grid-column: 1 / -1;
}

.field label {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-muted);
}

.field :deep(.p-inputtext),
.field :deep(.p-inputnumber),
.field :deep(.p-select) {
  width: 100%;
}

.err {
  font-size: 11.5px;
  color: var(--danger);
}

@media (max-width: 640px) {
  .form {
    grid-template-columns: 1fr;
  }
}
</style>