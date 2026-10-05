<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useAuthStore } from '@/stores/auth.store.js'
import { useToast } from '@/composables/useToast.js'
import { COPY } from '@/constants/copy.js'

const router = useRouter()
const auth = useAuthStore()
const { push } = useToast()

const username = ref('siti')
const password = ref('password')
const isSubmitting = ref(false)
const errorMessage = ref('')

async function submit() {
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    await auth.login({ username: username.value, password: password.value })
    const redirect = router.currentRoute.value.query.redirect
    if (typeof redirect === 'string' && redirect.length) {
      router.push(redirect)
    } else {
      router.push({ name: 'dashboard' })
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
      <div class="field">
        <label>Username</label>
        <InputText
          v-model="username"
          placeholder="e.g. siti"
          class="w-full"
          autocomplete="username"
        />
      </div>

      <div class="field">
        <label>Password</label>
        <Password
          v-model="password"
          :feedback="false"
          toggle-mask
          placeholder="Enter password"
          input-class="w-full"
          class="w-full"
          autocomplete="current-password"
        />
      </div>
    </div>

    <Message v-if="errorMessage" severity="error" :closable="false" class="error-msg">
      {{ errorMessage }}
    </Message>

    <Button
      type="submit"
      :label="COPY.auth.loginButton"
      :loading="isSubmitting"
      class="submit"
    />

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
  width: 52px;
  height: 52px;
  border-radius: var(--radius-lg);
  background: var(--primary);
  color: var(--primary-fg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 22px;
  margin: 0 auto 18px;
}

.title {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
}

.sub {
  color: var(--text-muted);
  font-size: 13px;
  margin: 0 0 24px;
}

.fields {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-muted);
}

.field :deep(.p-inputtext),
.field :deep(.p-password),
.field :deep(.p-password-input) {
  width: 100%;
}

.error-msg {
  margin-bottom: 14px;
  text-align: left;
}

.submit {
  width: 100%;
  height: 46px;
  font-weight: 600;
}

.hint {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 16px;
}

.hint .mono {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  color: var(--text);
}
</style>