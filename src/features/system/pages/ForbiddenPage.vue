<script setup>
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import AppIcon from '@/components/ui/AppIcon.vue'

const router = useRouter()

function goHome() {
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <div>
    <div class="status-icon warn">
      <AppIcon name="shield-lock" :size="26" />
    </div>
    <div class="badge">403</div>
    <h2 class="title">You don't have access</h2>
    <p class="sub">Your current role doesn't have permission to view this page.</p>
    <Button
      label="Back to Dashboard"
      icon="pi pi-arrow-left"
      class="go-btn"
      @click="goHome"
    />
  </div>
</template>

<style scoped>
.status-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
}

.status-icon.warn {
  background: var(--warning-bg);
  color: var(--warning);
}

.badge {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  color: var(--primary);
  background: var(--surface-hover);
  padding: 3px 10px;
  border-radius: var(--radius-xs);
  margin-bottom: 10px;
  letter-spacing: 0.05em;
}

.title {
  margin: 0 0 6px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
}

.sub {
  color: var(--text-muted);
  font-size: 13px;
  margin: 0 0 20px;
  line-height: 1.5;
}

.go-btn {
  width: 100%;
  height: 44px;
  font-weight: 600;
}
</style>