<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header com filtros e ações -->
    <Card variant="elevated" class="task-list-header">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <!-- Título e estatísticas -->
        <div class="animate-slide-down">
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <ClipboardListIcon class="w-6 h-6 text-white" />
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Minhas Tarefas</h2>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <Badge variant="outline" class="stats-badge">
              <span class="font-medium">{{ tasksStore.stats.total }}</span>
              <span class="text-xs ml-1">Total</span>
            </Badge>
            <Badge variant="secondary" class="stats-badge text-yellow-700 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400">
              <ClockIcon class="w-3 h-3 mr-1" />
              <span class="font-medium">{{ tasksStore.stats.pending }}</span>
              <span class="text-xs ml-1">Pendentes</span>
            </Badge>
            <Badge variant="default" class="stats-badge text-blue-700 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400">
              <PlayIcon class="w-3 h-3 mr-1" />
              <span class="font-medium">{{ tasksStore.stats.inProgress }}</span>
              <span class="text-xs ml-1">Em andamento</span>
            </Badge>
            <Badge variant="success" class="stats-badge">
              <CheckCircleIcon class="w-3 h-3 mr-1" />
              <span class="font-medium">{{ tasksStore.stats.completed }}</span>
              <span class="text-xs ml-1">Concluídas</span>
            </Badge>
            <Badge v-if="tasksStore.stats.overdue > 0" variant="destructive" class="stats-badge animate-pulse">
              <AlertTriangleIcon class="w-3 h-3 mr-1" />
              <span class="font-medium">{{ tasksStore.stats.overdue }}</span>
              <span class="text-xs ml-1">Atrasadas</span>
            </Badge>
          </div>
        </div>

        <!-- Botão nova tarefa -->
        <Button
          @click="openCreateModal"
          variant="default"
          size="lg"
          class="animate-slide-up new-task-btn"
        >
          <PlusIcon class="w-5 h-5 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      <!-- Filtros -->
      <div class="mt-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style="animation-delay: 0.2s">
          <!-- Busca -->
          <div class="relative">
            <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar tarefas..."
              class="pl-10 search-input"
            />
          </div>

          <!-- Status -->
          <div class="relative">
            <FilterIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
            <select
              v-model="statusFilter"
              class="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluída</option>
            </select>
            <ChevronDownIcon class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <!-- Prioridade -->
          <div class="relative">
            <AlertCircleIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
            <select
              v-model="priorityFilter"
              class="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="">Todas as prioridades</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
            <ChevronDownIcon class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <!-- Categoria -->
          <div class="relative">
            <FolderIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              v-model="categoryFilter"
              type="text"
              placeholder="Filtrar por categoria"
              class="pl-10"
            />
          </div>
        </div>

        <!-- Ações dos filtros -->
        <div class="flex items-center justify-between animate-slide-up" style="animation-delay: 0.3s">
          <div class="flex items-center gap-2">
            <Button
              v-if="hasActiveFilters"
              @click="clearFilters"
              variant="ghost"
              size="sm"
              class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <XIcon class="w-4 h-4 mr-1" />
              Limpar filtros
            </Button>
            <Badge v-if="hasActiveFilters" variant="secondary" class="text-xs">
              {{ filteredTasks.length }} resultado{{ filteredTasks.length !== 1 ? 's' : '' }}
            </Badge>
          </div>
          
          <div class="flex items-center gap-2">
            <Button
              @click="refreshTasks"
              variant="ghost"
              size="sm"
              :disabled="tasksStore.loading"
              class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <RefreshCwIcon class="w-4 h-4 mr-1" :class="{ 'animate-spin': tasksStore.loading }" />
              Atualizar
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- Loading -->
    <Card v-if="tasksStore.loading" variant="outline" class="text-center py-12 animate-pulse">
      <div class="flex flex-col items-center justify-center space-y-4">
        <div class="relative">
          <div class="loading-spinner"></div>
          <LoaderIcon class="w-8 h-8 text-blue-500 animate-spin" />
        </div>
        <div class="space-y-2">
          <p class="text-lg font-medium text-gray-900 dark:text-white">Carregando tarefas...</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">Aguarde enquanto buscamos suas tarefas</p>
        </div>
      </div>
    </Card>

    <!-- Erro -->
    <Card v-else-if="tasksStore.error" variant="destructive" class="animate-shake">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <AlertTriangleIcon class="w-5 h-5 text-red-500" />
        </div>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Erro ao carregar tarefas</h3>
          <p class="mt-1 text-sm text-red-700 dark:text-red-300">{{ tasksStore.error }}</p>
          <div class="mt-3">
            <Button
              @click="refreshTasks"
              variant="outline"
              size="sm"
              class="text-red-700 border-red-300 hover:bg-red-50 dark:text-red-300 dark:border-red-600 dark:hover:bg-red-900/20"
            >
              <RefreshCwIcon class="w-4 h-4 mr-1" />
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- Lista de tarefas -->
    <div v-else-if="filteredTasks.length > 0" class="space-y-4">
      <div class="grid gap-4 animate-stagger-in">
        <TaskCard
          v-for="(task, index) in filteredTasks"
          :key="task.id"
          :task="task"
          :style="{ animationDelay: `${index * 0.1}s` }"
          class="task-card animate-slide-up"
          @complete="handleCompleteTask"
          @edit="handleEditTask"
          @delete="handleDeleteTask"
          @click="handleTaskClick"
        />
      </div>
    </div>

    <!-- Estado vazio -->
    <Card v-else variant="outline" class="text-center py-16 animate-fade-in">
      <div class="flex flex-col items-center justify-center space-y-6">
        <!-- Ícone animado -->
        <div class="relative">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-pulse"></div>
          <div class="relative w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center border-2 border-blue-200 dark:border-blue-700">
            <component 
              :is="hasActiveFilters ? SearchIcon : ClipboardListIcon" 
              class="w-12 h-12 text-blue-500 animate-bounce"
            />
          </div>
        </div>

        <!-- Conteúdo -->
        <div class="space-y-3 max-w-md">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ hasActiveFilters ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa criada ainda' }}
          </h3>
          <p class="text-gray-500 dark:text-gray-400 leading-relaxed">
            {{ hasActiveFilters 
              ? 'Tente ajustar os filtros ou criar uma nova tarefa que corresponda aos critérios.' 
              : 'Que tal começar criando sua primeira tarefa? É rápido e fácil!' 
            }}
          </p>
        </div>

        <!-- Ações -->
        <div class="flex flex-col sm:flex-row gap-3">
          <Button
            v-if="!hasActiveFilters"
            @click="openCreateModal"
            variant="default"
            size="lg"
            class="group"
          >
            <PlusIcon class="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Criar primeira tarefa
          </Button>
          
          <template v-else>
            <Button
              @click="clearFilters"
              variant="outline"
              size="lg"
              class="group"
            >
              <XIcon class="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              Limpar filtros
            </Button>
            <Button
              @click="openCreateModal"
              variant="default"
              size="lg"
              class="group"
            >
              <PlusIcon class="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Nova tarefa
            </Button>
          </template>
        </div>

        <!-- Dicas -->
        <div v-if="!hasActiveFilters" class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0">
              <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span class="text-white text-xs font-bold">💡</span>
              </div>
            </div>
            <div class="text-left">
              <h4 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Dica</h4>
              <p class="text-xs text-blue-700 dark:text-blue-300">
                Organize suas tarefas por prioridade e categoria para maior produtividade!
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- Modal de criação/edição -->
    <TaskModal
      :is-open="isModalOpen"
      :task="currentTask"
      :loading="tasksStore.loading"
      @close="closeModal"
      @submit="handleSubmitTask"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useTasksStore } from '@/stores/tasks.js'
