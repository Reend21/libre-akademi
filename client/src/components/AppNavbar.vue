<script setup>
import { RouterLink } from 'vue-router'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <nav class="navbar">
    <div class="container flex justify-between items-center navbar-content">
      <div class="flex items-center gap-4">
        <RouterLink to="/" class="logo">libre akademi</RouterLink>
        <div class="nav-links">
          <RouterLink to="/courses" class="nav-link">Kurslar</RouterLink>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <!-- Temporary Buttons -->
        <RouterLink to="/login" class="nav-link">Giriş Yap</RouterLink>
        <RouterLink to="/upload" class="btn-primary">Kurs Yükle</RouterLink>
        
        <button 
          @click="themeStore.toggleTheme" 
          class="theme-toggle" 
          :title="themeStore.isDark ? 'Açık Tema' : 'Koyu Tema'"
        >
          {{ themeStore.isDark ? '☀️' : '🌙' }}
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background-color: var(--bg-card);
  border-bottom: 2px solid var(--border-color);
  padding: 1rem 0;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.navbar-content {
  min-height: 40px;
}
.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-right: 1.5rem;
}
.logo:hover {
  color: var(--accent);
}
.nav-links {
  display: flex;
  gap: 1rem;
}
.nav-link {
  color: var(--text-primary);
  font-weight: 600;
}
.nav-link:hover {
  color: var(--accent);
}
.btn-primary {
  background-color: var(--accent);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  transition: transform 0.1s;
}
.btn-primary:active {
  transform: scale(0.95);
}
[data-theme="dark"] .btn-primary {
  color: var(--bg-primary);
}
.theme-toggle {
  background: transparent;
  color: var(--text-primary);
  font-size: 1.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.theme-toggle:hover {
  background: var(--bg-secondary);
  color: var(--accent);
}
</style>
