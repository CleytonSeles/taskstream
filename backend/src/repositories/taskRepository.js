const { PrismaClient } = require('@prisma/client')
const Task = require('../models/Task')

const prisma = new PrismaClient()

class TaskRepository {
  async findAll(filters = {}) {
    const where = {}

    // Filtros de usuário
    if (filters.userId) {
      where.OR = [
        { userId: filters.userId },
        { assignedToId: filters.userId }
      ]
    }

    // Filtros específicos
    if (filters.status) {
      where.status = filters.status
    }

    if (filters.category) {
      where.category = filters.category
    }

    if (filters.priority) {
      where.priority = filters.priority
    }

    // Busca por texto
    if (filters.search) {
      where.OR = [
        ...(where.OR || []),
        {
          title: {
            contains: filters.search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: filters.search,
            mode: 'insensitive'
          }
        }
      ]
    }

    // Ordenação
    const orderBy = {}
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'desc'
    } else {
      orderBy.createdAt = 'desc'
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy,
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return tasks.map(taskData => new Task(taskData))
  }

  async findById(id) {
    const taskData = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return taskData ? new Task(taskData) : null
  }

  async create(taskData) {
    const createdTask = await prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        category: taskData.category || 'general',
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        userId: taskData.userId,
        assignedToId: taskData.assignedToId || null
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return new Task(createdTask)
  }

  async update(id, updateData) {
    try {
      // Se mudou para completed, definir completedAt
      if (updateData.status === 'completed') {
        updateData.completedAt = new Date()
      }

      const updatedTask = await prisma.task.update({
        where: { id: parseInt(id) },
        data: {
          ...updateData,
          dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
          updatedAt: new Date()
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          assignedTo: {
            select: { id: true, name: true, email: true }
          }
        }
      })

      return new Task(updatedTask)
    } catch (error) {
      if (error.code === 'P2025') {
        return null // Task not found
      }
      throw error
    }
  }

  async delete(id) {
    try {
      await prisma.task.delete({
        where: { id: parseInt(id) }
      })
      return true
    } catch (error) {
      if (error.code === 'P2025') {
        return false // Task not found
      }
      throw error
    }
  }

  // Estatísticas do usuário
  async getUserStats(userId) {
    const where = {
      OR: [
        { userId: userId },
        { assignedToId: userId }
      ]
    }

    const [total, pending, inProgress, completed] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.count({ where: { ...where, status: 'pending' } }),
      prisma.task.count({ where: { ...where, status: 'in_progress' } }),
      prisma.task.count({ where: { ...where, status: 'completed' } })
    ])

    // Tarefas atrasadas
    const overdue = await prisma.task.count({
      where: {
        ...where,
        status: { not: 'completed' },
        dueDate: { lt: new Date() }
      }
    })

    return {
      total,
      pending,
      inProgress,
      completed,
      overdue
    }
  }

  // Verificar se usuário tem acesso à tarefa
  async hasAccess(taskId, userId) {
    const task = await prisma.task.findFirst({
      where: {
        id: parseInt(taskId),
        OR: [
          { userId: userId },
          { assignedToId: userId }
        ]
      },
      select: { id: true }
    })

    return !!task
  }
}

module.exports = new TaskRepository()
