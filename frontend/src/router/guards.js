import { useAuthStore } from '@/stores/auth.js'
import { authService } from '@/services/authService.js'

// Guard para rotas que precisam de autenticação
export async function requireAuth(to, from, next) {
  const authStore = useAuthStore()

  // Se não há token, redirecionar para login
  if (!authStore.token) {
    return next('/login')
  }

  // Se há token mas não há usuário, verificar token
  if (!authStore.user) {
    const isValid = await authService.verifyToken()
    if (!isValid) {
      return next('/login')
    }
  }

  next()
}

// Guard para rotas que precisam de admin
export async function requireAdmin(to, from, next) {
  const authStore = useAuthStore()

  // Primeiro verificar autenticação
  await requireAuth(to, from, (result) => {
    if (result === '/login') {
      return next('/login')
    }

    // Verificar se é admin
    if (!authStore.isAdmin) {
      return next('/dashboard') // Redirecionar para dashboard se não for admin
    }

    next()
  })
}

// Guard para rotas que só devem ser acessadas por usuários não autenticados
export function requireGuest(to, from, next) {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    return next('/dashboard')
  }

  next()
}
