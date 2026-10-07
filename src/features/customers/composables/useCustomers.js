import { ref, reactive } from 'vue'
import * as customersService from '@/services/api/customers.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function useCustomers() {
  const rows = ref([])
  const loading = ref(false)
  const error = ref(null)
  const filters = reactive({ search: '', status: 'Active' })
  const sort = reactive({ key: '', dir: 'asc' })

  async function fetchCustomers() {
    loading.value = true
    error.value = null
    try {
      const result = await customersService.getCustomers({
        search: filters.search,
        status: filters.status,
      })
      let items = result.items
      if (sort.key) {
        const dir = sort.dir === 'desc' ? -1 : 1
        items = [...items].sort(
          (a, b) => String(a[sort.key]).localeCompare(String(b[sort.key])) * dir,
        )
      }
      rows.value = items
    } catch (err) {
      error.value = normalizeApiError(err)
    } finally {
      loading.value = false
    }
  }

  async function remove(id) {
    await customersService.deleteCustomer(id)
    await fetchCustomers()
  }

  async function bulkSetStatus(ids, status) {
    await customersService.bulkUpdateCustomerStatus(ids, status)
    await fetchCustomers()
  }

  async function bulkDelete(ids) {
    await customersService.bulkDeleteCustomers(ids)
    await fetchCustomers()
  }

  function setStatusTab(status) {
    filters.status = status
    fetchCustomers()
  }

  function setSort(key) {
    if (sort.key === key) {
      sort.dir = sort.dir === 'asc' ? 'desc' : 'asc'
    } else {
      sort.key = key
      sort.dir = 'asc'
    }
    fetchCustomers()
  }

  return {
    rows,
    loading,
    error,
    filters,
    sort,
    fetchCustomers,
    remove,
    bulkSetStatus,
    bulkDelete,
    setStatusTab,
    setSort,
  }
}