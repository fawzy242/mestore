<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | text | danger | success
  size: { type: String, default: 'md' },          // sm | md | lg
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
})

defineEmits(['click'])

const classes = computed(() => [
  'btn',
  `btn-${props.variant}`,
  `btn-size-${props.size}`,
  { block: props.block, loading: props.loading },
])
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spinner" aria-hidden="true"></span>
    <span class="btn-label"><slot /></span>
  </button>
</template>

<style scoped>
/* ---------------------------------------------------------------------------
 * AppButton — legacy non-PrimeVue button.
 * Aligned with the PrimeVue button system (tokens in tokens.css).
 * ------------------------------------------------------------------------- */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: var(--btn-radius);
  font-family: inherit;
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 140ms ease,
    border-color 140ms ease,
    color 140ms ease,
    transform 80ms ease;
  white-space: nowrap;
  -webkit-appearance: none;
  appearance: none;
}

/* Sizes */
.btn-size-sm {
  height: var(--btn-h-sm);
  padding: 0 var(--btn-px-sm);
  font-size: var(--btn-font-size-sm);
}
.btn-size-md {
  height: var(--btn-h);
  padding: 0 var(--btn-px);
}
.btn-size-lg {
  height: var(--btn-h-lg);
  padding: 0 var(--btn-px-lg);
  font-size: 14px;
}

.btn.block {
  width: 100%;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-ring);
}

.btn:active:not(:disabled) {
  transform: translateY(0.5px);
}

/* ---- Primary ---- */
.btn-primary {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--primary-fg);
}
.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

/* ---- Secondary (outlined) ---- */
.btn-secondary {
  background: var(--surface);
  border-color: var(--border);
  color: var(--text);
}
.btn-secondary:hover:not(:disabled) {
  background: var(--surface-hover);
  border-color: var(--border-strong);
}

/* ---- Text ---- */
.btn-text {
  background: transparent;
  border-color: transparent;
  color: var(--text-muted);
  padding-left: var(--btn-px-sm);
  padding-right: var(--btn-px-sm);
}
.btn-text:hover:not(:disabled) {
  background: var(--surface-hover);
  color: var(--text);
}

/* ---- Danger ---- */
.btn-danger {
  background: var(--danger);
  border-color: var(--danger);
  color: #fff;
}
.btn-danger:hover:not(:disabled) {
  background: var(--primary-active);
  border-color: var(--primary-active);
}

/* ---- Success ---- */
.btn-success {
  background: var(--success);
  border-color: var(--success);
  color: #fff;
}
.btn-success:hover:not(:disabled) {
  background: #166534;
  border-color: #166534;
}

/* ---- Loading spinner ---- */
.spinner {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-top-color: #fff;
  animation: app-btn-spin 0.7s linear infinite;
  flex-shrink: 0;
}

.btn-secondary .spinner,
.btn-text .spinner {
  border-color: rgba(183, 28, 28, 0.3);
  border-top-color: var(--primary);
}

.btn-label {
  display: inline-flex;
  align-items: center;
}

@keyframes app-btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>