<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
    <!-- Background Pattern -->
    <div class="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
    
    <!-- Header Moderno -->
    <AppHeader />
    
    <!-- Floating Elements -->
    <div class="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-floating"></div>
    <div class="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-xl animate-floating-delayed"></div>

    <!-- Main Content -->
    <main class="relative z-10 max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Welcome Section -->
        <div class="mb-8 animate-fade-in">
          <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Bem-vindo de volta, {{ authStore.user?.name }}! 👋
          </h1>
          <p class="text-slate-600 dark:text-slate-400 text-lg">
            Aqui está um resumo das suas tarefas hoje
          </p>
        </div>

        <!-- Loading inicial -->
        <div v-if="initialLoading" class="flex flex-col items-center justify-center py-20">
          <div class="relative">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-800"></div>
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p class="mt-6 text-slate-600 dark:text-slate-400 text-lg animate-pulse">Carregando seus dados...</p>
        </div>

        <div v-else class="space-y-8">
          <!-- Cards de estatísticas interativos -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Total de Tarefas -->
            <Card 
              variant="elevated" 
              :hoverable="true" 
              :clickable="true"
              class="group cursor-pointer transform transition-all duration-300 hover:scale-105 animate-slide-up"
              @click="filterTasks('all')"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <div class="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white group-hover:scale-110 transition-transform">
                      <ClipboardListIcon class="w-5 h-5" />
                    </div>
                    <h3 class="text-sm font-medium text-slate-600 dark:text-slate-400">Total de Tarefas</h3>
                  </div>
                  <p class="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {{ tasksStore.stats.total }}
                  </p>
                  <div class="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
                    <TrendingUpIcon class="w-3 h-3 mr-1" />
                    <span>Todas as suas tarefas</span>
                  </div>
                </div>
              </div>
            </Card>

            <!-- Tarefas Pendentes -->
            <Card 
              variant="elevated" 
              :hoverable="true" 
              :clickable="true"
              class="group cursor-pointer transform transition-all duration-300 hover:scale-105 animate-slide-up animation-delay-100"
              @click="filterTasks('pending')"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <div class="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white group-hover:scale-110 transition-transform">
                      <ClockIcon class="w-5 h-5" />
                    </div>
                    <h3 class="text-sm font-medium text-slate-600 dark:text-slate-400">Pendentes</h3>
                  </div>
                  <p class="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-yellow-600 transition-colors">
                    {{ tasksStore.stats.pending }}
                  </p>
                  <div class="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
                    <AlertCircleIcon class="w-3 h-3 mr-1" />
                    <span>Aguardando início</span>
                  </div>
                </div>
              </div>
            </Card>

            <!-- Tarefas em Andamento -->
            <Card 
              variant="elevated" 
              :hoverable="true" 
              :clickable="true"
              class="group cursor-pointer transform transition-all duration-300 hover:scale-105 animate-slide-up animation-delay-200"
              @click="filterTasks('in_progress')"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <div class="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white group-hover:scale-110 transition-transform">
                      <PlayIcon class="w-5 h-5" />
                    </div>
                    <h3 class="text-sm font-medium text-slate-600 dark:text-slate-400">Em Andamento</h3>
                  </div>
                  <p class="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {{ tasksStore.stats.inProgress }}
                  </p>
                  <div class="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
                    <ActivityIcon class="w-3 h-3 mr-1" />
                    <span>Em desenvolvimento</span>
                  </div>
                </div>
              </div>
            </Card>

            <!-- Tarefas Concluídas -->
            <Card 
              variant="elevated" 
              :hoverable="true" 
              :clickable="true"
              class="group cursor-pointer transform transition-all duration-300 hover:scale-105 animate-slide-up animation-delay-300"
              @click="filterTasks('completed')"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <div class="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white group-hover:scale-110 transition-transform">
                      <CheckCircleIcon class="w-5 h-5" />
                    </div>
                    <h3 class="text-sm font-medium text-slate-600 dark:text-slate-400">Concluídas</h3>
                  </div>
                  <p class="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-green-600 transition-colors">
                    {{ tasksStore.stats.completed }}
                  </p>
                  <div class="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
                    <CheckIcon class="w-3 h-3 mr-1" />
                    <span>Finalizadas com sucesso</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <!-- Quick Actions -->
          <div class="mb-8 animate-fade-in animation-delay-400">
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">Ações Rápidas</h2>
            <div class="flex flex-wrap gap-4">
              <Button 
                variant="primary" 
                size="md" 
                :icon-left="PlusIcon"
                @click="createNewTask"
                class="animate-slide-up animation-delay-500"
              >
                Nova Tarefa
              </Button>
              <Button 
                variant="secondary" 
                size="md" 
                :icon-left="FilterIcon"
                @click="toggleFilters"
                class="animate-slide-up animation-delay-600"
              >
                Filtros
              </Button>
              <Button 
                variant="ghost" 
                size="md" 
                :icon-left="RefreshCwIcon"
                @click="refreshData"
                :loading="refreshing"
                class="animate-slide-up animation-delay-700"
              >
                Atualizar
              </Button>
            </div>
          </div>

          <!-- Lista de tarefas -->
          <div class="animate-fade-in animation-delay-800">
            <TaskList />
          </div>

          <!-- Painel admin (apenas para admins) -->
          <Card 
            v-if="authStore.isAdmin" 
            variant="gradient" 
            class="mt-8 animate-slide-up animation-delay-900"
          >
            <div class="flex items-start space-x-4">
              <div class="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
                <CrownIcon class="w-6 h-6" />
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Painel Administrativo
                </h3>
                <p class="text-slate-600 dark:text-slate-400 mb-4">
                  Você tem acesso a funcionalidades administrativas especiais para gerenciar usuários e configurações do sistema.
                </p>
                <div class="flex flex-wrap gap-3">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    :icon-left="SettingsIcon"
                    @click="$router.push('/admin')"
                  >
                    Acessar Painel Admin
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    :icon-left="UsersIcon"
                    @click="$router.push('/admin/users')"
                  >
                    Gerenciar Usuários
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    :icon-left="BarChart3Icon"
                    @click="$router.push('/admin/analytics')"
                  >
                    Relatórios
                  </Button>
                </div>
              </div>
            </div>
          </Card>
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
import { useUIStore } from '@/stores/ui.js'
import { authService } from '@/services/authService.js'
import TaskList from '@/components/TaskList.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import {
  ClipboardListIcon,
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  CheckIcon,
  TrendingUpIcon,
  AlertCircleIcon,
  ActivityIcon,
  PlusIcon,
  FilterIcon,
  RefreshCwIcon,
  CrownIcon,
  SettingsIcon,
  UsersIcon,
  BarChart3Icon
} from 'lucide-vue-next'

