<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppPageHeader from '@/components/ui/AppPageHeader.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useUserForm } from '../composables/useUserForm.js'
import { useToast } from '@/composables/useToast.js'
import { useUnsavedChangesConfirm } from '@/composables/useUnsavedChangesConfirm.js'

const route = useRoute()
const router = useRouter()
const { push } = useToast()
const userId = computed(() => route.params.id || null)
const { form, isEdit, isSubmitting, isLoading, fieldErrors, load, submit } =
  useUserForm(userId.value)

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'cashier', label: 'Cashier' },
]

const { state: dirtyState, confirmDiscard } = useUnsavedChangesConfirm()
const initialSnapshot = ref('')

function snapshot() {
  return JSON.stringify({
    name: form.name,
    username: form.username,
    password: form.password,
    role: form.role,
    status: form.status,
  })
}

async function onSubmit() {
  const saved = await submit()
  if (saved) {
    push(isEdit.value ? 'User updated' : 'User added')
    router.push({ name: 'users.list' })
  }
}

async function cancel() {
  const dirty = snapshot() !== initialSnapshot.value
  const ok = await confirmDiscard(dirty)
  if (ok) router.push({ name: 'users.list' })
}

function setStatus(value) {
  form.status = value
}

onMounted(async () => {
  await load()
  initialSnapshot.value = snapshot()
})
</script>

<template>
  <AppPageContainer>
    <AppCard padded>
      <AppPageHeader :title="isEdit ? 'Edit User' : 'Add User'" />

      <AppSpinner v-if="isLoading" />

      <form v-else class="form-grid" @submit.prevent="onSubmit">
        <AppInput
          v-model="form.name"
          label="Full Name"
          placeholder="e.g. Budi Santoso"
          :error="fieldErrors.name"
        />
        <AppInput
          v-model="form.username"
          label="Username"
          placeholder="e.g. budi"
          :error="fieldErrors.username"
        />
        <AppInput
          v-model="form.password"
          :label="isEdit ? 'Reset Password (optional)' : 'Password'"
          type="password"
          placeholder="••••••••"
          :error="fieldErrors.password"
        />
        <AppSelect v-model="form.role" label="Role" :options="roleOptions" />

        <div v-if="isEdit" class="status-field">
          <label class="field-label">Status</label>
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

        <div class="actions">
          <AppButton variant="secondary" @click="cancel">Cancel</AppButton>
          <AppButton variant="primary" type="submit" :loading="isSubmitting">
            Save User
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
.status-field,
.actions {
  grid-column: 1 / -1;
}
.field-label {
  display: block;
  font-size: 12.5px;
  color: var(--color-ink-soft);
  margin-bottom: 5px;
  font-weight: 500;
}
.segmented {
  display: inline-flex;
  gap: 6px;
}
.seg {
  font-size: 12.5px;
  padding: 7px 14px;
  border-radius: 20px;
  border: 1px solid var(--color-line);
  background: var(--color-surface);
  color: var(--color-ink-soft);
}
.seg.active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
.actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
</style>