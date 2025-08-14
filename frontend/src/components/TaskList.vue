<template>
  <div class="space-y-6">
    <!-- Header com filtros e ações -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <!-- Título e estatísticas -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">📋 Minhas Tarefas</h2>
          <div class="flex items-center space-x-4 text-sm text-gray-600">
            <span>Total: {{ tasksStore.stats.total }}</span>
            <span class="text-yellow-600">Pendentes: {{ tasksStore.stats.pending }}</span>
            <span class="text-blue-600">Em andamento: {{ tasksStore.stats.inProgress }}</span>
            <span class="text-green-600">Concluídas: {{ tasksStore.stats.completed }}</span>
            <span v-if="tasksStore.stats.overdue > 0" class="text-red-600">
              Atrasadas: {{ tasksStore.stats.overdue }}
            </span>
          </div>
        </div>

        <!-- Botão nova tarefa -->
        <button
          @click="openCreateModal"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Nova Tarefa
        </button>
      </div>

      <!-- Filtros -->
      <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Busca -->
        <div>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="🔍 Buscar tarefas..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- Status -->
        <div>
          <select
            v-model="statusFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="pending">⏳ Pendente</option>
            <option value="in_progress">🔄 Em Andamento</option>
            <option value="completed">✅ Concluída</option>
          </select>
        </div>

        <!-- Prioridade -->
        <div>
          <select
            v-model="priorityFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as prioridades</option>
            <option value="high">🔴 Alta</option>
            <option value="medium">🟡 Média</option>
            <option value="low">🟢 Baixa</option>
          </select>
        </div>

        <!-- Categoria -->
        <div>
          <input
            v-model="categoryFilter"
            type="text"
            placeholder="Filtrar por categoria"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Botão limpar filtros -->
      <div v-if="hasActiveFilters" class="mt-4">
        <button
          @click="clearFilters"
          class="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          🗑️ Limpar filtros
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="tasksStore.loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Carregando tarefas...</p>
    </div>

    <!-- Erro -->
    <div v-else-if="tasksStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
        </svg>
        <span class="text-red-600">{{ tasksStore.error }}</span>
      </div>
    </div>

    <!-- Lista de tarefas -->
    <div v-else-if="filteredTasks.length > 0" class="space-y-4">
      <TaskCard
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        @complete="handleCompleteTask"
        @edit="handleEditTask"
        @delete="handleDeleteTask"
      />
    </div>

    <!-- Estado vazio -->
    <div v-else class="text-center py-12">
      <div class="text-6xl mb-4">📝</div>
      <h3 class="text-xl font-medium text-gray-900 mb-2">
        {{ hasActiveFilters ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa ainda' }}
      </h3>
      <p class="text-gray-600 mb-6">
        {{ hasActiveFilters 
          ? 'Tente ajustar os filtros para encontrar suas tarefas.' 
          : 'Crie sua primeira tarefa para começar a organizar seu trabalho.' 
        }}
      </p>
      <button
        v-if="!hasActiveFilters"
        @click="openCreateModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        ➕ Criar Primeira Tarefa
      </button>
    </div>

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
import TaskCard from './TaskCard.vue'
import TaskModal from './TaskModal.vue'

export default {
  name: 'TaskList',
  components: {
    TaskCard,
    TaskModal
  },
  setup() {
    const tasksStore = useTasksStore()
    
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
        } catch (error) {
          console.error('Erro ao deletar tarefa:', error)
        }
      }
    }

    const clearFilters = () => {
      searchTerm.value = ''
      statusFilter.value = ''
      priorityFilter.value = ''
      categoryFilter.value = ''
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
      clearFilters
    }
  }
}
</script>
