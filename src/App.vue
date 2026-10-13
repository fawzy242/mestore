<script setup>
import { onMounted } from 'vue'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import { useThemeStore } from '@/stores/theme.store.js'

const theme = useThemeStore()

onMounted(() => {
  theme.apply()
})
</script>

<template>
  <router-view />

  <!-- Global feedback surfaces — always above modals, single instance. -->
  <Toast
    position="top-right"
    group="default"
    :base-z-index="200"
  />
  <Toast
    position="bottom-center"
    group="persistent"
    :base-z-index="200"
  />
  <ConfirmDialog :draggable="false" :base-z-index="210" />
</template>