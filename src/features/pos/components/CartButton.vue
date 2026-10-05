<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
import { formatRupiah } from '@/composables/useFormatters.js'

defineProps({
  itemCount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
})

defineEmits(['open'])
</script>

<template>
  <button type="button" class="cart-btn" @click="$emit('open')">
    <AppIcon name="shopping-cart" :size="18" />
    <span class="badge">{{ itemCount }}</span>
    <span class="sep">·</span>
    <span class="mono total">{{ formatRupiah(total) }}</span>
  </button>
</template>

<style scoped>
.cart-btn {
  background: var(--primary);
  color: var(--primary-fg);
  border: none;
  border-radius: var(--radius-md);
  padding: 10px 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 600;
  flex-shrink: 0;
  transition: background 120ms;
}

.cart-btn:hover {
  background: var(--primary-hover);
}

.badge {
  background: rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-full);
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
}

.sep {
  opacity: 0.7;
}

.total {
  font-weight: 700;
}
</style>