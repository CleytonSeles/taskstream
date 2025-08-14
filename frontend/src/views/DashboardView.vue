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
        <!-- Loading inicial -->
        <div v-if="initialLoading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Carregando dados...</p>
        </div>

        <div v-else>
          <!-- Cards de estatísticas reais -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <span class="text-2xl">📋</span>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Total de Tarefas
                      </dt>
                      <dd class="text-lg font-medium text-gray-900">
                        {{ tasksStore.stats.total }}
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
                      <dd class="text-lg font-medium text-yellow-600">
                        {{ tasksStore.stats.pending }}
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
                    <span class="text-2xl">🔄</span>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Em Andamento
                      </dt>
                      <dd class="text-lg font-medium text-blue-600">
                        {{ tasksStore.stats.inProgress }}
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
                      <dd class="text-lg font-medium text-green-600">
                        {{ tasksStore.stats.completed }}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Lista de tarefas -->
          <TaskList />

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
                <router-link 
                  to="/admin" 
                  class="inline-block mt-2 text-amber-800 hover:text-amber-900 font-medium"
                >
                  Acessar painel admin →
                </router-link>
              </div>
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
import { useTasksStore } from '@/stores/tasks.js'
import { authService } from '@/services/authService.js'
import TaskList from '@/components/TaskList.vue'

export default {
  name: 'DashboardView',
  components: {
    TaskList
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const tasksStore = useTasksStore()
    const initialLoading = ref(true)

    const roleClasses = computed(() => {
      return authStore.isAdmin 
        ? 'bg-purple-100 text-purple-800'
        : 'bg-blue-100 text-blue-800'
    })

    const handleLogout = async () => {
      try {
        await authService.logoutWithStore()
        router.push('/login')
      } catch (error) {
        console.error('Erro no logout:', error)
      }
    }

    onMounted(async () => {
      // Verificar se o usuário ainda está autenticado
      if (!authStore.isAuthenticated) {
        router.push('/login')
        return
      }

      try {
        // Carregar dados iniciais
        await Promise.all([
          tasksStore.loadTasks(),
          tasksStore.loadStats()
        ])
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        initialLoading.value = false
      }
    })

    return {
      authStore,
      tasksStore,
      initialLoading,
      roleClasses,
      handleLogout
    }
  }
}
</script>
