import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { taskService } from '@/services/taskService.js'

export const useTasksStore = defineStore('tasks', () => {
  // Estado
  const tasks = ref([])
  const currentTask = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const filters = ref({
    status: '',
    category: '',
    priority: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const stats = ref({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  })

  // Getters
  const filteredTasks = computed(() => {
    return tasks.value.filter(task => {
      if (filters.value.status && task.status !== filters.value.status) return false
      if (filters.value.category && task.category !== filters.value.category) return false
      if (filters.value.priority && task.priority !== filters.value.priority) return false
      if (filters.value.search) {
        const searchTerm = filters.value.search.toLowerCase()
        return task.title.toLowerCase().includes(searchTerm) ||
               task.description.toLowerCase().includes(searchTerm)
      }
      return true
    })
  })

  const tasksByStatus = computed(() => {
    return {
      pending: tasks.value.filter(task => task.status === 'pending'),
      inProgress: tasks.value.filter(task => task.status === 'in_progress'),
      completed: tasks.value.filter(task => task.status === 'completed')
    }
  })

  const overdueTasks = computed(() => {
    return tasks.value.filter(task => task.isOverdue)
  })

  // Actions
  function setLoading(isLoading) {
    loading.value = isLoading
  }

  function setError(errorMessage) {
    error.value = errorMessage
  }

  function setTasks(taskList) {
    tasks.value = taskList
  }

  function setCurrentTask(task) {
    currentTask.value = task
  }

  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function setStats(newStats) {
    stats.value = newStats
  }

  // Carregar tarefas
  async function loadTasks() {
    setLoading(true)
    setError(null)

    try {
      const response = await taskService.getTasks(filters.value)
      setTasks(response.data.tasks)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Carregar estatísticas
  async function loadStats() {
    try {
      const response = await taskService.getStats()
      setStats(response.data.stats)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error.message)
    }
  }

  // Criar tarefa
  async function createTask(taskData) {
    setLoading(true)
    setError(null)

    try {
      const response = await taskService.createTask(taskData)
      await loadTasks() // Recarregar lista
      await loadStats() // Atualizar estatísticas
      return response.data.task
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Atualizar tarefa
  async function updateTask(taskId, updateData) {
    setLoading(true)
    setError(null)

    try {
      const response = await taskService.updateTask(taskId, updateData)
      await loadTasks() // Recarregar lista
      await loadStats() // Atualizar estatísticas
      return response.data.task
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Deletar tarefa
  async function deleteTask(taskId) {
    setLoading(true)
    setError(null)

    try {
      await taskService.deleteTask(taskId)
      await loadTasks() // Recarregar lista
      await loadStats() // Atualizar estatísticas
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Completar tarefa
  async function completeTask(taskId) {
    try {
      await taskService.completeTask(taskId)
      await loadTasks() // Recarregar lista
      await loadStats() // Atualizar estatísticas
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  // Limpar filtros
  function clearFilters() {
    setFilters({
      status: '',
      category: '',
      priority: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  return {
    // Estado
    tasks,
    currentTask,
    loading,
    error,
    filters,
    stats,
    
    // Getters
    filteredTasks,
    tasksByStatus,
    overdueTasks,
    
    // Actions
    setLoading,
    setError,
    setTasks,
    setCurrentTask,
    setFilters,
    setStats,
    loadTasks,
    loadStats,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    clearFilters
  }
})
