import api from './api.js'

export const taskService = {
  // Listar tarefas com filtros
  async getTasks(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key])
        }
      })

      const queryString = params.toString()
      const url = queryString ? `/api/v1/tasks?${queryString}` : '/api/v1/tasks'
      
      const response = await api.get(url)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao carregar tarefas')
    }
  },

  // Obter tarefa por ID
  async getTaskById(taskId) {
    try {
      const response = await api.get(`/api/v1/tasks/${taskId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao carregar tarefa')
    }
  },

  // Criar nova tarefa
  async createTask(taskData) {
    try {
      const response = await api.post('/api/v1/tasks', taskData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao criar tarefa')
    }
  },

  // Atualizar tarefa
  async updateTask(taskId, updateData) {
    try {
      const response = await api.put(`/api/v1/tasks/${taskId}`, updateData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao atualizar tarefa')
    }
  },

  // Deletar tarefa
  async deleteTask(taskId) {
    try {
      const response = await api.delete(`/api/v1/tasks/${taskId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao deletar tarefa')
    }
  },

  // Marcar como concluída
  async completeTask(taskId) {
    try {
      const response = await api.patch(`/api/v1/tasks/${taskId}/complete`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao completar tarefa')
    }
  },

  // Obter estatísticas
  async getStats() {
    try {
      const response = await api.get('/api/v1/tasks/stats')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao carregar estatísticas')
    }
  },

  // Atribuir tarefa
  async assignTask(taskId, assignToUserId) {
    try {
      const response = await api.patch(`/api/v1/tasks/${taskId}/assign`, {
        assignToUserId
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao atribuir tarefa')
    }
  }
}
