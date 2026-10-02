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
  <Toast position="bottom-center" />
  <ConfirmDialog :draggable="false" />
</template>