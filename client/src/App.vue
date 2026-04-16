<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
import { useThemeStore } from './stores/theme'

useThemeStore()

const route = useRoute()
const showFooter = computed(() => {
  return !['login', 'register', 'upload'].includes(route.name)
})

const routeKey = computed(() => route.fullPath)
</script>

<template>
  <div class="app-wrapper flex flex-col" style="min-height: 100vh;">
    <AppNavbar />
    <main class="main-area" style="flex: 1;">
      <div class="page-transition-wrapper">
        <RouterView v-slot="{ Component, route: currentRoute }">
          <transition :name="currentRoute.meta.transition || 'parallax'" mode="out-in">
            <component :is="Component" :key="currentRoute.fullPath" />
          </transition>
        </RouterView>
      </div>
    </main>
    <AppFooter v-if="showFooter" />
  </div>
</template>

<style scoped>
.parallax-enter-active,
.parallax-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.parallax-enter-from {
  opacity: 0;
  transform: translateX(60px);
}

.parallax-leave-to {
  opacity: 0;
  transform: translateX(-60px);
}

.parallax-enter-to,
.parallax-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.3s ease;
}

.zoom-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.zoom-leave-to {
  opacity: 0;
  transform: scale(1.05);
}
</style>
