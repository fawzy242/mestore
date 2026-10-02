<script setup>
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import IconExploreOff from '@/components/icons/IconExploreOff.vue'
import IconArrowBack from '@/components/icons/IconArrowBack.vue'
import IconRefresh from '@/components/icons/IconRefresh.vue'

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
      <IconExploreOff />
    </div>
    <div class="badge">ERR_404_NOT_FOUND</div>
    <h2 class="title">Page not found</h2>
    <p class="sub">That link doesn't lead anywhere in this prototype.</p>
    <div class="actions">
      <AppButton variant="primary" block @click="goHome">
        <IconArrowBack /> Back to Dashboard
      </AppButton>
      <AppButton variant="secondary" block @click="reload">
        <IconRefresh /> Retry
      </AppButton>
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
  background: var(--color-primary-fixed);
  color: var(--color-primary-container);
}

.badge {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--color-ink-soft);
  background: var(--color-surface-container);
  padding: 2px 8px;
  border-radius: var(--radius-s);
  margin-bottom: 10px;
  letter-spacing: 0.05em;
}

.title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
}

.sub {
  color: var(--color-ink-soft);
  font-size: 13px;
  margin: 0 0 20px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>