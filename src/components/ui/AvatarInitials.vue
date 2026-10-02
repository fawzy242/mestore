<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, default: '' },
  size: { type: Number, default: 32 },
  tone: { type: String, default: 'primary' },
})

const initials = computed(() => {
  if (!props.name) return '?'
  const parts = props.name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
})
</script>

<template>
  <span
    class="avatar"
    :class="`tone-${tone}`"
    :style="{ width: size + 'px', height: size + 'px', fontSize: size * 0.4 + 'px' }"
    aria-hidden="true"
  >
    {{ initials }}
  </span>
</template>

<style scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 600;
  line-height: 1;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}

.tone-primary {
  background: var(--primary);
  color: var(--primary-fg);
}
.tone-secondary {
  background: var(--surface-hover);
  color: var(--text);
}
.tone-neutral {
  background: var(--surface-hover);
  color: var(--text-muted);
}
</style>