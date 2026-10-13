<script setup>
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps({
  reportTypes: { type: Array, required: true },
  reportId: { type: String, required: true },
  report: { type: Object, required: true },
  params: { type: Object, required: true },
  rangeLabel: { type: String, default: '' },
  exporting: { type: String, default: '' },
  running: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:reportId',
  'update:param',
  'run',
  'reset',
  'export-csv',
  'export-xlsx',
  'export-pdf',
])

function onReportChange(v) {
  emit('update:reportId', v)
}
</script>

<template>
  <div class="filter-card">
    <div class="report-select-row">
      <span class="filter-icon-wrap">
        <AppIcon :name="report.icon || 'description'" :size="20" />
      </span>
      <div class="report-select">
        <span class="filter-label">Report</span>
        <Select
          :model-value="reportId"
          :options="reportTypes"
          option-label="label"
          option-value="id"
          class="report-select-input"
          @update:model-value="onReportChange"
        />
      </div>
      <p class="report-desc">{{ report.description }}</p>
    </div>

    <div class="divider" />

    <div class="params-grid">
      <div
        v-for="param in report.params"
        :key="param.key"
        class="param-field"
        :class="{ 'param-wide': param.type === 'select' && param.options?.length > 3 }"
      >
        <label class="param-label">
          {{ param.label }}
          <span v-if="param.required" class="req">*</span>
        </label>

        <Select
          v-if="param.type === 'select'"
          :model-value="params[param.key]"
          :options="param.options"
          option-label="label"
          option-value="value"
          class="param-control"
          @update:model-value="(v) => emit('update:param', param.key, v)"
        />

        <InputNumber
          v-else-if="param.type === 'number'"
          :model-value="params[param.key]"
          :min="param.min ?? 0"
          :max="param.max ?? 99999"
          class="param-control"
          @update:model-value="(v) => emit('update:param', param.key, v)"
        />

        <InputText
          v-else
          :model-value="params[param.key]"
          class="param-control"
          @update:model-value="(v) => emit('update:param', param.key, v)"
        />
      </div>
    </div>

    <div class="divider" />

    <div class="actions-row">
      <span v-if="rangeLabel" class="range-chip mono">
        <AppIcon name="event" :size="14" />
        {{ rangeLabel }}
      </span>

      <div class="actions-right">
        <Button
          label="Reset"
          icon="pi pi-refresh"
          severity="secondary"
          text
          size="small"
          @click="emit('reset')"
        />
        <Button
          label="Run Report"
          icon="pi pi-play"
          size="small"
          :loading="running"
          @click="emit('run')"
        />
        <span class="export-group">
          <Button
            label="CSV"
            icon="pi pi-file"
            size="small"
            severity="secondary"
            outlined
            :loading="exporting === 'csv'"
            @click="emit('export-csv')"
          />
          <Button
            label="Excel"
            icon="pi pi-file-excel"
            size="small"
            severity="secondary"
            outlined
            :loading="exporting === 'xlsx'"
            @click="emit('export-xlsx')"
          />
          <Button
            label="PDF"
            icon="pi pi-file-pdf"
            size="small"
            severity="secondary"
            outlined
            :loading="exporting === 'pdf'"
            @click="emit('export-pdf')"
          />
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.report-select-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.filter-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--primary-tint);
  color: var(--primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.report-select {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 220px;
}
.filter-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--text-muted);
}
.report-select-input {
  border: none;
  background: transparent;
  padding: 0;
}
.report-select-input :deep(.p-select-label) {
  padding: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}
.report-desc {
  flex: 1;
  min-width: 200px;
  font-size: 12.5px;
  color: var(--text-muted);
  margin: 0;
}

.divider {
  height: 1px;
  background: var(--border);
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px 16px;
}
.param-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.param-wide {
  grid-column: span 1;
}
.param-label {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-muted);
}
.req {
  color: var(--danger);
  margin-left: 2px;
}
.param-control {
  width: 100%;
}
.param-control :deep(input) {
  width: 100%;
}

.actions-row {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
  flex-wrap: wrap;
}
.range-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
  background: var(--surface-alt);
  border: 1px solid var(--border);
  padding: 5px 10px;
  border-radius: var(--radius-md);
}
.actions-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.export-group {
  display: inline-flex;
  gap: 6px;
}

@media (max-width: 640px) {
  .actions-row {
    flex-direction: column;
    align-items: stretch;
  }
  .actions-right {
    width: 100%;
  }
  .actions-right > * {
    flex: 1;
  }
  .export-group {
    width: 100%;
  }
  .export-group > * {
    flex: 1;
  }
}
</style>