const taskService = require('../services/taskService')

class TaskController {
  // GET /api/v1/tasks - Listar tarefas do usuário
  async getTasks(request, reply) {
    try {
      const userId = request.user.id
      const filters = {
        status: request.query.status,
        category: request.query.category,
        priority: request.query.priority,
        search: request.query.search,
        sortBy: request.query.sortBy,
        sortOrder: request.query.sortOrder,
        allUsers: request.user.role === 'admin' && request.query.allUsers === 'true'
      }

      // Remover filtros vazios
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined || filters[key] === '') {
          delete filters[key]
        }
      })

      const tasks = await taskService.getTasks(userId, filters)

      reply.send({
        success: true,
        data: {
          tasks,
          total: tasks.length,
          filters: filters
        }
      })

    } catch (error) {
      reply.status(500).send({
        error: error.message
      })
    }
  }

  // GET /api/v1/tasks/:id - Obter tarefa específica
  async getTaskById(request, reply) {
    try {
      const taskId = request.params.id
      const userId = request.user.id

      const task = await taskService.getTaskById(taskId, userId)

      reply.send({
        success: true,
        data: { task }
      })

    } catch (error) {
      const statusCode = error.message.includes('não encontrada') ? 404 :
                        error.message.includes('Acesso negado') ? 403 : 500

      reply.status(statusCode).send({
        error: error.message
      })
    }
  }

  // POST /api/v1/tasks - Criar nova tarefa
  async createTask(request, reply) {
    try {
      const userId = request.user.id
      const taskData = request.body

      if (!taskData.title) {
        return reply.status(400).send({
          error: 'Título da tarefa é obrigatório'
        })
      }

      const task = await taskService.createTask(taskData, userId)

      reply.status(201).send({
        success: true,
        message: 'Tarefa criada com sucesso',
        data: { task }
      })

    } catch (error) {
      reply.status(400).send({
        error: error.message
      })
    }
  }

  // PUT /api/v1/tasks/:id - Atualizar tarefa
  async updateTask(request, reply) {
    try {
      const taskId = request.params.id
      const userId = request.user.id
      const updateData = request.body

      const task = await taskService.updateTask(taskId, updateData, userId)

      reply.send({
        success: true,
        message: 'Tarefa atualizada com sucesso',
        data: { task }
      })

    } catch (error) {
      const statusCode = error.message.includes('não encontrada') ? 404 :
                        error.message.includes('Acesso negado') ? 403 : 400

      reply.status(statusCode).send({
        error: error.message
      })
    }
  }

  // DELETE /api/v1/tasks/:id - Deletar tarefa
  async deleteTask(request, reply) {
    try {
      const taskId = request.params.id
      const userId = request.user.id

      const result = await taskService.deleteTask(taskId, userId)

      reply.send({
        success: true,
        message: result.message
      })

    } catch (error) {
      const statusCode = error.message.includes('não encontrada') ? 404 :
                        error.message.includes('Acesso negado') ? 403 : 500

      reply.status(statusCode).send({
        error: error.message
      })
    }
  }

  // PATCH /api/v1/tasks/:id/complete - Marcar como concluída
  async completeTask(request, reply) {
    try {
      const taskId = request.params.id
      const userId = request.user.id

      const task = await taskService.completeTask(taskId, userId)

      reply.send({
        success: true,
        message: 'Tarefa marcada como concluída',
        data: { task }
      })

    } catch (error) {
      const statusCode = error.message.includes('não encontrada') ? 404 :
                        error.message.includes('Acesso negado') ? 403 : 400

      reply.status(statusCode).send({
        error: error.message
      })
    }
  }

  // GET /api/v1/tasks/stats - Estatísticas do usuário
  async getUserStats(request, reply) {
    try {
      const userId = request.user.id
      const stats = await taskService.getUserStats(userId)

      reply.send({
        success: true,
        data: { stats }
      })

    } catch (error) {
      reply.status(500).send({
        error: error.message
      })
    }
  }

  // PATCH /api/v1/tasks/:id/assign - Atribuir tarefa (feature futura)
  async assignTask(request, reply) {
    try {
      const taskId = request.params.id
      const userId = request.user.id
      const { assignToUserId } = request.body

      if (!assignToUserId) {
        return reply.status(400).send({
          error: 'ID do usuário para atribuição é obrigatório'
        })
      }

      const task = await taskService.assignTask(taskId, assignToUserId, userId)

      reply.send({
        success: true,
        message: 'Tarefa atribuída com sucesso',
        data: { task }
      })

    } catch (error) {
      const statusCode = error.message.includes('não encontrada') ? 404 :
                        error.message.includes('Acesso negado') ? 403 : 400

      reply.status(statusCode).send({
        error: error.message
      })
    }
  }
}

module.exports = new TaskController()
