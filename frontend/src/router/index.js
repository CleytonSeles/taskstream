import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireAdmin, requireGuest } from './guards.js'
import HomeView from '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue'
import LoginForm from '../components/LoginForm.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginForm,
      beforeEnter: requireGuest,
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      beforeEnter: requireAuth,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      beforeEnter: requireAdmin,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    // Redirecionar rotas não encontradas
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

export default router
