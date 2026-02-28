import { ref } from 'vue'

export function usePagination(fetchFn, options = {}) {
  const { pageSize = 20, immediate = true } = options

  const list = ref([])
  const loading = ref(false)
  const refreshing = ref(false)
  const finished = ref(false)
  const total = ref(0)
  const page = ref(1)

  async function loadMore() {
    if (loading.value || finished.value) return
    loading.value = true
    try {
      const res = await fetchFn({ page: page.value, pageSize })
      const newList = res.data?.list || res.list || []
      total.value = res.data?.total || res.total || 0

      if (page.value === 1) {
        list.value = newList
      } else {
        list.value = [...list.value, ...newList]
      }

      if (list.value.length >= total.value || newList.length < pageSize) {
        finished.value = true
      }
      page.value++
    } catch (err) {
      finished.value = true
    } finally {
      loading.value = false
    }
  }

  async function refresh() {
    refreshing.value = true
    page.value = 1
    finished.value = false
    list.value = []
    try {
      await loadMore()
    } finally {
      refreshing.value = false
    }
  }

  function reset() {
    list.value = []
    page.value = 1
    finished.value = false
    loading.value = false
    total.value = 0
  }

  if (immediate) {
    loadMore()
  }

  return { list, loading, refreshing, finished, total, loadMore, refresh, reset }
}
