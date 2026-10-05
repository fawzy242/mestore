<script setup>
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import AppIcon from '@/components/ui/AppIcon.vue'

const router = useRouter()

function goHome() {
  router.push({ name: 'dashboard' })
}
function reload() {
  window.location.reload()
}
</script>

<template>
  <div>
    <div class="status-icon neutral">
      <AppIcon name="explore-off" :size="26" />
    </div>
    <div class="badge">ERR_404_NOT_FOUND</div>
    <h2 class="title">Page not found</h2>
    <p class="sub">That link doesn't lead anywhere in this prototype.</p>
    <div class="actions">
      <Button
        label="Back to Dashboard"
        icon="pi pi-arrow-left"
        class="go-btn"
        @click="goHome"
      />
      <Button
        label="Retry"
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        class="go-btn"
        @click="reload"
      />
    </div>
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

.status-icon.neutral {
  background: var(--primary-tint);
  color: var(--primary);
}

.badge {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-muted);
  background: var(--surface-hover);
  padding: 3px 10px;
  border-radius: var(--radius-xs);
  margin-bottom: 10px;
  letter-spacing: 0.05em;
}

.title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}

.sub {
  color: var(--text-muted);
  font-size: 13px;
  margin: 0 0 20px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.go-btn {
  width: 100%;
  height: 44px;
  font-weight: 600;
}
</style>