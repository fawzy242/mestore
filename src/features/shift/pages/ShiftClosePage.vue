<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import IconVerifiedUser from '@/components/icons/IconVerifiedUser.vue'
import IconLockClock from '@/components/icons/IconLockClock.vue'
import { useShift } from '../composables/useShift.js'
import { useAuthStore } from '@/stores/auth.store.js'
import { useToast } from '@/composables/useToast.js'
import { formatRupiah } from '@/composables/useFormatters.js'
import { COPY } from '@/constants/copy.js'

const router = useRouter()
const shift = useShift()
const auth = useAuthStore()
const { push } = useToast()

const countedCash = ref(null)

const counted = computed(() => Number(countedCash.value) || 0)
const variance = computed(() => counted.value - shift.expected.value)

async function submit() {
  shift.closeShift()
  await auth.logout()
  push('Shift closed. Logged out.')
  router.push({ name: 'login' })
}
</script>

<template>
  <div>
    <div class="icon-wrap">
      <IconLockClock />
    </div>
    <h2 class="title">{{ COPY.shift.closeTitle }}</h2>
    <p class="sub">{{ COPY.shift.closeSubtitle }}</p>

    <div class="form">
      <AppInput
        v-model="countedCash"
        label="Counted Cash (Rp)"
        type="number"
        placeholder="0"
      />

      <div class="summary">
        <div class="row">
          <span class="lbl">Expected (starting + sales)</span>
          <span class="mono">{{ formatRupiah(shift.expected.value) }}</span>
        </div>
        <div class="row">
          <span class="lbl">Actual (counted)</span>
          <span class="mono">{{ formatRupiah(counted) }}</span>
        </div>
        <div class="row variance-row">
          <span class="lbl">Variance</span>
          <span class="mono variance" :class="{ negative: variance < 0, positive: variance > 0 }">
            {{ variance < 0 ? '− ' : variance > 0 ? '+ ' : '' }}{{ formatRupiah(Math.abs(variance)) }}
          </span>
        </div>
      </div>

      <AppButton variant="primary" block @click="submit">
        <IconVerifiedUser /> {{ COPY.shift.closeButton }}
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-primary-fixed);
  color: var(--color-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}
.sub {
  color: var(--color-ink-soft);
  font-size: 13px;
  margin: 0 0 20px;
  text-align: center;
}
.form {
  text-align: left;
}
.summary {
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  padding: 14px;
  margin-bottom: 16px;
  font-size: 13px;
  background: var(--color-surface-container-low);
}
.row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  align-items: center;
}
.lbl {
  color: var(--color-ink-soft);
}

.variance-row {
  border-top: 1px solid var(--color-line);
  margin-top: 6px;
  padding-top: 10px;
}

.variance {
  font-weight: 700;
}
.variance.negative {
  color: var(--color-error);
}
.variance.positive {
  color: var(--color-tertiary-container);
}
</style>