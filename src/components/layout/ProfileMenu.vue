<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store.js'
import { useShift } from '@/features/shift/composables/useShift.js'
import { useToast } from '@/composables/useToast.js'
import { formatRupiah } from '@/composables/useFormatters.js'
import AppIcon from '@/components/ui/AppIcon.vue'
import AvatarInitials from '@/components/ui/AvatarInitials.vue'

const router = useRouter()
const auth = useAuthStore()
const shift = useShift()
const { push } = useToast()

const open = ref(false)
const root = ref(null)

const initial = computed(() => auth.initials || '?')
const roleLabel = computed(() => {
  if (!auth.role) return ''
  return auth.role.charAt(0).toUpperCase() + auth.role.slice(1)
})

const shiftStartLabel = computed(() => {
  if (!shift.hasOpenShift.value) return 'No shift open'
  const amount = shift.startingCash.value
  return `Started · ${formatRupiah(amount)}`
})

const expected = computed(() => shift.expected.value)

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function handleDocClick(e) {
  if (!open.value) return
  if (root.value && !root.value.contains(e.target)) close()
}

async function logout() {
  close()
  if (auth.role === 'cashier' && shift.hasOpenShift.value) {
    router.push({ name: 'shift.close' })
    return
  }
  await auth.logout()
  push('Logged out')
  router.push({ name: 'login' })
}

onMounted(() => document.addEventListener('mousedown', handleDocClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleDocClick))
</script>

<template>
  <div ref="root" class="profile-root">
    <button
      type="button"
      class="profile-chip"
      :aria-expanded="open"
      @click="toggle"
    >
      <AvatarInitials :name="auth.user?.name || ''" :size="30" tone="primary" />
      <span class="profile-name">{{ auth.user?.name || 'Guest' }}</span>
      <span v-if="auth.role" class="profile-role">{{ roleLabel }}</span>
      <AppIcon name="expand-more" :size="18" class="chev" :class="{ rotated: open }" />
    </button>

    <Transition name="profile-fade">
      <div v-if="open" class="profile-menu" role="menu">
        <div class="menu-section">
          <span class="menu-label">Profile</span>
          <div class="profile-row">
            <AvatarInitials :name="auth.user?.name || ''" :size="40" tone="primary" />
            <div class="profile-detail">
              <span class="profile-fullname">{{ auth.user?.name || 'Guest' }}</span>
              <span class="profile-username">@{{ auth.user?.username || 'guest' }}</span>
              <span class="profile-role-pill">{{ roleLabel }}</span>
            </div>
          </div>
        </div>

        <div class="menu-separator"></div>

        <div class="menu-section">
          <span class="menu-label">Shift Information</span>
          <div class="shift-row">
            <AppIcon name="schedule" :size="18" class="shift-icon" />
            <div class="shift-detail">
              <span class="shift-status" :class="{ active: shift.hasOpenShift.value }">
                {{ shift.hasOpenShift.value ? 'Shift Open' : 'No shift open' }}
              </span>
              <span class="shift-meta">{{ shiftStartLabel }}</span>
              <span v-if="shift.hasOpenShift.value" class="shift-meta">
                Expected: {{ formatRupiah(expected) }}
              </span>
            </div>
          </div>
        </div>

        <div class="menu-separator"></div>

        <button type="button" class="menu-item" role="menuitem" @click="logout">
          <AppIcon name="logout" :size="16" />
          <span>Logout</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.profile-root {
  position: relative;
}

.profile-chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 5px 12px 5px 5px;
  background: transparent;
  border-radius: var(--radius-full);
  transition: background 120ms;
}
.profile-chip:hover {
  background: var(--surface-hover);
}

.profile-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
}

.profile-role {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--primary);
  background: var(--primary-tint);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.chev {
  color: var(--text-muted);
  transition: transform 150ms;
}
.chev.rotated {
  transform: rotate(180deg);
}

.profile-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 300px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-3);
  padding: 8px;
  z-index: 60;
}

.menu-section {
  padding: 10px 12px;
}

.menu-label {
  display: block;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-faint);
  margin-bottom: 10px;
}

.profile-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.profile-fullname {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.profile-username {
  font-size: 12px;
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
}

.profile-role-pill {
  align-self: flex-start;
  margin-top: 4px;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--primary);
  background: var(--primary-tint);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.menu-separator {
  height: 1px;
  background: var(--border);
  margin: 4px 0;
}

.shift-row {
  display: flex;
  gap: 10px;
}

.shift-icon {
  color: var(--text-muted);
  margin-top: 2px;
}

.shift-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.shift-status {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-muted);
}
.shift-status.active {
  color: var(--success);
}

.shift-meta {
  font-size: 12px;
  color: var(--text-muted);
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  transition: background 120ms;
}
.menu-item:hover {
  background: var(--surface-hover);
  color: var(--primary);
}

.profile-fade-enter-active,
.profile-fade-leave-active {
  transition: opacity 120ms ease, transform 120ms ease;
}
.profile-fade-enter-from,
.profile-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>