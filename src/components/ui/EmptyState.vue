<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  // Material Symbols icon name (preferred)
  iconName: { type: String, default: '' },
  // Raw HTML/emoji (legacy)
  icon: { type: String, default: '' },
  title: { type: String, default: '' },
  message: { type: String, default: 'Nothing to show.' },
})

defineEmits(['action'])
</script>

<template>
  <div class="empty-state">
    <span v-if="iconName" class="ic-wrap">
      <AppIcon :name="iconName" :size="32" />
    </span>
    <!-- eslint-disable-next-line vue/no-v-html -- icon is either an emoji or a trusted inline SVG -->
    <div v-else-if="icon" class="ic" v-html="icon"></div>
    <div v-if="title" class="title">{{ title }}</div>
    <div class="message">{{ message }}</div>
  </div>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
}

.ic-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--surface-hover);
  color: var(--text-muted);
  margin-bottom: 12px;
}

.ic {
  margin-bottom: 10px;
  opacity: 0.5;
}

.title {
  font-weight: 500;
  color: var(--text);
  margin-bottom: 4px;
}

.message {
  font-size: 13px;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .empty-state {
    padding: 32px 16px;
  }
  .message {
    font-size: 12.5px;
  }
  .ic-wrap {
    width: 48px;
    height: 48px;
  }
}
</style>