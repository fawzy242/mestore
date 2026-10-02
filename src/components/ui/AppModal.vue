<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  dismissible: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue'])

const dialogRef = ref(null)
let previouslyFocused = null

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function close() {
  if (!props.dismissible) return
  emit('update:modelValue', false)
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    close()
    return
  }
  if (event.key !== 'Tab') return

  const dialog = dialogRef.value
  if (!dialog) return
  const focusable = Array.from(dialog.querySelectorAll(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  )
  if (focusable.length === 0) {
    event.preventDefault()
    dialog.focus()
    return
  }
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = document.activeElement

  if (event.shiftKey && (active === first || active === dialog)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      previouslyFocused = document.activeElement
      document.addEventListener('keydown', handleKeydown)
      await nextTick()
      // Prefer the first focusable control inside the dialog; fall back to
      // the dialog element itself so Tab starts inside the modal.
      const firstFocusable = dialogRef.value?.querySelector(FOCUSABLE)
      ;(firstFocusable || dialogRef.value)?.focus()
    } else {
      document.removeEventListener('keydown', handleKeydown)
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus()
      previouslyFocused = null
    }
  },
)

onMounted(() => {
  if (props.modelValue) document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => document.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div
        ref="dialogRef"
        class="modal"
        role="dialog"
        aria-modal="true"
        :aria-label="title || undefined"
        tabindex="-1"
      >
        <header v-if="title || $slots.header" class="modal-header">
          <slot name="header">
            <h3 class="modal-title">{{ title }}</h3>
          </slot>
        </header>

        <div class="modal-body">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 16px;
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius-m);
  box-shadow: var(--shadow-2);
  width: 360px;
  max-width: 100%;
  padding: 22px;
  outline: none;
}

.modal-header {
  margin-bottom: 8px;
}

.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.modal-body {
  color: var(--color-ink);
}

.modal-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>