const bcrypt = require('bcryptjs')

class User {
  constructor(data) {
    this.id = data.id
    this.name = data.name
    this.email = data.email
    this.password = data.password
    this.role = data.role || 'user'
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  // Hash da senha antes de salvar
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10)
    }
  }

  // Verificar senha
  async comparePassword(plainPassword) {
    return await bcrypt.compare(plainPassword, this.password)
  }

  // Remover senha do objeto (para responses)
  toJSON() {
    const user = { ...this }
    delete user.password
    return user
  }

  // Validar dados do usuário
  static validate(data) {
    const errors = []

    if (!data.name || data.name.length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres')
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Email inválido')
    }

    if (!data.password || data.password.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

module.exports = User
