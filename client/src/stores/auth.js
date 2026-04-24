import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const isLoggedIn = ref(!!token.value)
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)

  const login = (userData) => {
    isLoggedIn.value = true
    user.value = userData
    token.value = userData.token
    localStorage.setItem('token', userData.token)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    isLoggedIn.value = false
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const setUser = (userData) => {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const setLanguage = (lang) => {
    if (user.value) {
      user.value.preferredLanguage = lang
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  return { isLoggedIn, user, token, login, logout, setUser, setLanguage }
})
