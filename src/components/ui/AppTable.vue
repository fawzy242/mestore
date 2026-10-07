<script setup>
import { computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import EmptyState from './EmptyState.vue'

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: Object, default: null },
  emptyMessage: { type: String, default: 'Nothing to show.' },
  rowKey: { type: String, default: 'id' },
  clickableRows: { type: Boolean, default: true },
  pagination: { type: Object, default: null },
  sortKey: { type: String, default: '' },
  sortDir: { type: String, default: 'asc' },
  selectable: { type: Boolean, default: false },
  selectedKeys: { type: Array, default: () => [] },
  resizableColumns: { type: Boolean, default: true },
})

const emit = defineEmits([
  'row-click',
  'page-change',
  'sort-change',
  'retry',
  'update:selectedKeys',
])

const first = computed(() => {
  if (!props.pagination) return 0
  return (props.pagination.page - 1) * props.pagination.pageSize
})

const rowsPerPage = computed(() => props.pagination?.pageSize ?? 10)
const sortField = computed(() => props.sortKey || null)
const sortOrder = computed(() => (props.sortDir === 'desc' ? -1 : 1))

const allSelected = computed(
  () =>
    props.rows.length > 0 &&
    props.rows.every((r) => props.selectedKeys.includes(r[props.rowKey])),
)
const someSelected = computed(
  () => props.selectedKeys.length > 0 && !allSelected.value,
)

function isSelected(row) {
  return props.selectedKeys.includes(row[props.rowKey])
}

function toggleRow(row, checked) {
  const key = row[props.rowKey]
  const next = new Set(props.selectedKeys)
  if (checked) next.add(key)
  else next.delete(key)
  emit('update:selectedKeys', Array.from(next))
}

function toggleAll(checked) {
  if (checked) {
    const keys = props.rows.map((r) => r[props.rowKey])
    const merged = new Set([...props.selectedKeys, ...keys])
    emit('update:selectedKeys', Array.from(merged))
  } else {
    const rowKeys = new Set(props.rows.map((r) => r[props.rowKey]))
    emit(
      'update:selectedKeys',
      props.selectedKeys.filter((k) => !rowKeys.has(k)),
    )
  }
}

function onPage(e) {
  if (!props.pagination) return
  const nextPage = Math.floor(e.first / e.rows) + 1
  emit('page-change', nextPage)
}

function onSort(e) {
  if (!e.sortField) return
  emit('sort-change', e.sortField)
}

/**
 * Row click handler — skips when the event originated from the checkbox
 * cell or an interactive control. This lets row clicks open the view modal
 * without interfering with selection.
 */
function onRowClick(e) {
  if (!props.clickableRows) return
  const target = e.originalEvent?.target
  if (target) {
    // Exempt checkbox cell and any button/input/label descendant
    const exempt = target.closest(
      'button, a, input, select, textarea, label, .p-checkbox, [data-row-click-ignore]',
    )
    if (exempt) return
  }
  emit('row-click', e.data)
}
</script>

<template>
  <div class="table-wrapper">
    <Message v-if="error" severity="error" :closable="false" class="error-banner">
      <div class="error-content">
        <span>{{ error.message }}</span>
        <button type="button" class="retry-btn" @click="emit('retry')">Retry</button>
      </div>
    </Message>

    <DataTable
      :value="rows"
      :loading="loading"
      :lazy="true"
      :paginator="Boolean(pagination)"
      :rows="rowsPerPage"
      :first="first"
      :total-records="pagination?.total ?? rows.length"
      :rows-per-page-options="[rowsPerPage]"
      :sort-field="sortField"
      :sort-order="sortOrder"
      :resizable-columns="resizableColumns"
      :row-hover="clickableRows"
      removable-sort
      scrollable
      class="app-table"
      @page="onPage"
      @sort="onSort"
      @row-click="onRowClick"
    >
      <template #empty>
        <EmptyState :message="emptyMessage" />
      </template>

      <Column
        v-if="selectable"
        header-style="width: 48px"
        body-style="width: 48px"
        data-row-click-ignore
      >
        <template #header>
          <Checkbox
            :model-value="allSelected"
            :indeterminate="someSelected"
            binary
            @update:model-value="toggleAll"
          />
        </template>
        <template #body="{ data }">
          <div data-row-click-ignore @click.stop>
            <Checkbox
              :model-value="isSelected(data)"
              binary
              @update:model-value="(v) => toggleRow(data, v)"
            />
          </div>
        </template>
      </Column>

      <Column
        v-for="col in columns"
        :key="col.key"
        :field="col.key"
        :header="col.label"
        :sortable="col.sortable"
        :resizable="resizableColumns && col.resizable !== false"
        :style="{ textAlign: col.align || 'left' }"
        :header-style="{ textAlign: col.align || 'left' }"
      >
        <template #body="{ data }">
          <slot :name="`cell-${col.key}`" :row="data" :value="data[col.key]">
            {{
              typeof col.formatter === 'function'
                ? col.formatter(data[col.key], data)
                : data[col.key]
            }}
          </slot>
        </template>
      </Column>

      <Column
        v-if="$slots['row-actions']"
        header=""
        :style="{ textAlign: 'right', width: '1%' }"
        :resizable="false"
      >
        <template #body="{ data }">
          <div class="row-actions" data-row-click-ignore @click.stop>
            <slot name="row-actions" :row="data" />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.table-wrapper {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.error-banner {
  border-radius: 0;
  margin: 0;
}

.error-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.retry-btn {
  background: transparent;
  border: none;
  color: inherit;
  text-decoration: underline;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.row-actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  justify-content: flex-end;
}

:deep(.app-table .p-datatable-header-cell) {
  background: var(--surface-alt);
  color: var(--text-muted);
  font-size: 11.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 12px 14px;
  border-color: var(--border);
  position: relative;
}

:deep(.app-table .p-datatable-tbody > tr > td) {
  padding: 12px 14px;
  font-size: 13.5px;
  color: var(--text);
  border-color: var(--border);
}

:deep(.app-table .p-datatable-tbody > tr:hover) {
  background: var(--surface-hover);
}

:deep(.app-table .p-datatable-tbody > tr) {
  transition: background-color 100ms;
}

:deep(.app-table .p-column-resizer) {
  background: transparent;
}

:deep(.app-table .p-column-resizer:hover) {
  background: var(--primary);
}

:deep(.app-table .p-paginator) {
  background: var(--surface-alt);
  border-top: 1px solid var(--border);
  padding: 10px 14px;
}

:deep(.app-table .p-paginator .p-paginator-page.p-highlight) {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--primary-fg);
}

:deep(.app-table .p-sortable-column-icon) {
  color: var(--text-faint);
  font-size: 11px;
  margin-left: 4px;
}

:deep(.app-table .p-sortable-column.p-highlight .p-sortable-column-icon) {
  color: var(--primary);
}
</style>