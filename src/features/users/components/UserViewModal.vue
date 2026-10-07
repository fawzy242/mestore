<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import AppDetailRow from '@/components/ui/AppDetailRow.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import * as usersService from '@/services/api/users.service.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  userId: { type: [String, Number], default: null },
})

const emit = defineEmits(['update:modelValue', 'edit'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const user = ref(null)
const loading = ref(false)

const isActive = computed(() => user.value?.IsActive === 1)

async function load() {
  if (!props.userId) return
  loading.value = true
  try {
    user.value = await usersService.getUserById(props.userId)
  } finally {
    loading.value = false
  }
}

function edit() {
  const id = user.value?.id
  visible.value = false
  emit('edit', id)
}

function close() {
  visible.value = false
}

watch(
  () => [visible.value, props.userId],
  ([open]) => {
    if (open) load()
  },
)

onMounted(() => {
  if (visible.value) load()
})
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    :style="{ width: '520px' }"
    :show-header="false"
  >
    <div class="modal-head">
      <span class="head-icon">
        <AppIcon name="person" :size="20" />
      </span>
      <h2 class="head-title">User Detail</h2>
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
      <div v-if="loading" class="loading">
        <AppSpinner />
      </div>

      <div v-else-if="user" class="body">
        <div class="user-head">
          <AvatarInitials :name="user.name" :size="56" tone="primary" />
          <div class="user-head-text">
            <h3 class="user-name">{{ user.name }}</h3>
            <span class="user-username mono">@{{ user.username }}</span>
          </div>
          <StatusPill :variant="isActive ? 'success' : 'neutral'">
            {{ isActive ? 'Active' : 'Inactive' }}
          </StatusPill>
        </div>

        <div class="details">
          <AppDetailRow label="Role">
            {{ user.role.charAt(0).toUpperCase() + user.role.slice(1) }}
          </AppDetailRow>
          <AppDetailRow label="Status">
            {{ isActive ? 'Active' : 'Inactive' }}
          </AppDetailRow>
        </div>
      </div>
    </div>

    <div class="mestore-modal-foot">
      <Button label="Close" text severity="secondary" @click="close" />
      <Button label="Edit" icon="pi pi-pencil" @click="edit" />
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
  display: flex;
  justify-content: center;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.user-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}
.user-head-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.user-name {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
}
.user-username {
  font-size: 13px;
  color: var(--text-muted);
}
.details {
  display: flex;
  flex-direction: column;
}
</style>