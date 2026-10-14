<script setup>
import { computed, onMounted, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import DatePicker from 'primevue/datepicker'
import Message from 'primevue/message'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useRefundForm } from '../composables/useRefundForm.js'
import { useToast } from '@/composables/useToast.js'
import { formatRupiah } from '@/composables/useFormatters.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  refundId: { type: [String, Number], default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])
const { push } = useToast()
const visible = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
const isEdit = computed(() => Boolean(props.refundId))
const { form, isSubmitting, isLoading, error, fieldErrors, load, submit, reset, addItem, removeItem } =
  useRefundForm(props.refundId)

const statusOptions = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Completed', value: 'Completed' },
]

const total = computed(() =>
  form.items.reduce((sum, i) => sum + (Number(i.qty) || 0) * (Number(i.price) || 0), 0),
)

function parseDate(str) {
  if (!str) return null
  const d = new Date(str)
  return Number.isNaN(d.getTime()) ? null : d
}
function fmtDate(d) {
  if (!d) return ''
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const dateProxy = computed({
  get: () => parseDate(form.date),
  set: (v) => {
    form.date = fmtDate(v)
  },
})

async function onSubmit() {
  const saved = await submit()
  if (saved) {
    push(isEdit.value ? 'Refund updated' : 'Refund created')
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
  reset()
  if (isEdit.value) {
    await load()
  } else {
    addItem()
    form.date = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }
})

onMounted(() => {
  if (!visible.value) return
  reset()
  if (isEdit.value) {
    load()
  } else {
    addItem()
    form.date = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }
})
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    :style="{ width: '720px' }"
    :show-header="false"
  >
    <div class="modal-head">
      <span class="head-icon"><AppIcon name="assignment-return" :size="20" /></span>
      <h2 class="head-title">{{ isEdit ? 'Edit Refund' : 'New Refund' }}</h2>
      <button type="button" class="head-close" aria-label="Close" @click="close">
        <AppIcon name="close" :size="14" />
      </button>
    </div>

    <div class="modal-body">
      <div v-if="isLoading" class="loading">Loading…</div>
      <form v-else class="form" @submit.prevent="onSubmit">
        <div class="field">
          <label>Original Receipt *</label>
          <InputText
            v-model="form.originalTxId"
            placeholder="e.g. RC-0192"
            :class="{ 'p-invalid': fieldErrors.originalTxId }"
          />
          <small v-if="fieldErrors.originalTxId" class="err">{{ fieldErrors.originalTxId }}</small>
        </div>
        <div class="field">
          <label>Customer Name</label>
          <InputText v-model="form.customerName" placeholder="e.g. Walk-in / Member (C-0042)" />
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
        <div class="field">
          <label>Refund Date</label>
          <DatePicker
            v-model="dateProxy"
            date-format="M d, yy"
            :show-icon="true"
            :class="{ 'p-invalid': fieldErrors.date }"
          />
          <small v-if="fieldErrors.date" class="err">{{ fieldErrors.date }}</small>
        </div>

        <div class="items-block full">
          <div class="items-head">
            <span class="items-title">Refunded Items</span>
            <Button label="Add Item" icon="pi pi-plus" size="small" outlined @click="addItem" />
          </div>

          <div class="item-head-row">
            <span>Name</span>
            <span>Qty</span>
            <span>Price</span>
            <span class="ar">Total</span>
            <span></span>
          </div>

          <div v-for="(item, i) in form.items" :key="i" class="item-row-wrap">
            <div class="item-row">
              <InputText
                v-model="item.name"
                placeholder="Item name"
                class="item-name"
                :class="{ 'p-invalid': fieldErrors[`item-name-${i}`] }"
              />
              <InputNumber
                v-model="item.qty"
                :min="1"
                placeholder="Qty"
                class="item-qty"
                :class="{ 'p-invalid': fieldErrors[`item-qty-${i}`] }"
              />
              <InputNumber
                v-model="item.price"
                mode="currency"
                currency="IDR"
                locale="id-ID"
                :min="0"
                class="item-price"
                :class="{ 'p-invalid': fieldErrors[`item-price-${i}`] }"
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
            <div
              v-if="
                fieldErrors[`item-name-${i}`] ||
                fieldErrors[`item-qty-${i}`] ||
                fieldErrors[`item-price-${i}`]
              "
              class="item-errors"
            >
              <small v-if="fieldErrors[`item-name-${i}`]" class="err">
                {{ fieldErrors[`item-name-${i}`] }}
              </small>
              <small v-if="fieldErrors[`item-qty-${i}`]" class="err">
                {{ fieldErrors[`item-qty-${i}`] }}
              </small>
              <small v-if="fieldErrors[`item-price-${i}`]" class="err">
                {{ fieldErrors[`item-price-${i}`] }}
              </small>
            </div>
          </div>

          <small v-if="fieldErrors.items" class="err">{{ fieldErrors.items }}</small>
        </div>

        <div class="total-row full">
          <span>Refund Amount</span>
          <span class="mono total-value">{{ formatRupiah(total) }}</span>
        </div>

        <div class="field full">
          <label>Reason *</label>
          <InputText
            v-model="form.reason"
            placeholder="e.g. Damaged packaging, wrong item"
            :class="{ 'p-invalid': fieldErrors.reason }"
          />
          <small v-if="fieldErrors.reason" class="err">{{ fieldErrors.reason }}</small>
        </div>

        <Message v-if="error" severity="error" :closable="false" class="full">
          {{ error.message }}
        </Message>
      </form>
    </div>

    <div class="mestore-modal-foot">
      <Button label="Cancel" text severity="secondary" @click="close" />
      <Button
        :label="isEdit ? 'Save Changes' : 'Create Refund'"
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
  flex-shrink: 0;
}
.head-close:hover {
  background: var(--surface-hover);
  color: var(--text);
}
.modal-body {
  padding: 22px;
  max-height: 70vh;
  overflow-y: auto;
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
  min-width: 0;
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
  gap: 10px;
}
.items-title {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.item-head-row,
.item-row {
  display: grid;
  grid-template-columns: 2fr 80px 120px 120px 36px;
  gap: 8px;
  align-items: center;
}
.item-head-row {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  padding: 0 2px;
}
.item-head-row .ar {
  text-align: right;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-row-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.item-errors {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  padding-left: 2px;
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
  .modal-body {
    padding: 16px;
  }
  .form {
    grid-template-columns: 1fr;
  }
  .item-head-row,
  .item-row {
    grid-template-columns: 1.4fr 60px 90px 90px 30px;
    gap: 6px;
  }
  .item-total {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .item-head-row {
    display: none;
  }
  .item-row {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      'name name'
      'qty price'
      'total remove';
    gap: 8px;
    padding: 10px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }
  .item-row .item-name {
    grid-area: name;
  }
  .item-row .item-qty {
    grid-area: qty;
  }
  .item-row .item-price {
    grid-area: price;
  }
  .item-row .item-total {
    grid-area: total;
    text-align: left;
    align-self: center;
    padding-left: 2px;
  }
  .item-row > :deep(.p-button) {
    grid-area: remove;
    justify-self: end;
  }
  .items-block {
    padding: 10px;
  }
  .total-row {
    padding: 10px 12px;
    font-size: 13px;
  }
  .total-value {
    font-size: 16px;
  }
}
</style>