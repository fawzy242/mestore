import { ref, reactive } from 'vue'
import * as usersService from '@/services/api/users.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'
import { usePagination } from '@/composables/usePagination.js'

export function useUsers() {
  const rows = ref([])
  const loading = ref(false)
  const error = ref(null)
  const filters = reactive({ search: '', role: '', isActive: true })
  const sort = reactive({ key: '', dir: 'asc' })
  const { page, pageSize, total, pageCount, setTotal, goToPage, reset } =
    usePagination({ pageSize: 10 })

  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      const result = await usersService.getUsers({
        search: filters.search,
        role: filters.role,
        isActive: filters.isActive,
        page: page.value,
        pageSize: pageSize.value,
        sortKey: sort.key,
        sortDir: sort.dir,
      })
      rows.value = result.items
      setTotal(result.total)
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      loading.value = false
    }
  }

  async function removeUser(id) {
    await usersService.deleteUser(id)
    if (rows.value.length === 1 && page.value > 1) {
      goToPage(page.value - 1)
    }
    await fetchUsers()
  }

  async function bulkSetStatus(ids, status) {
    await usersService.bulkUpdateUserStatus(ids, status)
    await fetchUsers()
  }

  async function bulkDelete(ids) {
    await usersService.bulkDeleteUsers(ids)
    await fetchUsers()
  }

  function applyFilter() {
    reset()
    fetchUsers()
  }

  function setStatusTab(tabValue) {
    filters.isActive = tabValue === 'Active'
    reset()
    fetchUsers()
  }

  function setSort(key) {
    if (sort.key === key) {
      sort.dir = sort.dir === 'asc' ? 'desc' : 'asc'
    } else {
      sort.key = key
      sort.dir = 'asc'
    }
    fetchUsers()
  }

  return {
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
    removeUser,
    bulkSetStatus,
    bulkDelete,
    applyFilter,
    setStatusTab,
    setSort,
    goToPage,
  }
}