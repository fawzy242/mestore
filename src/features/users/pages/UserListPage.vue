<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppToolbar from '@/components/ui/AppToolbar.vue'
import AppSearchInput from '@/components/ui/AppSearchInput.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import KPIBar from '@/components/ui/KPIBar.vue'
import KPIStat from '@/components/ui/KPIStat.vue'
import UserTable from '../components/UserTable.vue'
import UserFormModal from '../components/UserFormModal.vue'
import UserViewModal from '../components/UserViewModal.vue'
import { useUsers } from '../composables/useUsers.js'
import { useDebouncedSearch } from '@/composables/useDebouncedSearch.js'
import { useToast } from '@/composables/useToast.js'
import { useConfirm } from '@/composables/useConfirm.js'

const router = useRouter()
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
  deactivate,
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

const formModalOpen = ref(false)
const formUserId = ref(null)
const viewModalOpen = ref(false)
const viewUserId = ref(null)

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

function onTabChange(next) {
  activeTab.value = next
  selectedKeys.value = []
  setStatusTab(next)
}

function openAdd() {
  formUserId.value = null
  formModalOpen.value = true
}

function openEdit(row) {
  formUserId.value = row.id
  formModalOpen.value = true
}

function openView(row) {
  viewUserId.value = row.id
  viewModalOpen.value = true
}

function editFromView(id) {
  viewModalOpen.value = false
  formUserId.value = id
  formModalOpen.value = true
}

function onPageChange(p) {
  goToPage(p)
  fetchUsers()
}

async function askDeactivate(row) {
  await confirmAction({
    header: 'Deactivate user?',
    message: `Deactivate "${row.name}"? They will no longer be able to log in. Their transaction history is kept.`,
    acceptLabel: 'Deactivate',
    rejectLabel: 'Cancel',
    variant: 'danger',
    accept: async () => {
      await deactivate(row.id)
      selectedKeys.value = selectedKeys.value.filter((k) => k !== row.id)
      push('User deactivated')
    },
  })
}

async function bulkDeactivate() {
  if (!selectedKeys.value.length) return
  const count = selectedKeys.value.length
  await confirmAction({
    header: 'Deactivate selected users?',
    message: `Deactivate ${count} selected user(s)?`,
    acceptLabel: 'Deactivate',
    rejectLabel: 'Cancel',
    variant: 'danger',
    accept: async () => {
      await bulkSetStatus(selectedKeys.value, 'Inactive')
      push(`${count} users deactivated`)
      selectedKeys.value = []
    },
  })
}

async function bulkActivate() {
  if (!selectedKeys.value.length) return
  const count = selectedKeys.value.length
  await confirmAction({
    header: 'Activate selected users?',
    message: `Activate ${count} selected user(s)?`,
    acceptLabel: 'Activate',
    rejectLabel: 'Cancel',
    variant: 'success',
    accept: async () => {
      await bulkSetStatus(selectedKeys.value, 'Active')
      push(`${count} users activated`)
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
    <div class="mestore-tabs">
      <button
        type="button"
        class="mestore-tab"
        :class="{ active: activeTab === 'Active' }"
        @click="onTabChange('Active')"
      >
        Active
      </button>
      <button
        type="button"
        class="mestore-tab"
        :class="{ active: activeTab === 'Inactive' }"
        @click="onTabChange('Inactive')"
      >
        Inactive
      </button>
    </div>

    <KPIBar :columns="4">
      <KPIStat label="Total Accounts" :value="kpis.total" icon="person" tone="neutral" />
      <KPIStat label="Active Staff" :value="kpis.active" icon="verified-user" tone="success" />
      <KPIStat label="Deactivated" :value="kpis.inactive" icon="block" tone="neutral" />
      <KPIStat label="Active Cashiers" :value="kpis.cashiers" icon="point-of-sale" tone="primary" />
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
        <Button label="Add User" icon="pi pi-plus" @click="openAdd" />
      </template>
    </AppToolbar>

    <div v-if="selectedKeys.length" class="bulk-bar">
      <span class="bulk-count">{{ selectedKeys.length }} selected</span>
      <Button
        v-if="activeTab === 'Active'"
        label="Deactivate"
        icon="pi pi-ban"
        severity="danger"
        outlined
        size="small"
        @click="bulkDeactivate"
      />
      <Button
        v-else
        label="Activate"
        icon="pi pi-check-circle"
        severity="success"
        outlined
        size="small"
        @click="bulkActivate"
      />
      <Button
        label="Clear"
        icon="pi pi-times"
        text
        severity="secondary"
        size="small"
        @click="selectedKeys = []"
      />
    </div>

    <UserTable
      :rows="rows"
      :loading="loading"
      :error="error"
      :pagination="{ page, pageSize, total, pageCount }"
      :sort-key="sort.key"
      :sort-dir="sort.dir"
      selectable
      :selected-keys="selectedKeys"
      @update:selected-keys="(v) => (selectedKeys = v)"
      @view="openView"
      @edit="openEdit"
      @deactivate="askDeactivate"
      @page-change="onPageChange"
      @sort-change="setSort"
      @retry="fetchUsers"
    />

    <p class="page-footer">
      Showing <span class="mono">{{ rows.length }}</span> of
      <span class="mono">{{ total }}</span> {{ activeTab.toLowerCase() }} users
    </p>

    <UserFormModal
      v-model="formModalOpen"
      :user-id="formUserId"
      @saved="onSaved"
    />
    <UserViewModal
      v-model="viewModalOpen"
      :user-id="viewUserId"
      @edit="editFromView"
    />
  </AppPageContainer>
</template>

<style scoped>
.bulk-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--primary-tint);
  border: 1px solid var(--primary);
  border-radius: var(--radius-md);
  margin-bottom: 12px;
}

.bulk-count {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  margin-right: auto;
}

.page-footer {
  text-align: right;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 10px;
}
</style>