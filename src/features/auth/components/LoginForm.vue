<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store.js'
import { useToast } from '@/composables/useToast.js'
import { useShift } from '@/features/shift/composables/useShift.js'
import { ROLE } from '@/constants/roles.js'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import { COPY } from '@/constants/copy.js'

const router = useRouter()
const auth = useAuthStore()
const { push } = useToast()
const shift = useShift()

const username = ref('siti')
const password = ref('password')
const isSubmitting = ref(false)
const errorMessage = ref('')

function landingRoute() {
  if (auth.role === ROLE.CASHIER) {
    return shift.hasOpenShift.value ? 'dashboard' : 'shift.open'
  }
  return 'dashboard'
}

async function submit() {
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    await auth.login({ username: username.value, password: password.value })
    const redirect = router.currentRoute.value.query.redirect
    if (typeof redirect === 'string' && redirect.length) {
      router.push(redirect)
    } else {
      router.push({ name: landingRoute() })
    }
    push('Signed in')
  } catch (error) {
    errorMessage.value = error?.message || COPY.auth.loginError
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="login-form" @submit.prevent="submit">
    <div class="gate-logo">M</div>
    <h2 class="title">{{ COPY.auth.loginTitle }}</h2>
    <p class="sub">{{ COPY.auth.loginSubtitle }}</p>

    <div class="fields">
      <AppInput
        v-model="username"
        :label="COPY.auth.loginUsername"
        placeholder="e.g. siti"
      />
      <AppInput
        v-model="password"
        :label="COPY.auth.loginPassword"
        type="password"
        placeholder="Enter password"
      />
    </div>

    <AppAlert v-if="errorMessage" variant="error" :message="errorMessage" />

    <AppButton
      variant="primary"
      type="submit"
      block
      :loading="isSubmitting"
      class="submit"
    >
      {{ COPY.auth.loginButton }}
    </AppButton>

    <p class="hint">
      Demo users: <span class="mono">fawzy</span> · <span class="mono">budi</span> ·
      <span class="mono">siti</span> (any password)
    </p>
  </form>
</template>

<style scoped>
.login-form {
  text-align: center;
}

.gate-logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--color-primary-container);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
  margin: 0 auto 16px;
  box-shadow: var(--shadow-1);
}

.title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 600;
}

.sub {
  color: var(--color-ink-soft);
  font-size: 13px;
  margin: 0 0 22px;
}

.fields {
  text-align: left;
}

.submit {
  margin-top: 4px;
}

.hint {
  font-size: 11px;
  color: var(--color-ink-soft);
  margin-top: 16px;
}
</style>