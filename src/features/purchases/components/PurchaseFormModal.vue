<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import DatePicker from 'primevue/datepicker'
import Message from 'primevue/message'
import AppIcon from '@/components/ui/AppIcon.vue'
import { usePurchaseForm } from '../composables/usePurchaseForm.js'
import { useToast } from '@/composables/useToast.js'
import * as suppliersService from '@/services/api/suppliers.service.js'
import { formatRupiah } from '@/composables/useFormatters.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  purchaseId: { type: [String, Number], default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])
const { push } = useToast()
const visible = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
const isEdit = computed(() => Boolean(props.purchaseId))
const { form, isSubmitting, isLoading, error, fieldErrors, load, submit, addItem, removeItem } =
  usePurchaseForm(props.purchaseId)

const supplierOptions = ref([])

async function loadSuppliers() {
  const result = await suppliersService.getSuppliers({ status: 'Active' })
  supplierOptions.value = result.items.map((s) => ({ label: s.name, value: s.id }))
}

// Translate the string date ↔ Date object for the DatePicker.
const dateProxy = computed({
  get: () => {
    if (!form.date) return null
    const d = new Date(form.date)
    return Number.isNaN(d.getTime()) ? null : d
  },
  set: (v) => {
    if (!v) {
      form.date = ''
      return
    }
    form.date = v.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  },
})

const total = computed(() =>
  form.items.reduce((sum, i) => sum + (Number(i.qty) || 0) * (Number(i.price) || 0), 0),
)

const statusOptions = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Received', value: 'Received' },
]

async function onSubmit() {
  const saved = await submit()
  if (saved) {
    push(isEdit.value ? 'Purchase updated' : 'Purchase created')
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
  if (!open) return
  await loadSuppliers()
  if (isEdit.value) await load()
  else {
    if (form.items.length === 0) addItem()
    if (!form.date) {
      form.date = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }
  }
})

onMounted(async () => {
  if (!visible.value) return
  await loadSuppliers()
  if (isEdit.value) load()
})
</script>

<template>
  <Dialog v-model:visible="visible" modal :draggable="false" :style="{ width: '720px' }" :show-header="false">
    <div class="modal-head">
      <span class="head-icon"><AppIcon name="shopping-basket" :size="20" /></span>
      <h2 class="head-title">{{ isEdit ? 'Edit Purchase' : 'New Purchase' }}</h2>
      <button type="button" class="head-close" aria-label="Close" @click="close">
        <AppIcon name="close" :size="14" />
      </button>
    </div>

    <div class="modal-body">
      <div v-if="isLoading" class="loading">Loading…</div>
      <form v-else class="form" @submit.prevent="onSubmit">
        <div class="field">
          <label>Supplier *</label>
          <Select
            v-model="form.supplierId"
            :options="supplierOptions"
            option-label="label"
            option-value="value"
            placeholder="Select supplier"
            :class="{ 'p-invalid': fieldErrors.supplierId }"
          />
          <small v-if="fieldErrors.supplierId" class="err">{{ fieldErrors.supplierId }}</small>
        </div>
        <div class="field">
          <label>Date *</label>
          <DatePicker
            v-model="dateProxy"
            date-format="M d, yy"
            :show-icon="true"
            :class="{ 'p-invalid': fieldErrors.date }"
          />
          <small v-if="fieldErrors.date" class="err">{{ fieldErrors.date }}</small>
        </div>
        <div class="field">
          <label>Status</label>
          <Select
            v-model="form.status"
            :options="statusOptions"
            option-label="label"
            option-value="value"
          />
        </div>

        <div class="items-block full">
          <div class="items-head">
            <span class="items-title">Items</span>
            <Button label="Add Item" icon="pi pi-plus" size="small" outlined @click="addItem" />
          </div>

          <div v-for="(item, i) in form.items" :key="i" class="item-row">
            <InputText
              v-model="item.name"
              placeholder="Item name"
              class="item-name"
              :class="{ 'p-invalid': fieldErrors[`item-name-${i}`] }"
            />
            <InputNumber v-model="item.qty" :min="1" placeholder="Qty" class="item-qty" />
            <InputNumber
              v-model="item.price"
              mode="currency"
              currency="IDR"
              locale="id-ID"
              :min="0"
              class="item-price"
            />
            <div class="item-total mono">
              {{ formatRupiah((item.qty || 0) * (item.price || 0)) }}
            </div>
            <Button
              icon="pi pi-times"
              severity="danger"
              text
              rounded
              size="small"
              aria-label="Remove"
              @click="removeItem(i)"
            />
          </div>

          <small v-if="fieldErrors.items" class="err">{{ fieldErrors.items }}</small>
        </div>

        <div class="total-row full">
          <span>Total</span>
          <span class="mono total-value">{{ formatRupiah(total) }}</span>
        </div>

        <Message v-if="error" severity="error" :closable="false" class="full">
          {{ error.message }}
        </Message>
      </form>
    </div>

    <div class="mestore-modal-foot">
      <Button label="Cancel" text severity="secondary" @click="close" />
      <Button
        :label="isEdit ? 'Save Changes' : 'Create Purchase'"
        icon="pi pi-check"
        :loading="isSubmitting"
        @click="onSubmit"
      />
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
.field.full,
.full {
  grid-column: 1 / -1;
}
.field label {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-muted);
}
.field :deep(.p-inputtext),
.field :deep(.p-select),
.field :deep(.p-datepicker) {
  width: 100%;
}
.items-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  background: var(--surface-alt);
}
.items-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.items-title {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.item-row {
  display: grid;
  grid-template-columns: 2fr 90px 130px 120px 36px;
  gap: 8px;
  align-items: center;
}
.item-name :deep(input),
.item-qty :deep(input),
.item-price :deep(input) {
  width: 100%;
}
.item-total {
  text-align: right;
  font-weight: 600;
  font-size: 13px;
}
.total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--surface-alt);
  border: 1px solid var(--border);
  font-size: 14px;
  font-weight: 600;
}
.total-value {
  color: var(--primary);
  font-size: 18px;
  font-weight: 700;
}
.err {
  font-size: 11.5px;
  color: var(--danger);
}
@media (max-width: 700px) {
  .form {
    grid-template-columns: 1fr;
  }
  .item-row {
    grid-template-columns: 1fr 60px 90px 80px 30px;
    font-size: 12px;
  }
}
</style>