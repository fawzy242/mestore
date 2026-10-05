<script setup>
import { computed, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAuthStore } from '@/stores/auth.store.js'
import { useToast } from '@/composables/useToast.js'
import { useLocalStorage } from '@vueuse/core'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const auth = useAuthStore()
const { push } = useToast()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

// Persist profile extras locally for the mock
const profileExtras = useLocalStorage('mestore.profileExtras', {
  email: '',
  phone: '',
  photoDataUrl: '',
})

const form = ref({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  photoDataUrl: '',
})

const fileInput = ref(null)

watch(
  () => visible.value,
  (open) => {
    if (!open) return
    form.value = {
      username: auth.user?.username || '',
      email: profileExtras.value.email || '',
      phone: profileExtras.value.phone || '',
      password: '',
      confirmPassword: '',
      photoDataUrl: profileExtras.value.photoDataUrl || '',
    }
  },
  { immediate: true },
)

function pickPhoto() {
  fileInput.value?.click()
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form.value.photoDataUrl = String(reader.result)
  }
  reader.readAsDataURL(file)
}

function save() {
  if (form.value.password && form.value.password !== form.value.confirmPassword) {
    push('Passwords do not match', { severity: 'error' })
    return
  }
  // Persist
  profileExtras.value = {
    email: form.value.email,
    phone: form.value.phone,
    photoDataUrl: form.value.photoDataUrl,
  }
  if (auth.user) {
    auth.user.username = form.value.username
  }
  push('Profile updated')
  visible.value = false
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    :style="{ width: '560px' }"
    header="Manage Profile"
  >
    <div class="body">
      <!-- Avatar + photo uploader -->
      <div class="avatar-row">
        <div class="avatar-wrap" @click="pickPhoto">
          <img
            v-if="form.photoDataUrl"
            :src="form.photoDataUrl"
            class="avatar-img"
            alt="Profile photo"
          />
          <AvatarInitials
            v-else
            :name="auth.user?.name || ''"
            :size="72"
            tone="primary"
          />
          <span class="avatar-overlay">
            <AppIcon name="photo-camera" :size="20" />
          </span>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="file-input"
          @change="onFileChange"
        />
        <div class="avatar-text">
          <span class="avatar-name">{{ auth.user?.name }}</span>
          <span class="avatar-role">{{ auth.user?.role }}</span>
          <button type="button" class="upload-btn" @click="pickPhoto">
            Change photo
          </button>
        </div>
      </div>

      <div class="grid">
        <div class="field">
          <label>Username</label>
          <InputText v-model="form.username" placeholder="e.g. fawzy" />
        </div>

        <div class="field">
          <label>Email</label>
          <InputText
            v-model="form.email"
            type="email"
            placeholder="you@example.com"
          />
        </div>

        <div class="field">
          <label>Phone Number</label>
          <InputText
            v-model="form.phone"
            type="tel"
            placeholder="+62 812 3456 7890"
          />
        </div>

        <div class="field">
          <label>New Password</label>
          <Password
            v-model="form.password"
            :feedback="false"
            toggle-mask
            placeholder="Leave blank to keep current"
            input-class="w-full"
            class="w-full"
          />
        </div>

        <div class="field field-full">
          <label>Confirm New Password</label>
          <Password
            v-model="form.confirmPassword"
            :feedback="false"
            toggle-mask
            placeholder="Repeat new password"
            input-class="w-full"
            class="w-full"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" text severity="secondary" @click="visible = false" />
      <Button label="Save Changes" icon="pi pi-check" @click="save" />
    </template>
  </Dialog>
</template>

<style scoped>
.body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.avatar-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--border);
}

.avatar-wrap {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  background: var(--surface-hover);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 120ms;
}

.avatar-wrap:hover .avatar-overlay {
  opacity: 1;
}

.file-input {
  display: none;
}

.avatar-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.avatar-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.avatar-role {
  font-size: 12px;
  text-transform: capitalize;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.upload-btn {
  background: transparent;
  border: 1px solid var(--border);
  padding: 5px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
  width: fit-content;
  cursor: pointer;
}

.upload-btn:hover {
  background: var(--surface-hover);
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-full {
  grid-column: 1 / -1;
}

.field label {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-muted);
}

.field :deep(.p-inputtext),
.field :deep(.p-password),
.field :deep(.p-password-input) {
  width: 100%;
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>