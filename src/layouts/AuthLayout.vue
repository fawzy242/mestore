<script setup>
/**
 * Layout route for gate screens (Login, Shift, 403, 404).
 * Renders its child route via <router-view />.
 *
 * The background image is loaded from /public/bg.png (served at /bg.png).
 * No overlay, no blur — the image is rendered as-is with `background-size: cover`.
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
  box-sizing: border-box;
  z-index: 40;

  /* Background image — rendered directly on the layout element.
     No transform, no extra scaling, no overlay. */
  background-image: url('/bg.png');
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;

  /* Layout */
  display: flex;
  overflow: auto; /* only scrolls if the card is taller than the viewport */
  padding: 20px;
  padding-top: calc(20px + env(safe-area-inset-top, 0px));
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
}

.auth-card {
  /* `margin: auto` centers the card when there is room and allows
     proper scrolling when the content is taller than the viewport. */
  margin: auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-3);
  padding: 32px 28px;
  width: 100%;
  max-width: 380px;
  text-align: center;
}

@media (max-width: 480px) {
  .auth-layout {
    padding: 16px;
    padding-top: calc(16px + env(safe-area-inset-top, 0px));
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  }
  .auth-card {
    padding: 26px 20px;
    border-radius: var(--radius-md);
  }
}
</style>