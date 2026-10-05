<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Select from 'primevue/select'
import Message from 'primevue/message'
import { useUserForm } from '../composables/useUserForm.js'
import { useToast } from '@/composables/useToast.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  userId: { type: [String, Number], default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const { push } = useToast()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const isEdit = computed(() => Boolean(props.userId))
const { form, isSubmitting, isLoading, error, fieldErrors, load, submit } = useUserForm(
  props.userId,
)

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Cashier', value: 'cashier' },
]

async function onSubmit() {
  const saved = await submit()
  if (saved) {
    push(isEdit.value ? 'User updated' : 'User added')
    emit('saved', saved)
    visible.value = false
  } else if (error.value) {
    push(error.value.message, { severity: 'error' })
  }
}

function close() {
  visible.value = false
}

function setStatus(value) {
  form.status = value
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
    :style="{ width: '600px' }"
    :header="isEdit ? 'Edit User' : 'Add User'"
  >
    <div v-if="isLoading" class="loading">Loading…</div>

    <form v-else class="form" @submit.prevent="onSubmit">
      <div class="field">
        <label>Full Name *</label>
        <InputText
          v-model="form.name"
          placeholder="e.g. Budi Santoso"
          :class="{ 'p-invalid': fieldErrors.name }"
        />
        <small v-if="fieldErrors.name" class="err">{{ fieldErrors.name }}</small>
      </div>

      <div class="field">
        <label>Username *</label>
        <InputText
          v-model="form.username"
          placeholder="e.g. budi"
          :class="{ 'p-invalid': fieldErrors.username }"
        />
        <small v-if="fieldErrors.username" class="err">{{ fieldErrors.username }}</small>
      </div>

      <div class="field">
        <label>{{ isEdit ? 'Reset Password (optional)' : 'Password *' }}</label>
        <Password
          v-model="form.password"
          :feedback="false"
          toggle-mask
          placeholder="Enter password"
          :class="{ 'p-invalid': fieldErrors.password }"
          input-class="w-full"
        />
        <small v-if="fieldErrors.password" class="err">{{ fieldErrors.password }}</small>
      </div>

      <div class="field">
        <label>Role *</label>
        <Select
          v-model="form.role"
          :options="roleOptions"
          option-label="label"
          option-value="value"
          placeholder="Select role"
        />
      </div>

      <div v-if="isEdit" class="field full">
        <label>Status</label>
        <div class="segmented">
          <button
            type="button"
            class="seg"
            :class="{ active: form.status === 'Active' }"
            @click="setStatus('Active')"
          >
            Active
          </button>
          <button
            type="button"
            class="seg"
            :class="{ active: form.status === 'Inactive' }"
            @click="setStatus('Inactive')"
          >
            Inactive
          </button>
        </div>
      </div>

      <Message v-if="error" severity="error" :closable="false" class="full">
        {{ error.message }}
      </Message>
    </form>

    <template #footer>
      <Button label="Cancel" text severity="secondary" @click="close" />
      <Button
        :label="isEdit ? 'Save Changes' : 'Save User'"
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
.field :deep(.p-password),
.field :deep(.p-select) {
  width: 100%;
}

.field :deep(.p-password-input) {
  width: 100%;
}

.segmented {
  display: inline-flex;
  gap: 8px;
}

.seg {
  padding: 8px 16px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  font-size: 12.5px;
  font-weight: 500;
  transition: all 120ms;
}

.seg.active {
  background: var(--primary);
  color: var(--primary-fg);
  border-color: var(--primary);
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