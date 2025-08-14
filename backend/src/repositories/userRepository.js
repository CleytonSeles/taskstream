const User = require('../models/User')

// Simulando um banco de dados em memória (posteriormente substituiremos por PostgreSQL)
let users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@taskstream.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

let nextId = 2

class UserRepository {
  async findAll() {
    return users.map(userData => new User(userData))
  }

  async findById(id) {
    const userData = users.find(user => user.id === parseInt(id))
    return userData ? new User(userData) : null
  }

  async findByEmail(email) {
    const userData = users.find(user => user.email === email)
    return userData ? new User(userData) : null
  }

  async create(userData) {
    const user = new User({
      ...userData,
      id: nextId++,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await user.hashPassword()
    users.push(user)
    
    return user
  }

  async update(id, userData) {
    const index = users.findIndex(user => user.id === parseInt(id))
    
    if (index === -1) return null

    users[index] = {
      ...users[index],
      ...userData,
      updatedAt: new Date()
    }

    return new User(users[index])
  }

  async delete(id) {
    const index = users.findIndex(user => user.id === parseInt(id))
    
    if (index === -1) return false

    users.splice(index, 1)
    return true
  }

  async emailExists(email) {
    return users.some(user => user.email === email)
  }
}

module.exports = new UserRepository()