import { useUIStore } from '@/stores/ui'
import TaskCard from './TaskCard.vue'
import TaskModal from './TaskModal.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Input from '@/components/ui/Input.vue'
import {
  ClipboardListIcon,
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  ChevronDownIcon,
  FolderIcon,
  XIcon,
  RefreshCwIcon,
  LoaderIcon
} from 'lucide-vue-next'

export default {
  name: 'TaskList',
  components: {
    TaskCard,
    TaskModal
  },
  setup() {
    const tasksStore = useTasksStore()
    const uiStore = useUIStore()
    
    // Estado do modal
    const isModalOpen = ref(false)
    const currentTask = ref(null)
    
    // Filtros locais
    const searchTerm = ref('')
    const statusFilter = ref('')
    const priorityFilter = ref('')
    const categoryFilter = ref('')

    // Computed
    const hasActiveFilters = computed(() => {
      return searchTerm.value || statusFilter.value || priorityFilter.value || categoryFilter.value
    })

    const filteredTasks = computed(() => {
      let tasks = [...tasksStore.tasks]

      if (searchTerm.value) {
        const search = searchTerm.value.toLowerCase()
        tasks = tasks.filter(task => 
          task.title.toLowerCase().includes(search) ||
          task.description.toLowerCase().includes(search)
        )
      }

      if (statusFilter.value) {
        tasks = tasks.filter(task => task.status === statusFilter.value)
      }

      if (priorityFilter.value) {
        tasks = tasks.filter(task => task.priority === priorityFilter.value)
      }

      if (categoryFilter.value) {
        tasks = tasks.filter(task => 
          task.category.toLowerCase().includes(categoryFilter.value.toLowerCase())
        )
      }

      return tasks
    })

    // Methods
    const loadData = async () => {
      await Promise.all([
        tasksStore.loadTasks(),
        tasksStore.loadStats()
      ])
    }

    const openCreateModal = () => {
      currentTask.value = null
      isModalOpen.value = true
    }

    const closeModal = () => {
      isModalOpen.value = false
      currentTask.value = null
    }

    const handleEditTask = (task) => {
      currentTask.value = task
      isModalOpen.value = true
    }

    const handleSubmitTask = async (taskData) => {
      try {
        if (currentTask.value) {
          // Editar
          await tasksStore.updateTask(currentTask.value.id, taskData)
        } else {
          // Criar
          await tasksStore.createTask(taskData)
        }
        closeModal()
      } catch (error) {
        // Erro já tratado no store
      }
    }

    const handleCompleteTask = async (taskId) => {
      try {
        await tasksStore.completeTask(taskId)
      } catch (error) {
        console.error('Erro ao completar tarefa:', error)
      }
    }

    const handleDeleteTask = async (taskId) => {
      if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
        try {
          await tasksStore.deleteTask(taskId)
          uiStore.showNotification('Tarefa excluída com sucesso!', 'success')
        } catch (error) {
          console.error('Erro ao deletar tarefa:', error)
          uiStore.showNotification('Erro ao excluir tarefa', 'error')
        }
      }
    }

    const clearFilters = () => {
      searchTerm.value = ''
      statusFilter.value = ''
      priorityFilter.value = ''
      categoryFilter.value = ''
      uiStore.showNotification('Filtros limpos', 'info')
    }

    const refreshTasks = async () => {
      try {
        await loadData()
        uiStore.showNotification('Tarefas atualizadas!', 'success')
      } catch (error) {
        console.error('Erro ao atualizar tarefas:', error)
        uiStore.showNotification('Erro ao atualizar tarefas', 'error')
      }
    }

    const handleTaskClick = (task) => {
      // Pode ser usado para expandir detalhes ou navegar
      console.log('Task clicked:', task)
    }

    // Watchers para filtros (debounce na busca)
    let searchTimeout
    watch(searchTerm, () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        tasksStore.setFilters({ search: searchTerm.value })
      }, 300)
    })

    watch([statusFilter, priorityFilter, categoryFilter], () => {
      tasksStore.setFilters({
        status: statusFilter.value,
        priority: priorityFilter.value,
        category: categoryFilter.value
      })
    })

    // Lifecycle
    onMounted(loadData)

    return {
      tasksStore,
      uiStore,
      isModalOpen,
      currentTask,
      searchTerm,
      statusFilter,
      priorityFilter,
      categoryFilter,
      hasActiveFilters,
      filteredTasks,
      openCreateModal,
      closeModal,
      handleEditTask,
      handleSubmitTask,
      handleCompleteTask,
      handleDeleteTask,
      clearFilters,
      refreshTasks,
      handleTaskClick
    }
  }
}
</script>

