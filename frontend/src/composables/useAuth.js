import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLocalStorage } from './useLocalStorage.js'
import authService from '../services/authService.js'

// Estado global da autenticação
const user = ref(null)
const token = ref(null)
const isLoading = ref(false)
const error = ref(null)

// Persistência do token
const persistedToken = useLocalStorage('taskstream-token', null)
const persistedUser = useLocalStorage('taskstream-user', null)

/**
 * Composable para gerenciar autenticação
 */
export function useAuth() {
  const router = useRouter()

  // Computed properties
  const isAuthenticated = computed(() => {
    return !!(token.value && user.value)
  })

  const isAdmin = computed(() => {
    return user.value?.role === 'admin'
  })

  const userInitials = computed(() => {
    if (!user.value?.name) return ''
    return user.value.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  })

  const userDisplayName = computed(() => {
    return user.value?.name || user.value?.email || 'Usuário'
  })

  // Methods
  const setAuthData = (authData) => {
    if (authData.token) {
      token.value = authData.token
      persistedToken.value = authData.token
    }
    
    if (authData.user) {
      user.value = authData.user
      persistedUser.value = authData.user
    }
    
    error.value = null
  }

  const clearAuthData = () => {
    user.value = null
    token.value = null
    persistedToken.value = null
    persistedUser.value = null
    error.value = null
  }

  const login = async (credentials) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await authService.login(credentials)
      
      if (response.success) {
        setAuthData({
          token: response.token,
          user: response.user
        })
        
        // Redirecionar para dashboard ou página anterior
        const redirectTo = router.currentRoute.value.query.redirect || '/dashboard'
        await router.push(redirectTo)
        
        return { success: true, user: response.user }
      } else {
        error.value = response.message || 'Erro ao fazer login'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = err.message || 'Erro de conexão'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await authService.register(userData)
      
      if (response.success) {
        setAuthData({
          token: response.token,
          user: response.user
        })
        
        await router.push('/dashboard')
        return { success: true, user: response.user }
      } else {
        error.value = response.message || 'Erro ao criar conta'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = err.message || 'Erro de conexão'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (redirect = true) => {
    try {
      isLoading.value = true
      
      // Tentar fazer logout no servidor
      if (token.value) {
        await authService.logout()
      }
    } catch (err) {
      console.warn('Erro ao fazer logout no servidor:', err)
    } finally {
      // Limpar dados locais independentemente do resultado
      clearAuthData()
      isLoading.value = false
      
      if (redirect) {
        await router.push('/login')
      }
    }
  }

  const refreshToken = async () => {
    try {
      if (!token.value) {
        throw new Error('Token não encontrado')
      }

      const response = await authService.refreshToken()
      
      if (response.success) {
        setAuthData({
          token: response.token,
          user: response.user
        })
        return { success: true }
      } else {
        // Token inválido, fazer logout
        await logout()
        return { success: false, error: 'Sessão expirada' }
      }
    } catch (err) {
      await logout()
      return { success: false, error: err.message }
    }
  }

  const updateProfile = async (profileData) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await authService.updateProfile(profileData)
      
      if (response.success) {
        user.value = { ...user.value, ...response.user }
        persistedUser.value = user.value
        return { success: true, user: user.value }
      } else {
        error.value = response.message || 'Erro ao atualizar perfil'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = err.message || 'Erro de conexão'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const changePassword = async (passwordData) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await authService.changePassword(passwordData)
      
      if (response.success) {
        return { success: true }
      } else {
        error.value = response.message || 'Erro ao alterar senha'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = err.message || 'Erro de conexão'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const forgotPassword = async (email) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await authService.forgotPassword(email)
      
      if (response.success) {
        return { success: true, message: response.message }
      } else {
        error.value = response.message || 'Erro ao enviar email'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = err.message || 'Erro de conexão'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const resetPassword = async (resetData) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await authService.resetPassword(resetData)
      
      if (response.success) {
        return { success: true, message: response.message }
      } else {
        error.value = response.message || 'Erro ao redefinir senha'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = err.message || 'Erro de conexão'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const checkAuth = async () => {
    try {
      // Verificar se há token persistido
      if (persistedToken.value && persistedUser.value) {
        token.value = persistedToken.value
        user.value = persistedUser.value
        
        // Validar token no servidor
        const response = await authService.validateToken()
        
        if (response.success) {
          // Token válido, atualizar dados do usuário se necessário
          if (response.user) {
            user.value = response.user
            persistedUser.value = response.user
          }
          return { success: true, user: user.value }
        } else {
          // Token inválido, limpar dados
          clearAuthData()
          return { success: false, error: 'Sessão expirada' }
        }
      }
      
      return { success: false, error: 'Não autenticado' }
    } catch (err) {
      clearAuthData()
      return { success: false, error: err.message }
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Verificar permissões
  const hasPermission = (permission) => {
    if (!user.value) return false
    
    // Admin tem todas as permissões
    if (user.value.role === 'admin') return true
    
    // Verificar permissões específicas
    return user.value.permissions?.includes(permission) || false
  }

  const hasRole = (role) => {
    return user.value?.role === role
  }

  // Watchers para sincronizar com localStorage
  watch(
    () => persistedToken.value,
    (newToken) => {
      if (newToken && newToken !== token.value) {
        token.value = newToken
      }
    },
    { immediate: true }
  )

  watch(
    () => persistedUser.value,
    (newUser) => {
      if (newUser && JSON.stringify(newUser) !== JSON.stringify(user.value)) {
        user.value = newUser
      }
    },
    { immediate: true }
  )

  return {
    // State
    user: readonly(user),
    token: readonly(token),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Computed
    isAuthenticated,
    isAdmin,
    userInitials,
    userDisplayName,
    
    // Methods
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    checkAuth,
    clearError,
    hasPermission,
    hasRole
  }
}

// Instância global para uso em toda a aplicação
let globalAuthInstance = null

export function useGlobalAuth() {
  if (!globalAuthInstance) {
    globalAuthInstance = useAuth()
  }
  return globalAuthInstance
}

// Guard para rotas que requerem autenticação
export function requireAuth(to, from, next) {
  const auth = useGlobalAuth()
  
  if (auth.isAuthenticated.value) {
    next()
  } else {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
}

// Guard para rotas que requerem admin
export function requireAdmin(to, from, next) {
  const auth = useGlobalAuth()
  
  if (auth.isAuthenticated.value && auth.isAdmin.value) {
    next()
  } else if (auth.isAuthenticated.value) {
    next('/dashboard') // Usuário logado mas não é admin
  } else {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
}

// Guard para rotas que requerem permissão específica
export function requirePermission(permission) {
  return (to, from, next) => {
    const auth = useGlobalAuth()
    
    if (auth.isAuthenticated.value && auth.hasPermission(permission)) {
      next()
    } else if (auth.isAuthenticated.value) {
      next('/dashboard') // Usuário logado mas sem permissão
    } else {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  }
}