import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const storedTheme = localStorage.getItem('theme-dark')
  // Default to system preference if no localStorage value
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = ref(storedTheme !== null ? storedTheme === 'true' : prefersDark)

  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  watch(isDark, (val) => {
    localStorage.setItem('theme-dark', val.toString())
    if (val) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, { immediate: true })

  return { isDark, toggleTheme }
})
