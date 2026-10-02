<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppToolbar from '@/components/ui/AppToolbar.vue'
import AppSearchInput from '@/components/ui/AppSearchInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppButton from '@/components/ui/AppButton.vue'
import KPIBar from '@/components/ui/KPIBar.vue'
import KPIStat from '@/components/ui/KPIStat.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconPerson from '@/components/icons/IconPerson.vue'
import IconVerifiedUser from '@/components/icons/IconVerifiedUser.vue'
import IconBlock from '@/components/icons/IconBlock.vue'
import IconPointOfSale from '@/components/icons/IconPointOfSale.vue'
import UserTable from '../components/UserTable.vue'
import { useUsers } from '../composables/useUsers.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog.js'
import { useDebouncedSearch } from '@/composables/useDebouncedSearch.js'
import { useToast } from '@/composables/useToast.js'
import * as usersService from '@/services/api/users.service.js'

const router = useRouter()
const { push } = useToast()
const {
  rows,
  loading,
  error,
  filters,
  sort,
  page,
  pageSize,
  total,
  pageCount,
  fetchUsers,
  deactivate,
  applyFilter,
  setSort,
  goToPage,
} = useUsers()

const roleOptions = [
  { value: '', label: 'All roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'cashier', label: 'Cashier' },
]

const { state: confirmState, open: openConfirm, confirm: confirmOk, close: confirmCancel } =
  useConfirmDialog()
let pending = null

const kpis = computed(() => {
  const active = rows.value.filter((u) => u.status === 'Active').length
  const inactive = rows.value.length - active
  const cashiers = rows.value.filter((u) => u.role === 'cashier' && u.status === 'Active').length
  return { total: total.value, active, inactive, cashiers }
})

const { value: searchValue } = useDebouncedSearch((v) => {
  filters.search = v
  applyFilter()
})

watch(
  () => filters.role,
  () => applyFilter(),
)

function goNew() {
  router.push({ name: 'users.new' })
}
function goEdit(row) {
  router.push({ name: 'users.edit', params: { id: row.id } })
}
function goDetail(row) {
  router.push({ name: 'users.detail', params: { id: row.id } })
}

function onPageChange(p) {
  goToPage(p)
  fetchUsers()
}

async function askDeactivate(row) {
  pending = row
  const ok = await openConfirm({
    title: 'Deactivate user?',
    message: `Deactivate "${row.name}"? They will no longer be able to log in. Their transaction history is kept.`,
    confirmLabel: 'Deactivate',
    variant: 'danger',
  })
  if (ok && pending) {
    await deactivate(pending.id)
    push('User deactivated')
    pending = null
  }
}

async function reactivate(row) {
  await usersService.updateUser(row.id, { status: 'Active' })
  push('User reactivated')
  await fetchUsers()
}

onMounted(fetchUsers)
</script>

<template>
  <AppPageContainer>
    <KPIBar :columns="4">
      <KPIStat label="Total Accounts" :value="kpis.total" :icon="IconPerson" tone="neutral" />
      <KPIStat label="Active Staff" :value="kpis.active" :icon="IconVerifiedUser" tone="success" />
      <KPIStat label="Deactivated" :value="kpis.inactive" :icon="IconBlock" tone="neutral" />
      <KPIStat label="Active Cashiers" :value="kpis.cashiers" :icon="IconPointOfSale" tone="primary" />
    </KPIBar>

    <AppToolbar>
      <template #search>
        <AppSearchInput v-model="searchValue" placeholder="Search users…" />
      </template>
      <template #filters>
        <AppSelect
          :model-value="filters.role"
          :options="roleOptions"
          @update:model-value="(v) => (filters.role = v)"
        />
      </template>
      <template #actions>
        <AppButton variant="primary" @click="goNew">
          <IconPlus /> Add User
        </AppButton>
      </template>
    </AppToolbar>

    <UserTable
      :rows="rows"
      :loading="loading"
      :error="error"
      :pagination="{ page, pageSize, total, pageCount }"
      :sort-key="sort.key"
      :sort-dir="sort.dir"
      @view="goDetail"
      @edit="goEdit"
      @deactivate="askDeactivate"
      @reactivate="reactivate"
      @page-change="onPageChange"
      @sort-change="setSort"
      @retry="fetchUsers"
    />

    <p class="page-footer">
      Showing <span class="mono">{{ rows.length }}</span> of
      <span class="mono">{{ total }}</span> users
    </p>

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
.page-footer {
  text-align: right;
  font-size: 12px;
  color: var(--color-ink-soft);
  margin-top: 10px;
}
</style>