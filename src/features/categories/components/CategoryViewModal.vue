<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import AppDetailRow from '@/components/ui/AppDetailRow.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useCategoryIcons } from '../composables/useCategoryIcons.js'
import * as categoriesService from '@/services/api/categories.service.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  categoryId: { type: [String, Number], default: null },
})

const emit = defineEmits(['update:modelValue', 'edit'])

const { iconFor } = useCategoryIcons()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const category = ref(null)
const loading = ref(false)

async function load() {
  if (!props.categoryId) return
  loading.value = true
  try {
    category.value = await categoriesService.getCategoryById(props.categoryId)
  } finally {
    loading.value = false
  }
}

function edit() {
  const id = category.value?.id
  visible.value = false
  emit('edit', id)
}

function close() {
  visible.value = false
}

watch(
  () => [visible.value, props.categoryId],
  ([open]) => {
    if (open) load()
  },
)

onMounted(() => {
  if (visible.value) load()
})
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    :style="{ width: '480px' }"
    :show-header="false"
  >
    <div class="modal-head">
      <span class="head-icon">
        <AppIcon name="category" :size="20" />
      </span>
      <h2 class="head-title">Category Detail</h2>
      <button
        type="button"
        class="head-close"
        aria-label="Close"
        @click="close"
      >
        <AppIcon name="close" :size="14" />
      </button>
    </div>

    <div class="modal-body">
      <div v-if="loading" class="loading">
        <AppSpinner />
      </div>

      <div v-else-if="category" class="body">
        <div class="cat-head">
          <span class="icon-square">
            <AppIcon :name="iconFor(category.name)" :size="22" />
          </span>
          <div class="cat-head-text">
            <h3 class="cat-name">{{ category.name }}</h3>
            <span class="cat-meta">Taxonomy Record</span>
          </div>
        </div>

        <div class="details">
          <AppDetailRow label="Name">{{ category.name }}</AppDetailRow>
          <AppDetailRow label="Status">
            {{ category.status || 'Active' }}
          </AppDetailRow>
        </div>
      </div>
    </div>

    <div class="modal-foot">
      <Button label="Close" text severity="secondary" @click="close" />
      <Button label="Edit" icon="pi pi-pencil" @click="edit" />
    </div>
  </Dialog>
</template>

<style scoped>
.modal-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border);
}

.head-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--primary-tint);
  color: var(--primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.head-title {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.head-close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}

.head-close:hover {
  background: var(--surface-hover);
  color: var(--text);
}

.modal-body {
  padding: 22px;
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 22px;
  border-top: 1px solid var(--border);
}

.loading {
  padding: 40px;
  display: flex;
  justify-content: center;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.cat-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.icon-square {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  background: var(--primary-tint);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cat-head-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cat-name {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
}

.cat-meta {
  font-size: 12.5px;
  color: var(--text-muted);
}

.details {
  display: flex;
  flex-direction: column;
}
</style>