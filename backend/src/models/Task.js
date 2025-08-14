class Task {
  constructor(data) {
    this.id = data.id
    this.title = data.title
    this.description = data.description || ''
    this.status = data.status || 'pending' // pending, in_progress, completed
    this.priority = data.priority || 'medium' // low, medium, high
    this.category = data.category || 'general'
    this.dueDate = data.dueDate ? new Date(data.dueDate) : null
    this.userId = data.userId // ID do usuário proprietário
    this.assignedTo = data.assignedTo || null // ID do usuário atribuído
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
    this.completedAt = data.completedAt || null
  }

  // Validar dados da tarefa
  static validate(data) {
    const errors = []

    if (!data.title || data.title.trim().length < 3) {
      errors.push('Título deve ter pelo menos 3 caracteres')
    }

    if (data.title && data.title.length > 100) {
      errors.push('Título deve ter no máximo 100 caracteres')
    }

    if (data.description && data.description.length > 500) {
      errors.push('Descrição deve ter no máximo 500 caracteres')
    }

    const validStatuses = ['pending', 'in_progress', 'completed']
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push('Status deve ser: pending, in_progress ou completed')
    }

    const validPriorities = ['low', 'medium', 'high']
    if (data.priority && !validPriorities.includes(data.priority)) {
      errors.push('Prioridade deve ser: low, medium ou high')
    }

    if (data.dueDate && isNaN(new Date(data.dueDate).getTime())) {
      errors.push('Data de vencimento inválida')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Marcar como concluída
  markAsCompleted() {
    this.status = 'completed'
    this.completedAt = new Date()
    this.updatedAt = new Date()
  }

  // Verificar se está vencida
  isOverdue() {
    if (!this.dueDate || this.status === 'completed') return false
    return new Date() > this.dueDate
  }

  // Obter emoji baseado na prioridade
  getPriorityEmoji() {
    const emojis = {
      low: '🟢',
      medium: '🟡', 
      high: '🔴'
    }
    return emojis[this.priority] || '⚪'
  }

  // Obter emoji baseado no status
  getStatusEmoji() {
    const emojis = {
      pending: '⏳',
      in_progress: '🔄',
      completed: '✅'
    }
    return emojis[this.status] || '❓'
  }

  // Converter para JSON com informações extras
  toJSON() {
    return {
      ...this,
      isOverdue: this.isOverdue(),
      priorityEmoji: this.getPriorityEmoji(),
      statusEmoji: this.getStatusEmoji(),
      dueDate: this.dueDate ? this.dueDate.toISOString() : null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      completedAt: this.completedAt ? this.completedAt.toISOString() : null
    }
  }
}

module.exports = Task
