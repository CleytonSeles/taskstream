<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <h1 class="text-3xl font-bold text-gray-900">
              🚀 TaskStream Dashboard
            </h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Info do usuário -->
            <div class="text-sm">
              <p class="text-gray-700">Olá, <span class="font-semibold">{{ authStore.user?.name }}</span>!</p>
              <p class="text-gray-500">{{ authStore.user?.email }}</p>
            </div>
            
            <!-- Badge de role -->
            <span 
              :class="roleClasses"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            >
              {{ authStore.user?.role === 'admin' ? '👑 Admin' : '👤 Usuário' }}
            </span>
            
            <!-- Botão logout -->
            <button
              @click="handleLogout"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Cards de estatísticas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <span class="text-2xl">📋</span>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Tarefas Totais
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{ stats.totalTasks }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <span class="text-2xl">✅</span>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Concluídas
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{ stats.completedTasks }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <span class="text-2xl">⏳</span>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Pendentes
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{ stats.pendingTasks }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Seção de tarefas recentes -->
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Tarefas Recentes
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              Suas tarefas mais recentes aparecerão aqui.
            </p>
          </div>
          <ul class="divide-y divide-gray-200">
            <li v-for="task in recentTasks" :key="task.id" class="px-4 py-4 sm:px-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <span class="text-lg mr-3">{{ task.emoji }}</span>
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      {{ task.title }}
                    </p>
                    <p class="text-sm text-gray-500">
                      {{ task.description }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center">
                  <span 
                    :class="getStatusClass(task.status)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ task.status }}
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Painel admin (apenas para admins) -->
        <div v-if="authStore.isAdmin" class="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div class="flex items-center">
            <span class="text-2xl mr-3">👑</span>
            <div>
              <h3 class="text-lg font-medium text-amber-800">
                Painel Administrativo
              </h3>
              <p class="text-sm text-amber-700 mt-1">
                Você tem acesso a funcionalidades administrativas especiais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { authService } from '@/services/authService.js'

export default {
  name: 'DashboardView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    // Dados mock das tarefas (posteriormente virão da API)
    const stats = ref({
      totalTasks: 12,
      completedTasks: 8,
      pendingTasks: 4
    })

    const recentTasks = ref([
      {
        id: 1,
        title: 'Implementar autenticação JWT',
        description: 'Criar sistema completo de login e registro',
        status: 'Concluída',
        emoji: '🔐'
      },
      {
        id: 2,
        title: 'Criar dashboard responsivo',
        description: 'Interface principal com estatísticas',
        status: 'Em andamento',
        emoji: '📊'
      },
      {
        id: 3,
        title: 'Configurar banco PostgreSQL',
        description: 'Setup do banco de dados em produção',
        status: 'Pendente',
        emoji: '🗄️'
      }
    ])

    const roleClasses = computed(() => {
      return authStore.isAdmin 
        ? 'bg-purple-100 text-purple-800'
        : 'bg-blue-100 text-blue-800'
    })

    const getStatusClass = (status) => {
      const classes = {
        'Concluída': 'bg-green-100 text-green-800',
        'Em andamento': 'bg-yellow-100 text-yellow-800',
        'Pendente': 'bg-gray-100 text-gray-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const handleLogout = async () => {
      try {
        await authService.logoutWithStore()
        router.push('/login')
      } catch (error) {
        console.error('Erro no logout:', error)
      }
    }

    onMounted(() => {
      // Verificar se o usuário ainda está autenticado
      if (!authStore.isAuthenticated) {
        router.push('/login')
      }
    })

    return {
      authStore,
      stats,
      recentTasks,
      roleClasses,
      getStatusClass,
      handleLogout
    }
  }
}
</script>
