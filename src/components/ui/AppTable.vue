<script setup>
import EmptyState from './EmptyState.vue'
import AppAlert from './AppAlert.vue'
import AppIconButton from './AppIconButton.vue'

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: Object, default: null },
  emptyMessage: { type: String, default: 'Nothing to show.' },
  rowKey: { type: String, default: 'id' },
  clickableRows: { type: Boolean, default: false },
  pagination: { type: Object, default: null },
  sortKey: { type: String, default: '' },
  sortDir: { type: String, default: 'asc' },
})

const emit = defineEmits(['row-click', 'page-change', 'sort-change', 'retry'])

function cellValue(row, col) {
  const raw = row[col.key]
  return typeof col.formatter === 'function' ? col.formatter(raw, row) : raw
}

function headerClick(col) {
  if (!col.sortable) return
  emit('sort-change', col.key)
}

function sortIndicator(col) {
  if (!col.sortable || props.sortKey !== col.key) return ''
  return props.sortDir === 'asc' ? '▲' : '▼'
}

function pageWindow(current, count) {
  const total = Math.max(count, 1)
  const window = []
  const start = Math.max(1, Math.min(current - 1, total - 2))
  const end = Math.min(total, start + 2)
  for (let i = start; i <= end; i++) window.push(i)
  return window
}
</script>

<template>
  <div class="table-card">
    <AppAlert v-if="error" variant="error" :message="error.message" retry-label="Retry" @retry="emit('retry')" />

    <div class="table-scroll">
      <table class="table">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :style="{ textAlign: col.align || 'left' }"
              :class="{ sortable: col.sortable }"
              @click="headerClick(col)"
            >
              {{ col.label }}
              <span v-if="col.sortable" class="sort-ind">{{ sortIndicator(col) }}</span>
            </th>
            <th v-if="$slots['row-actions']" style="text-align: right"></th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr v-for="n in 3" :key="`skeleton-${n}`">
            <td v-for="col in columns" :key="col.key">
              <div class="skeleton"></div>
            </td>
            <td v-if="$slots['row-actions']"><div class="skeleton"></div></td>
          </tr>
        </tbody>

        <tbody v-else-if="rows.length === 0">
          <tr>
            <td :colspan="columns.length + ($slots['row-actions'] ? 1 : 0)">
              <EmptyState :message="emptyMessage" />
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr
            v-for="row in rows"
            :key="row[rowKey]"
            :class="{ clickable: clickableRows }"
            @click="emit('row-click', row)"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              :style="{ textAlign: col.align || 'left' }"
              :class="{ mono: col.mono }"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="cellValue(row, col)">
                {{ cellValue(row, col) }}
              </slot>
            </td>
            <td v-if="$slots['row-actions']" style="text-align: right" @click.stop>
              <slot name="row-actions" :row="row" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer v-if="pagination && pagination.pageCount > 1" class="table-footer">
      <span class="page-info">
        Page {{ pagination.page }} of {{ pagination.pageCount }}
        · {{ pagination.total }} total
      </span>
      <div class="page-controls">
        <AppIconButton
          title="Previous page"
          :disabled="pagination.page <= 1"
          @click="emit('page-change', pagination.page - 1)"
        >
          ‹
        </AppIconButton>
        <button
          v-for="p in pageWindow(pagination.page, pagination.pageCount)"
          :key="p"
          type="button"
          class="page-btn"
          :class="{ active: p === pagination.page }"
          @click="emit('page-change', p)"
        >
          {{ p }}
        </button>
        <AppIconButton
          title="Next page"
          :disabled="pagination.page >= pagination.pageCount"
          @click="emit('page-change', pagination.page + 1)"
        >
          ›
        </AppIconButton>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.table-card {
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-1);
  overflow: hidden;
}
.table-scroll {
  overflow-x: auto;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}
.table thead th {
  text-align: left;
  font-weight: 500;
  color: var(--color-ink-soft);
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 10px 14px;
  border-bottom: 1px solid var(--color-line);
  background: var(--color-surface-container-low);
  white-space: nowrap;
}
.table thead th.sortable {
  cursor: pointer;
  user-select: none;
}
.table thead th.sortable:hover {
  color: var(--color-ink);
}
.sort-ind {
  display: inline-block;
  font-size: 9px;
  margin-left: 4px;
  color: var(--color-primary-container);
}
.table tbody td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-line);
}
.table tbody tr:last-child td {
  border-bottom: none;
}
.table tbody tr.clickable:hover {
  background: rgba(253, 236, 234, 0.4);
  cursor: pointer;
}
.skeleton {
  height: 12px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--color-line), rgba(0, 0, 0, 0.02), var(--color-line));
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
  min-width: 60px;
}
@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-top: 1px solid var(--color-line);
  font-size: 12.5px;
  color: var(--color-ink-soft);
  background: var(--color-surface-container-low);
  flex-wrap: wrap;
}
.page-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}
.page-btn {
  min-width: 26px;
  height: 26px;
  border-radius: 4px;
  border: 1px solid var(--color-line);
  background: var(--color-surface);
  color: var(--color-ink);
  font-size: 12.5px;
  cursor: pointer;
}
.page-btn:hover {
  background: var(--color-primary-tint);
  color: var(--color-primary-container);
}
.page-btn.active {
  background: var(--color-primary-container);
  color: #fff;
  border-color: var(--color-primary-container);
}
</style>