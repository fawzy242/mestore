import { ref, computed } from 'vue'

/**
 * Pagination state for server-side paginated lists.
 * @param {{ page?: number, pageSize?: number }} [options]
 */
export function usePagination(options = {}) {
  const page = ref(options.page ?? 1)
  const pageSize = ref(options.pageSize ?? 20)
  const total = ref(0)

  const pageCount = computed(() =>
    pageSize.value > 0 ? Math.max(Math.ceil(total.value / pageSize.value), 1) : 1,
  )

  function setTotal(value) {
    total.value = Number(value) || 0
  }

  function goToPage(next) {
    const clamped = Math.min(Math.max(next, 1), pageCount.value)
    page.value = clamped
  }

  function reset() {
    page.value = 1
  }

  return { page, pageSize, total, pageCount, setTotal, goToPage, reset }
}