<style scoped>
/* Animações personalizadas */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes staggerIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Classes de animação */
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

.animate-slide-down {
  animation: slideDown 0.4s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.4s ease-out;
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

.animate-stagger-in {
  animation: staggerIn 0.6s ease-out;
}

/* Delays para animações escalonadas */
.animate-slide-up:nth-child(1) { animation-delay: 0.1s; }
.animate-slide-up:nth-child(2) { animation-delay: 0.2s; }
.animate-slide-up:nth-child(3) { animation-delay: 0.3s; }
.animate-slide-up:nth-child(4) { animation-delay: 0.4s; }
.animate-slide-up:nth-child(5) { animation-delay: 0.5s; }

/* Loading spinner customizado */
.loading-spinner {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent, rgba(59, 130, 246, 0.3), transparent);
  animation: spin 2s linear infinite;
}

/* Efeitos de hover para cards estatísticos */
.stats-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.stats-card:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.stats-card:active {
  transform: translateY(0) scale(0.98);
}

/* Efeitos para badges */
.badge-hover {
  transition: all 0.2s ease;
}

.badge-hover:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}

/* Filtros responsivos */
.filters-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
}

/* Scrollbar customizada */
.task-list {
  max-height: 600px;
  overflow-y: auto;
}

.task-list::-webkit-scrollbar {
  width: 6px;
}

.task-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.task-list::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
  border-radius: 3px;
}

.task-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #94a3b8, #64748b);
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .task-list::-webkit-scrollbar-track {
    background: #1e293b;
  }
  
  .task-list::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #475569, #334155);
  }
  
  .task-list::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #64748b, #475569);
  }
}

/* Transições suaves para modo escuro */
* {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}
</style>
