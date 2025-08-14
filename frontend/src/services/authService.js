import api from './api.js'
import { useAuthStore } from '@/stores/auth.js'

export const authService = {
  // Registrar usuário
  async register(userData) {
    try {
      const response = await api.post('/api/v1/auth/register', userData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao registrar usuário')
    }
  },

  // Login
  async login(credentials) {
    try {
      const response = await api.post('/api/v1/auth/login', credentials)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao fazer login')
    }
  },

  // Obter perfil do usuário
  async getProfile() {
    try {
      const response = await api.get('/api/v1/auth/me')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao obter perfil')
    }
  },

  // Logout
  async logout() {
    try {
      await api.post('/api/v1/auth/logout')
    } catch (error) {
      // Logout local mesmo se falhar no servidor
      console.warn('Erro no logout do servidor:', error.message)
    }
  },

  // Configurar token no header das requisições
  setAuthToken(token) {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  },

  // Login com store
  async loginWithStore(credentials) {
    const authStore = useAuthStore()
    
    authStore.setLoading(true)
    authStore.setError(null)

    try {
      const response = await this.login(credentials)
      
      // Salvar token e usuário no store
      authStore.setToken(response.data.token)
      authStore.setUser(response.data.user)
      
      // Configurar token para futuras requisições
      this.setAuthToken(response.data.token)
      
      return response

    } catch (error) {
      authStore.setError(error.message)
      throw error
    } finally {
      authStore.setLoading(false)
    }
  },

  // Registro com store
  async registerWithStore(userData) {
    const authStore = useAuthStore()
    
    authStore.setLoading(true)
    authStore.setError(null)

    try {
      const response = await this.register(userData)
      
      // Salvar token e usuário no store
      authStore.setToken(response.data.token)
      authStore.setUser(response.data.user)
      
      // Configurar token para futuras requisições
      this.setAuthToken(response.data.token)
      
      return response

    } catch (error) {
      authStore.setError(error.message)
      throw error
    } finally {
      authStore.setLoading(false)
    }
  },

  // Logout com store
  async logoutWithStore() {
    const authStore = useAuthStore()
    
    try {
      await this.logout()
    } finally {
      // Limpar dados locais
      authStore.clearAuth()
      this.setAuthToken(null)
    }
  },

  // Verificar token atual
  async verifyToken() {
    const authStore = useAuthStore()
    
    if (!authStore.token) return false

    try {
      this.setAuthToken(authStore.token)
      const response = await this.getProfile()
      authStore.setUser(response.data.user)
      return true
    } catch (error) {
      // Token inválido, limpar autenticação
      authStore.clearAuth()
      this.setAuthToken(null)
      return false
    }
  }
}
