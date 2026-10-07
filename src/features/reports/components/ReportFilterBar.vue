<script setup>
import Button from 'primevue/button'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps({
  range: { type: String, required: true },
  rangeLabel: { type: String, default: '' },
  exporting: { type: String, default: '' },
})

const emit = defineEmits(['update:range', 'export-csv', 'export-xlsx', 'export-pdf'])

const rangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'last7', label: 'Last 7 days' },
  { value: 'last30', label: 'Last 30 days' },
]
</script>

<template>
  <div class="filter-bar">
    <div class="filter-left">
      <span class="filter-icon-wrap">
        <AppIcon name="calendar-today" :size="20" />
      </span>
      <div class="filter-text">
        <span class="filter-label">Reporting Window</span>
        <AppSelect
          :model-value="range"
          :options="rangeOptions"
          class="range-select"
          @update:model-value="(v) => emit('update:range', v)"
        />
      </div>
      <span class="range-value mono">{{ rangeLabel }}</span>
    </div>

    <div class="filter-actions">
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
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px 18px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.filter-left {
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
.filter-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.filter-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--text-muted);
}
.range-select {
  min-width: 180px;
  margin-bottom: 0;
}
.range-value {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text);
  padding: 6px 12px;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}
.filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
@media (max-width: 640px) {
  .filter-actions {
    width: 100%;
  }
  .filter-actions > * {
    flex: 1;
  }
}
</style>