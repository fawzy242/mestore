<script setup>
import { computed, onMounted, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Message from 'primevue/message'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useDiscountForm } from '../composables/useDiscountForm.js'
import { useToast } from '@/composables/useToast.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  discountId: { type: [String, Number], default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])
const { push } = useToast()
const visible = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
const isEdit = computed(() => Boolean(props.discountId))
const { form, isSubmitting, isLoading, error, fieldErrors, load, submit } =
  useDiscountForm(props.discountId)

const typeOptions = [
  { label: 'Percentage (%)', value: 'percentage' },
  { label: 'Fixed (Rp)', value: 'fixed' },
]
const scopeOptions = [
  { label: 'All products', value: 'all' },
  { label: 'Category', value: 'category' },
  { label: 'Specific product', value: 'product' },
]

function parseDate(str) {
  if (!str) return null
  const d = new Date(str)
  return Number.isNaN(d.getTime()) ? null : d
}
function fmtDate(d) {
  if (!d) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const startDateProxy = computed({
  get: () => parseDate(form.startDate),
  set: (v) => (form.startDate = fmtDate(v)),
})
const endDateProxy = computed({
  get: () => parseDate(form.endDate),
  set: (v) => (form.endDate = fmtDate(v)),
})

async function onSubmit() {
  const saved = await submit()
  if (saved) {
    push(isEdit.value ? 'Promotion updated' : 'Promotion created')
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
  if (open && isEdit.value) await load()
})
onMounted(() => {
  if (visible.value && isEdit.value) load()
})
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    :style="{ width: '640px' }"
    :show-header="false"
  >
    <div class="modal-head">
      <span class="head-icon"><AppIcon name="local-offer" :size="20" /></span>
      <h2 class="head-title">{{ isEdit ? 'Edit Promotion' : 'Add Promotion' }}</h2>
      <button type="button" class="head-close" aria-label="Close" @click="close">
        <AppIcon name="close" :size="14" />
      </button>
    </div>
    <div class="modal-body">
      <div v-if="isLoading" class="loading">Loading…</div>
      <form v-else class="form" @submit.prevent="onSubmit">
        <div class="field full">
          <label>Promotion Name *</label>
          <InputText
            v-model="form.name"
            placeholder="e.g. Weekend Flash Sale"
            :class="{ 'p-invalid': fieldErrors.name }"
          />
          <small v-if="fieldErrors.name" class="err">{{ fieldErrors.name }}</small>
        </div>
        <div class="field">
          <label>Type</label>
          <Select
            v-model="form.type"
            :options="typeOptions"
            option-label="label"
            option-value="value"
          />
        </div>
        <div class="field">
          <label>Value *</label>
          <InputNumber
            v-model="form.value"
            :min="0"
            :class="{ 'p-invalid': fieldErrors.value }"
          />
          <small v-if="fieldErrors.value" class="err">{{ fieldErrors.value }}</small>
        </div>
        <div class="field">
          <label>Applies To</label>
          <Select
            v-model="form.scope"
            :options="scopeOptions"
            option-label="label"
            option-value="value"
          />
        </div>
        <div class="field">
          <label>Target</label>
          <InputText v-model="form.appliesTo" placeholder="e.g. Beverages, All products" />
        </div>
        <div class="field">
          <label>Min. Purchase (Rp)</label>
          <InputNumber
            v-model="form.minPurchase"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            :min="0"
          />
        </div>
        <div class="field">
          <label>Start Date *</label>
          <DatePicker
            v-model="startDateProxy"
            date-format="M d, yy"
            :show-icon="true"
            :class="{ 'p-invalid': fieldErrors.startDate }"
          />
          <small v-if="fieldErrors.startDate" class="err">{{ fieldErrors.startDate }}</small>
        </div>
        <div class="field">
          <label>End Date *</label>
          <DatePicker
            v-model="endDateProxy"
            date-format="M d, yy"
            :show-icon="true"
            :class="{ 'p-invalid': fieldErrors.endDate }"
          />
          <small v-if="fieldErrors.endDate" class="err">{{ fieldErrors.endDate }}</small>
        </div>
        <Message v-if="error" severity="error" :closable="false" class="full">
          {{ error.message }}
        </Message>
      </form>
    </div>
    <div class="mestore-modal-foot">
      <Button label="Cancel" text severity="secondary" @click="close" />
      <Button
        :label="isEdit ? 'Save Changes' : 'Save Promotion'"
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
.field :deep(.p-select),
.field :deep(.p-datepicker) {
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