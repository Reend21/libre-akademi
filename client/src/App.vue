<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
import { useThemeStore } from './stores/theme'

// Initialize theme store to bind watch effect
useThemeStore()

const route = useRoute()
const showFooter = computed(() => {
  return !['login', 'upload'].includes(route.name)
})
</script>

<template>
  <div class="app-wrapper flex flex-col" style="min-height: 100vh;">
    <AppNavbar />
    <main class="container" style="flex: 1;">
      <RouterView />
    </main>
    <AppFooter v-if="showFooter" />
  </div>
</template>

<style scoped>
/* App specific global layout could go here */
</style>
