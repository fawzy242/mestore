<script setup>
import { computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useCashMovementForm } from '../composables/useCashMovementForm.js'
import { useToast } from '@/composables/useToast.js'
import { useAuthStore } from '@/stores/auth.store.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  movementId: { type: [String, Number], default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])
const { push } = useToast()
const auth = useAuthStore()

const visible = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
const isEdit = computed(() => Boolean(props.movementId))

const { form, isSubmitting, isLoading, error, fieldErrors, load, submit, reset } =
  useCashMovementForm(props.movementId)

async function onSubmit() {
  if (!isEdit.value) form.user = auth.user?.name || 'Admin'
  const saved = await submit()
  if (saved) {
    push(isEdit.value ? 'Movement updated' : (form.type === 'in' ? 'Cash In recorded' : 'Cash Out recorded'))
    emit('saved', saved)
    visible.value = false
  } else if (error.value) {
    push(error.value.message, { severity: 'error' })
  }
}

function close() { visible.value = false }

watch(visible, async (open) => {
  if (!open) return
  if (isEdit.value) await load()
  else reset()
})
</script>

<template>
  <Dialog v-model:visible="visible" modal :draggable="false" :style="{ width: '520px' }" :show-header="false">
    <div class="modal-head">
      <span class="head-icon"><AppIcon name="payments" :size="20" /></span>
      <h2 class="head-title">{{ isEdit ? 'Edit Cash Movement' : 'Record Cash Movement' }}</h2>
      <button type="button" class="head-close" aria-label="Close" @click="close">
        <AppIcon name="close" :size="14" />
      </button>
    </div>

    <div class="modal-body">
      <div v-if="isLoading" class="loading">Loading…</div>
      <form v-else class="form" @submit.prevent="onSubmit">
        <div class="field full">
          <label>Type</label>
          <div class="segmented">
            <button type="button" class="seg" :class="{ active: form.type === 'in' }" @click="form.type = 'in'">Cash In</button>
            <button type="button" class="seg" :class="{ active: form.type === 'out' }" @click="form.type = 'out'">Cash Out</button>
          </div>
        </div>
        <div class="field full">
          <label>Amount (Rp) *</label>
          <InputNumber v-model="form.amount" mode="currency" currency="IDR" locale="id-ID" :min="0" :class="{ 'p-invalid': fieldErrors.amount }" />
          <small v-if="fieldErrors.amount" class="err">{{ fieldErrors.amount }}</small>
        </div>
        <div class="field full">
          <label>Reason *</label>
          <InputText v-model="form.reason" placeholder="e.g. Petty cash top-up" :class="{ 'p-invalid': fieldErrors.reason }" />
          <small v-if="fieldErrors.reason" class="err">{{ fieldErrors.reason }}</small>
        </div>
        <div class="field full">
          <label>Shift Reference (optional)</label>
          <InputText v-model="form.shiftRef" placeholder="e.g. SH-2026-0088" />
        </div>
        <Message v-if="error" severity="error" :closable="false" class="full">{{ error.message }}</Message>
      </form>
    </div>

    <div class="mestore-modal-foot">
      <Button label="Cancel" text severity="secondary" @click="close" />
      <Button :label="isEdit ? 'Save Changes' : 'Record'" icon="pi pi-check" :loading="isSubmitting" @click="onSubmit" />
    </div>
  </Dialog>
</template>

<style scoped>
.modal-head { display: flex; align-items: center; gap: 12px; padding: 18px 22px; border-bottom: 1px solid var(--border); }
.head-icon { width: 36px; height: 36px; border-radius: var(--radius-md); background: var(--primary-tint); color: var(--primary); display: inline-flex; align-items: center; justify-content: center; }
.head-title { flex: 1; margin: 0; font-size: 16px; font-weight: 600; color: var(--text); }
.head-close { width: 32px; height: 32px; border-radius: var(--radius-md); background: transparent; border: none; color: var(--text-muted); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
.head-close:hover { background: var(--surface-hover); color: var(--text); }
.modal-body { padding: 22px; }
.loading { padding: 40px; text-align: center; color: var(--text-muted); }
.form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 12.5px; font-weight: 500; color: var(--text-muted); }
.field :deep(.p-inputtext),
.field :deep(.p-inputnumber) { width: 100%; }
.segmented { display: inline-flex; gap: 8px; }
.seg { padding: 9px 18px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--surface); color: var(--text-muted); font-size: 13px; font-weight: 500; cursor: pointer; }
.seg.active { background: var(--primary); color: var(--primary-fg); border-color: var(--primary); }
.err { font-size: 11.5px; color: var(--danger); }
</style>