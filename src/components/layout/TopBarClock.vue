<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const now = ref(new Date())
let timer = null

function tick() {
  now.value = new Date()
}

const formatted = computed(() => {
  const d = now.value
  const weekday = d.toLocaleDateString('en-GB', { weekday: 'long' })
  const day = String(d.getDate()).padStart(2, '0')
  const month = d.toLocaleDateString('en-GB', { month: 'long' })
  const year = d.getFullYear()
  const time = d.toLocaleTimeString('en-GB', { hour12: false })
  return `${weekday}, ${day} - ${month} - ${year}, ${time}`
})

onMounted(() => {
  timer = setInterval(tick, 1000)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="clock" role="status" aria-live="off">
    <AppIcon name="schedule" :size="14" class="clock-icon" />
    <span class="clock-text mono">{{ formatted }}</span>
  </div>
</template>

<style scoped>
.clock {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-muted);
  font-size: 12px;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  transition: background-color 150ms ease, border-color 150ms ease;
}

.clock-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.clock-text {
  font-weight: 500;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Tablet: hide the icon, keep the text */
@media (max-width: 1200px) {
  .clock-icon {
    display: none;
  }
  .clock-text {
    font-size: 11.5px;
  }
}

/* Mobile: hide the whole clock to save topbar space */
@media (max-width: 900px) {
  .clock {
    display: none;
  }
}
</style>