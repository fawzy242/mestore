<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Select from 'primevue/select'
import Message from 'primevue/message'
import AppIcon from '@/components/ui/AppIcon.vue'
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
    :show-header="false"
  >
    <div class="modal-head">
      <span class="head-icon">
        <AppIcon name="person" :size="20" />
      </span>
      <h2 class="head-title">{{ isEdit ? 'Edit User' : 'Add User' }}</h2>
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
    </div>

    <div class="mestore-modal-foot">
      <Button label="Cancel" text severity="secondary" @click="close" />
      <Button
        :label="isEdit ? 'Save Changes' : 'Save User'"
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
  cursor: pointer;
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