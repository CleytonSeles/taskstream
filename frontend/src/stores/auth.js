import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService.js'

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref(null)
  const token = ref(localStorage.getItem('taskstream_token'))
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Actions
  function setToken(newToken) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('taskstream_token', newToken)
      // Configurar token no axios
      authService.setAuthToken(newToken)
    } else {
      localStorage.removeItem('taskstream_token')
      // Remover token do axios
      authService.setAuthToken(null)
    }
  }

  function setUser(userData) {
    user.value = userData
  }

  function setLoading(isLoading) {
    loading.value = isLoading
  }

  function setError(errorMessage) {
    error.value = errorMessage
  }

  function clearAuth() {
    user.value = null
    token.value = null
    localStorage.removeItem('taskstream_token')
    error.value = null
  }

  // Inicializar autenticação (verificar se há token válido)
  async function initAuth() {
    const storedToken = localStorage.getItem('taskstream_token')
    if (storedToken) {
      setToken(storedToken)
      // Token será configurado automaticamente no setToken
    }
  }

  return {
    // Estado
    user,
    token,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    isAdmin,
    
    // Actions
    setToken,
    setUser,
    setLoading,
    setError,
    clearAuth,
    initAuth
  }
})
