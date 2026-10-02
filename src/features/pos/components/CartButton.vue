<script setup>
import { formatRupiah } from '@/composables/useFormatters.js'
import IconCart from '@/components/icons/IconCart.vue'

defineProps({
  itemCount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
})

defineEmits(['open'])
</script>

<template>
  <button type="button" class="cart-btn" @click="$emit('open')">
    <IconCart />
    <span class="badge">{{ itemCount }}</span>
    <span class="sep">·</span>
    <span class="mono total">{{ formatRupiah(total) }}</span>
  </button>
</template>

<style scoped>
.cart-btn {
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-s);
  padding: 9px 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 500;
  flex-shrink: 0;
}

.cart-btn:hover {
  background: var(--color-primary-hover);
}

.badge {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 12px;
}

.sep {
  opacity: 0.7;
}
</style>