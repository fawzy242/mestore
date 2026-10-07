<script setup>
import { computed, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useToast } from '@/composables/useToast.js'
import { useAuthStore } from '@/stores/auth.store.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  product: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const { push } = useToast()
const auth = useAuthStore()

const visible = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
const delta = ref(0)
const reason = ref('')

watch(visible, (open) => {
  if (open) {
    delta.value = 0
    reason.value = ''
  }
})

function save() {
  if (delta.value === 0) {
    push('Enter a non-zero adjustment', { severity: 'warn' })
    return
  }
  emit('saved', {
    productId: props.product.id,
    delta: delta.value,
    reason: reason.value || 'Manual adjustment',
    user: auth.user?.name || 'Admin',
  })
  visible.value = false
}

function close() {
  visible.value = false
}
</script>

<template>
  <Dialog v-model:visible="visible" modal :draggable="false" :style="{ width: '480px' }" :show-header="false">
    <div class="modal-head">
      <span class="head-icon"><AppIcon name="tune" :size="20" /></span>
      <h2 class="head-title">Adjust Stock</h2>
      <button type="button" class="head-close" aria-label="Close" @click="close">
        <AppIcon name="close" :size="14" />
      </button>
    </div>

    <div class="modal-body">
      <div v-if="product" class="info-card">
        <div class="info-row">
          <span class="info-label">Product</span>
          <span class="info-value">{{ product.productName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Current Stock</span>
          <span class="info-value mono">{{ product.stock }} {{ product.unit }}</span>
        </div>
      </div>

      <div class="field">
        <label>Adjustment (positive to add, negative to remove)</label>
        <InputNumber v-model="delta" show-buttons :min="-100000" :max="100000" class="full" />
      </div>

      <div class="field">
        <label>Reason</label>
        <InputText v-model="reason" placeholder="e.g. Damaged items, stock audit" class="full" />
      </div>
    </div>

    <div class="mestore-modal-foot">
      <Button label="Cancel" text severity="secondary" @click="close" />
      <Button label="Apply Adjustment" icon="pi pi-check" @click="save" />
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
}
.head-close:hover {
  background: var(--surface-hover);
  color: var(--text);
}
.modal-body {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.info-card {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}
.info-label {
  color: var(--text-muted);
}
.info-value {
  color: var(--text);
  font-weight: 600;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field label {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-muted);
}
.full {
  width: 100%;
}
.full :deep(input) {
  width: 100%;
}
</style>