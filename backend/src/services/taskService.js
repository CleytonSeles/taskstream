const taskRepository = require('../repositories/taskRepository')
const Task = require('../models/Task')

class TaskService {
  // Listar tarefas com filtros
  async getTasks(userId, filters = {}) {
    // Adicionar filtro por usuário se não for admin consultando todas
    if (!filters.allUsers) {
      filters.userId = userId
    }

    const tasks = await taskRepository.findAll(filters)
    return tasks.map(task => task.toJSON())
  }

  // Obter tarefa por ID
  async getTaskById(taskId, userId) {
    const task = await taskRepository.findById(taskId)
    
    if (!task) {
      throw new Error('Tarefa não encontrada')
    }

    // Verificar acesso
    if (!await taskRepository.hasAccess(taskId, userId)) {
      throw new Error('Acesso negado a esta tarefa')
    }

    return task.toJSON()
  }

  // Criar nova tarefa
  async createTask(taskData, userId) {
    const validation = Task.validate(taskData)
    
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`)
    }

    // Definir o usuário proprietário
    taskData.userId = userId

    const task = await taskRepository.create(taskData)
    return task.toJSON()
  }

  // Atualizar tarefa
  async updateTask(taskId, updateData, userId) {
    const existingTask = await taskRepository.findById(taskId)
    
    if (!existingTask) {
      throw new Error('Tarefa não encontrada')
    }

    // Verificar acesso
    if (!await taskRepository.hasAccess(taskId, userId)) {
      throw new Error('Acesso negado a esta tarefa')
    }

    const validation = Task.validate({ ...existingTask, ...updateData })
    
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`)
    }

    const updatedTask = await taskRepository.update(taskId, updateData)
    return updatedTask.toJSON()
  }

  // Deletar tarefa
  async deleteTask(taskId, userId) {
    const existingTask = await taskRepository.findById(taskId)
    
    if (!existingTask) {
      throw new Error('Tarefa não encontrada')
    }

    // Verificar acesso (apenas o dono pode deletar)
    if (existingTask.userId !== userId) {
      throw new Error('Apenas o criador da tarefa pode deletá-la')
    }

    const deleted = await taskRepository.delete(taskId)
    
    if (!deleted) {
      throw new Error('Erro ao deletar tarefa')
    }

    return { message: 'Tarefa deletada com sucesso' }
  }

  // Obter estatísticas do usuário
  async getUserStats(userId) {
    return await taskRepository.getUserStats(userId)
  }

  // Marcar tarefa como concluída
  async completeTask(taskId, userId) {
    return await this.updateTask(taskId, { status: 'completed' }, userId)
  }

  // Atribuir tarefa a outro usuário (feature futura)
  async assignTask(taskId, assignToUserId, currentUserId) {
    const existingTask = await taskRepository.findById(taskId)
    
    if (!existingTask) {
      throw new Error('Tarefa não encontrada')
    }

    // Apenas o dono pode atribuir
    if (existingTask.userId !== currentUserId) {
      throw new Error('Apenas o criador da tarefa pode atribuí-la')
    }

    return await this.updateTask(taskId, { assignedTo: assignToUserId }, currentUserId)
  }
}

module.exports = new TaskService()
