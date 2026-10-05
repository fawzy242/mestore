<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import { useConfirm } from 'primevue/useconfirm'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppDetailRow from '@/components/ui/AppDetailRow.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import UserFormModal from '../components/UserFormModal.vue'
import { useUserDetail } from '../composables/useUserDetail.js'
import { useToast } from '@/composables/useToast.js'
import * as usersService from '@/services/api/users.service.js'

const route = useRoute()
const router = useRouter()
const confirm = useConfirm()
const { push } = useToast()

const userId = computed(() => route.params.id)
const { user, loading, error, fetchUser } = useUserDetail(userId.value)

const modalOpen = ref(false)

function openEdit() {
  modalOpen.value = true
}

function askDeactivate() {
  confirm.require({
    header: 'Deactivate user?',
    message: `Deactivate "${user.value.name}"? They will no longer be able to log in. Their transaction history is kept.`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Deactivate',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await usersService.deactivateUser(user.value.id)
      push('User deactivated')
      router.push({ name: 'users.list' })
    },
  })
}

async function onSaved() {
  await fetchUser()
}

onMounted(fetchUser)
</script>

<template>
  <AppPageContainer max-width="720px">
    <AppCard padded>
      <AppAlert
        v-if="error"
        variant="error"
        :message="error.message"
        retry-label="Retry"
        @retry="fetchUser"
      />
      <AppSpinner v-else-if="loading" />
      <template v-else-if="user">
        <div class="header">
          <AvatarInitials :name="user.name" :size="52" tone="primary" />
          <div class="header-text">
            <h2 class="title">{{ user.name }}</h2>
            <span class="username mono">@{{ user.username }}</span>
          </div>
        </div>

        <AppDetailRow label="Role">
          {{ user.role.charAt(0).toUpperCase() + user.role.slice(1) }}
        </AppDetailRow>
        <AppDetailRow label="Status">
          <StatusPill :variant="user.status === 'Active' ? 'success' : 'neutral'">
            {{ user.status }}
          </StatusPill>
        </AppDetailRow>

        <div class="actions">
          <Button label="Edit" icon="pi pi-pencil" outlined @click="openEdit" />
          <Button
            v-if="user.status === 'Active'"
            label="Deactivate"
            icon="pi pi-ban"
            severity="danger"
            @click="askDeactivate"
          />
        </div>
      </template>
    </AppCard>

    <UserFormModal v-model="modalOpen" :user-id="userId" @saved="onSaved" />
  </AppPageContainer>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}

.username {
  font-size: 13px;
  color: var(--text-muted);
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}
</style>