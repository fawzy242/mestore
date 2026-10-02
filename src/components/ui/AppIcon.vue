<script setup>
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 18 },
})

const fullName = computed(() => {
  if (props.name.includes(':')) return props.name
  return `material-symbols:${props.name}`
})
</script>

<template>
  <Icon :icon="fullName" :width="size" :height="size" class="app-icon" />
</template>

<style scoped>
.app-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}
</style>