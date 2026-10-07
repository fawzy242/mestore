import { ref, reactive } from 'vue'
import * as suppliersService from '@/services/api/suppliers.service.js'
import { normalizeApiError } from '@/services/http/apiError.js'

export function useSuppliers() {
  const rows = ref([])
  const loading = ref(false)
  const error = ref(null)
  const filters = reactive({ search: '', status: 'Active' })
  const sort = reactive({ key: '', dir: 'asc' })

  async function fetchSuppliers() {
    loading.value = true
    error.value = null
    try {
      const result = await suppliersService.getSuppliers({
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
    await suppliersService.deleteSupplier(id)
    await fetchSuppliers()
  }

  async function bulkSetStatus(ids, status) {
    await suppliersService.bulkUpdateSupplierStatus(ids, status)
    await fetchSuppliers()
  }

  async function bulkDelete(ids) {
    await suppliersService.bulkDeleteSuppliers(ids)
    await fetchSuppliers()
  }

  function setStatusTab(status) {
    filters.status = status
    fetchSuppliers()
  }

  function setSort(key) {
    if (sort.key === key) {
      sort.dir = sort.dir === 'asc' ? 'desc' : 'asc'
    } else {
      sort.key = key
      sort.dir = 'asc'
    }
    fetchSuppliers()
  }

  return {
    rows,
    loading,
    error,
    filters,
    sort,
    fetchSuppliers,
    remove,
    bulkSetStatus,
    bulkDelete,
    setStatusTab,
    setSort,
  }
}