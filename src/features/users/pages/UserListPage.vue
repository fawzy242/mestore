<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import KPIBar from '@/components/ui/KPIBar.vue'
import KPIStat from '@/components/ui/KPIStat.vue'
import { CrudToolbar, CrudTabs, BulkActionBar } from '@/components/crud/index.js'
import UserTable from '../components/UserTable.vue'
import UserFormModal from '../components/UserFormModal.vue'
import UserViewModal from '../components/UserViewModal.vue'
import { useUsers } from '../composables/useUsers.js'
import { useDebouncedSearch } from '@/composables/useDebouncedSearch.js'
import { useToast } from '@/composables/useToast.js'
import { useConfirm } from '@/composables/useConfirm.js'

const { push } = useToast()
const { confirmAction } = useConfirm()

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
  bulkDelete,
  bulkSetStatus,
  applyFilter,
  setStatusTab,
  setSort,
  goToPage,
} = useUsers()

const activeTab = ref('Active')
const selectedKeys = ref([])

const roleOptions = [
  { value: '', label: 'All roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'cashier', label: 'Cashier' },
]

const formOpen = ref(false)
const formId = ref(null)
const viewOpen = ref(false)
const viewId = ref(null)
const refreshing = ref(false)

const tabs = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
]

const bulkActions = computed(() =>
  activeTab.value === 'Active'
    ? [
        { key: 'deactivate', label: 'Deactivate', icon: 'pi pi-ban', severity: 'danger' },
        { key: 'delete', label: 'Delete', icon: 'pi pi-trash', severity: 'danger' },
      ]
    : [
        { key: 'activate', label: 'Activate', icon: 'pi pi-check-circle', severity: 'success' },
        { key: 'delete', label: 'Delete', icon: 'pi pi-trash', severity: 'danger' },
      ],
)

const kpis = computed(() => {
  const active = rows.value.filter((u) => u.IsActive === 1).length
  const inactive = rows.value.length - active
  const cashiers = rows.value.filter((u) => u.role === 'cashier' && u.IsActive === 1).length
  return { total: total.value, active, inactive, cashiers }
})

const { value: searchValue } = useDebouncedSearch((v) => {
  filters.search = v
  applyFilter()
})

watch(() => filters.role, () => applyFilter())

function onTabChange(next) {
  activeTab.value = next
  selectedKeys.value = []
  setStatusTab(next)
}

async function onRefresh() {
  refreshing.value = true
  await fetchUsers()
  refreshing.value = false
}

function onPageChange(p) {
  goToPage(p)
  fetchUsers()
}

function openAdd() {
  formId.value = null
  formOpen.value = true
}
function openEdit(row) {
  formId.value = row.id
  formOpen.value = true
}
function openView(row) {
  viewId.value = row.id
  viewOpen.value = true
}

async function askDelete(row) {
  await confirmAction({
    header: 'Delete user?',
    message: `Delete "${row.name}"? This cannot be undone.`,
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    variant: 'danger',
    accept: async () => {
      await bulkDelete([row.id])
      selectedKeys.value = selectedKeys.value.filter((k) => k !== row.id)
      push('User deleted')
    },
  })
}

async function onBulkAction(key) {
  if (!selectedKeys.value.length) return
  const count = selectedKeys.value.length

  if (key === 'delete') {
    await confirmAction({
      header: 'Delete selected?',
      message: `Delete ${count} user(s)? This cannot be undone.`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      variant: 'danger',
      accept: async () => {
        await bulkDelete(selectedKeys.value)
        push(`${count} user${count === 1 ? '' : 's'} deleted`)
        selectedKeys.value = []
      },
    })
    return
  }

  const isActivate = key === 'activate'
  await confirmAction({
    header: isActivate ? 'Activate selected?' : 'Deactivate selected?',
    message: `${isActivate ? 'Activate' : 'Deactivate'} ${count} user(s)?`,
    acceptLabel: isActivate ? 'Activate' : 'Deactivate',
    rejectLabel: 'Cancel',
    variant: isActivate ? 'success' : 'danger',
    accept: async () => {
      await bulkSetStatus(selectedKeys.value, isActivate ? 'Active' : 'Inactive')
      push(`${count} user${count === 1 ? '' : 's'} ${isActivate ? 'activated' : 'deactivated'}`)
      selectedKeys.value = []
    },
  })
}

async function onSaved() {
  await fetchUsers()
}

onMounted(fetchUsers)
</script>

<template>
  <AppPageContainer>
    <KPIBar :columns="4">
      <KPIStat label="Total Accounts" :value="kpis.total" icon="person" tone="neutral" />
      <KPIStat label="Active Staff" :value="kpis.active" icon="verified-user" tone="success" />
      <KPIStat label="Deactivated" :value="kpis.inactive" icon="block" tone="neutral" />
      <KPIStat label="Active Cashiers" :value="kpis.cashiers" icon="point-of-sale" tone="primary" />
    </KPIBar>

    <CrudToolbar
      v-model:search="searchValue"
      search-placeholder="Search users…"
      add-label="Add User"
      :refreshing="refreshing"
      @refresh="onRefresh"
      @add="openAdd"
    >
      <template #filters>
        <AppSelect
          :model-value="filters.role"
          :options="roleOptions"
          @update:model-value="(v) => (filters.role = v)"
        />
      </template>
    </CrudToolbar>

    <CrudTabs :model-value="activeTab" :tabs="tabs" @update:model-value="onTabChange" />

    <BulkActionBar
      :count="selectedKeys.length"
      :actions="bulkActions"
      @action="onBulkAction"
      @clear="selectedKeys = []"
    />

    <UserTable
      :rows="rows"
      :loading="loading"
      :error="error"
      :pagination="{ page, pageSize, total, pageCount }"
      :sort-key="sort.key"
      :sort-dir="sort.dir"
      :selectable="true"
      :selected-keys="selectedKeys"
      @update:selected-keys="(v) => (selectedKeys = v)"
      @view="openView"
      @edit="openEdit"
      @delete="askDelete"
      @page-change="onPageChange"
      @sort-change="setSort"
      @retry="fetchUsers"
    />

    <p class="page-footer">
      Showing <span class="mono">{{ rows.length }}</span> of
      <span class="mono">{{ total }}</span> {{ activeTab.toLowerCase() }} users
    </p>

    <UserFormModal v-model="formOpen" :user-id="formId" @saved="onSaved" />
    <UserViewModal v-model="viewOpen" :user-id="viewId" @edit="openEdit" />
  </AppPageContainer>
</template>

<style scoped>
.page-footer {
  text-align: right;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 10px;
}
</style>