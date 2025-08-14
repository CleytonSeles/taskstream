<template>
  <div class="bg-white rounded-lg shadow-md p-6 mb-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-4">🔗 API Connection Status</h2>
    
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center text-blue-600">
      <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
      Checking connection...
    </div>

    <!-- Success State -->
    <div v-else-if="apiInfo && healthInfo" class="space-y-4">
      <div class="flex items-center text-green-600">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
        </svg>
        Connected to TaskStream API
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div class="bg-green-50 p-4 rounded-lg">
          <h3 class="font-semibold text-green-800 mb-2">API Info</h3>
          <p class="text-sm text-green-700">{{ apiInfo.message }}</p>
          <p class="text-xs text-green-600">Version: {{ apiInfo.version }}</p>
        </div>

        <div class="bg-blue-50 p-4 rounded-lg">
          <h3 class="font-semibold text-blue-800 mb-2">Health Status</h3>
          <p class="text-sm text-blue-700">Status: {{ healthInfo.status }}</p>
          <p class="text-xs text-blue-600">Uptime: {{ Math.round(healthInfo.uptime) }}s</p>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center text-red-600">
      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
      </svg>
      {{ error }}
    </div>

    <button
      @click="checkConnection"
      class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
      :disabled="loading"
    >
      {{ loading ? 'Checking...' : 'Refresh Connection' }}
    </button>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { healthService } from '../services/healthService.js'

export default {
  name: 'ApiStatus',
  setup() {
    const loading = ref(false)
    const apiInfo = ref(null)
    const healthInfo = ref(null)
    const error = ref(null)

    const checkConnection = async () => {
      loading.value = true
      error.value = null
      apiInfo.value = null
      healthInfo.value = null

      try {
        // Verificar ambos os endpoints
        const [apiResponse, healthResponse] = await Promise.all([
          healthService.getApiInfo(),
          healthService.checkHealth()
        ])

        apiInfo.value = apiResponse
        healthInfo.value = healthResponse
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    // Verificar conexão quando o componente for montado
    onMounted(checkConnection)

    return {
      loading,
      apiInfo,
      healthInfo,
      error,
      checkConnection
    }
  }
}
</script>