<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import AppDetailRow from '@/components/ui/AppDetailRow.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'
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
    header="User Detail"
  >
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
        <StatusPill :variant="user.status === 'Active' ? 'success' : 'neutral'">
          {{ user.status }}
        </StatusPill>
      </div>

      <div class="details">
        <AppDetailRow label="Role">
          {{ user.role.charAt(0).toUpperCase() + user.role.slice(1) }}
        </AppDetailRow>
        <AppDetailRow label="Status">{{ user.status }}</AppDetailRow>
      </div>
    </div>

    <template #footer>
      <Button label="Close" text severity="secondary" @click="visible = false" />
      <Button label="Edit" icon="pi pi-pencil" @click="edit" />
    </template>
  </Dialog>
</template>

<style scoped>
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