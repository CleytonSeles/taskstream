import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Configurar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status}`, response.data)
    return response
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api