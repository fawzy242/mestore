<script setup>
import { computed, ref } from 'vue'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ReportFilterBar from '../components/ReportFilterBar.vue'
import ReportStatCard from '../components/ReportStatCard.vue'
import { useReports, REPORT_TYPES } from '../composables/useReports.js'
import { useToast } from '@/composables/useToast.js'
import { exportPdf, exportXlsx } from '@/composables/useExport.js'
import { formatRupiah } from '@/composables/useFormatters.js'

const { push } = useToast()

const {
  reportId,
  activeReport,
  params,
  result,
  loading,
  error,
  setReport,
  run,
} = useReports()

const exporting = ref('')

const filenameBase = computed(() => {
  const slug = reportId.value
  const stamp = new Date().toISOString().slice(0, 10)
  return `mestore-report-${slug}-${stamp}`
})

function onParamUpdate(key, value) {
  params[key] = value
}

async function onRun() {
  const res = await run()
  if (res) push(`${res.title} generated`)
}

function onReset() {
  setReport(reportId.value)
  result.value = null
}

function summaryRowsList() {
  if (!result.value?.summaryRows) return []
  return Object.entries(result.value.summaryRows)
}

function rowsForCsv() {
  if (!result.value) return []
  return result.value.rows.map((r) =>
    result.value.columns.map((c) => {
      const v = r[c.key]
      return c.format ? c.format(v) : v
    }),
  )
}

async function onExportCsv() {
  if (!result.value) {
    push('Run the report first', { severity: 'warn' })
    return
  }
  exporting.value = 'csv'
  try {
    const metaRows = summaryRowsList().map(([k, v]) => [k, v])
    const columnHeaders = result.value.columns.map((c) => c.label)

    const allRows = [
      ...metaRows.map(([k, v]) => [k, v]),
      [],
      columnHeaders,
      ...rowsForCsv(),
    ]
    const escape = (v) => {
      const s = v == null ? '' : String(v)
      if (s.includes('"') || s.includes(',') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }
    const csv = allRows.map((r) => r.map(escape).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filenameBase.value}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    push('CSV downloaded')
  } catch {
    push('Failed to export CSV', { severity: 'error' })
  } finally {
    exporting.value = ''
  }
}

async function onExportXlsx() {
  if (!result.value) {
    push('Run the report first', { severity: 'warn' })
    return
  }
  exporting.value = 'xlsx'
  try {
    const columns = result.value.columns.map((c) => ({
      label: c.label,
      key: c.key,
      format: c.format,
    }))
    const meta = Object.fromEntries(summaryRowsList())
    await exportXlsx(
      `${filenameBase.value}.xlsx`,
      result.value.title,
      columns,
      result.value.rows,
      meta,
    )
    push('Excel downloaded')
  } catch {
    push('Failed to export Excel', { severity: 'error' })
  } finally {
    exporting.value = ''
  }
}

async function onExportPdf() {
  if (!result.value) {
    push('Run the report first', { severity: 'warn' })
    return
  }
  exporting.value = 'pdf'
  try {
    const columns = result.value.columns.map((c) => ({
      label: c.label,
      key: c.key,
      align: c.align,
      format: c.format,
    }))
    const summary = Object.fromEntries(
      summaryRowsList().map(([k, v]) => [
        k,
        typeof v === 'number' && /sales|amount|revenue|cash/i.test(k)
          ? formatRupiah(v)
          : String(v),
      ]),
    )
    await exportPdf(
      `${filenameBase.value}.pdf`,
      result.value.title,
      result.value.subtitle,
      columns,
      result.value.rows,
      summary,
    )
    push('PDF downloaded')
  } catch {
    push('Failed to export PDF', { severity: 'error' })
  } finally {
    exporting.value = ''
  }
}

function fmtCell(col, row) {
  const v = row[col.key]
  if (col.format) return col.format(v, row)
  if (typeof v === 'number' && /sales|amount|revenue|cash/i.test(col.key)) {
    return formatRupiah(v)
  }
  return v ?? '—'
}
</script>

<template>
  <AppPageContainer>
    <ReportFilterBar
      :report-types="REPORT_TYPES"
      :report-id="reportId"
      :report="activeReport"
      :params="params"
      :range-label="result?.subtitle || ''"
      :exporting="exporting"
      :running="loading"
      @update:report-id="setReport"
      @update:param="onParamUpdate"
      @run="onRun"
      @reset="onReset"
      @export-csv="onExportCsv"
      @export-xlsx="onExportXlsx"
      @export-pdf="onExportPdf"
    />

    <AppAlert
      v-if="error"
      variant="error"
      :message="error.message"
      retry-label="Retry"
      @retry="onRun"
    />

    <template v-if="result">
      <div class="stats-grid">
        <ReportStatCard
          v-for="([label, value], i) in summaryRowsList()"
          :key="label"
          :label="label"
          :value="
            typeof value === 'number' && /sales|amount|revenue|cash|avg/i.test(label)
              ? formatRupiah(value)
              : String(value)
          "
          :tone="i === 0 ? 'primary' : 'neutral'"
          :icon="i === 0 ? 'payments' : 'analytics'"
        />
      </div>

      <AppCard padded>
        <div class="card-head">
          <h3 class="card-title">{{ result.title }}</h3>
          <span class="card-sub">{{ result.subtitle }}</span>
        </div>

        <AppTable
          :columns="result.columns"
          :rows="result.rows"
          :loading="loading"
          empty-message="No data for the selected parameters."
        >
          <template
            v-for="col in result.columns"
            :key="col.key"
            #[`cell-${col.key}`]="{ row }"
          >
            <span :class="{ mono: typeof row[col.key] === 'number' }">
              {{ fmtCell(col, row) }}
            </span>
          </template>
        </AppTable>
      </AppCard>
    </template>

    <AppCard v-else padded>
      <EmptyState
        icon-name="bar-chart"
        title="Select a report and run it"
        message="Choose a report above, adjust the parameters, and press Run Report."
      />
    </AppCard>
  </AppPageContainer>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 16px;
}
.card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}
.card-sub {
  font-size: 11.5px;
  color: var(--text-muted);
}
</style>