<script setup>
defineProps({
  variant: { type: String, default: 'info' },
  message: { type: String, required: true },
  dismissible: { type: Boolean, default: false },
})

defineEmits(['dismiss'])
</script>

<template>
  <div class="notice" :class="`notice-${variant}`" role="status">
    <span class="dot" aria-hidden="true"></span>
    <span class="msg">{{ message }}</span>
    <button
      v-if="dismissible"
      type="button"
      class="close"
      aria-label="Dismiss"
      @click="$emit('dismiss')"
    >
      ✕
    </button>
  </div>
</template>

<style scoped>
.notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 13px;
  margin-bottom: 18px;
  border: 1px solid transparent;
  transition: background-color 150ms ease, color 150ms ease;
}
.notice-info {
  background: var(--info-bg);
  color: var(--info);
  border-color: var(--info-bg);
}
.notice-warning {
  background: var(--warning-bg);
  color: var(--warning);
  border-color: var(--warning-bg);
}
.notice-error {
  background: var(--danger-bg);
  color: var(--danger);
  border-color: var(--danger-bg);
}
.notice-success {
  background: var(--success-bg);
  color: var(--success);
  border-color: var(--success-bg);
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}
.msg {
  flex: 1;
  line-height: 1.4;
}
.close {
  font-size: 12px;
  opacity: 0.6;
  padding: 2px 6px;
  background: transparent;
  border: none;
  color: inherit;
}
.close:hover {
  opacity: 1;
}
</style>