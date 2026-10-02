<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppPageContainer from '@/components/ui/AppPageContainer.vue'
import AppPageHeader from '@/components/ui/AppPageHeader.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import IconPicker from '@/components/ui/IconPicker.vue'
import { useCategoryForm } from '../composables/useCategoryForm.js'
import { useToast } from '@/composables/useToast.js'
import { useUnsavedChangesConfirm } from '@/composables/useUnsavedChangesConfirm.js'

const route = useRoute()
const router = useRouter()
const { push } = useToast()
const categoryId = computed(() => route.params.id || null)
const { form, isEdit, isSubmitting, isLoading, fieldErrors, load, submit } =
  useCategoryForm(categoryId.value)

const { state: dirtyState, confirmDiscard } = useUnsavedChangesConfirm()
const initialName = ref('')
const icon = ref('shopping_bag')

const charCount = computed(() => (form.name || '').length)

async function onSubmit() {
  const saved = await submit()
  if (saved) {
    push(isEdit.value ? 'Category updated' : 'Category added')
    router.push({ name: 'categories.list' })
  }
}

async function cancel() {
  const dirty = isEdit.value ? form.name !== initialName.value : Boolean(form.name)
  const ok = await confirmDiscard(dirty)
  if (ok) router.push({ name: 'categories.list' })
}

onMounted(async () => {
  await load()
  initialName.value = form.name
})
</script>

<template>
  <AppPageContainer>
    <AppCard padded>
      <AppPageHeader :title="isEdit ? 'Edit Category' : 'Add Category'" />
      <AppSpinner v-if="isLoading" />
      <form v-else @submit.prevent="onSubmit">
        <div class="field-wrap">
          <div class="field-head">
            <span class="field-label">Category Name</span>
            <span class="counter mono">{{ charCount }}/32</span>
          </div>
          <AppInput
            v-model="form.name"
            placeholder="e.g. Beverages"
            :error="fieldErrors.name"
            maxlength="32"
          />
        </div>

        <div class="icon-picker-wrap">
          <span class="field-label">Icon Representation</span>
          <IconPicker v-model="icon" />
        </div>

        <div class="actions">
          <AppButton variant="secondary" @click="cancel">Cancel</AppButton>
          <AppButton variant="primary" type="submit" :loading="isSubmitting">
            Save Category
          </AppButton>
        </div>
      </form>
    </AppCard>

    <ConfirmDialog
      :model-value="dirtyState.isOpen.value"
      :title="dirtyState.title.value"
      :message="dirtyState.message.value"
      :confirm-label="dirtyState.confirmLabel.value"
      :variant="dirtyState.variant.value"
    />
  </AppPageContainer>
</template>

<style scoped>
.field-wrap {
  margin-bottom: 16px;
}

.field-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.field-label {
  font-size: 12.5px;
  color: var(--color-ink-soft);
  font-weight: 500;
}

.counter {
  font-size: 12px;
  color: var(--color-ink-soft);
}

.icon-picker-wrap {
  margin-bottom: 20px;
}

.icon-picker-wrap .field-label {
  display: block;
  margin-bottom: 8px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
</style>