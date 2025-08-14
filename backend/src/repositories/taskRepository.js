const Task = require('../models/Task')

// Simulando banco de dados em memória
let tasks = [
  {
    id: 1,
    title: 'Implementar autenticação JWT',
    description: 'Criar sistema completo de login e registro com tokens JWT',
    status: 'completed',
    priority: 'high',
    category: 'backend',
    userId: 1,
    dueDate: new Date(Date.now() - 86400000), // ontem
    createdAt: new Date(Date.now() - 172800000), // 2 dias atrás
    completedAt: new Date(Date.now() - 86400000)
  },
  {
    id: 2,
    title: 'Criar dashboard responsivo',
    description: 'Interface principal com estatísticas e navegação',
    status: 'in_progress',
    priority: 'medium',
    category: 'frontend',
    userId: 1,
    dueDate: new Date(Date.now() + 86400000), // amanhã
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: 3,
    title: 'Configurar banco PostgreSQL',
    description: 'Setup do banco de dados em produção com migrations',
    status: 'pending',
    priority: 'high',
    category: 'devops',
    userId: 1,
    dueDate: new Date(Date.now() + 172800000), // 2 dias
    createdAt: new Date()
  }
]

let nextId = 4

class TaskRepository {
  async findAll(filters = {}) {
    let filteredTasks = [...tasks]

    // Filtrar por usuário
    if (filters.userId) {
      filteredTasks = filteredTasks.filter(task => 
        task.userId === filters.userId || task.assignedTo === filters.userId
      )
    }

    // Filtrar por status
    if (filters.status) {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status)
    }

    // Filtrar por categoria
    if (filters.category) {
      filteredTasks = filteredTasks.filter(task => task.category === filters.category)
    }

    // Filtrar por prioridade
    if (filters.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority)
    }

    // Buscar por texto
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm)
      )
    }

    // Ordenar
    const sortBy = filters.sortBy || 'createdAt'
    const sortOrder = filters.sortOrder || 'desc'
    
    filteredTasks.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (aValue instanceof Date) aValue = aValue.getTime()
      if (bValue instanceof Date) bValue = bValue.getTime()
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1
      } else {
        return aValue > bValue ? 1 : -1
      }
    })

    return filteredTasks.map(taskData => new Task(taskData))
  }

  async findById(id) {
    const taskData = tasks.find(task => task.id === parseInt(id))
    return taskData ? new Task(taskData) : null
  }

  async create(taskData) {
    const task = new Task({
      ...taskData,
      id: nextId++,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    tasks.push(task)
    return task
  }

  async update(id, updateData) {
    const index = tasks.findIndex(task => task.id === parseInt(id))
    
    if (index === -1) return null

    // Preservar campos que não devem ser alterados
    const existingTask = tasks[index]
    const updatedTask = {
      ...existingTask,
      ...updateData,
      id: existingTask.id,
      userId: existingTask.userId,
      createdAt: existingTask.createdAt,
      updatedAt: new Date()
    }

    // Se mudou para completed, definir completedAt
    if (updateData.status === 'completed' && existingTask.status !== 'completed') {
      updatedTask.completedAt = new Date()
    }

    tasks[index] = updatedTask
    return new Task(updatedTask)
  }

  async delete(id) {
    const index = tasks.findIndex(task => task.id === parseInt(id))
    
    if (index === -1) return false

    tasks.splice(index, 1)
    return true
  }

  // Estatísticas do usuário
  async getUserStats(userId) {
    const userTasks = tasks.filter(task => 
      task.userId === userId || task.assignedTo === userId
    )

    const stats = {
      total: userTasks.length,
      pending: userTasks.filter(task => task.status === 'pending').length,
      inProgress: userTasks.filter(task => task.status === 'in_progress').length,
      completed: userTasks.filter(task => task.status === 'completed').length,
      overdue: userTasks.filter(task => {
        const taskObj = new Task(task)
        return taskObj.isOverdue()
      }).length
    }

    return stats
  }

  // Verificar se usuário tem acesso à tarefa
  async hasAccess(taskId, userId) {
    const task = await this.findById(taskId)
    if (!task) return false
    
    return task.userId === userId || task.assignedTo === userId
  }
}

module.exports = new TaskRepository()
