<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useCategoryForm } from '../composables/useCategoryForm.js'
import { useToast } from '@/composables/useToast.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  categoryId: { type: [String, Number], default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const { push } = useToast()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const isEdit = computed(() => Boolean(props.categoryId))
const { form, isSubmitting, isLoading, error, fieldErrors, load, submit } = useCategoryForm(
  props.categoryId,
)

const icon = ref('local-cafe')

const iconOptions = [
  { value: 'local-cafe', label: 'Beverages' },
  { value: 'lunch-dining', label: 'Snacks & Instant' },
  { value: 'bakery-dining', label: 'Bakery' },
  { value: 'egg-alt', label: 'Staples' },
  { value: 'cleaning-services', label: 'Household' },
]

const charCount = computed(() => (form.name || '').length)

async function onSubmit() {
  const saved = await submit()
  if (saved) {
    push(isEdit.value ? 'Category updated' : 'Category added')
    emit('saved', saved)
    visible.value = false
  } else if (error.value) {
    push(error.value.message, { severity: 'error' })
  }
}

function close() {
  visible.value = false
}

watch(visible, async (open) => {
  if (open && isEdit.value) await load()
})

onMounted(() => {
  if (visible.value && isEdit.value) load()
})
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    :style="{ width: '520px' }"
    :show-header="false"
  >
    <div class="modal-head">
      <span class="head-icon">
        <AppIcon name="category" :size="20" />
      </span>
      <h2 class="head-title">{{ isEdit ? 'Edit Category' : 'Add Category' }}</h2>
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
      <div v-if="isLoading" class="loading">Loading…</div>

      <form v-else class="form" @submit.prevent="onSubmit">
        <div class="field">
          <div class="field-head">
            <label>Category Name *</label>
            <span class="counter mono">{{ charCount }}/32</span>
          </div>
          <InputText
            v-model="form.name"
            placeholder="e.g. Beverages"
            maxlength="32"
            :class="{ 'p-invalid': fieldErrors.name }"
          />
          <small v-if="fieldErrors.name" class="err">{{ fieldErrors.name }}</small>
        </div>

        <div class="field">
          <label>Icon</label>
          <div class="icon-picker">
            <button
              v-for="opt in iconOptions"
              :key="opt.value"
              type="button"
              class="icon-btn"
              :class="{ active: icon === opt.value }"
              :aria-label="opt.label"
              :title="opt.label"
              @click="icon = opt.value"
            >
              <AppIcon :name="opt.value" :size="20" />
            </button>
          </div>
        </div>

        <Message v-if="error" severity="error" :closable="false">
          {{ error.message }}
        </Message>
      </form>
    </div>

    <div class="mestore-modal-foot">
      <Button label="Cancel" text severity="secondary" @click="close" />
      <Button
        :label="isEdit ? 'Save Changes' : 'Save Category'"
        icon="pi pi-check"
        :loading="isSubmitting"
        @click="onSubmit"
      />
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

.loading {
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.field label {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-muted);
}
.counter {
  font-size: 11.5px;
  color: var(--text-faint);
}
.field :deep(.p-inputtext) {
  width: 100%;
}

.icon-picker {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
.icon-btn {
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--surface-hover);
  border: 1px solid transparent;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
}
.icon-btn:hover {
  background: var(--primary-tint);
  color: var(--primary);
}
.icon-btn.active {
  background: var(--primary-tint);
  color: var(--primary);
  border-color: var(--primary);
}
.err {
  font-size: 11.5px;
  color: var(--danger);
}
</style>