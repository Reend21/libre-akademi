import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CoursesView from '../views/CoursesView.vue'
import LoginView from '../views/LoginView.vue'
import CourseUploadView from '../views/CourseUploadView.vue'
import CourseDetailView from '../views/CourseDetailView.vue'
import ProfileView from '../views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/courses', name: 'courses', component: CoursesView },
    { path: '/courses/:id', name: 'course-detail', component: CourseDetailView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/upload', name: 'upload', component: CourseUploadView },
    { path: '/profile', name: 'profile', component: ProfileView },
  ]
})


export default router

