<template>
  <div id="app">
    <!-- Loading inicial -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Carregando TaskStream...</p>
      </div>
    </div>

    <!-- Aplicação -->
    <div v-else>
      <RouterView />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { authService } from '@/services/authService.js'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    const loading = ref(true)

    onMounted(async () => {
      try {
        // Inicializar autenticação
        await authStore.initAuth()
        
        // Se há token, verificar se ainda é válido
        if (authStore.token) {
          await authService.verifyToken()
        }
      } catch (error) {
        console.error('Erro na inicialização:', error)
      } finally {
        loading.value = false
      }
    })

    return {
      loading
    }
  }
}
</script>