export default {
  name: 'DashboardView',
  components: {
    TaskList,
    AppHeader,
    Card,
    Button,
    Badge,
    ClipboardListIcon,
    ClockIcon,
    PlayIcon,
    CheckCircleIcon,
    CheckIcon,
    TrendingUpIcon,
    AlertCircleIcon,
    ActivityIcon,
    PlusIcon,
    FilterIcon,
    RefreshCwIcon,
    CrownIcon,
    SettingsIcon,
    UsersIcon,
    BarChart3Icon
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const tasksStore = useTasksStore()
    const uiStore = useUIStore()
    const initialLoading = ref(true)
    const refreshing = ref(false)

    // Métodos para interação com cards estatísticos
    const filterTasks = (status) => {
      tasksStore.setFilter('status', status === 'all' ? '' : status)
      // Scroll suave para a lista de tarefas
      const taskListElement = document.querySelector('.task-list')
      if (taskListElement) {
        taskListElement.scrollIntoView({ behavior: 'smooth' })
      }
    }

    // Ações rápidas
    const createNewTask = () => {
      uiStore.openModal('taskForm', { mode: 'create' })
    }

    const toggleFilters = () => {
      uiStore.toggleSidebar()
    }

    const refreshData = async () => {
      refreshing.value = true
      try {
        await Promise.all([
          tasksStore.loadTasks(),
          tasksStore.loadStats()
        ])
        uiStore.showNotification({
          type: 'success',
          title: 'Dados atualizados',
          message: 'Suas tarefas foram atualizadas com sucesso!'
        })
      } catch (error) {
        console.error('Erro ao atualizar dados:', error)
        uiStore.showNotification({
          type: 'error',
          title: 'Erro ao atualizar',
          message: 'Não foi possível atualizar os dados. Tente novamente.'
        })
      } finally {
        refreshing.value = false
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
        uiStore.showNotification({
          type: 'error',
          title: 'Erro ao carregar dados',
          message: 'Não foi possível carregar os dados iniciais.'
        })
      } finally {
        initialLoading.value = false
      }
    })

    return {
      authStore,
      tasksStore,
      uiStore,
      initialLoading,
      refreshing,
      filterTasks,
      createNewTask,
      toggleFilters,
      refreshData
    }
  }
}
</script>

<style scoped>
/* Padrão de fundo com grade */
.bg-grid-pattern {
  background-image: 
    linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}

.dark .bg-grid-pattern {
  background-image: 
    linear-gradient(rgba(147, 197, 253, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(147, 197, 253, 0.1) 1px, transparent 1px);
}

/* Elementos flutuantes */
.floating-element {
  animation: float 6s ease-in-out infinite;
}

.floating-element:nth-child(2) {
  animation-delay: -2s;
}

.floating-element:nth-child(3) {
  animation-delay: -4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* Spinner de carregamento customizado */
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.dark .loading-spinner {
  border-color: #374151;
  border-top-color: #60a5fa;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Animações de entrada */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out;
}

.animate-slide-up-delay-1 {
  animation: slideUp 0.6s ease-out 0.1s both;
}

.animate-slide-up-delay-2 {
  animation: slideUp 0.6s ease-out 0.2s both;
}

.animate-slide-up-delay-3 {
  animation: slideUp 0.6s ease-out 0.3s both;
}

.animate-slide-up-delay-4 {
  animation: slideUp 0.6s ease-out 0.4s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Efeitos de hover para cards estatísticos */
.stat-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.dark .stat-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
}

.stat-card:active {
  transform: translateY(-2px) scale(1.01);
}

/* Gradientes para cards */
.gradient-blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-green {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.gradient-yellow {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.gradient-purple {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.gradient-admin {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

/* Efeito de pulso para ícones */
.icon-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Responsividade aprimorada */
@media (max-width: 640px) {
  .stat-card {
    transform: none !important;
  }
  
  .stat-card:hover {
    transform: none !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
}

/* Transições suaves para modo escuro */
* {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}
</style>
