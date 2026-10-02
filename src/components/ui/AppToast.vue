<script setup>
import { storeToRefs } from 'pinia'
import { useUiStore } from '@/stores/ui.store.js'

const ui = useUiStore()
const { toasts } = storeToRefs(ui)
</script>

<template>
  <div class="toast-stack" role="status" aria-live="polite">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 60;
  pointer-events: none;
}

.toast {
  background: #2e2b2b;
  color: #fff;
  padding: 11px 20px;
  border-radius: var(--radius-s);
  font-size: 13.5px;
  box-shadow: var(--shadow-2);
  animation: toast-in 0.2s ease;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>