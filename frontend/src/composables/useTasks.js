import { ref, computed, watch } from 'vue'
import { useLocalStorage } from './useLocalStorage.js'
import taskService from '../services/taskService.js'

// Estado global das tarefas
const tasks = ref([])
const isLoading = ref(false)
const error = ref(null)
const currentTask = ref(null)
const filters = ref({
  status: 'all',
  priority: 'all',
  search: '',
  dateRange: null,
  assignee: 'all',
  category: 'all'
})
const sortBy = ref('createdAt')
const sortOrder = ref('desc')
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0
})

// Persistência dos filtros
const persistedFilters = useLocalStorage('taskstream-filters', {})
const persistedSort = useLocalStorage('taskstream-sort', { by: 'createdAt', order: 'desc' })

/**
 * Composable para gerenciar tarefas
 */
export function useTasks() {
  // Computed properties
  const filteredTasks = computed(() => {
    let result = [...tasks.value]

    // Filtro por status
    if (filters.value.status !== 'all') {
      result = result.filter(task => task.status === filters.value.status)
    }

    // Filtro por prioridade
    if (filters.value.priority !== 'all') {
      result = result.filter(task => task.priority === filters.value.priority)
    }

    // Filtro por busca (título e descrição)
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase()
      result = result.filter(task => 
        task.title?.toLowerCase().includes(searchTerm) ||
        task.description?.toLowerCase().includes(searchTerm)
      )
    }

    // Filtro por responsável
    if (filters.value.assignee !== 'all') {
      result = result.filter(task => task.assigneeId === filters.value.assignee)
    }

    // Filtro por categoria
    if (filters.value.category !== 'all') {
      result = result.filter(task => task.category === filters.value.category)
    }

    // Filtro por data
    if (filters.value.dateRange) {
      const { start, end } = filters.value.dateRange
      result = result.filter(task => {
        const taskDate = new Date(task.createdAt)
        return taskDate >= start && taskDate <= end
      })
    }

    // Ordenação
    result.sort((a, b) => {
      const aValue = a[sortBy.value]
      const bValue = b[sortBy.value]
      
      let comparison = 0
      if (aValue < bValue) comparison = -1
      if (aValue > bValue) comparison = 1
      
      return sortOrder.value === 'desc' ? -comparison : comparison
    })

    return result
  })

  const tasksByStatus = computed(() => {
    return {
      pending: tasks.value.filter(task => task.status === 'pending'),
      inProgress: tasks.value.filter(task => task.status === 'in_progress'),
      completed: tasks.value.filter(task => task.status === 'completed'),
      cancelled: tasks.value.filter(task => task.status === 'cancelled')
    }
  })

  const tasksByPriority = computed(() => {
    return {
      low: tasks.value.filter(task => task.priority === 'low'),
      medium: tasks.value.filter(task => task.priority === 'medium'),
      high: tasks.value.filter(task => task.priority === 'high'),
      urgent: tasks.value.filter(task => task.priority === 'urgent')
    }
  })

  const taskStats = computed(() => {
    const total = tasks.value.length
    const completed = tasksByStatus.value.completed.length
    const pending = tasksByStatus.value.pending.length
    const inProgress = tasksByStatus.value.inProgress.length
    const overdue = tasks.value.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false
      return new Date(task.dueDate) < new Date()
    }).length

    return {
      total,
      completed,
      pending,
      inProgress,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  })

  const hasActiveTasks = computed(() => {
    return tasks.value.some(task => 
      task.status === 'pending' || task.status === 'in_progress'
    )
  })

  const recentTasks = computed(() => {
    return [...tasks.value]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
  })

  // Methods
  const fetchTasks = async (options = {}) => {
    try {
      isLoading.value = true
      error.value = null

      const params = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
        ...filters.value,
        ...options
      }

      const response = await taskService.getTasks(params)
      
      if (response.success) {
        tasks.value = response.tasks || []
        pagination.value = {
          ...pagination.value,
          total: response.total || 0
        }
        return { success: true, tasks: tasks.value }
      } else {
        error.value = response.message || 'Erro ao carregar tarefas'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = err.message || 'Erro de conexão'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const fetchTaskById = async (id) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await taskService.getTaskById(id)
      
      if (response.success) {
        currentTask.value = response.task
        return { success: true, task: response.task }
      } else {
        error.value = response.message || 'Tarefa não encontrada'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = err.message || 'Erro de conexão'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const createTask = async (taskData) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await taskService.createTask(taskData)
      
      if (response.success) {
        tasks.value.unshift(response.task)
        return { success: true, task: response.task }
      } else {
        error.value = response.message || 'Erro ao criar tarefa'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = err.message || 'Erro de conexão'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const updateTask = async (id, taskData) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await taskService.updateTask(id, taskData)
      
      if (response.success) {
        const index = tasks.value.findIndex(task => task.id === id)
        if (index !== -1) {
          tasks.value[index] = response.task
        }
        
        if (currentTask.value?.id === id) {
          currentTask.value = response.task
        }
        
        return { success: true, task: response.task }
      } else {
        error.value = response.message || 'Erro ao atualizar tarefa'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = err.message || 'Erro de conexão'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const deleteTask = async (id) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await taskService.deleteTask(id)
      
      if (response.success) {
        tasks.value = tasks.value.filter(task => task.id !== id)
        
        if (currentTask.value?.id === id) {
          currentTask.value = null
        }
        
        return { success: true }
      } else {
        error.value = response.message || 'Erro ao excluir tarefa'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = err.message || 'Erro de conexão'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const updateTaskStatus = async (id, status) => {
    return await updateTask(id, { status })
  }

  const updateTaskPriority = async (id, priority) => {
    return await updateTask(id, { priority })
  }

  const assignTask = async (id, assigneeId) => {
    return await updateTask(id, { assigneeId })
  }

  const duplicateTask = async (id) => {
    try {
      const task = tasks.value.find(t => t.id === id)
      if (!task) {
        throw new Error('Tarefa não encontrada')
      }

      const duplicatedData = {
        ...task,
        title: `${task.title} (Cópia)`,
        status: 'pending',
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined
      }

      return await createTask(duplicatedData)
    } catch (err) {
      error.value = err.message
      return { success: false, error: error.value }
    }
  }

  const bulkUpdateTasks = async (taskIds, updates) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await taskService.bulkUpdateTasks(taskIds, updates)
      
      if (response.success) {
        // Atualizar tarefas localmente
        response.tasks.forEach(updatedTask => {
          const index = tasks.value.findIndex(task => task.id === updatedTask.id)
          if (index !== -1) {
            tasks.value[index] = updatedTask
          }
        })
        
        return { success: true, tasks: response.tasks }
      } else {
        error.value = response.message || 'Erro ao atualizar tarefas'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = err.message || 'Erro de conexão'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const bulkDeleteTasks = async (taskIds) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await taskService.bulkDeleteTasks(taskIds)
      
      if (response.success) {
        tasks.value = tasks.value.filter(task => !taskIds.includes(task.id))
        return { success: true }
      } else {
        error.value = response.message || 'Erro ao excluir tarefas'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = err.message || 'Erro de conexão'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Filter methods
  const setFilter = (key, value) => {
    filters.value[key] = value
    pagination.value.page = 1 // Reset to first page
    persistedFilters.value = { ...filters.value }
  }

  const clearFilters = () => {
    filters.value = {
      status: 'all',
      priority: 'all',
      search: '',
      dateRange: null,
      assignee: 'all',
      category: 'all'
    }
    pagination.value.page = 1
    persistedFilters.value = {}
  }

  const setSort = (field, order = 'desc') => {
    sortBy.value = field
    sortOrder.value = order
    persistedSort.value = { by: field, order }
  }

  const toggleSortOrder = () => {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
    persistedSort.value = { by: sortBy.value, order: sortOrder.value }
  }

  // Pagination methods
  const setPage = (page) => {
    pagination.value.page = page
  }

  const setLimit = (limit) => {
    pagination.value.limit = limit
    pagination.value.page = 1
  }

  const nextPage = () => {
    const maxPage = Math.ceil(pagination.value.total / pagination.value.limit)
    if (pagination.value.page < maxPage) {
      pagination.value.page++
    }
  }

  const prevPage = () => {
    if (pagination.value.page > 1) {
      pagination.value.page--
    }
  }

  // Utility methods
  const clearError = () => {
    error.value = null
  }

  const clearCurrentTask = () => {
    currentTask.value = null
  }

  const refreshTasks = () => {
    return fetchTasks()
  }

  const getTaskById = (id) => {
    return tasks.value.find(task => task.id === id)
  }

  const isTaskOverdue = (task) => {
    if (!task.dueDate || task.status === 'completed') return false
    return new Date(task.dueDate) < new Date()
  }

  const getTaskProgress = (task) => {
    if (!task.subtasks || task.subtasks.length === 0) {
      return task.status === 'completed' ? 100 : 0
    }
    
    const completed = task.subtasks.filter(subtask => subtask.completed).length
    return Math.round((completed / task.subtasks.length) * 100)
  }

  // Watchers para sincronizar com localStorage
  watch(
    () => persistedFilters.value,
    (newFilters) => {
      if (newFilters && Object.keys(newFilters).length > 0) {
        filters.value = { ...filters.value, ...newFilters }
      }
    },
    { immediate: true }
  )

  watch(
    () => persistedSort.value,
    (newSort) => {
      if (newSort) {
        sortBy.value = newSort.by || 'createdAt'
        sortOrder.value = newSort.order || 'desc'
      }
    },
    { immediate: true }
  )

  return {
    // State
    tasks: readonly(tasks),
    isLoading: readonly(isLoading),
    error: readonly(error),
    currentTask: readonly(currentTask),
    filters: readonly(filters),
    sortBy: readonly(sortBy),
    sortOrder: readonly(sortOrder),
    pagination: readonly(pagination),
    
    // Computed
    filteredTasks,
    tasksByStatus,
    tasksByPriority,
    taskStats,
    hasActiveTasks,
    recentTasks,
    
    // Methods
    fetchTasks,
    fetchTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskPriority,
    assignTask,
    duplicateTask,
    bulkUpdateTasks,
    bulkDeleteTasks,
    
    // Filter methods
    setFilter,
    clearFilters,
    setSort,
    toggleSortOrder,
    
    // Pagination methods
    setPage,
    setLimit,
    nextPage,
    prevPage,
    
    // Utility methods
    clearError,
    clearCurrentTask,
    refreshTasks,
    getTaskById,
    isTaskOverdue,
    getTaskProgress
  }
}

// Instância global para uso em toda a aplicação
let globalTasksInstance = null

export function useGlobalTasks() {
  if (!globalTasksInstance) {
    globalTasksInstance = useTasks()
  }
  return globalTasksInstance
}

// Constantes para status e prioridades
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
}

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.PENDING]: 'Pendente',
  [TASK_STATUS.IN_PROGRESS]: 'Em Progresso',
  [TASK_STATUS.COMPLETED]: 'Concluída',
  [TASK_STATUS.CANCELLED]: 'Cancelada'
}

export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITY.LOW]: 'Baixa',
  [TASK_PRIORITY.MEDIUM]: 'Média',
  [TASK_PRIORITY.HIGH]: 'Alta',
  [TASK_PRIORITY.URGENT]: 'Urgente'
}

export const TASK_STATUS_COLORS = {
  [TASK_STATUS.PENDING]: 'warning',
  [TASK_STATUS.IN_PROGRESS]: 'info',
  [TASK_STATUS.COMPLETED]: 'success',
  [TASK_STATUS.CANCELLED]: 'danger'
}

export const TASK_PRIORITY_COLORS = {
  [TASK_PRIORITY.LOW]: 'success',
  [TASK_PRIORITY.MEDIUM]: 'warning',
  [TASK_PRIORITY.HIGH]: 'danger',
  [TASK_PRIORITY.URGENT]: 'danger'
}