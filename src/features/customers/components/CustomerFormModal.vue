<script setup>
import { computed, onMounted, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useCustomerForm } from '../composables/useCustomerForm.js'
import { useToast } from '@/composables/useToast.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  customerId: { type: [String, Number], default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])
const { push } = useToast()
const visible = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
const isEdit = computed(() => Boolean(props.customerId))
const { form, isSubmitting, isLoading, error, fieldErrors, load, submit } = useCustomerForm(props.customerId)

async function onSubmit() {
  const saved = await submit()
  if (saved) {
    push(isEdit.value ? 'Customer updated' : 'Customer added')
    emit('saved', saved)
    visible.value = false
  } else if (error.value) {
    push(error.value.message, { severity: 'error' })
  }
}

function close() { visible.value = false }
watch(visible, async (open) => { if (open && isEdit.value) await load() })
onMounted(() => { if (visible.value && isEdit.value) load() })
</script>

<template>
  <Dialog v-model:visible="visible" modal :draggable="false" :style="{ width: '620px' }" :show-header="false">
    <div class="modal-head">
      <span class="head-icon"><AppIcon name="group" :size="20" /></span>
      <h2 class="head-title">{{ isEdit ? 'Edit Customer' : 'Add Customer' }}</h2>
      <button type="button" class="head-close" aria-label="Close" @click="close">
        <AppIcon name="close" :size="14" />
      </button>
    </div>
    <div class="modal-body">
      <div v-if="isLoading" class="loading">Loading…</div>
      <form v-else class="form" @submit.prevent="onSubmit">
        <div class="field full">
          <label>Customer Name *</label>
          <InputText v-model="form.name" placeholder="e.g. Ahmad Yusuf" :class="{ 'p-invalid': fieldErrors.name }" />
          <small v-if="fieldErrors.name" class="err">{{ fieldErrors.name }}</small>
        </div>
        <div class="field">
          <label>Phone *</label>
          <InputText v-model="form.phone" placeholder="+62 811 …" :class="{ 'p-invalid': fieldErrors.phone }" />
          <small v-if="fieldErrors.phone" class="err">{{ fieldErrors.phone }}</small>
        </div>
        <div class="field">
          <label>Email</label>
          <InputText v-model="form.email" type="email" placeholder="customer@email.com" />
        </div>
        <div class="field full">
          <label>Address</label>
          <InputText v-model="form.address" placeholder="Street address" />
        </div>
        <Message v-if="error" severity="error" :closable="false" class="full">{{ error.message }}</Message>
      </form>
    </div>
    <div class="mestore-modal-foot">
      <Button label="Cancel" text severity="secondary" @click="close" />
      <Button :label="isEdit ? 'Save Changes' : 'Save Customer'" icon="pi pi-check" :loading="isSubmitting" @click="onSubmit" />
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
.modal-body { padding: 22px; }
.loading { padding: 40px; text-align: center; color: var(--text-muted); }
.form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;
}
.field { display: flex; flex-direction: column; gap: 6px; }
.field.full { grid-column: 1 / -1; }
.field label {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-muted);
}
.field :deep(.p-inputtext) { width: 100%; }
.err { font-size: 11.5px; color: var(--danger); }
@media (max-width: 640px) {
  .form { grid-template-columns: 1fr; }
}
</style>