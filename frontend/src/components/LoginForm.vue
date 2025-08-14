<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          🚀 TaskStream
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ isLogin ? 'Faça login em sua conta' : 'Crie sua conta gratuita' }}
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <!-- Nome (apenas para registro) -->
        <div v-if="!isLogin">
          <label for="name" class="sr-only">Nome</label>
          <input
            id="name"
            name="name"
            type="text"
            v-model="form.name"
            :class="inputClasses"
            placeholder="Nome completo"
            required
          />
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="sr-only">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            v-model="form.email"
            :class="inputClasses"
            placeholder="Email"
            required
          />
        </div>

        <!-- Senha -->
        <div>
          <label for="password" class="sr-only">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            v-model="form.password"
            :class="inputClasses"
            placeholder="Senha"
            required
          />
        </div>

        <!-- Erro -->
        <div v-if="authStore.error" class="text-red-600 text-sm text-center">
          {{ authStore.error }}
        </div>

        <!-- Botão Submit -->
        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="authStore.loading" class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processando...
            </span>
            <span v-else>
              {{ isLogin ? 'Entrar' : 'Registrar' }}
            </span>
          </button>
        </div>

        <!-- Toggle Login/Register -->
        <div class="text-center">
          <button
            type="button"
            @click="toggleMode"
            class="text-indigo-600 hover:text-indigo-500"
          >
            {{ isLogin ? 'Não tem conta? Registre-se' : 'Já tem conta? Faça login' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { authService } from '@/services/authService.js'

export default {
  name: 'LoginForm',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const isLogin = ref(true)
    const form = ref({
      name: '',
      email: '',
      password: ''
    })

    const inputClasses = "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"

    const toggleMode = () => {
      isLogin.value = !isLogin.value
      authStore.setError(null)
      form.value = { name: '', email: '', password: '' }
    }

    const handleSubmit = async () => {
      try {
        if (isLogin.value) {
          await authService.loginWithStore({
            email: form.value.email,
            password: form.value.password
          })
        } else {
          await authService.registerWithStore({
            name: form.value.name,
            email: form.value.email,
            password: form.value.password
          })
        }

        // Redirecionar para dashboard
        router.push('/dashboard')
        
      } catch (error) {
        // Erro já foi tratado no service
        console.error('Erro na autenticação:', error.message)
      }
    }

    return {
      isLogin,
      form,
      authStore,
      inputClasses,
      toggleMode,
      handleSubmit
    }
  }
}
</script>
