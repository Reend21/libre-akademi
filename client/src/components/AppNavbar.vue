<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useThemeStore } from '../stores/theme'

import logoDark from '../assets/logos/libre-akademi.png'
import logoLight from '../assets/logos/libre-akademi-light.png'

const themeStore = useThemeStore()
const router = useRouter()

const currentLogo = computed(() => {
  return themeStore.isDark ? logoDark : logoLight
})

const searchQuery = ref('')
const currentLang = ref('TR')
const langs = ['TR', 'EN', 'DE']

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/courses', query: { q: searchQuery.value } })
  }
}

const switchLang = () => {
  const idx = langs.indexOf(currentLang.value)
  currentLang.value = langs[(idx + 1) % langs.length]
}
</script>

<template>
  <nav class="navbar">
    <div class="container navbar-content">
      <!-- Left: Logo + Kurslar -->
      <div class="flex items-center gap-4 navbar-left">
        <RouterLink to="/" class="logo">
          <img :src="currentLogo" alt="libre akademi" width="128" height="128">
        </RouterLink>
        <div class="nav-links">
          <RouterLink to="/courses" class="nav-link"><i class="bi bi-search"></i> Kurslar</RouterLink>
        </div>
      </div>

      <!-- Center: Search -->
      <div class="navbar-search">
        <form @submit.prevent="handleSearch" class="search-form">
          <i class="bi bi-search search-icon"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Kurs ara..."
            class="search-input"
          />
        </form>
      </div>

      <!-- Right: Buttons -->
      <div class="flex items-center gap-4 navbar-right">
        <RouterLink to="/login" class="nav-link" title="Giriş Yap"><i class="bi bi-box-arrow-in-right"></i> Giriş Yap</RouterLink>
        <RouterLink to="/upload" class="btn-primary" title="Kurs Yükle"><i class="bi bi-cloud-arrow-up-fill"></i> Kurs Yükle</RouterLink>

        <button class="lang-toggle" @click="switchLang" :title="`Dil: ${currentLang}`">
          <i class="bi bi-globe"></i>
        </button>

        <button
          @click="themeStore.toggleTheme"
          class="theme-toggle"
          :title="themeStore.isDark ? 'Açık Tema' : 'Koyu Tema'"
        >
          <i :class="themeStore.isDark ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill'"></i>
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
  display: grid;
  grid-template-columns: 1fr minmax(auto, 700px) 1fr;
  align-items: center;
  gap: 30px;
  min-height: 40px;
}
.navbar-left {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 2rem;
  width: 100%;
}
.navbar-right {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
  width: 100%;
}
.navbar-search {
  display: flex;
  justify-content: center;
  width: 100%;
}
.search-form {
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 999px;
  padding: 0.5rem 1.2rem;
  gap: 0.5rem;
  width: 100%;
  transition: border-color 0.2s;
}
.search-form:focus-within {
  border-color: var(--accent);
}
.search-icon {
  color: var(--text-secondary);
  font-size: 0.95rem;
  flex-shrink: 0;
}
.search-input {
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.95rem;
  width: 100%;
}
.search-input::placeholder {
  color: var(--text-secondary);
}
.lang-toggle {
  background: transparent;
  color: var(--text-primary);
  border: none;
  font-size: 1.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  font-weight: 700;
  transition: all 0.2s ease;
}
.lang-toggle:hover {
  background: var(--bg-secondary);
  color: var(--accent);
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
  background-color: var(--bg-primary);
  border: 2px solid var(--accent);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.nav-link:hover {
  background-color: var(--accent);
  color: var(--bg-primary);
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
