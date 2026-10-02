<script setup>
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import IconShieldLock from '@/components/icons/IconShieldLock.vue'
import IconArrowBack from '@/components/icons/IconArrowBack.vue'

const router = useRouter()

function goHome() {
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <div>
    <div class="status-icon warn">
      <IconShieldLock />
    </div>
    <div class="badge">403</div>
    <h2 class="title">You don't have access</h2>
    <p class="sub">Your current role doesn't have permission to view this page.</p>
    <AppButton variant="primary" block @click="goHome">
      <IconArrowBack /> Back to Dashboard
    </AppButton>
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
  background: var(--color-tertiary-fixed);
  color: var(--color-tertiary);
}

.badge {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-primary-container);
  background: var(--color-surface-container);
  padding: 2px 8px;
  border-radius: var(--radius-s);
  margin-bottom: 10px;
  letter-spacing: 0.05em;
}

.title {
  margin: 0 0 6px;
  font-size: 20px;
  font-weight: 600;
}

.sub {
  color: var(--color-ink-soft);
  font-size: 13px;
  margin: 0 0 20px;
  line-height: 1.5;
}
</style>