<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppDetailRow from '@/components/ui/AppDetailRow.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useUserDetail } from '../composables/useUserDetail.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog.js'
import { useToast } from '@/composables/useToast.js'
import * as usersService from '@/services/api/users.service.js'

const route = useRoute()
const router = useRouter()
const { push } = useToast()
const userId = computed(() => route.params.id)
const { user, loading, error, fetchUser } = useUserDetail(userId.value)

const { state: confirmState, open: openConfirm, confirm: confirmOk, close: confirmCancel } =
  useConfirmDialog()

function goEdit() {
  router.push({ name: 'users.edit', params: { id: user.value.id } })
}

async function askDeactivate() {
  const ok = await openConfirm({
    title: 'Deactivate user?',
    message: `Deactivate "${user.value.name}"? They will no longer be able to log in. Their transaction history is kept.`,
    confirmLabel: 'Deactivate',
    variant: 'danger',
  })
  if (!ok) return
  await usersService.deactivateUser(user.value.id)
  push('User deactivated')
  router.push({ name: 'users.list' })
}

onMounted(fetchUser)
</script>

<template>
  <AppPageContainer max-width="520px">
    <AppCard padded>
      <AppAlert v-if="error" variant="error" :message="error.message" retry-label="Retry" @retry="fetchUser" />
      <AppSpinner v-else-if="loading" />
      <template v-else-if="user">
        <AppDetailRow label="Name">{{ user.name }}</AppDetailRow>
        <AppDetailRow label="Username" mono>@{{ user.username }}</AppDetailRow>
        <AppDetailRow label="Role">
          {{ user.role.charAt(0).toUpperCase() + user.role.slice(1) }}
        </AppDetailRow>
        <AppDetailRow label="Status">
          <AppBadge :variant="user.status === 'Active' ? 'success' : 'inactive'">
            {{ user.status }}
          </AppBadge>
        </AppDetailRow>

        <div class="actions">
          <AppButton variant="secondary" @click="goEdit">Edit</AppButton>
          <AppButton variant="danger" @click="askDeactivate">Deactivate</AppButton>
        </div>
      </template>
    </AppCard>

    <ConfirmDialog
      :model-value="confirmState.isOpen.value"
      :title="confirmState.title.value"
      :message="confirmState.message.value"
      :confirm-label="confirmState.confirmLabel.value"
      :variant="confirmState.variant.value"
      @update:model-value="(v) => !v && confirmCancel()"
      @confirm="confirmOk"
    />
  </AppPageContainer>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}
</style>