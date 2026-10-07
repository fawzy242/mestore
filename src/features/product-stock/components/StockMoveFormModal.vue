<script setup>
import { computed, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useToast } from '@/composables/useToast.js'
import { useAuthStore } from '@/stores/auth.store.js'
import { db } from '@/services/mock/data.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  move: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])
const { push } = useToast()
const auth = useAuthStore()

const visible = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
const isEdit = computed(() => Boolean(props.move))

const productId = ref(null)
const direction = ref('in')
const quantity = ref(1)
const reason = ref('')

const productOptions = db.products.map((p) => ({ label: `${p.name} (${p.sku})`, value: p.id }))

watch(visible, (open) => {
  if (!open) return
  if (isEdit.value) {
    productId.value = props.move.productId
    direction.value = props.move.type === 'out' ? 'out' : 'in'
    quantity.value = props.move.quantity
    reason.value = props.move.reason
  } else {
    productId.value = null
    direction.value = 'in'
    quantity.value = 1
    reason.value = ''
  }
})

function save() {
  if (!productId.value) { push('Select a product', { severity: 'warn' }); return }
  if (!quantity.value || quantity.value <= 0) { push('Enter a positive quantity', { severity: 'warn' }); return }
  if (!reason.value.trim()) { push('Enter a reason', { severity: 'warn' }); return }
  const delta = direction.value === 'in' ? quantity.value : -quantity.value
  emit('saved', {
    productId: productId.value,
    delta,
    reason: reason.value,
    user: auth.user?.name || 'Admin',
  })
  visible.value = false
}
</script>

<template>
  <Dialog v-model:visible="visible" modal :draggable="false" :style="{ width: '520px' }" :show-header="false">
    <div class="modal-head">
      <span class="head-icon"><AppIcon name="tune" :size="20" /></span>
      <h2 class="head-title">{{ isEdit ? 'Edit Stock Move' : 'Add Stock Move' }}</h2>
      <button type="button" class="head-close" aria-label="Close" @click="visible = false">
        <AppIcon name="close" :size="14" />
      </button>
    </div>
    <div class="modal-body">
      <div class="field">
        <label>Product</label>
        <Select v-model="productId" :options="productOptions" option-label="label" option-value="value" :disabled="isEdit" placeholder="Select product" class="full" />
      </div>
      <div class="field">
        <label>Direction</label>
        <div class="segmented">
          <button type="button" class="seg" :class="{ active: direction === 'in' }" @click="direction = 'in'">Stock In</button>
          <button type="button" class="seg" :class="{ active: direction === 'out' }" @click="direction = 'out'">Stock Out</button>
        </div>
      </div>
      <div class="field">
        <label>Quantity</label>
        <InputNumber v-model="quantity" :min="1" class="full" />
      </div>
      <div class="field">
        <label>Reason</label>
        <InputText v-model="reason" placeholder="e.g. Stock count, damaged items" class="full" />
      </div>
    </div>
    <div class="mestore-modal-foot">
      <Button label="Cancel" text severity="secondary" @click="visible = false" />
      <Button :label="isEdit ? 'Save Changes' : 'Add Move'" icon="pi pi-check" @click="save" />
    </div>
  </Dialog>
</template>

<style scoped>
.modal-head { display: flex; align-items: center; gap: 12px; padding: 18px 22px; border-bottom: 1px solid var(--border); }
.head-icon { width: 36px; height: 36px; border-radius: var(--radius-md); background: var(--primary-tint); color: var(--primary); display: inline-flex; align-items: center; justify-content: center; }
.head-title { flex: 1; margin: 0; font-size: 16px; font-weight: 600; color: var(--text); }
.head-close { width: 32px; height: 32px; border-radius: var(--radius-md); background: transparent; border: none; color: var(--text-muted); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
.head-close:hover { background: var(--surface-hover); color: var(--text); }
.modal-body { padding: 22px; display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 12.5px; font-weight: 500; color: var(--text-muted); }
.full { width: 100%; }
.full :deep(input) { width: 100%; }
.segmented { display: inline-flex; gap: 8px; }
.seg { padding: 9px 18px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--surface); color: var(--text-muted); font-size: 13px; font-weight: 500; cursor: pointer; }
.seg.active { background: var(--primary); color: var(--primary-fg); border-color: var(--primary); }
</style>