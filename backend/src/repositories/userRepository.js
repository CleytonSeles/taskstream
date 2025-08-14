const { PrismaClient } = require('@prisma/client')
const User = require('../models/User')

const prisma = new PrismaClient()

class UserRepository {
  async findAll() {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return users.map(userData => new User(userData))
  }

  async findById(id) {
    const userData = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    })
    return userData ? new User(userData) : null
  }

  async findByEmail(email) {
    const userData = await prisma.user.findUnique({
      where: { email }
    })
    return userData ? new User(userData) : null
  }

  async create(userData) {
    const user = new User(userData)
    await user.hashPassword()

    const createdUser = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role
      }
    })

    return new User(createdUser)
  }

  async update(id, userData) {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: {
          ...userData,
          updatedAt: new Date()
        }
      })

      return new User(updatedUser)
    } catch (error) {
      if (error.code === 'P2025') {
        return null // User not found
      }
      throw error
    }
  }

  async delete(id) {
    try {
      await prisma.user.delete({
        where: { id: parseInt(id) }
      })
      return true
    } catch (error) {
      if (error.code === 'P2025') {
        return false // User not found
      }
      throw error
    }
  }

  async emailExists(email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    })
    return !!user
  }

  // Buscar usuários para atribuição de tarefas
  async findUsersForAssignment(excludeUserId = null) {
    const whereClause = excludeUserId ? { NOT: { id: excludeUserId } } : {}
    
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: { name: 'asc' }
    })

    return users
  }
}

module.exports = new UserRepository()
