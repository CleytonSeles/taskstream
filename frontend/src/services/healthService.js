import api from './api.js'

export const healthService = {
  // Verificar status da API
  async checkHealth() {
    try {
      const response = await api.get('/api/v1/health')
      return response.data
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`)
    }
  },

  // Obter informações básicas da API
  async getApiInfo() {
    try {
      const response = await api.get('/')
      return response.data
    } catch (error) {
      throw new Error(`Failed to get API info: ${error.message}`)
    }
  }
}