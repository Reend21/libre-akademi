import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
    { path: '/courses', name: 'courses', component: () => import('../views/CoursesView.vue') },
    { path: '/courses/:id', name: 'course-detail', component: () => import('../views/CourseDetailView.vue') },
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
    { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue') },
    { path: '/forgot-password', name: 'forgot-password', component: () => import('../views/ForgotPasswordView.vue') },
    { path: '/reset-password/:token', name: 'reset-password', component: () => import('../views/ResetPasswordView.vue') },
    { path: '/auth/callback', name: 'auth-callback', component: () => import('../views/AuthCallbackView.vue') },
    { path: '/upload', name: 'upload', component: () => import('../views/CourseUploadView.vue'), meta: { requiresAuth: true } },
    { path: '/profile', redirect: () => {
        const authStore = useAuthStore()
        return authStore.user ? `/profile/${authStore.user.username}` : '/login'
    }},
    { path: '/profile/edit', name: 'profile-edit', component: () => import('../views/ProfileEditView.vue'), meta: { requiresAuth: true } },
    { path: '/profile/:username', name: 'profile', component: () => import('../views/ProfileView.vue') },
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
