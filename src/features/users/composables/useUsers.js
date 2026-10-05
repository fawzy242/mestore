import { ref, reactive } from 'vue'
import * as usersService from '@/services/api/users.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'
import { usePagination } from '@/composables/usePagination.js'

export function useUsers() {
  const rows = ref([])
  const loading = ref(false)
  const error = ref(null)
  const filters = reactive({ search: '', role: '', status: 'Active' })
  const sort = reactive({ key: '', dir: 'asc' })
  const { page, pageSize, total, pageCount, setTotal, goToPage, reset } = usePagination({
    pageSize: 10,
  })

  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      const result = await usersService.getUsers({
        search: filters.search,
        role: filters.role,
        status: filters.status,
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

  async function deactivate(id) {
    await usersService.deactivateUser(id)
    await fetchUsers()
  }

  async function bulkSetStatus(ids, status) {
    await usersService.bulkUpdateUserStatus(ids, status)
    await fetchUsers()
  }

  function applyFilter() {
    reset()
    fetchUsers()
  }

  function setStatusTab(status) {
    filters.status = status
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
    deactivate,
    bulkSetStatus,
    applyFilter,
    setStatusTab,
    setSort,
    goToPage,
  }
}