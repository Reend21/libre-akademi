<script setup>
import { RouterView } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import { useThemeStore } from './stores/theme'

// Initialize theme store to bind watch effect
useThemeStore()
</script>

<template>
  <AppNavbar />
  <main class="container">
    <RouterView />
  </main>
</template>

<style scoped>
/* App specific global layout could go here */
</style>
