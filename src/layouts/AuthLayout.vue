<script setup>
/**
 * Layout route for gate screens (Login, Shift, 403, 404).
 * Renders its child route via <router-view />.
 */
</script>

<template>
  <div class="auth-layout">
    <div class="auth-card">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  position: fixed;
  inset: 0;
  background: var(--color-canvas);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  padding-top: calc(20px + env(safe-area-inset-top, 0px));
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
  z-index: 40;
}

.auth-card {
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-m);
  box-shadow: var(--shadow-2);
  padding: 32px;
  width: 340px;
  text-align: center;
}
</style>