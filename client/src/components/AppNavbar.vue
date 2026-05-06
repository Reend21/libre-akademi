<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'
import { authApi } from '../api/auth'

import logoDark from '../assets/logos/libre-akademi.png'
import logoLight from '../assets/logos/libre-akademi-light.png'

const themeStore = useThemeStore()
const authStore = useAuthStore()
const router = useRouter()

const currentLogo = computed(() => {
  return themeStore.isDark ? logoDark : logoLight
})

const searchQuery = ref('')
const currentLang = ref(authStore.user?.preferredLanguage?.toUpperCase() || 'TR')
const isLangDropdownOpen = ref(false)

const langs = [
  { code: 'AR', name: 'Arapça' },
  { code: 'TR', name: 'Türkçe' },
  { code: 'EN', name: 'İngilizce' },
  { code: 'ES', name: 'İspanyolca' },
  { code: 'AZ', name: 'Azerbeycanca' }
]

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/courses', query: { q: searchQuery.value } })
  }
}

const toggleLangDropdown = () => {
  isLangDropdownOpen.value = !isLangDropdownOpen.value
}

const selectLang = async (lang) => {
  currentLang.value = lang.code
  isLangDropdownOpen.value = false
  
  if (authStore.isLoggedIn) {
    try {
      await authApi.updateLanguage(authStore.token, lang.code.toLowerCase())
      authStore.setLanguage(lang.code.toLowerCase())
    } catch (error) {
      console.error('Dil güncellenemedi:', error)
    }
  }
}

const closeDropdown = (e) => {
  if (!e.target.closest('.lang-selector')) {
    isLangDropdownOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown)
})

watch(() => authStore.user?.preferredLanguage, (newLang) => {
  if (newLang) {
    currentLang.value = newLang.toUpperCase()
  }
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="navbar">
    <div class="container navbar-content">
      <!-- Left: Logo + Actions -->
      <div class="flex items-center gap-6 navbar-left">
        <RouterLink to="/" class="logo">
          <img :src="currentLogo" alt="libre akademi" width="90" height="90">
        </RouterLink>
        <div class="nav-links">
          <RouterLink v-if="!authStore.isLoggedIn" to="/login" class="btn-primary" title="Kurs Yükle">
            <i class="bi bi-cloud-arrow-up-fill"></i> Kurs Yükle
          </RouterLink>
          <RouterLink v-else to="/upload" class="btn-primary" title="Kurs Yükle">
            <i class="bi bi-cloud-arrow-up-fill"></i> Kurs Yükle
          </RouterLink>
          <RouterLink to="/courses" class="nav-link"><i class="bi bi-search"></i> Kurslar</RouterLink>
        </div>
      </div>

      <!-- Center: Large Search -->
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

      <!-- Right: User & Utils -->
      <div class="flex items-center gap-4 navbar-right">
        <template v-if="!authStore.isLoggedIn">
          <RouterLink to="/login" class="nav-link" title="Giriş Yap"><i class="bi bi-box-arrow-in-right"></i> Giriş Yap</RouterLink>
        </template>
        <template v-else>
          <RouterLink to="/profile" class="nav-link" title="Profil"><i class="bi bi-person-circle"></i> {{ authStore.user?.name || 'Profil' }}</RouterLink>
          <button @click="handleLogout" class="nav-link logout-btn" title="Çıkış Yap"><i class="bi bi-box-arrow-right"></i></button>
        </template>

        <div class="lang-selector">
          <button class="lang-toggle" @click.stop="toggleLangDropdown" :title="`Dil: ${currentLang}`">
            <i class="bi bi-globe"></i>
            <span class="lang-code">{{ currentLang }}</span>
          </button>
          
          <div v-if="isLangDropdownOpen" class="lang-dropdown">
            <button 
              v-for="lang in langs" 
              :key="lang.code"
              class="lang-option"
              :class="{ active: currentLang === lang.code }"
              @click="selectLang(lang)"
            >
              {{ lang.name }}
            </button>
          </div>
        </div>

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
  padding: 0.5rem 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.navbar-content {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 40px;
  min-height: 50px;
}
.navbar-left {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 2.5rem;
}
.navbar-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1.5rem;
}
.navbar-search {
  display: flex;
  justify-content: center;
}
.search-form {
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 0.6rem 1.2rem;
  gap: 0.75rem;
  width: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.search-form:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(250, 189, 47, 0.1);
  transform: scale(1.02);
}
.search-icon {
  color: var(--text-secondary);
  font-size: 1.1rem;
  flex-shrink: 0;
}
.search-input {
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1.1rem;
  width: 100%;
}
.search-input::placeholder {
  color: var(--text-secondary);
}
.lang-selector {
  position: relative;
}
.lang-toggle {
  background: transparent;
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  font-size: 1rem;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 700;
  transition: all 0.2s ease;
  cursor: pointer;
}
.lang-toggle:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.lang-code {
  font-size: 0.85rem;
}
.lang-dropdown {
  position: absolute;
  top: 120%;
  right: 0;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 0.5rem;
  min-width: 150px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.lang-option {
  background: transparent;
  border: none;
  color: var(--text-primary);
  padding: 0.6rem 1rem;
  text-align: left;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}
.lang-option:hover {
  background: var(--bg-secondary);
  color: var(--accent);
}
.lang-option.active {
  background: var(--accent);
  color: #fff;
}
[data-theme="dark"] .lang-option.active {
  color: var(--bg-primary);
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
  white-space: nowrap;
}
.nav-link:hover {
  background-color: var(--accent);
  color: var(--bg-primary);
}
.logout-btn {
  border: 2px solid var(--error);
  color: var(--error);
  padding: 0.5rem;
  width: 40px;
  height: 40px;
  justify-content: center;
}
.logout-btn:hover {
  background-color: var(--error);
  color: #fff;
}
.btn-primary {
  background-color: var(--accent);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  transition: transform 0.1s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
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
