<script setup>
defineProps({
  icon: { type: String, default: '' },
  title: { type: String, default: '' },
  message: { type: String, default: 'Nothing to show.' },
})

defineEmits(['action'])
</script>

<template>
  <div class="empty-state">
    <div v-if="icon" class="ic" v-html="icon"></div>
    <div v-if="title" class="title">{{ title }}</div>
    <div class="message">{{ message }}</div>
  </div>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-ink-soft);
}

.ic {
  margin-bottom: 10px;
  opacity: 0.5;
}

.title {
  font-weight: 500;
  color: var(--color-ink);
  margin-bottom: 4px;
}

.message {
  font-size: 13px;
}
</style>